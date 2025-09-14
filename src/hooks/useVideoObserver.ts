import { useEffect, useRef, useCallback } from 'react';

export type VideoObserverOptions = {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
  onActiveChange?: (index: number, isActive: boolean) => void;
  onNearby?: (index: number, isNearby: boolean) => void;
};

/**
 * Custom hook for managing video autoplay with IntersectionObserver
 * Handles both active playback and nearby warmup loading
 * Enhanced with mobile autoplay support
 */
export const useVideoObserver = (options: VideoObserverOptions) => {
  const activeObserverRef = useRef<IntersectionObserver | null>(null);
  const nearbyObserverRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Map<Element, number>>(new Map());

  const {
    root = null,
    rootMargin = '200px 0px',
    threshold = 0.5,
    onActiveChange,
    onNearby
  } = options;

  const onEnter = useCallback(async (element: Element) => {
    const video = (element as HTMLElement).querySelector('video') as HTMLVideoElement | null;
    if (!video) return;
    try {
      video.muted = true;
      video.setAttribute('muted', '');
      await video.play();
    } catch {
      // ignore autoplay failures
    }
  }, []);

  const onLeave = useCallback((element: Element) => {
    const video = (element as HTMLElement).querySelector('video') as HTMLVideoElement | null;
    if (video) video.pause();
  }, []);

  useEffect(() => {
    activeObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = elementsRef.current.get(entry.target);
          if (idx === undefined) return;
          const isActive = entry.isIntersecting && entry.intersectionRatio >= threshold;
          onActiveChange?.(idx, isActive);

          try {
            if (isActive) onEnter(entry.target);
            else onLeave(entry.target);
          } catch {
            // ignore non-HTMLElements
          }
        });
      },
      { root, rootMargin, threshold: [0, threshold] }
    );

    if (onNearby) {
      nearbyObserverRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const idx = elementsRef.current.get(entry.target);
            if (idx === undefined) return;
            onNearby(idx, entry.isIntersecting);
          });
        },
        { root, rootMargin: '800px 0px', threshold: 0.01 }
      );
    }

    return () => {
      activeObserverRef.current?.disconnect();
      nearbyObserverRef.current?.disconnect();
    };
  }, [root, rootMargin, threshold, onActiveChange, onNearby, onEnter, onLeave]);

  const observe = useCallback((element: Element, index: number) => {
    if (!element) return;
    elementsRef.current.set(element, index);
    activeObserverRef.current?.observe(element);
    nearbyObserverRef.current?.observe(element);
  }, []);

  const unobserve = useCallback((element: Element) => {
    if (!element) return;
    elementsRef.current.delete(element);
    activeObserverRef.current?.unobserve(element);
    nearbyObserverRef.current?.unobserve(element);
  }, []);

  const disconnect = useCallback(() => {
    activeObserverRef.current?.disconnect();
    nearbyObserverRef.current?.disconnect();
    elementsRef.current.clear();
  }, []);

  return { observe, unobserve, disconnect };
};