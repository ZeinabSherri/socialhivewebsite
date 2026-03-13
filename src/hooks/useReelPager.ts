// hooks/useReelPager.ts
"use client";
import { useEffect, useRef, useState, useCallback } from "react";

type Opts = {
  container: React.RefObject<HTMLElement>;
  itemSelector: string;      // e.g. ".reel-card"
  throttleMs?: number;       // default 450
  swipeThreshold?: number;   // default 60
};

export function useReelPager({
  container,
  itemSelector,
  throttleMs = 450,
  swipeThreshold = 60,
}: Opts) {
  const [active, setActive] = useState(0);
  const busy = useRef(false);
  const touchStartY = useRef<number | null>(null);

  const goto = useCallback((i: number) => {
    const root = container.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>(itemSelector));
    const clamped = Math.max(0, Math.min(i, cards.length - 1));
    const el = cards[clamped];
    if (!el) return;
    busy.current = true;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => (busy.current = false), throttleMs);
  }, [container, itemSelector, throttleMs]);

  // Track which card is most visible
  useEffect(() => {
    const root = container.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>(itemSelector));
    if (!cards.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        let best = active, ratio = -1;
        for (const e of entries) {
          const idx = cards.indexOf(e.target as HTMLElement);
          if (idx >= 0 && e.intersectionRatio > ratio) {
            ratio = e.intersectionRatio; best = idx;
          }
        }
        setActive(best);
      },
      {
        threshold: Array.from({ length: 11 }, (_, i) => i / 10),
        root: (root.scrollHeight > root.clientHeight ? root : null),
        rootMargin: "0px 0px -1px 0px",
      }
    );

    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [container, itemSelector, active]);

  // Wheel + swipe; ignore if event originated inside a scrollable child
  useEffect(() => {
    const root = container.current;
    const listensOnWindow = !root || root.scrollHeight <= root.clientHeight;
    const wheelTarget = listensOnWindow ? window : root;

    const isFromScrollableChild = (target: EventTarget | null): boolean => {
      let el = target as HTMLElement | null;
      while (el && el !== root) {
        const canScroll = el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
        if (canScroll) return true;
        el = el.parentElement;
      }
      return false;
    };

    const onWheel = (e: WheelEvent) => {
      if (busy.current) return;
      if (isFromScrollableChild(e.target)) return;
      const dy = e.deltaY || 0;
      if (Math.abs(dy) < 2) return;
      e.preventDefault();
      goto(active + (dy > 0 ? 1 : -1)); // down -> next, up -> prev
    };

    const onTouchStart = (e: TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      const start = touchStartY.current; touchStartY.current = null;
      if (start == null) return;
      const dy = start - (e.changedTouches[0]?.clientY ?? start);
      if (Math.abs(dy) < swipeThreshold) return;
      goto(active + (dy > 0 ? 1 : -1));
    };

    wheelTarget.addEventListener("wheel", onWheel, { passive: false });
    (root ?? document).addEventListener("touchstart", onTouchStart, { passive: true });
    (root ?? document).addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      wheelTarget.removeEventListener("wheel", onWheel);
      (root ?? document).removeEventListener("touchstart", onTouchStart);
      (root ?? document).removeEventListener("touchend", onTouchEnd);
    };
  }, [container, active, throttleMs, swipeThreshold, goto]);
}