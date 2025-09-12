// src/components/CloudflareVideo.tsx
'use client';
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import Hls from 'hls.js';

type CloudflareVideoProps = React.DetailedHTMLProps<
  React.VideoHTMLAttributes<HTMLVideoElement>,
  HTMLVideoElement
> & {
  /** Cloudflare Stream UID (unlisted/public). */
  uid: string;
};

/**
 * CloudflareVideo
 * - Keeps a real <video> element so your refs/IntersectionObserver keep working.
 * - Uses native HLS on Safari; hls.js for other browsers.
 * - Falls back to progressive MP4 if HLS isn’t supported.
 */
const CloudflareVideo = forwardRef<HTMLVideoElement, CloudflareVideoProps>(
  ({ uid, ...rest }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement);

    useEffect(() => {
      const video = videoRef.current;
      if (!video || !uid) return;

      const hlsSrc = `https://videodelivery.net/${uid}/manifest/video.m3u8`;
      let hlsInstance: Hls | null = null;

      // Hard stop function for complete teardown
      const hardStop = () => {
        try {
          video.pause();
          video.muted = true;
          video.currentTime = 0;
          
          if (hlsInstance) {
            hlsInstance.stopLoad?.();
            hlsInstance.detachMedia?.();
            hlsInstance.destroy?.();
            hlsInstance = null;
          }
          
          // Fully detach audio pipeline
          video.removeAttribute('src');
          video.load(); // Keeps poster, guarantees no ghost audio
        } catch (error) {
          console.warn('Error in CloudflareVideo hardStop:', error);
        }
      };

      // Native HLS (Safari)
      const hasNativeHls =
        typeof video.canPlayType === 'function' &&
        video.canPlayType('application/vnd.apple.mpegurl') !== '';

      // Set autoplay policy compliant attributes
      video.setAttribute('playsinline', '');
      video.setAttribute('muted', '');
      video.playsInline = true;
      video.muted = true;

      if (hasNativeHls) {
        video.src = hlsSrc;
      } else if (Hls.isSupported()) {
        // Other browsers → hls.js with error handling
        hlsInstance = new Hls({ 
          maxBufferLength: 30, 
          backBufferLength: 30,
          fragLoadingMaxRetry: 2,
          manifestLoadingMaxRetry: 2
        });
        
        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.warn('CloudflareVideo HLS Fatal Error, falling back to MP4:', data);
            if (!video.src.includes('downloads')) {
              video.src = `https://videodelivery.net/${uid}/downloads/default.mp4`;
            }
          }
        });
        
        hlsInstance.loadSource(hlsSrc);
        hlsInstance.attachMedia(video);
      } else {
        // Fallback to progressive MP4
        video.src = `https://videodelivery.net/${uid}/downloads/default.mp4`;
      }

      return () => {
        hardStop(); // Complete teardown on unmount
      };
    }, [uid]);

    return <video ref={videoRef} {...rest} />;
  }
);

CloudflareVideo.displayName = 'CloudflareVideo';
export default CloudflareVideo;
