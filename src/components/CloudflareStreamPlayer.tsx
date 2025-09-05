import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import CloudflareVideo from './CloudflareVideo';

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

/** Enhanced Stream player with native video control for mobile autoplay */
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
    
    useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement);

    // Mobile-friendly autoplay handling
    useEffect(() => {
      const video = videoRef.current;
      if (!video || !autoplay) return;

      const handleCanPlay = async () => {
        try {
          video.muted = true; // Ensure muted for autoplay
          await video.play();
        } catch (error) {
          console.log('Autoplay failed, will retry on user gesture:', error);
        }
      };

      video.addEventListener('canplay', handleCanPlay);
      return () => video.removeEventListener('canplay', handleCanPlay);
    }, [autoplay, uid]);

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
        <CloudflareVideo
          ref={videoRef}
          uid={uid}
          controls={controls}
          autoPlay={autoplay}
          muted={muted}
          loop={loop}
          poster={poster || `https://videodelivery.net/${uid}/thumbnails/thumbnail.jpg?time=1s&height=720`}
          playsInline
          webkit-playsinline="true"
          preload="auto"
          style={{ width: '100%', height: '100%' }}
          onPlay={onPlay}
          onPause={onPause}
          onLoadedMetadata={onLoadedMetadata}
        />
      </div>
    );
  }
);

CloudflareStreamPlayer.displayName = 'CloudflareStreamPlayer';
export default CloudflareStreamPlayer;