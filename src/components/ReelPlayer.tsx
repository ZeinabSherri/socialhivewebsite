import { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import HeartBurst from './HeartBurst';
import VolumeToast from './VolumeToast';

interface ReelPlayerProps {
  videoUrl: string;
  poster?: string;
  isActive: boolean;
  globalMuted: boolean;
  onMuteToggle: () => void;
  onLike: () => void;
  height: number;
}

const ReelPlayer = ({
  videoUrl,
  poster,
  isActive,
  globalMuted,
  onMuteToggle,
  onLike,
  height
}: ReelPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showVolumeToast, setShowVolumeToast] = useState(false);
  
  // Tap handling
  const tapTimeoutRef = useRef<number | null>(null);
  const tapCountRef = useRef(0);
  const pressStateRef = useRef<{ isPressed: boolean; wasPlaying: boolean; holdTimeout?: number }>({
    isPressed: false,
    wasPlaying: false
  });

  // Auto play/pause based on active state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.muted = globalMuted;
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive, globalMuted]);

  // Mute state sync
  useEffect(() => {
    const video = videoRef.current;
    if (video && isActive) {
      video.muted = globalMuted;
    }
  }, [globalMuted, isActive]);

  // Tap gesture handling
  const handleVideoTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (pressStateRef.current.isPressed) return;

    tapCountRef.current += 1;
    
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    tapTimeoutRef.current = window.setTimeout(() => {
      if (tapCountRef.current === 1) {
        // Single tap - toggle mute
        onMuteToggle();
        setShowVolumeToast(true);
        setTimeout(() => setShowVolumeToast(false), 1000);
      } else if (tapCountRef.current === 2) {
        // Double tap - like with heart animation
        onLike();
        setShowHeartBurst(true);
        
        // Haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(15);
        }
      }
      tapCountRef.current = 0;
    }, 250);
  }, [onMuteToggle, onLike]);

  // Press and hold for pause
  const handlePressStart = useCallback((e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const video = videoRef.current;
    if (!video || !isActive || pressStateRef.current.isPressed) return;

    pressStateRef.current.isPressed = true;
    pressStateRef.current.wasPlaying = !video.paused;

    pressStateRef.current.holdTimeout = window.setTimeout(() => {
      if (pressStateRef.current.isPressed && isActive) {
        video.pause();
      }
    }, 300);
  }, [isActive]);

  const handlePressEnd = useCallback((e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const video = videoRef.current;
    if (!video) return;

    if (pressStateRef.current.holdTimeout) {
      clearTimeout(pressStateRef.current.holdTimeout);
      pressStateRef.current.holdTimeout = undefined;
    }

    const shouldResume = pressStateRef.current.isPressed && pressStateRef.current.wasPlaying && isActive;
    pressStateRef.current.isPressed = false;
    
    if (shouldResume) {
      video.play().catch(() => {});
    }
  }, [isActive]);

  return (
    <>
      {/* Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          objectPosition: 'center center',
          paddingLeft: 'max(14px, env(safe-area-inset-left))',
          paddingRight: 'max(14px, env(safe-area-inset-right))'
        }}
        loop
        muted={globalMuted}
        playsInline
        preload="metadata"
        poster={poster}
        onClick={handleVideoTap}
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Volume toast */}
      <VolumeToast isMuted={globalMuted} isVisible={showVolumeToast} />

      {/* Heart burst animation */}
      <AnimatePresence>
        {showHeartBurst && (
          <HeartBurst onComplete={() => setShowHeartBurst(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default ReelPlayer;