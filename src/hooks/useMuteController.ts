"use client";
import { useCallback } from "react";

type Target = HTMLVideoElement | HTMLIFrameElement | null;

export function useMuteController(targetRef: React.RefObject<Target>) {
  const setMuted = useCallback((muted: boolean) => {
    const el = targetRef.current;
    if (!el) return;

    if (el instanceof HTMLVideoElement) {
      el.muted = muted;
      if (!muted) el.volume = 1;
    } else {
      // Cloudflare Stream iframe API
      try {
        el.contentWindow?.postMessage(
          JSON.stringify({ event: "command", func: "setMuted", args: [muted] }),
          "*"
        );
      } catch (e) {
        // Ignore iframe postMessage errors
      }
    }
  }, [targetRef]);

  const toggleMute = useCallback(() => {
    const el = targetRef.current;
    if (!el) return;

    if (el instanceof HTMLVideoElement) {
      const next = !el.muted;
      el.muted = next;
      if (!next) el.volume = 1;
    } else {
      // Query current mute state isn't reliable via iframe; just flip a local flag:
      // Callers should track state in React state and pass desired mute on click.
      // For simplicity: send unmute; if already unmuted, send mute.
      el.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "toggleMuted" }), "*");
    }
  }, [targetRef]);

  return { setMuted, toggleMute };
}