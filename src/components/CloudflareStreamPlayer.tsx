import React, { forwardRef, useEffect, useImperativeHandle, useRef, useCallback } from "react";
import Hls from 'hls.js';
import { playbackBus } from '../lib/playbackBus';

export type CloudflareStreamPlayerProps = {
  videoId: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  poster?: string;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onLoadedMetadata?: () => void;
  onActiveChange?: (isActive: boolean) => void;
  isActive?: boolean;
  onTap?: () => void;
  onDoubleTap?: () => void;
  warmupLoad?: boolean;
};

// Global registry for "one playing" rule
const globalPlayerRegistry = new Set<() => void>();

/**
 * Unified Cloudflare Stream Player - native video + HLS.js
 * Optimized for mobile autoplay, instant start, tap controls without restart
 */
const CloudflareStreamPlayer = forwardRef<HTMLVideoElement, CloudflareStreamPlayerProps>(
  ({ 
    videoId,
    autoPlay = true,
    muted = true,
    loop = true,
    controls = false,
    poster,
    className,
    onPlay,
    onPause,
    onLoadedMetadata,
    onActiveChange,
    isActive = false,
    onTap,
    onDoubleTap,
    warmupLoad = false,
  }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const tapCountRef = useRef(0);
    const tapTimeoutRef = useRef<number | null>(null);
    const isWarmupLoadedRef = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const reelIdRef = useRef(`reel-${videoId}-${Date.now()}`);
    const isInitializedRef = useRef(false);
    const retryTimeoutRef = useRef<number | null>(null);
    const playGenRef = useRef(0); // Race-condition guard token
    
    useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement);

    // Hard stop routine - complete teardown with race-condition guard
    const hardStop = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;

      try {
        // Invalidate current play generation
        playGenRef.current++;
        
        // Stop playback and reset
        video.pause();
        video.muted = true;
        video.currentTime = 0;

        // Clear any retry timeouts
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }

        // Stop HLS loading and destroy instance
        if (hlsRef.current) {
          hlsRef.current.stopLoad?.();
          hlsRef.current.detachMedia?.();
          hlsRef.current.destroy?.();
          hlsRef.current = null;
        }

        // Fully detach audio pipeline - guarantees no ghost audio on all browsers
        video.removeAttribute('src');
        video.load(); // Keeps poster visible but completely detaches audio
        isInitializedRef.current = false;
      } catch (error) {
        console.warn('Error in hardStop:', error);
      }
    }, []);

    // Legacy pause function for global registry
    const pauseVideo = useCallback(() => {
      hardStop();
    }, [hardStop]);

    // Initialize video source with race-condition guard
    const initializeAndPlay = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;

      // Get current play generation for race-condition guard
      const myPlayGen = ++playGenRef.current;

      // Cancel any existing loads
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const hlsUrl = `https://videodelivery.net/${videoId}/manifest/video.m3u8`;
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
      // Clean up existing HLS
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // Set autoplay policy compliant attributes
  video.setAttribute('playsinline', '');
  // iOS requires these to avoid forcing fullscreen playback which can render black on some devices
  video.setAttribute('webkit-playsinline', 'true');
  video.setAttribute('x-webkit-airplay', 'allow');
      video.playsInline = true;
      video.preload = "auto";
      
      // Set initial mute state but prepare for unmuting
      video.muted = true;
      video.defaultMuted = false; // Allow unmuting
      video.volume = 1.0; // Ensure volume is up for unmuting
      
      // Attach source based on Safari/native vs HLS
      if (isSafari || !Hls.isSupported()) {
        video.src = hlsUrl;
      } else {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          startLevel: 0,
          capLevelToPlayerSize: true,
          maxBufferLength: 10,
          backBufferLength: 15,
          fragLoadingTimeOut: 10000,
          manifestLoadingTimeOut: 10000,
          fragLoadingMaxRetry: 3,
          manifestLoadingMaxRetry: 3,
          levelLoadingMaxRetry: 3
        });
        
        hlsRef.current = hls;
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (abortControllerRef.current?.signal.aborted || playGenRef.current !== myPlayGen) return;
          
          if (data.fatal) {
            console.warn('HLS Fatal Error, falling back to MP4 once:', data);
            if (!video.src.includes('downloads')) {
              video.src = `https://videodelivery.net/${videoId}/downloads/default.mp4`;
            }
          }
        });
      }

      // Play attempt with race-condition guard and unmute handling
      const tryPlay = () => {
        if (playGenRef.current !== myPlayGen) return; // Stale play attempt

        // Start muted to ensure playback begins
        video.muted = true;
        const playPromise = video.play();
        if (playPromise) {
          playPromise.then(() => {
            if (playGenRef.current !== myPlayGen) return;
            // Successfully started playback, now try unmuting if needed
            if (!muted) {
              // Small delay to let browser realize user interaction happened
              setTimeout(() => {
                if (playGenRef.current !== myPlayGen) return;
                video.muted = false;
                video.defaultMuted = false;
                video.removeAttribute('muted');
                if (video.volume === 0) video.volume = 1.0;
              }, 100);
            }
          }).catch(() => {
            if (playGenRef.current !== myPlayGen) return;
            // Retry on canplay
            const onCanPlay = () => {
              video.removeEventListener('canplay', onCanPlay);
              if (playGenRef.current !== myPlayGen) return;
              video.play().then(() => {
                // Try unmuting again after retry success
                if (!muted) {
                  setTimeout(() => {
                    if (playGenRef.current !== myPlayGen) return;
                    video.muted = false;
                    video.defaultMuted = false;
                    video.removeAttribute('muted');
                    if (video.volume === 0) video.volume = 1.0;
                  }, 100);
                }
              }).catch(() => {});
            };
            video.addEventListener('canplay', onCanPlay, { once: true });
          });
        }
      };

      // Try play on loadedmetadata with unmuting
      const handleLoadedMetadata = () => {
        if (playGenRef.current === myPlayGen) {
          // Try playing unmuted first if that's what's requested
          if (!muted) {
            video.muted = false;
            video.removeAttribute('muted');
            video.play().catch(() => {
              // If unmuted play fails, try muted then unmute
              video.muted = true;
              video.play().then(() => {
                setTimeout(() => {
                  if (playGenRef.current === myPlayGen) {
                    video.muted = false;
                    video.removeAttribute('muted');
                  }
                }, 100);
              }).catch(() => tryPlay()); // Fall back to regular play attempt
            });
          } else {
            tryPlay();
          }
          onLoadedMetadata?.(); // Call the prop callback
        }
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
      isInitializedRef.current = true;
    }, [videoId, muted, onLoadedMetadata]);

    // Setup cleanup and registry
    useEffect(() => {
      globalPlayerRegistry.add(pauseVideo);

      return () => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        globalPlayerRegistry.delete(pauseVideo);
        hardStop();
      };
    }, [pauseVideo, hardStop]);

    // Enhanced playback bus listener for instant coordination
    useEffect(() => {
      const unsubscribe = playbackBus.subscribe((activeReelId) => {
        if (activeReelId !== reelIdRef.current) {
          hardStop(); // Instant hard stop for others
        }
      });

      return unsubscribe;
    }, [hardStop]);

    // Handle active state changes with complete teardown/restart and instant coordination
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      if (isActive) {
        // Force stop others instantly, then signal this reel is becoming active
        playbackBus.forceStopOthers(reelIdRef.current);
        playbackBus.setActive(reelIdRef.current);

        // Always reinitialize for clean start - no partial state
        initializeAndPlay();
        onPlay?.();
      } else {
        // Hard stop when not active - complete teardown
        hardStop();
      }

      onActiveChange?.(isActive);
    }, [isActive, initializeAndPlay, hardStop, onActiveChange, onPlay]);

    // Visibility change handling with play generation guard and unmute preservation
    useEffect(() => {
      const handleVisibilityChange = () => {
        const video = videoRef.current;
        if (!video) return;

        if (document.hidden) {
          // Hard stop non-active, pause active
          if (isActive) {
            video.pause();
          } else {
            hardStop();
          }
        } else if (isActive && !document.hidden) {
          // Only current active item attempts play with generation guard
          const currentGen = playGenRef.current;
          const wasMuted = video.muted;
          // Start muted to ensure playback
          video.muted = true;
          video.play().then(() => {
            if (playGenRef.current === currentGen && !wasMuted && !muted) {
              // Restore unmuted state after successful play
              setTimeout(() => {
                if (playGenRef.current === currentGen) {
                  video.muted = false;
                  video.defaultMuted = false;
                  video.removeAttribute('muted');
                  if (video.volume === 0) video.volume = 1.0;
                }
              }, 100);
            }
          }).catch(() => {
            if (playGenRef.current === currentGen) {
              // Retry once if same generation
              setTimeout(() => {
                if (playGenRef.current === currentGen) {
                  video.play().then(() => {
                    // Try restoring unmuted state after retry
                    if (!wasMuted && !muted) {
                      setTimeout(() => {
                        if (playGenRef.current === currentGen) {
                          video.muted = false;
                          video.defaultMuted = false;
                          video.removeAttribute('muted');
                          if (video.volume === 0) video.volume = 1.0;
                        }
                      }, 100);
                    }
                  }).catch(() => {});
                }
              }, 100);
            }
          });
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isActive, hardStop, muted]);

    // Smooth mute toggle that never restarts playback
    const toggleMuteSmooth = useCallback(() => {
      const video = videoRef.current;
      if (!video || !isInitializedRef.current) return;

      // Store current state
      const wasPlaying = !video.paused;
      const currentTime = video.currentTime;
      const newMutedState = !video.muted;

      // Toggle mute without affecting playback
      if (newMutedState) {
        video.muted = true;
        video.setAttribute('muted', '');
      } else {
        video.muted = false;
        video.removeAttribute('muted');
        if (video.volume === 0) video.volume = 1.0;
      }

      // If video was playing but paused during mute toggle, resume at same position
      if (wasPlaying && video.paused) {
        video.currentTime = currentTime;
        video.play().catch(() => {
          // If unmuted play fails, try muted
          if (!video.muted) {
            video.muted = true;
            video.setAttribute('muted', '');
            video.play().then(() => {
              // Try unmuting again after successful play
              video.muted = false;
              video.removeAttribute('muted');
            }).catch(() => {});
          }
        });
      }
    }, []);

    // Sync video muted state with prop (initial only, no restart)
    useEffect(() => {
      const video = videoRef.current;
      if (video && isInitializedRef.current && video.muted !== muted) {
        const currentTime = video.currentTime;
        video.muted = muted;
        
        // Preserve position
        if (Math.abs(video.currentTime - currentTime) > 0.01) {
          video.currentTime = currentTime;
        }
      }
    }, [muted]);
    // True lazy-load: warmup effect - only preload metadata, don't start HLS loading
    useEffect(() => {
      if (!warmupLoad || isWarmupLoadedRef.current || isActive) return;

      isWarmupLoadedRef.current = true;
      
      // For warmup: set preload="metadata" only, don't attach full source
      const video = videoRef.current;
      if (video && !isInitializedRef.current) {
        video.preload = "metadata";
        // Don't initialize full HLS yet - just prepare metadata
      }
    }, [warmupLoad, isActive]);

    // Handle tap gestures - single tap mute/unmute, double tap callback
    const handleVideoTap = useCallback((e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      tapCountRef.current += 1;
      
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }

      tapTimeoutRef.current = window.setTimeout(() => {
        if (tapCountRef.current === 1) {
          // Single tap - smooth mute toggle without restart
          const video = videoRef.current;
          if (video && video.paused && isActive) {
            // If paused due to policy, try to play
            video.play().catch(() => {});
          } else {
            // Use smooth mute toggle instead of external callback
            toggleMuteSmooth();
          }
          onTap?.(); // Still call external callback for UI updates
        } else if (tapCountRef.current === 2) {
          // Double tap - like animation
          onDoubleTap?.();
          
          if ('vibrate' in navigator) {
            navigator.vibrate(15);
          }
        }
        tapCountRef.current = 0;
      }, 250);
    }, [isActive, onTap, onDoubleTap, toggleMuteSmooth]);

    return (
      <div className={className}>
        <video
          ref={videoRef}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          controls={controls}
          poster={poster || `https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg?time=1s&height=720`}
          playsInline
          webkit-playsinline="true"
          x-webkit-airplay="allow"
          preload={isActive ? "auto" : "metadata"}
          crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onPlay={onPlay}
          onPause={onPause}
          onLoadedMetadata={onLoadedMetadata}
          onClick={handleVideoTap}
          onTouchEnd={handleVideoTap}
          onError={(e) => {
            console.warn('Video error, trying MP4 fallback:', e);
            const video = e.currentTarget;
            if (!video.src.includes('downloads')) {
              video.src = `https://videodelivery.net/${videoId}/downloads/default.mp4`;
            }
          }}
        />
      </div>
    );
  }
);

CloudflareStreamPlayer.displayName = 'CloudflareStreamPlayer';
export default CloudflareStreamPlayer;