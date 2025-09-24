import { useEffect, useRef, useCallback } from 'react';
import { playbackBus } from '../lib/playbackBus';

export interface UseAutoplayVideoOptions {
  id: string;
  threshold?: number;
  rootMargin?: string;
  onVisibilityChange?: (isVisible: boolean) => void;
}

export function useAutoplayVideo({
  id,
  threshold = 0.6,
  rootMargin = '0px',
  onVisibilityChange
}: UseAutoplayVideoOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isVisibleRef = useRef(false);
  const attemptedPlayRef = useRef(false);

  // Save time before any operation that might affect playback
  const saveTimeAndResume = useCallback(async (video: HTMLVideoElement) => {
    const time = video.currentTime;
    const wasPlaying = !video.paused;
    
    // Wait a tick to let any video operations complete
    await new Promise(resolve => setTimeout(resolve, 0));
    
    if (Math.abs(video.currentTime - time) > 0.01) {
      video.currentTime = time;
    }
    
    if (wasPlaying && video.paused) {
      try {
        await video.play();
      } catch {
        // Ignore play failures
      }
    }
  }, []);

  // Initialize video with proper mobile attributes
  const initVideo = useCallback((video: HTMLVideoElement) => {
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('x-webkit-airplay', 'allow');
    video.preload = 'metadata';
    video.muted = true; // Start muted for autoplay
  }, []);

  // Safely attempt play with proper error handling
  const attemptPlay = useCallback(async (video: HTMLVideoElement) => {
    if (attemptedPlayRef.current) return;
    attemptedPlayRef.current = true;

    try {
      await video.play();
    } catch (err) {
      // On failure, try once more after a short delay
      setTimeout(async () => {
        if (!video.paused) return;
        try {
          video.muted = true; // Ensure muted for autoplay
          await video.play();
        } catch {
          // Give up after second attempt
        }
      }, 100);
    }
  }, []);

  // Handle visibility changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Create observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0]?.isIntersecting ?? false;
        isVisibleRef.current = isVisible;
        onVisibilityChange?.(isVisible);

        if (isVisible) {
          playbackBus.activate(id);
          attemptPlay(video);
        } else {
          video.pause();
          playbackBus.deactivate(id);
        }
      },
      { threshold, rootMargin }
    );

    // Observe video
    observerRef.current.observe(video);

    // Initial setup
    initVideo(video);

    return () => {
      observerRef.current?.disconnect();
      playbackBus.deactivate(id);
    };
  }, [id, threshold, rootMargin, onVisibilityChange, initVideo, attemptPlay]);

  // Subscribe to playback bus
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    return playbackBus.subscribe(id, (activeId) => {
      if (activeId === id) {
        if (isVisibleRef.current) {
          attemptPlay(video);
        }
      } else {
        video.pause();
      }
    });
  }, [id, attemptPlay]);

  // Handle visibility changes (tab/app switches)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVisibility = () => {
      if (document.hidden) {
        video.pause();
      } else if (isVisibleRef.current && playbackBus.getActiveId() === id) {
        attemptPlay(video);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [id, attemptPlay]);

  // Video error recovery
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleError = async () => {
      if (!isVisibleRef.current) return;
      await saveTimeAndResume(video);
    };

    const handleWaiting = () => {
      // Keep poster but preserve time
      const time = video.currentTime;
      setTimeout(() => {
        if (Math.abs(video.currentTime - time) > 0.01) {
          video.currentTime = time;
        }
      }, 0);
    };

    video.addEventListener('error', handleError);
    video.addEventListener('waiting', handleWaiting);

    return () => {
      video.removeEventListener('error', handleError);
      video.removeEventListener('waiting', handleWaiting);
    };
  }, [saveTimeAndResume]);

  const onUserInteract = useCallback(() => {
    playbackBus.markUserInteraction();
  }, []);

  // Toggle mute without restart
  const toggleMute = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    const time = video.currentTime;
    video.muted = !video.muted;
    
    await saveTimeAndResume(video);
  }, [saveTimeAndResume]);

  return {
    videoRef,
    onUserInteract,
    toggleMute,
    canUnmute: playbackBus.canUnmute()
  };
}