import { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Music } from 'lucide-react';
import HeartBurst from './HeartBurst';
import VolumeToast from './VolumeToast';
import { formatNumber } from '../lib/format';

interface ReelVideoProps {
  reel: {
    id: number;
    description: string;
    likes: number;
    comments: number;
    shares: number;
    user: string;
    avatar: string;
    audioTitle: string;
    videoUrl: string;
    poster?: string;
    viewCount?: number;
  };
  isActive: boolean;
  height: number;
  onLike: (reelId: number) => void;
  isLiked: boolean;
  globalMuted: boolean;
  onMuteToggle: () => void;
}

const ReelVideo = ({
  reel,
  isActive,
  height,
  onLike,
  isLiked,
  globalMuted,
  onMuteToggle
}: ReelVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showVolumeToast, setShowVolumeToast] = useState(false);
  const [expandedCaption, setExpandedCaption] = useState(false);
  
  // Tap handling
  const tapTimeoutRef = useRef<number | null>(null);
  const tapCountRef = useRef(0);
  const pressStateRef = useRef<{ isPressed: boolean; wasPlaying: boolean; holdTimeout?: number }>({
    isPressed: false,
    wasPlaying: false
  });

  // Progress tracking
  useEffect(() => {
    if (!isActive || !videoRef.current) return;

    const video = videoRef.current;
    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const interval = setInterval(updateProgress, 100);
    return () => clearInterval(interval);
  }, [isActive]);

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
      setProgress(0);
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
        onLike(reel.id);
        setShowHeartBurst(true);
        
        // Haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(15);
        }
      }
      tapCountRef.current = 0;
    }, 250);
  }, [onMuteToggle, onLike, reel.id]);

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

  const truncateText = (text: string, expanded: boolean) => {
    if (expanded) return text;
    const words = text.split(' ');
    if (words.length <= 15) return text;
    return words.slice(0, 15).join(' ') + '...';
  };

  return (
    <section
      className="relative bg-black w-full snap-start snap-always"
      style={{ height: `${height}px`, scrollSnapStop: 'always' }}
    >
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
        poster={reel.poster}
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
        <source src={reel.videoUrl} type="video/mp4" />
      </video>

      {/* Progress bar */}
      {isActive && (
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30 z-30"
          style={{
            paddingLeft: 'max(14px, env(safe-area-inset-left))',
            paddingRight: 'max(14px, env(safe-area-inset-right))',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)'
          }}
        >
          <div
            className="h-full bg-white transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Volume toast */}
      <VolumeToast isMuted={globalMuted} isVisible={showVolumeToast} />

      {/* Heart burst animation */}
      <AnimatePresence>
        {showHeartBurst && (
          <HeartBurst onComplete={() => setShowHeartBurst(false)} />
        )}
      </AnimatePresence>

      {/* Right action rail */}
      <div
        className="absolute right-0 flex flex-col space-y-5 z-20 pointer-events-auto"
        style={{ 
          bottom: '72px',
          paddingRight: 'max(14px, env(safe-area-inset-right))'
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike(reel.id);
          }}
          className="flex flex-col items-center text-white"
        >
          <Heart
            size={28}
            className={`transition-colors ${
              isLiked ? 'fill-red-500 text-red-500' : ''
            }`}
          />
          <span className="text-xs mt-1">{formatNumber(reel.likes + (isLiked ? 1 : 0))}</span>
        </button>

        <button className="flex flex-col items-center text-white">
          <MessageCircle size={28} />
          <span className="text-xs mt-1">{formatNumber(reel.comments)}</span>
        </button>

        <button className="flex flex-col items-center text-white">
          <Send size={28} />
          <span className="text-xs mt-1">Share</span>
        </button>

        <button className="flex flex-col items-center text-white">
          <Bookmark size={28} />
        </button>

        <button className="flex flex-col items-center text-white">
          <MoreHorizontal size={28} />
        </button>

        {/* Profile picture */}
        <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
          <img
            src={reel.avatar}
            alt={reel.user}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Bottom content area */}
      <div
        className="absolute bottom-0 left-0 right-16 text-white z-20"
        style={{
          paddingLeft: 'max(14px, env(safe-area-inset-left))',
          paddingBottom: '76px'
        }}
      >
        {/* User info */}
        <div className="flex items-center space-x-2 mb-2">
          <span className="font-semibold text-sm">@{reel.user}</span>
          <button className="text-white border border-white px-2 py-1 rounded text-xs">
            Follow
          </button>
        </div>

        {/* Caption */}
        <div className="mb-2">
          <p className="text-sm leading-relaxed">
            {truncateText(reel.description, expandedCaption)}
            {reel.description.split(' ').length > 15 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedCaption(!expandedCaption);
                }}
                className="text-gray-300 ml-1"
              >
                {expandedCaption ? 'less' : 'more'}
              </button>
            )}
          </p>
        </div>

        {/* Audio */}
        <div className="flex items-center space-x-2">
          <Music size={12} className="text-white" />
          <span className="text-xs text-gray-300">{reel.audioTitle}</span>
        </div>
      </div>
    </section>
  );
};

export default ReelVideo;