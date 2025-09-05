import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import Hls from 'hls.js';

export type CloudflareStreamPlayerProps = {
  uid: string; // Cloudflare Stream video UID or signed token
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  poster?: string;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onLoadedMetadata?: () => void;
};

/** Unified Cloudflare player with native video + HLS for fast mobile autoplay */
const CloudflareStreamPlayer = forwardRef<HTMLVideoElement, CloudflareStreamPlayerProps>(
  ({ 
    uid,
    autoplay = false,
    muted = true,
    loop = true,
    controls = true,
    poster,
    className,
    onPlay,
    onPause,
    onLoadedMetadata,
  }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    
    useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement);

    // Initialize HLS or native video
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const hlsUrl = `https://videodelivery.net/${uid}/manifest/video.m3u8`;
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
      if (isSafari || !Hls.isSupported()) {
        // Use native HLS on Safari/devices that don't support hls.js
        video.src = hlsUrl;
      } else {
        // Use hls.js for other browsers with optimized settings
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          startLevel: 0, // Start with lowest quality for fast first frame
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
            video.src = `https://videodelivery.net/${uid}/downloads/default.mp4`;
          }
        });
      }

      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };
    }, [uid]);

    // Mobile-friendly autoplay handling
    useEffect(() => {
      const video = videoRef.current;
      if (!video || !autoplay) return;

      const handleCanPlay = async () => {
        try {
          video.muted = true; // Ensure muted for autoplay
          const playPromise = video.play();
          if (playPromise) {
            await playPromise;
            onPlay?.();
          }
        } catch (error) {
          console.log('Autoplay failed, will retry on user gesture:', error);
          // Retry with muted guarantee
          video.muted = true;
          try {
            await video.play();
          } catch (retryError) {
            console.log('Retry also failed:', retryError);
          }
        }
      };

      video.addEventListener('canplay', handleCanPlay);
      return () => video.removeEventListener('canplay', handleCanPlay);
    }, [autoplay, uid, onPlay]);

    // Visibility change handling
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handleVisibilityChange = () => {
        if (document.hidden) {
          video.pause();
        } else if (autoplay && !document.hidden) {
          video.muted = true;
          video.play().catch(() => {});
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [autoplay]);

    return (
      <div className={className}>
        <video
          ref={videoRef}
          autoPlay={autoplay}
          muted={muted}
          loop={loop}
          controls={controls}
          poster={poster || `https://videodelivery.net/${uid}/thumbnails/thumbnail.jpg?time=1s&height=720`}
          playsInline
          webkit-playsinline="true"
          preload="auto"
          crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onPlay={onPlay}
          onPause={onPause}
          onLoadedMetadata={onLoadedMetadata}
          onError={(e) => {
            console.warn('Video error, trying MP4 fallback:', e);
            const video = e.currentTarget;
            if (!video.src.includes('downloads')) {
              video.src = `https://videodelivery.net/${uid}/downloads/default.mp4`;
            }
          }}
        />
      </div>
    );
  }
);

CloudflareStreamPlayer.displayName = 'CloudflareStreamPlayer';
export default CloudflareStreamPlayer;