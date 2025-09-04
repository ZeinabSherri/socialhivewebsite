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

      // Native HLS (Safari)
      const hasNativeHls =
        typeof video.canPlayType === 'function' &&
        video.canPlayType('application/vnd.apple.mpegurl') !== '';

      if (hasNativeHls) {
        video.src = hlsSrc;
        return () => {
          video.removeAttribute('src');
        };
      }

      // Other browsers → hls.js
      if (Hls.isSupported()) {
        hlsInstance = new Hls({ maxBufferLength: 30, backBufferLength: 30 });
        hlsInstance.loadSource(hlsSrc);
        hlsInstance.attachMedia(video);
      } else {
        // Fallback to progressive MP4
        video.src = `https://videodelivery.net/${uid}/downloads/default.mp4`;
      }

      return () => {
        if (hlsInstance) hlsInstance.destroy();
      };
    }, [uid]);

    return <video ref={videoRef} {...rest} />;
  }
);

CloudflareVideo.displayName = 'CloudflareVideo';
export default CloudflareVideo;
