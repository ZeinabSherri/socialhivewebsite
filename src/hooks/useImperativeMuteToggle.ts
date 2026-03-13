import { useCallback } from 'react';

/**
 * Imperatively toggles mute on a video element without causing a restart or re-mount.
 * Usage: const toggleMute = useImperativeMuteToggle(videoRef)
 *
 * @returns (nextMuted: boolean) => void
 */
export function useImperativeMuteToggle(videoRef: React.RefObject<HTMLVideoElement>) {
  return useCallback((nextMuted: boolean) => {
    const v = videoRef.current;
    if (!v) return;
    const t = v.currentTime;
    v.muted = nextMuted;
    // If paused, resume playback
    if (v.paused) v.play().catch(() => {});
    // Belt & suspenders: restore time if browser glitches
    if (Math.abs(v.currentTime - t) > 0.05) v.currentTime = t;
  }, [videoRef]);
}
