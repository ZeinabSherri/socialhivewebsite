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
    
    useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement);

    // Complete teardown function
    const teardownVideo = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;

      // Stop playback
      video.pause();
      video.muted = true;

      // Clear any retry timeouts
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      // Stop HLS loading and destroy instance
      if (hlsRef.current) {
        hlsRef.current.stopLoad();
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // Complete audio detachment
      video.removeAttribute('src');
      video.load(); // This keeps poster visible but guarantees no ghost audio
      isInitializedRef.current = false;
    }, []);

    // Legacy pause function for global registry
    const pauseVideo = useCallback(() => {
      teardownVideo();
    }, [teardownVideo]);

    // Initialize video source only when active or warmup
    const initializeVideo = useCallback(() => {
      const video = videoRef.current;
      if (!video || isInitializedRef.current) return;

      isInitializedRef.current = true;

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

      // Set basic video properties
      video.playsInline = true;
      video.muted = true; // Always start muted for autoplay policy
      video.preload = "metadata";
      
      if (isSafari || !Hls.isSupported()) {
        video.src = hlsUrl;
      } else {
        // Optimized HLS.js settings for instant start and better error handling
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          startLevel: 0, // Fastest first frame
          capLevelToPlayerSize: true,
          maxBufferLength: 10,
          backBufferLength: 15,
          fragLoadingTimeOut: 10000, // Increased timeout
          manifestLoadingTimeOut: 10000, // Increased timeout
          abrEwmaDefaultEstimate: 3e5,
          fragLoadingMaxRetry: 3,
          manifestLoadingMaxRetry: 3,
          levelLoadingMaxRetry: 3
        });
        
        hlsRef.current = hls;
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (abortControllerRef.current?.signal.aborted) return;
          
          if (data.fatal) {
            console.warn('HLS Fatal Error, falling back to MP4:', data);
            // Single fallback to MP4 - don't retry HLS
            if (!video.src.includes('downloads')) {
              video.src = `https://videodelivery.net/${videoId}/downloads/default.mp4`;
            }
          } else {
            // Non-fatal errors - let HLS.js handle recovery
            console.warn('HLS Non-fatal Error:', data.type, data.details);
          }
        });
      }

      // Try to play once metadata is loaded
      const onLoadedMetadata = () => {
        if (isActive) {
          video.muted = muted;
          const playPromise = video.play();
          if (playPromise) {
            playPromise.catch((error) => {
              console.log('Play failed on loadedmetadata, will retry on canplay:', error);
              // Retry on canplay event
              const onCanPlay = () => {
                video.removeEventListener('canplay', onCanPlay);
                video.play().catch(() => {
                  console.log('Second play attempt failed');
                });
              };
              video.addEventListener('canplay', onCanPlay, { once: true });
            });
          }
        }
        onLoadedMetadata?.();
      };

      video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
    }, [videoId, isActive, muted, onLoadedMetadata]);

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
        teardownVideo();
      };
    }, [pauseVideo, teardownVideo]);

    // Playback bus listener for global coordination
    useEffect(() => {
      const unsubscribe = playbackBus.subscribe((activeReelId) => {
        if (activeReelId !== reelIdRef.current) {
          teardownVideo();
        }
      });

      return unsubscribe;
    }, [teardownVideo]);

    // Handle active state changes with complete teardown/restart
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      if (isActive) {
        // Signal this reel is becoming active
        playbackBus.setActive(reelIdRef.current);

        // Initialize video if not already done
        if (!isInitializedRef.current) {
          initializeVideo();
        } else {
          // Video already initialized, just play
          video.muted = muted;
          const playPromise = video.play();
          if (playPromise) {
            playPromise.then(() => {
              onPlay?.();
            }).catch((error) => {
              console.log('Autoplay failed, will retry on user gesture:', error);
            });
          }
        }
      } else {
        // Complete teardown when not active
        teardownVideo();
      }

      onActiveChange?.(isActive);
    }, [isActive, muted, onPlay, initializeVideo, teardownVideo, onActiveChange]);

    // Visibility change handling
    useEffect(() => {
      const handleVisibilityChange = () => {
        const video = videoRef.current;
        if (!video) return;

        if (document.hidden) {
          video.pause();
        } else if (isActive && !document.hidden) {
          video.muted = true;
          video.play().catch(() => {});
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isActive]);

    // Sync video muted state with prop
    useEffect(() => {
      const video = videoRef.current;
      if (video && video.muted !== muted) {
        video.muted = muted;
      }
    }, [muted]);
    // Warmup effect - only initialize metadata, don't start loading
    useEffect(() => {
      if (!warmupLoad || isWarmupLoadedRef.current || isActive) return;

      isWarmupLoadedRef.current = true;
      
      // For warmup, just initialize the video but don't start heavy loading
      setTimeout(() => {
        if (!isActive && !isInitializedRef.current) {
          initializeVideo();
        }
      }, 100);
    }, [warmupLoad, isActive, initializeVideo]);

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
          // Single tap - call external onTap callback for mute toggle
          const video = videoRef.current;
          if (video && video.paused && isActive) {
            // If paused due to policy, try to play
            video.play().catch(() => {});
          }
          onTap?.();
        } else if (tapCountRef.current === 2) {
          // Double tap - like animation
          onDoubleTap?.();
          
          if ('vibrate' in navigator) {
            navigator.vibrate(15);
          }
        }
        tapCountRef.current = 0;
      }, 250);
    }, [isActive, onTap, onDoubleTap]);

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