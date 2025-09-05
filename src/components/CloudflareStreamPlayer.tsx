import React, { forwardRef, useEffect, useImperativeHandle, useRef, useCallback } from "react";
import Hls from 'hls.js';

export type CloudflareStreamPlayerProps = {
  videoId: string; // Cloudflare Stream video UID
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
};

// Global registry to manage "one playing" rule
const globalPlayerRegistry = new Set<() => void>();

/** 
 * Unified Cloudflare Stream Player with native video + HLS
 * Handles mobile autoplay, tap-to-mute (no restart), and instant loading
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
  }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const tapCountRef = useRef(0);
    const tapTimeoutRef = useRef<number | null>(null);
    
    useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement);

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

      const hlsUrl = `https://videodelivery.net/${videoId}/manifest/video.m3u8`;
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
      // Clean up existing HLS
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      
      if (isSafari || !Hls.isSupported()) {
        // Use native HLS on Safari/devices that don't support hls.js
        video.src = hlsUrl;
      } else {
        // Use hls.js for other browsers with optimized settings for fast start
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          startLevel: 0, // Start with lowest quality for fastest first frame
          capLevelToPlayerSize: true,
          maxBufferLength: 10,
          backBufferLength: 30,
          fragLoadingTimeOut: 8000,
          manifestLoadingTimeOut: 8000,
          abrEwmaDefaultEstimate: 3e5 // Conservative bandwidth estimate
        });
        
        hlsRef.current = hls;
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.warn('HLS Error:', event, data);
          if (data.fatal) {
            // Fallback to direct MP4 on fatal error
            video.src = `https://videodelivery.net/${videoId}/downloads/default.mp4`;
          }
        });
      }

      // Register with global player registry
      globalPlayerRegistry.add(pauseVideo);

      return () => {
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

        // Start playing this video
        video.muted = true; // Always start muted for autoplay
        const playPromise = video.play();
        if (playPromise) {
          playPromise.then(() => {
            onPlay?.();
          }).catch((error) => {
            console.log('Autoplay failed, will retry on user gesture:', error);
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

    // Warmup loading for nearby videos
    const startWarmupLoad = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;

      if (hlsRef.current) {
        hlsRef.current.startLoad();
      } else {
        video.load();
      }
    }, []);

    // Expose warmup method via ref
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
        if (tapCountRef.current === 1) {
          // Single tap - toggle mute (NO RESTART)
          const video = videoRef.current;
          if (video) {
            video.muted = !video.muted;
            // If paused, try to play again (for mobile)
            if (video.paused && isActive) {
              video.play().catch(() => {});
            }
          }
          onTap?.();
        } else if (tapCountRef.current === 2) {
          // Double tap - trigger callback (like with heart animation)
          onDoubleTap?.();
          
          // Haptic feedback if available
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
          preload="auto"
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