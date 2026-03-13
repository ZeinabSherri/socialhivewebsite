"use client";
import React, { useEffect, useRef } from "react";
// Install if missing: npm i hls.js
import Hls from "hls.js";

type Props = {
  id: string;              // Cloudflare Stream ID
  className?: string;      // keep existing classes from PostCard
  muted: boolean;          // driven by parent button state
  autoPlay?: boolean;      // default true
};

export default function PostVideoLegacy({ id, className = "", muted, autoPlay = true }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current!;
    const src = `https://videodelivery.net/${id}/manifest/video.m3u8`;

    // Init once
    if (!video.dataset.__bound) {
      video.dataset.__bound = "1";
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src; // iOS/Safari
      } else if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        // Optional MP4 fallback if enabled in Cloudflare Stream
        video.src = `https://videodelivery.net/${id}/downloads/default.mp4`;
      }
    }

    // Apply mute state reliably
    video.muted = muted;
    if (!muted) video.volume = 1;

    // Autoplay/pause according to visibility if you already use IO externally; otherwise just try play
    if (autoPlay) video.play().catch(() => {});

  }, [id, muted, autoPlay]);

  return (
    <video
      ref={videoRef}
      className={className}
      playsInline
      preload="metadata"
      crossOrigin="anonymous"
      // Fill ONLY the post card, no global CSS change:
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      controls={false}
    />
  );
}