import { useCallback, useRef } from 'react';

/**
 * Debounces category changes and cancels in-flight requests
 * Fixes explore page category conflicts and lag
 */
export const useCategoryDebounce = (delay: number = 300) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const debounceCategory = useCallback((callback: () => void) => {
    // Cancel previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      if (!abortControllerRef.current?.signal.aborted) {
        callback();
      }
    }, delay);

    return abortControllerRef.current;
  }, [delay]);

  const cancelPending = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return { debounceCategory, cancelPending };
};