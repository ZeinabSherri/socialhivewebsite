"use client";
import React, { useRef, useEffect, forwardRef, useImperativeHandle } from "react";

type Props = { 
  id: string; 
  className?: string; 
  title?: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  poster?: string;
};

const CFStreamIframe = forwardRef<HTMLIFrameElement, Props>(({ 
  id, 
  className = "", 
  title = "video",
  autoPlay = true,
  muted = true,
  controls = false,
  poster
}, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useImperativeHandle(ref, () => iframeRef.current!, []);

  // Initialize muted autoplay on mount for iframe API
  useEffect(() => {
    if (!iframeRef.current) return;
    
    const timer = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({
          event: "command",
          func: "setMuted",
          args: [true]
        }),
        "*"
      );
    }, 100); // Small delay to ensure iframe is loaded

    return () => clearTimeout(timer);
  }, []);

  // Build iframe URL with parameters
  const params = new URLSearchParams();
  if (autoPlay) params.set('autoplay', 'true');
  if (muted) params.set('muted', 'true');
  if (!controls) params.set('controls', 'false');
  if (poster) params.set('poster', poster);
  params.set('preload', 'metadata');
  params.set('loop', 'true');
  
  const iframeSrc = `https://iframe.videodelivery.net/${id}?${params.toString()}`;

  // Keep parent layout intact, just swap the player
  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        loading="lazy"
        title={title}
        style={{ border: 0, width: "100%", height: "100%", display: "block" }}
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
});

CFStreamIframe.displayName = 'CFStreamIframe';

export default CFStreamIframe;