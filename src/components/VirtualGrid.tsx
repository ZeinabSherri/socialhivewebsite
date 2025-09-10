import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface VirtualGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  columns?: number;
  gap?: number;
  overscan?: number;
  className?: string;
}

/**
 * Virtualized grid component for performance
 * Only renders visible items plus overscan buffer
 */
export function VirtualGrid<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  columns = 3,
  gap = 4,
  overscan = 5,
  className = ''
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const rowHeight = itemHeight + gap;
  const totalRows = Math.ceil(items.length / columns);
  const totalHeight = totalRows * rowHeight - gap;

  const visibleRange = useMemo(() => {
    const visibleRows = Math.ceil(containerHeight / rowHeight);
    const startRow = Math.floor(scrollTop / rowHeight);
    const endRow = Math.min(startRow + visibleRows + overscan, totalRows);
    const safeStartRow = Math.max(0, startRow - overscan);

    const startIndex = safeStartRow * columns;
    const endIndex = Math.min(endRow * columns, items.length);

    return { startIndex, endIndex, startRow: safeStartRow };
  }, [scrollTop, containerHeight, rowHeight, totalRows, columns, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
  }, []);

  // Reset scroll position when items change
  useEffect(() => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [items]);

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-y-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${visibleRange.startRow * rowHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          <motion.div
            className={`grid grid-cols-${columns}`}
            style={{ gap: `${gap}px` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {visibleItems.map((item, index) => {
              const originalIndex = visibleRange.startIndex + index;
              return (
                <motion.div
                  key={originalIndex}
                  style={{ height: itemHeight }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (index % columns) * 0.05, duration: 0.3 }}
                >
                  {renderItem(item, originalIndex)}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}