import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import ReelVideo from './ReelVideo';
import { useVideoObserver } from '../hooks/useVideoObserver';
import { Reel } from './ReelsViewer';

interface DesktopReelsStageProps {
  reels: Reel[];
  initialIndex?: number;
  category?: string;
  onClose: () => void;
}

const DesktopReelsStage: React.FC<DesktopReelsStageProps> = ({
  reels,
  initialIndex = 0,
  category,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [likedReels, setLikedReels] = useState<Set<number>>(new Set());
  const [globalMuted, setGlobalMuted] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isNavigatingRef = useRef(false);

  // Formatted reels with defaults
  const formattedReels = useMemo(() => 
    reels.map(reel => ({
      ...reel,
      description: reel.description || reel.title || 'No description',
      likes: reel.likes || Math.floor(Math.random() * 10000) + 1000,
      comments: reel.comments || Math.floor(Math.random() * 500) + 50,
      shares: reel.shares || Math.floor(Math.random() * 200) + 20,
      user: reel.user || 'socialhive.agency',
      avatar: reel.avatar || '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      audioTitle: reel.audioTitle || 'Original audio',
      isCloudflare: true
    })), [reels]
  );

  // Video observer for autoplay and warmup
  const { observe, unobserve } = useVideoObserver({
    root: scrollRef.current,
    rootMargin: "300px 0px",
    threshold: 0.6,
    onActiveChange: (index, isActive) => {
      if (isActive && index !== currentIndex) {
        setCurrentIndex(index);
      }
    },
    onNearby: (index, isNearby) => {
      // Warmup nearby videos
      const videoElement = document.querySelector(`[data-desktop-reel-index="${index}"] video`) as HTMLVideoElement;
      if (videoElement && isNearby) {
        (videoElement as any).startWarmupLoad?.();
      }
    }
  });

  // Register video elements with observer
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const videoElements = container.querySelectorAll('[data-desktop-reel-index]');
    videoElements.forEach((element, index) => {
      observe(element, index);
    });

    return () => {
      videoElements.forEach((element) => {
        unobserve(element);
      });
    };
  }, [formattedReels, observe, unobserve]);

  // Navigate between reels
  const navigate = useCallback((direction: 'prev' | 'next') => {
    if (isNavigatingRef.current) return;

    const newIndex = direction === 'next' 
      ? Math.min(currentIndex + 1, formattedReels.length - 1)
      : Math.max(currentIndex - 1, 0);

    if (newIndex !== currentIndex) {
      isNavigatingRef.current = true;
      setCurrentIndex(newIndex);
      
      // Smooth scroll to new reel
      const container = scrollRef.current;
      if (container) {
        const targetElement = container.children[newIndex] as HTMLElement;
        if (targetElement) {
          targetElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }
      
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 300);
    }
  }, [currentIndex, formattedReels.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          navigate('prev');
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigate('next');
          break;
        case 'Escape':
          onClose();
          break;
        case 'm':
        case 'M':
          setGlobalMuted(prev => !prev);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, onClose]);

  // Handle like
  const handleLike = useCallback((reelId: number) => {
    setLikedReels(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(reelId)) {
        newLiked.delete(reelId);
      } else {
        newLiked.add(reelId);
      }
      return newLiked;
    });
  }, []);

  // Handle mute toggle
  const handleMuteToggle = useCallback(() => {
    setGlobalMuted(prev => !prev);
  }, []);

  return (
    <div className="flex h-screen bg-black">
      {/* Left Sidebar - preserved */}
      <div className="w-64 bg-black border-r border-gray-800 flex-shrink-0">
        {/* Sidebar content can be added here */}
      </div>

      {/* Center Stage - 9:16 aspect ratio */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative" style={{ width: 'clamp(420px, 32vw, 620px)', aspectRatio: '9/16', maxHeight: '86vh' }}>
          {/* Header overlay */}
          <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h2 className="text-white font-semibold text-lg">
                  {category ? `${category} Reels` : 'Reels'}
                </h2>
                <span className="text-gray-400 text-sm">
                  {currentIndex + 1} / {formattedReels.length}
                </span>
              </div>
              
              <button
                onClick={onClose}
                className="text-white hover:text-gray-300 p-1 rounded-full bg-black/30 backdrop-blur-sm"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Reels container */}
          <div 
            ref={scrollRef}
            className="w-full h-full overflow-y-auto snap-y snap-mandatory rounded-lg"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {formattedReels.map((reel, index) => (
              <div
                key={reel.id}
                data-desktop-reel-index={index}
                className="w-full h-full snap-start snap-always"
              >
                <ReelVideo
                  reel={reel}
                  isActive={index === currentIndex}
                  height={0} // Controlled by container
                  onLike={handleLike}
                  isLiked={likedReels.has(reel.id)}
                  globalMuted={globalMuted}
                  onMuteToggle={handleMuteToggle}
                  layout="desktop-mobile-like"
                />
              </div>
            ))}
          </div>

          {/* Navigation arrows */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col space-y-2 z-40">
            <button
              onClick={() => navigate('prev')}
              disabled={currentIndex === 0}
              className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 disabled:opacity-50 backdrop-blur-sm"
            >
              <ChevronUp size={20} />
            </button>
            <button
              onClick={() => navigate('next')}
              disabled={currentIndex === formattedReels.length - 1}
              className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 disabled:opacity-50 backdrop-blur-sm"
            >
              <ChevronDown size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - preserved */}
      <div className="w-80 bg-black border-l border-gray-800 flex-shrink-0">
        {/* Suggestions content can be added here */}
      </div>
    </div>
  );
};

export default DesktopReelsStage;