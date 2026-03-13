"use client";
import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

type Props = { 
  id: string; 
  className?: string; 
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  poster?: string;
};

export default function CFHls({ 
  id, 
  className = "", 
  autoPlay = true,
  muted = true,
  controls = false,
  poster
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current!;
    const src = `https://videodelivery.net/${id}/manifest/video.m3u8`;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari / iOS
      video.src = src;
      if (autoPlay) video.play().catch(() => {});
    } else if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) video.play().catch(() => {});
      });
      return () => hls.destroy();
    } else {
      // Last-ditch: MP4 fallback if enabled in Cloudflare Stream settings
      video.src = `https://videodelivery.net/${id}/downloads/default.mp4`;
      if (autoPlay) video.play().catch(() => {});
    }
  }, [id, autoPlay]);

  return (
    <video
      ref={videoRef}
      className={className}
      // Keep existing layout; only behavior flags below:
      playsInline
      muted={muted}
      controls={controls}
      preload="metadata"
      crossOrigin="anonymous"
      poster={poster}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
  );
}