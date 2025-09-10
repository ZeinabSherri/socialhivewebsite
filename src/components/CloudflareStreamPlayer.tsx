import React, { forwardRef, useEffect, useImperativeHandle, useRef, useCallback, useState } from "react";
import Hls from 'hls.js';

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
  playsInline?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  showUnmuteButton?: boolean;
  onMuteChange?: (muted: boolean) => void;
};

export interface CloudflareStreamPlayerRef {
  play: () => Promise<void>;
  pause: () => void;
  mute: () => void;
  unmute: () => void;
  videoEl: HTMLVideoElement | null;
  startWarmupLoad: () => void;
}

// Global registry for "one playing" rule
const globalPlayerRegistry = new Set<() => void>();

/**
 * Unified Cloudflare Stream Player - native video + HLS.js
 * Optimized for mobile autoplay, instant start, tap controls without restart
 */
const CloudflareStreamPlayer = forwardRef<CloudflareStreamPlayerRef, CloudflareStreamPlayerProps>(
  ({ 
    videoId,
    autoPlay = true,
    muted = false, // Default to unmuted for home page requirement
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
    playsInline = true,
    preload = 'metadata',
    showUnmuteButton = false,
    onMuteChange,
  }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const tapCountRef = useRef(0);
    const tapTimeoutRef = useRef<number | null>(null);
    const isWarmupLoadedRef = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const [showUnmuteOverlay, setShowUnmuteOverlay] = useState(false);
    const [internalMuted, setInternalMuted] = useState(muted);
    
    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      play: async () => {
        const video = videoRef.current;
        if (video) {
          return video.play();
        }
        return Promise.resolve();
      },
      pause: () => {
        const video = videoRef.current;
        if (video) {
          video.pause();
        }
      },
      mute: () => {
        const video = videoRef.current;
        if (video) {
          video.muted = true;
          setInternalMuted(true);
          onMuteChange?.(true);
        }
      },
      unmute: () => {
        const video = videoRef.current;
        if (video) {
          video.muted = false;
          setInternalMuted(false);
          onMuteChange?.(false);
          setShowUnmuteOverlay(false);
        }
      },
      videoEl: videoRef.current,
      startWarmupLoad
    }));

    // Pause function for global registry
    const pauseVideo = useCallback(() => {
      const video = videoRef.current;
      if (video && !video.paused) {
        video.pause();
      }
    }, []);

    // Initialize HLS or native video
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

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
      
      if (isSafari || !Hls.isSupported()) {
        video.src = hlsUrl;
      } else {
        // Optimized HLS.js settings for instant start
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          startLevel: 0, // Fastest first frame
          capLevelToPlayerSize: true,
          maxBufferLength: 10,
          backBufferLength: 30,
          fragLoadingTimeOut: 6000,
          manifestLoadingTimeOut: 6000,
          abrEwmaDefaultEstimate: 3e5
        });
        
        hlsRef.current = hls;
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (abortControllerRef.current?.signal.aborted) return;
          console.warn('HLS Error:', event, data);
          if (data.fatal) {
            video.src = `https://videodelivery.net/${videoId}/downloads/default.mp4`;
          }
        });
      }

      globalPlayerRegistry.add(pauseVideo);

      return () => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        globalPlayerRegistry.delete(pauseVideo);
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };
    }, [videoId, pauseVideo]);

    // Handle active state changes
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      if (isActive) {
        // Pause all other players first (one-playing rule)
        globalPlayerRegistry.forEach(pauseFn => {
          if (pauseFn !== pauseVideo) {
            pauseFn();
          }
        });

        // Start playing this video - try unmuted first for home page
        video.muted = internalMuted;
        const playPromise = video.play();
        if (playPromise) {
          playPromise.then(() => {
            onPlay?.();
            setShowUnmuteOverlay(false);
          }).catch((error) => {
            console.log('Autoplay failed, trying muted fallback:', error);
            // Fallback to muted autoplay
            if (!video.muted) {
              video.muted = true;
              setInternalMuted(true);
              setShowUnmuteOverlay(showUnmuteButton);
              video.play().catch(() => {
                console.log('Muted autoplay also failed');
              });
            }
          });
        }
      } else {
        video.pause();
      }

      onActiveChange?.(isActive);
    }, [isActive, onPlay, pauseVideo, onActiveChange]);

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
      if (video && video.muted !== internalMuted) {
        video.muted = internalMuted;
        onMuteChange?.(internalMuted);
      }
    }, [internalMuted, onMuteChange]);
    useEffect(() => {
      const video = videoRef.current;
      if (!video || !warmupLoad || isWarmupLoadedRef.current) return;

      isWarmupLoadedRef.current = true;
      
      if (hlsRef.current) {
        hlsRef.current.startLoad();
      } else {
        video.load();
      }
    }, [warmupLoad]);

    // Expose warmup method via ref
    const startWarmupLoad = useCallback(() => {
      const video = videoRef.current;
      if (!video || isWarmupLoadedRef.current) return;

      isWarmupLoadedRef.current = true;
      
      if (hlsRef.current) {
        hlsRef.current.startLoad();
      } else {
        video.load();
      }
    }, []);

    useEffect(() => {
      if (videoRef.current) {
        (videoRef.current as any).startWarmupLoad = startWarmupLoad;
      }
    }, [startWarmupLoad]);

    // Handle tap gestures - single tap mute/unmute, double tap callback
    const handleVideoTap = useCallback((e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      tapCountRef.current += 1;
      
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }

      tapTimeoutRef.current = window.setTimeout(() => {
        const video = videoRef.current;
        if (!video) return;

        if (tapCountRef.current === 1) {
          // Single tap - toggle mute/unmute
          const newMuted = !internalMuted;
          video.muted = newMuted;
          setInternalMuted(newMuted);
          
          if (video.paused && isActive) {
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
    }, [isActive, internalMuted, onTap, onDoubleTap]);

    return (
      <div className={`relative ${className || ''}`}>
        <video
          ref={videoRef}
          autoPlay={autoPlay}
          muted={internalMuted}
          loop={loop}
          controls={controls}
          poster={poster || `https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg?time=1s&height=720`}
          playsInline={playsInline}
          webkit-playsinline="true"
          preload={preload}
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
        
        {/* Unmute button overlay for browsers that block unmuted autoplay */}
        {showUnmuteOverlay && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <button
              onClick={() => {
                const video = videoRef.current;
                if (video) {
                  video.muted = false;
                  setInternalMuted(false);
                  setShowUnmuteOverlay(false);
                  if (video.paused) {
                    video.play().catch(() => {});
                  }
                }
              }}
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full hover:bg-white/30 transition-colors"
            >
              🔊 Tap to unmute
            </button>
          </div>
        )}
      </div>
    );
  }
);

CloudflareStreamPlayer.displayName = 'CloudflareStreamPlayer';
export default CloudflareStreamPlayer;