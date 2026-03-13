"use client";
import { useEffect } from "react";

export function useSingleActiveVideo(selector = "video") {
  useEffect(() => {
    const vids = Array.from(document.querySelectorAll<HTMLVideoElement>(selector));
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting && e.intersectionRatio > 0.6) {
          v.play().catch(() => {
            // Ignore autoplay blocked errors
          });
        } else {
          v.pause();
        }
      });
    }, { threshold: [0, 0.6, 1] });
    vids.forEach(v => obs.observe(v));
    return () => obs.disconnect();
  }, [selector]);
}