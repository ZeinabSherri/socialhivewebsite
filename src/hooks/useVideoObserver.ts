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
 */
export const useVideoObserver = (options: VideoObserverOptions) => {
  const activeObserverRef = useRef<IntersectionObserver | null>(null);
  const nearbyObserverRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Map<Element, number>>(new Map());

  const {
    root = null,
    rootMargin = "300px 0px",
    threshold = 0.6,
    onActiveChange,
    onNearby
  } = options;

  // Initialize observers
  useEffect(() => {
    // Primary observer for active playback
    activeObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = elementsRef.current.get(entry.target);
          if (index !== undefined) {
            const isActive = entry.isIntersecting && entry.intersectionRatio >= threshold;
            onActiveChange?.(index, isActive);
          }
        });
      },
      {
        root,
        rootMargin,
        threshold: [0, threshold]
      }
    );

    // Secondary observer for nearby warmup
    if (onNearby) {
      nearbyObserverRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const index = elementsRef.current.get(entry.target);
            if (index !== undefined) {
              onNearby(index, entry.isIntersecting);
            }
          });
        },
        {
          root,
          rootMargin: "800px 0px",
          threshold: 0.01
        }
      );
    }

    return () => {
      activeObserverRef.current?.disconnect();
      nearbyObserverRef.current?.disconnect();
    };
  }, [root, rootMargin, threshold, onActiveChange, onNearby]);

  // Function to register an element for observation
  const observe = useCallback((element: Element, index: number) => {
    if (!element) return;

    elementsRef.current.set(element, index);
    activeObserverRef.current?.observe(element);
    nearbyObserverRef.current?.observe(element);
  }, []);

  // Function to unregister an element
  const unobserve = useCallback((element: Element) => {
    if (!element) return;

    elementsRef.current.delete(element);
    activeObserverRef.current?.unobserve(element);
    nearbyObserverRef.current?.unobserve(element);
  }, []);

  // Cleanup function
  const disconnect = useCallback(() => {
    activeObserverRef.current?.disconnect();
    nearbyObserverRef.current?.disconnect();
    elementsRef.current.clear();
  }, []);

  return { observe, unobserve, disconnect };
};