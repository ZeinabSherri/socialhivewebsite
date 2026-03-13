// components/ControllableReelVideo.tsx
"use client";
import React, { useEffect, useRef } from "react";
// npm i hls.js
import Hls from "hls.js";

type Props = {
  id: string;            // Cloudflare Stream ID
  className?: string;    // keep existing classes from the card
  muted?: boolean;       // controlled by parent button/state
  autoPlay?: boolean;    // default true
  loop?: boolean;        // default true
};

export default function ControllableReelVideo({
  id,
  className = "",
  muted = true,
  autoPlay = true,
  loop = true,
}: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    const el = ref.current!;
    if (!el || initialized.current) return;

    const src = `https://videodelivery.net/${id}/manifest/video.m3u8`;

    // Safari/iOS natively supports HLS
    if (el.canPlayType("application/vnd.apple.mpegurl")) {
      el.src = src;
    } else if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(el);
      el.addEventListener("loadedmetadata", () => {
        if (autoPlay) el.play().catch(() => {});
      });
      return () => hls.destroy();
    } else {
      // Optional MP4 fallback if enabled on Stream
      el.src = `https://videodelivery.net/${id}/downloads/default.mp4`;
    }

    initialized.current = true;
  }, [id, autoPlay]);

  // Keep mute/unmute fully controllable
  useEffect(() => {
    const el = ref.current!;
    if (!el) return;
    el.muted = !!muted;
    if (!muted) el.volume = 1;
    if (autoPlay) el.play().catch(() => {});
  }, [muted, autoPlay]);

  return (
    <video
      ref={ref}
      className={className}          // do not change classes
      playsInline
      preload="metadata"
      crossOrigin="anonymous"
      controls={false}
      loop={loop}
      // make the video fill the existing card area, no CSS file edits:
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
  );
}