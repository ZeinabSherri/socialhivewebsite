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

    // Initialize video source with improved mobile support
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
      
      // iOS detection for native HLS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
      // Clean up existing HLS
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // Mobile playback setup
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', 'true');
      video.setAttribute('x-webkit-airplay', 'allow');
      video.preload = "auto";
      
      // Start muted for autoplay
      video.muted = true;
      video.defaultMuted = false;
      video.volume = 1.0;
      // Enhanced mobile compatibility attributes
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.setAttribute('x-webkit-airplay', 'allow');
      video.crossOrigin = 'anonymous';
      video.preload = 'metadata';
      
      console.log(`[CloudflareStreamPlayer] Initializing video ${videoId}, isActive: ${isActive}, userAgent: ${typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) : 'server'}`);
      
      // Platform-specific HLS handling - prevents audio-only on mobile
      if (isIOS && video.canPlayType('application/vnd.apple.mpegurl')) {
        // iOS Safari: use native HLS - never mix with hls.js
        console.log(`[CloudflareStreamPlayer] Using native HLS on iOS for ${videoId}`);
        video.src = hlsUrl;
      } else if (hlsUrl.endsWith('.m3u8') && Hls.isSupported()) {
        // Android/other browsers: use hls.js
        console.log(`[CloudflareStreamPlayer] Using hls.js for ${videoId}`);
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
          levelLoadingMaxRetry: 3,
          autoStartLoad: true // Ensures loading starts immediately
        });
        
        hlsRef.current = hls;
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (abortControllerRef.current?.signal.aborted || playGenRef.current !== myPlayGen) return;
          
          console.error(`[CloudflareStreamPlayer] HLS Error for ${videoId}:`, data);
          
          if (data.fatal) {
            console.warn(`[CloudflareStreamPlayer] HLS Fatal Error for ${videoId}, falling back to MP4:`, data);
            try {
              if (!video.src.includes('downloads')) {
                video.src = `https://videodelivery.net/${videoId}/downloads/default.mp4`;
              }
            } catch (fallbackError) {
              console.error(`[CloudflareStreamPlayer] MP4 fallback failed for ${videoId}:`, fallbackError);
            }
          }
        });
      } else {
        // Fallback to MP4 for unsupported browsers
        console.log(`[CloudflareStreamPlayer] Using MP4 fallback for ${videoId}`);
        video.src = `https://videodelivery.net/${videoId}/downloads/default.mp4`;
      }

      // Enhanced mobile play attempt with fallback chain
      const tryPlay = () => {
        if (playGenRef.current !== myPlayGen) return; // Stale play attempt

        // Always start muted for autoplay policy
        video.muted = true;
        video.setAttribute('muted', '');

        // Chain of play attempts with unmute
        const attemptUnmutedPlay = () => {
          if (playGenRef.current !== myPlayGen) return;
          if (!muted) {
            video.muted = false;
            video.removeAttribute('muted');
            video.volume = 1.0;
          }
        };

        // Use RAF for better mobile compatibility
        requestAnimationFrame(() => {
          if (playGenRef.current !== myPlayGen) return;

          video.play()
            .then(() => {
              if (!muted) setTimeout(attemptUnmutedPlay, 100);
            })
            .catch(() => {
              if (playGenRef.current !== myPlayGen) return;
              
              // Retry on canplay
              const onCanPlay = () => {
                video.removeEventListener('canplay', onCanPlay);
                if (playGenRef.current !== myPlayGen) return;
                
                video.play()
                  .then(() => {
                    if (!muted) setTimeout(attemptUnmutedPlay, 100);
                  })
                  .catch(() => {});
              };
              video.addEventListener('canplay', onCanPlay, { once: true });
            });
        });
      };

      // Try play on loadedmetadata with mobile considerations
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
    }, [videoId, muted, onLoadedMetadata, isActive]);

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
      const unsubscribe = playbackBus.subscribe(reelIdRef.current, (activeReelId) => {
        if (activeReelId !== reelIdRef.current) {
          hardStop(); // Instant hard stop for others
        }
      });

      return unsubscribe;
    }, [hardStop]);

    // Handle active state changes with improved mobile support
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      if (isActive) {
        // Ensure mobile attributes are set
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', 'true');
        video.setAttribute('x-webkit-airplay', 'allow');

        // Start fresh
        video.muted = true; // Start muted for autoplay
        // Activate this player in playback bus
        playbackBus.activate(reelIdRef.current);
        initializeAndPlay();
        
        // Try to unmute after successful play if needed
        if (!muted) {
          const unmute = () => {
            if (!video.paused) {
              video.muted = false;
              video.volume = 1.0;
            }
          };
          setTimeout(unmute, 250);
        }
        
        onPlay?.();
      } else {
        hardStop();
      }

      onActiveChange?.(isActive);
    }, [isActive, initializeAndPlay, hardStop, onActiveChange, onPlay, muted]);

    // Visibility change handling with play generation guard and unmute preservation
    useEffect(() => {
      if (typeof document === 'undefined') return;
      
      const handleVisibilityChange = () => {
        const video = videoRef.current;
        if (!video || typeof document === 'undefined') return;

        try {
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
        } catch (error) {
          console.warn('CloudflareStreamPlayer visibility change error:', error);
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isActive, hardStop, muted]);

    // Smooth mute toggle that never restarts playback
    const toggleMuteSmooth = useCallback(() => {
      const video = videoRef.current;
      if (!video || !isInitializedRef.current) return;

      // Store exact current state
      const wasPlaying = !video.paused;
      const currentTime = video.currentTime;
      const newMutedState = !video.muted;
      const currentGen = playGenRef.current;

      // Toggle mute preserving position exactly
      if (newMutedState) {
        video.muted = true;
        video.setAttribute('muted', '');
      } else {
        // Unmute attempt with fallback
        const unmute = () => {
          if (playGenRef.current !== currentGen) return;
          video.muted = false;
          video.removeAttribute('muted');
          video.volume = 1.0;
        };

        // Try unmuted play or fall back to muted
        video.play().then(unmute).catch(() => {
          video.muted = true;
          video.play().then(() => setTimeout(unmute, 100)).catch(() => {});
        });
      }

      // Restore position precisely and resume if needed
      if (Math.abs(video.currentTime - currentTime) > 0.01) {
        video.currentTime = currentTime;
      }
      
      if (wasPlaying && video.paused) {
        video.play().catch(() => {});
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

    // Handle tap gestures with improved mobile interaction
    const handleVideoTap = useCallback((e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      tapCountRef.current += 1;
      
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }

      if (typeof window !== 'undefined') {
        tapTimeoutRef.current = window.setTimeout(() => {
        const video = videoRef.current;
        if (!video) return;
        
        if (tapCountRef.current === 1) {
          // Single tap - toggle mute without restart
          if (video.paused && isActive) {
            // Try to resume if paused
            video.muted = true; // Start muted
            video.play().then(() => {
              if (!muted) {
                setTimeout(() => {
                  if (!video.paused) {
                    video.muted = false;
                    video.volume = 1.0;
                  }
                }, 250);
              }
            }).catch(() => {});
          } else {
            // Toggle mute preserving time
            const time = video.currentTime;
            video.muted = !video.muted;
            if (!video.muted) video.volume = 1.0;
            if (Math.abs(video.currentTime - time) > 0.01) {
              video.currentTime = time;
            }
          }
          onTap?.();
        } else if (tapCountRef.current === 2) {
          onDoubleTap?.();
          if ('vibrate' in navigator) {
            navigator.vibrate(15);
          }
        }
        tapCountRef.current = 0;
      }, 250);
      }
    }, [isActive, onTap, onDoubleTap, muted]);

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
              // Fallback to MP4 with mobile attributes preserved
              video.playsInline = true;
              video.setAttribute('playsinline', '');
              video.setAttribute('webkit-playsinline', 'true');
              video.muted = true;
              video.src = `https://videodelivery.net/${videoId}/downloads/default.mp4`;
              video.load();
              video.play().catch(() => {});
            }
          }}
        />
      </div>
    );
  }
);

CloudflareStreamPlayer.displayName = 'CloudflareStreamPlayer';
export default CloudflareStreamPlayer;