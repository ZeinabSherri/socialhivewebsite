import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { generateAllReelsPosts } from '../data/categoryVideos';
import ReelVideo from './ReelVideo';
import ReelActionRail from './ReelActionRail';
import { useVideoObserver } from '../hooks/useVideoObserver';

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
  // Generate all reels from Home + Categories
  const allVideosPosts = useMemo(() => generateAllReelsPosts(), []);

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

  // Video observer for autoplay control
  const { observe, unobserve, disconnect } = useVideoObserver({
    root: containerRef.current,
    rootMargin: "300px 0px",
    threshold: 0.6,
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
    onNearby: (index, isNearby) => {
      setNearbyReels(prev => {
        const newSet = new Set(prev);
        if (isNearby) {
          newSet.add(index);
        } else {
          newSet.delete(index);
        }
        return newSet;
      });
    }
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

    // For mobile layout only - register video elements with observer
    const reelElements = container.querySelectorAll('[data-reel-index]');
    reelElements.forEach((element, index) => {
      observe(element, index);
    });

    return () => {
      disconnect();
    };
  }, [formattedReels.length, observe, disconnect]);

  // Desktop-specific observer setup
  useEffect(() => {
    // For desktop, we manage active state manually through navigation
    if (window.innerWidth >= 1024) {
      setActiveReels(new Set([currentIndex]));
    }
  }, [currentIndex]);

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

      {/* Desktop Layout (lg+) - Integrated with site shell */}
      <div className="hidden lg:flex justify-center items-center min-h-screen">
        <div className="relative">
          {/* Center video stage */}
          <div 
            className="relative bg-black rounded-xl overflow-hidden shadow-2xl"
            style={{
              width: 'clamp(420px, 32vw, 620px)',
              aspectRatio: '9 / 16',
              maxHeight: '86vh'
            }}
          >
            {formattedReels[currentIndex] && (
              <ReelVideo
                reel={formattedReels[currentIndex]}
                isActive={true} // Always active on desktop
                height={0} // Height controlled by aspect ratio
                onLike={handleLike}
                isLiked={likedReels.has(formattedReels[currentIndex].id)}
                globalMuted={globalMuted}
                onMuteToggle={handleMuteToggle}
                layout="desktop-mobile-like"
              />
            )}
          </div>

          {/* Navigation arrows */}
          {currentIndex > 0 && (
            <button
              onClick={() => navigate('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 -translate-x-full text-white hover:text-gray-300 z-30 bg-black/50 rounded-full p-2 backdrop-blur-sm"
            >
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
          )}
          
          {currentIndex < formattedReels.length - 1 && (
            <button
              onClick={() => navigate('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 translate-x-full text-white hover:text-gray-300 z-30 bg-black/50 rounded-full p-2 backdrop-blur-sm"
            >
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>
          )}

          {/* Action rail beside the stage */}
          <div 
            className="absolute z-20"
            style={{
              left: '100%',
              top: '50%',
              transform: 'translateY(-50%)',
              marginLeft: '20px'
            }}
          >
            {formattedReels.length > 0 && (
              <ReelActionRail
                likes={formattedReels[currentIndex].likes}
                comments={formattedReels[currentIndex].comments}
                shares={formattedReels[currentIndex].shares || 0}
                isLiked={likedReels.has(formattedReels[currentIndex].id)}
                onLike={() => handleLike(formattedReels[currentIndex].id)}
                avatar={formattedReels[currentIndex].avatar}
                user={formattedReels[currentIndex].user}
              />
            )}
          </div>

          {/* Progress indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {formattedReels.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all cursor-pointer ${
                  index === currentIndex ? 'bg-white w-8' : 'bg-white/50 w-1 hover:bg-white/75'
                }`}
                onClick={() => {
                  setCurrentIndex(index);
                  setActiveReels(new Set([index]));
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

// Removed VideoStage component - integrated into main layout

export default ReelsPage;