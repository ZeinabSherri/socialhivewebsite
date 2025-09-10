import { useCallback, useRef, useEffect } from 'react';

interface LazyVideoObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
  onEnterViewport?: (element: Element, index: number) => void;
  onExitViewport?: (element: Element, index: number) => void;
  onActiveChange?: (index: number, isActive: boolean) => void;
}

/**
 * Custom hook for lazy loading videos and managing autoplay
 * Only loads videos when they're ~200px from entering viewport
 * Enforces one-video-playing-at-a-time rule
 */
export const useLazyVideoObserver = (options: LazyVideoObserverOptions = {}) => {
  const {
    root = null,
    rootMargin = '200px 0px',
    threshold = 0.6,
    onEnterViewport,
    onExitViewport,
    onActiveChange
  } = options;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const playbackObserverRef = useRef<IntersectionObserver | null>(null);
  const elementMapRef = useRef<Map<Element, number>>(new Map());
  const activeVideoRef = useRef<Element | null>(null);

  // Initialize observers
  useEffect(() => {
    // Lazy loading observer - triggers video loading
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = elementMapRef.current.get(entry.target) ?? -1;
          
          if (entry.isIntersecting) {
            onEnterViewport?.(entry.target, index);
          } else {
            onExitViewport?.(entry.target, index);
          }
        });
      },
      { root, rootMargin, threshold: 0.1 }
    );

    // Playback observer - manages active video playback
    playbackObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = elementMapRef.current.get(entry.target) ?? -1;
          const isActive = entry.isIntersecting && entry.intersectionRatio >= threshold;
          
          if (isActive && activeVideoRef.current !== entry.target) {
            // Pause previous active video
            if (activeVideoRef.current) {
              const prevIndex = elementMapRef.current.get(activeVideoRef.current) ?? -1;
              onActiveChange?.(prevIndex, false);
            }
            
            // Set new active video
            activeVideoRef.current = entry.target;
            onActiveChange?.(index, true);
          } else if (!isActive && activeVideoRef.current === entry.target) {
            // Deactivate current video
            activeVideoRef.current = null;
            onActiveChange?.(index, false);
          }
        });
      },
      { root, rootMargin: '50px 0px', threshold }
    );

    return () => {
      observerRef.current?.disconnect();
      playbackObserverRef.current?.disconnect();
    };
  }, [root, rootMargin, threshold, onEnterViewport, onExitViewport, onActiveChange]);

  const observe = useCallback((element: Element, index: number) => {
    if (!element || !observerRef.current || !playbackObserverRef.current) return;
    
    elementMapRef.current.set(element, index);
    observerRef.current.observe(element);
    playbackObserverRef.current.observe(element);
  }, []);

  const unobserve = useCallback((element: Element) => {
    if (!element) return;
    
    elementMapRef.current.delete(element);
    observerRef.current?.unobserve(element);
    playbackObserverRef.current?.unobserve(element);
    
    if (activeVideoRef.current === element) {
      activeVideoRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    observerRef.current?.disconnect();
    playbackObserverRef.current?.disconnect();
    elementMapRef.current.clear();
    activeVideoRef.current = null;
  }, []);

  return { observe, unobserve, disconnect };
};