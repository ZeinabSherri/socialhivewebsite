// src/components/CloudflareVideo.tsx
'use client';
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import Hls from 'hls.js';
import { playbackBus } from '../lib/playbackBus';

type CloudflareVideoProps = React.DetailedHTMLProps<
  React.VideoHTMLAttributes<HTMLVideoElement>,
  HTMLVideoElement
> & {
  /** Cloudflare Stream UID (unlisted/public). */
  uid: string;
  isActive?: boolean;
  onActiveChange?: (isActive: boolean) => void;
};

/**
 * CloudflareVideo
 * - Keeps a real <video> element so your refs/IntersectionObserver keep working.
 * - Uses native HLS on Safari; hls.js for other browsers.
 * - Falls back to progressive MP4 if HLS isn’t supported.
 */
const CloudflareVideo = forwardRef<HTMLVideoElement, CloudflareVideoProps>(
  ({ uid, isActive = false, onActiveChange, ...rest }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const playGenRef = useRef(0);
    const reelIdRef = useRef(`cloudflare-${uid}-${Date.now()}`);

    useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement);

    // Hard stop function for complete teardown - prevents audio-only issues
    const hardStop = () => {
      const video = videoRef.current;
      if (!video) return;

      try {
        // Invalidate current play generation
        playGenRef.current++;
        
        video.pause();
        video.muted = true;
        video.currentTime = 0;
        
        if (hlsRef.current) {
          hlsRef.current.stopLoad?.();
          hlsRef.current.detachMedia?.();
          hlsRef.current.destroy?.();
          hlsRef.current = null;
        }
        
        // Fully detach audio pipeline - single path cleanup
        video.removeAttribute('src');
        video.load(); // Keeps poster, guarantees no ghost audio
      } catch (error) {
        console.warn('Error in CloudflareVideo hardStop:', error);
      }
    };

    useEffect(() => {
      const video = videoRef.current;
      if (!video || !uid) return;

      // Get current play generation for race-condition guard
      const myPlayGen = ++playGenRef.current;

      const hlsSrc = `https://videodelivery.net/${uid}/manifest/video.m3u8`;

      // Set autoplay policy compliant attributes before attachment
      video.setAttribute('playsinline', '');
      video.setAttribute('muted', '');
      video.setAttribute('webkit-playsinline', 'true');
      video.playsInline = true;
      video.muted = true;
      video.preload = isActive ? 'auto' : 'metadata';

      // Single attach path - prevents audio-only issues
      const hasNativeHls =
        typeof video.canPlayType === 'function' &&
        video.canPlayType('application/vnd.apple.mpegurl') !== '';

      if (hasNativeHls) {
        // Native HLS (Safari) - never set both src and HLS
        if (hlsRef.current) {
          hlsRef.current.destroy?.();
          hlsRef.current = null;
        }
        video.src = hlsSrc;
      } else if (Hls.isSupported()) {
        // Other browsers → hls.js with single instance
        if (hlsRef.current) {
          hlsRef.current.stopLoad?.();
          hlsRef.current.detachMedia?.();
          hlsRef.current.destroy?.();
        }
        
        hlsRef.current = new Hls({ 
          maxBufferLength: 30, 
          backBufferLength: 30,
          enableWorker: true,
          lowLatencyMode: true,
          fragLoadingMaxRetry: 2,
          manifestLoadingMaxRetry: 2,
          startLevel: -1 // Auto quality
        });
        
        hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal && playGenRef.current === myPlayGen) {
            console.warn('CloudflareVideo HLS Fatal Error, falling back to MP4:', data);
            if (!video.src.includes('downloads')) {
              video.src = `https://videodelivery.net/${uid}/downloads/default.mp4`;
            }
          }
        });
        
        hlsRef.current.loadSource(hlsSrc);
        hlsRef.current.attachMedia(video);
      } else {
        // Fallback to progressive MP4
        video.src = `https://videodelivery.net/${uid}/downloads/default.mp4`;
      }

      // Autoplay when active with race condition protection
      if (isActive) {
        const attemptPlay = () => {
          if (playGenRef.current !== myPlayGen) return;
          
          requestAnimationFrame(() => {
            if (playGenRef.current === myPlayGen) {
              video.play().catch(() => {
                // Retry on canplay if needed
                const onCanPlay = () => {
                  if (playGenRef.current === myPlayGen) {
                    video.play().catch(() => {});
                  }
                  video.removeEventListener('canplay', onCanPlay);
                };
                video.addEventListener('canplay', onCanPlay, { once: true });
              });
            }
          });
        };

        if (video.readyState >= 1) {
          attemptPlay();
        } else {
          const onLoadedMetadata = () => {
            attemptPlay();
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
          };
          video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
        }
      }

      return () => {
        hardStop(); // Complete teardown on unmount
      };
    }, [uid, isActive]);

    // Handle active state changes with global coordination
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      if (isActive) {
        // Signal to playback bus
        playbackBus.activate(reelIdRef.current);
      } else {
        // Pause when not active
        video.pause();
        playbackBus.deactivate(reelIdRef.current);
      }

      onActiveChange?.(isActive);
    }, [isActive, onActiveChange]);

    // Subscribe to playback bus for global coordination
    useEffect(() => {
      const unsubscribe = playbackBus.subscribe(reelIdRef.current, (activeReelId) => {
        if (activeReelId !== reelIdRef.current) {
          const video = videoRef.current;
          if (video) {
            video.pause();
          }
        }
      });

      return unsubscribe;
    }, []);

    // Visibility change handling
    useEffect(() => {
      const handleVisibilityChange = () => {
        const video = videoRef.current;
        if (document.hidden && video) {
          video.pause();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    return <video ref={videoRef} {...rest} />;
  }
);

CloudflareVideo.displayName = 'CloudflareVideo';
export default CloudflareVideo;
