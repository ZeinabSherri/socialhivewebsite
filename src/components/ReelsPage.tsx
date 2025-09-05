import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { ALL_REELS_IDS } from '../data/categoryVideos';
import ReelItem from './ReelItem';
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
  // Generate reels from ALL_REELS_IDS
  const reels = useMemo<Reel[]>(() => {
    if (!ALL_REELS_IDS.length) return [];
    
    return ALL_REELS_IDS.map((cloudflareId, index) => ({
      id: index,
      description: `Reel ${index + 1} - Social Hive content`,
      likes: Math.floor(Math.random() * 50000) + 1000,
      comments: Math.floor(Math.random() * 1000) + 50,
      shares: Math.floor(Math.random() * 500) + 25,
      user: 'socialhive.agency',
      avatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      audioTitle: 'Original audio',
      videoUrl: cloudflareId,
      poster: `https://videodelivery.net/${cloudflareId}/thumbnails/thumbnail.jpg?time=1s&height=720`,
    }));
  }, []);

  // UI state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedReels, setLikedReels] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('liked-reels');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
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

  // Persist liked reels to localStorage
  useEffect(() => {
    localStorage.setItem('liked-reels', JSON.stringify([...likedReels]));
  }, [likedReels]);

  // Handle empty state
  if (!reels.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No reels yet</h2>
          <p className="text-gray-400">Check back later for new content</p>
        </div>
      </div>
    );
  }

  const navigate = useCallback((direction: 'prev' | 'next') => {
    if (isNavigatingRef.current) return;

    let newIndex = currentIndex;
    if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'next' && currentIndex < reels.length - 1) {
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
  }, [currentIndex, reels.length]);

  /** Likes */
  const handleLike = useCallback((reelId: number) => {
    setLikedReels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reelId)) {
        newSet.delete(reelId);
      } else {
        newSet.add(reelId);
      }
      return newSet;
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

    // Register reel elements with observer
    const reelElements = container.querySelectorAll('[data-reel-id]');
    reelElements.forEach((element, index) => {
      observe(element, index);
    });

    return () => {
      disconnect();
    };
  }, [reels.length, observe, disconnect]);

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
              <p className="text-xs text-gray-300">{currentIndex + 1} of {reels.length}</p>
            </div>
            
            <div className="w-10" />
          </div>

          {/* Reels container - using scroll as IO root */}
          <div
            ref={containerRef}
            className="w-full h-full overflow-y-auto snap-y snap-mandatory scrollbar-hidden"
            style={{ WebkitOverflowScrolling: 'touch' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {reels.map((reel, index) => (
              <ReelItem
                key={reel.id}
                reel={reel}
                isActive={activeReels.has(index)}
                isNearby={nearbyReels.has(index)}
                onLike={handleLike}
                isLiked={likedReels.has(reel.id)}
                globalMuted={globalMuted}
                onMuteToggle={handleMuteToggle}
                layout="mobile"
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
            {reels[currentIndex] && (
              <ReelItem
                reel={reels[currentIndex]}
                isActive={true}
                isNearby={true}
                onLike={handleLike}
                isLiked={likedReels.has(reels[currentIndex].id)}
                globalMuted={globalMuted}
                onMuteToggle={handleMuteToggle}
                layout="desktop"
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
          
          {currentIndex < reels.length - 1 && (
            <button
              onClick={() => navigate('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 translate-x-full text-white hover:text-gray-300 z-30 bg-black/50 rounded-full p-2 backdrop-blur-sm"
            >
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>
          )}

          {/* Progress indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {reels.map((_, index) => (
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

export default ReelsPage;