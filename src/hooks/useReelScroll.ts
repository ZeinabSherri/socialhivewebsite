"use client";
import { useEffect, useRef } from "react";

type Opts = {
  container: React.RefObject<HTMLElement>;
  itemSelector: string;           // e.g., ".reel-card" (use your existing class)
  throttleMs?: number;
  swipeThreshold?: number;        // px
};

export function useReelScroll({ container, itemSelector, throttleMs = 450, swipeThreshold = 60 }: Opts) {
  const busy = useRef(false);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const root = container.current;
    if (!root) return;

    const items = () => Array.from(root.querySelectorAll<HTMLElement>(itemSelector));

    const indexFromScroll = () => {
      const list = items();
      let best = 0, bestDist = Infinity;
      const top = root.getBoundingClientRect().top;
      for (let i = 0; i < list.length; i++) {
        const d = Math.abs(list[i].getBoundingClientRect().top - top);
        if (d < bestDist) { bestDist = d; best = i; }
      }
      return best;
    };

    const scrollToIndex = (i: number) => {
      const list = items();
      const clamped = Math.max(0, Math.min(i, list.length - 1));
      list[clamped]?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const throttle = (fn: () => void) => {
      if (busy.current) return;
      busy.current = true;
      fn();
      setTimeout(() => (busy.current = false), throttleMs);
    };

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 8) return;
      e.preventDefault();
      throttle(() => {
        const cur = indexFromScroll();
        scrollToIndex(e.deltaY > 0 ? cur + 1 : cur - 1);
      });
    };

    const onTouchStart = (e: TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current == null) return;
      const dy = touchStartY.current - (e.changedTouches[0]?.clientY ?? touchStartY.current);
      touchStartY.current = null;
      if (Math.abs(dy) < swipeThreshold) return;
      throttle(() => {
        const cur = indexFromScroll();
        scrollToIndex(dy > 0 ? cur + 1 : cur - 1);
      });
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      root.removeEventListener("wheel", onWheel as EventListener);
      root.removeEventListener("touchstart", onTouchStart as EventListener);
      root.removeEventListener("touchend", onTouchEnd as EventListener);
    };
  }, [container, itemSelector, throttleMs, swipeThreshold]);
}