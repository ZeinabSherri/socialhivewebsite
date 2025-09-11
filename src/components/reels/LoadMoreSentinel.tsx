'use client';

import { useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useInfiniteVideos } from '../../hooks/useInfiniteVideos';

const LoadMoreSentinel = () => {
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteVideos();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !hasNextPage || isFetchingNextPage) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchNextPage();
        }
      },
      { rootMargin: '1200px' }
    );
    
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  return (
    <div ref={ref} className="h-12 flex items-center justify-center">
      {isFetchingNextPage && (
        <Loader2 className="w-6 h-6 text-white animate-spin" />
      )}
    </div>
  );
};

export default LoadMoreSentinel;