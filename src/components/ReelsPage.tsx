import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { generateExploreAllPosts, EXPLORE_ALL_UNIQUE_VIDEO_IDS } from '../data/categoryVideos';
import ReelVideo from './ReelVideo';
import ReelActionRail from './ReelActionRail';
import { useLazyVideoObserver } from '../hooks/useLazyVideoObserver';

/** Types */
type Reel = {
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
};

const ReelsPage = () => {
  // Use Explore as the single source of truth - all category videos
  const allVideosPosts = useMemo(() => generateExploreAllPosts(), []);

  // Empty state if no videos
  if (!EXPLORE_ALL_UNIQUE_VIDEO_IDS.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-2">No reels yet</h2>
          <p className="text-gray-400">Add videos to Explore to see them here.</p>
        </div>
      </div>
    );
  }

  // Convert to reel format
  const reels = useMemo<Reel[]>(() => {
    return allVideosPosts.map((post, index) => ({
      id: parseInt(post.id.replace(/\D/g, '')) || index,
      description: post.caption,
      likes: post.likesCount,
      comments: post.commentsCount,
      shares: Math.floor(Math.random() * 100) + 10,
      user: post.user.handle,
      avatar: post.user.avatarUrl,
      audioTitle: 'Original audio',
      videoUrl: post.cloudflareId, // Use cloudflareId directly for CloudflareStreamPlayer
      poster: `https://videodelivery.net/${post.cloudflareId}/thumbnails/thumbnail.jpg?time=1s&height=720`,
      isCloudflare: true
    }));
  }, [allVideosPosts]);

  // UI state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedReels, setLikedReels] = useState<Set<number>>(new Set());
  const [globalMuted, setGlobalMuted] = useState(true);
  const [activeReels, setActiveReels] = useState<Set<number>>(new Set());
  const [nearbyReels, setNearbyReels] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const isNavigatingRef = useRef(false);

  // Lazy video observer for performance - only load videos near viewport
  const { observe, unobserve, disconnect } = useLazyVideoObserver({
    root: containerRef.current,
    rootMargin: "200px 0px", // Load videos 200px before they enter viewport
    threshold: 0.6,
    onEnterViewport: (element, index) => {
      // Trigger video loading when near viewport
      const video = element.querySelector('video');
      if (video && video.preload === 'none') {
        video.preload = 'metadata';
      }
    },
    onActiveChange: (index, isActive) => {
      setActiveReels(prev => {
        const newSet = new Set(prev);
        if (isActive) {
          newSet.add(index);
          setCurrentIndex(index);
        } else {
          newSet.delete(index);
        }
        return newSet;
      });
    },
  });

  // No need for additional loading - everything is generated from categories

  // Convert reels to proper format
  const formattedReels = reels.map(reel => ({
    id: reel.id,
    description: reel.description || '',
    likes: reel.likes || Math.floor(Math.random() * 50000) + 1000,
    comments: reel.comments || Math.floor(Math.random() * 1000) + 50,
    shares: Math.floor(Math.random() * 500) + 25,
    user: reel.user || 'socialhive.agency',
    avatar: reel.avatar || '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
    audioTitle: reel.audioTitle || 'Original audio',
    videoUrl: reel.videoUrl,
    poster: reel.poster,
    viewCount: Math.floor(Math.random() * 100000) + 10000,
    isCloudflare: (reel as any).isCloudflare || false
  }));

  const navigate = useCallback((direction: 'prev' | 'next') => {
    if (isNavigatingRef.current) return;

    let newIndex = currentIndex;
    if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'next' && currentIndex < formattedReels.length - 1) {
      newIndex = currentIndex + 1;
    }

    if (newIndex !== currentIndex) {
      isNavigatingRef.current = true;
      setCurrentIndex(newIndex);
      
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: newIndex * window.innerHeight,
          behavior: 'smooth'
        });
      }

      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 300);
    }
  }, [currentIndex, formattedReels.length]);

  /** Likes */
  const handleLike = useCallback((reelId: number) => {
    setLikedReels((prev) => {
      const s = new Set(prev);
      if (s.has(reelId)) s.delete(reelId);
      else s.add(reelId);
      return s;
    });
  }, []);

  const handleMuteToggle = useCallback(() => {
    setGlobalMuted(!globalMuted);
  }, [globalMuted]);

  // Handle touch/swipe navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    containerRef.current?.setAttribute('data-start-y', `${e.touches[0].clientY}`);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const startY = parseFloat(containerRef.current?.getAttribute('data-start-y') || '0');
    const endY = e.changedTouches[0].clientY;
    const diff = startY - endY;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        navigate('next');
      } else {
        navigate('prev');
      }
    }
  }, [navigate]);

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
          // Could add close functionality
          break;
        case ' ':
          e.preventDefault();
          break;
        case 'm':
        case 'M':
          setGlobalMuted(!globalMuted);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, globalMuted]);

  // Handle scroll-based navigation and IntersectionObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Register video elements with observer for both mobile and desktop
    const reelElements = container.querySelectorAll('[data-reel-index]');
    reelElements.forEach((element, index) => {
      observe(element, index);
    });

    return () => {
      disconnect();
    };
  }, [formattedReels.length, observe, disconnect]);

  return (
    <>
      {/* Mobile/Tablet Layout (< lg) - Full Screen */}
      <motion.div
        className="lg:hidden fixed inset-0 bg-black z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="w-full h-full">
          {/* Header */}
          <div
            className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2"
            style={{
              paddingTop: 'max(8px, env(safe-area-inset-top))',
              paddingLeft: 'max(16px, env(safe-area-inset-left))',
              paddingRight: 'max(16px, env(safe-area-inset-right))'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
            
            <button
              onClick={() => window.history.back()}
              className="relative text-white hover:text-gray-300 p-2"
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="relative text-white text-center">
              <h2 className="font-semibold">Reels</h2>
              <p className="text-xs text-gray-300">{currentIndex + 1} of {formattedReels.length}</p>
            </div>
            
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          {/* Reels container */}
          <div
            ref={containerRef}
            className="w-full h-full overflow-y-auto snap-y snap-mandatory scrollbar-hidden"
            style={{ WebkitOverflowScrolling: 'touch' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {formattedReels.map((reel, index) => (
              <ReelVideo
                key={reel.id}
                reel={reel}
                isActive={activeReels.has(index)}
                height={window.innerHeight}
                onLike={handleLike}
                isLiked={likedReels.has(reel.id)}
                globalMuted={globalMuted}
                onMuteToggle={handleMuteToggle}
                layout="mobile"
                data-reel-index={index}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Desktop Layout (lg+) - Vertical scrolling full-screen reels */}
      <div className="hidden lg:block fixed inset-0 bg-black">
        <div 
          ref={containerRef}
          className="w-full h-full overflow-y-auto snap-y snap-mandatory"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {formattedReels.map((reel, index) => (
            <div
              key={reel.id}
              className="relative w-full h-screen snap-start flex items-center justify-center animate-fade-in"
              data-reel-index={index}
            >
              {/* Center video stage */}
              <div 
                className="relative bg-black rounded-xl overflow-hidden shadow-2xl"
                style={{
                  width: 'clamp(420px, 32vw, 620px)',
                  aspectRatio: '9 / 16',
                  maxHeight: '86vh'
                }}
              >
                <ReelVideo
                  reel={reel}
                  isActive={activeReels.has(index)}
                  height={0} // Height controlled by aspect ratio
                  onLike={handleLike}
                  isLiked={likedReels.has(reel.id)}
                  globalMuted={globalMuted}
                  onMuteToggle={handleMuteToggle}
                  layout="desktop-mobile-like"
                />
              </div>

              {/* Action rail beside the stage */}
              <div 
                className="absolute z-20"
                style={{
                  right: 'calc((100vw - min(620px, 32vw)) / 2 - 80px)',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              >
                <ReelActionRail
                  likes={reel.likes}
                  comments={reel.comments}
                  shares={reel.shares || 0}
                  isLiked={likedReels.has(reel.id)}
                  onLike={() => handleLike(reel.id)}
                  avatar={reel.avatar}
                  user={reel.user}
                />
              </div>

              {/* Video counter */}
              <div className="absolute top-4 right-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
                {index + 1} of {formattedReels.length}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// Removed VideoStage component - integrated into main layout

export default ReelsPage;