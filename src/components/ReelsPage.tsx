import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { generateExploreAllPosts, EXPLORE_ALL_UNIQUE_VIDEO_IDS } from '../data/categoryVideos';
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
  isCloudflare?: boolean;
};

const ReelsPage = () => {
  // Use Explore as the single source of truth - all category videos
  const allVideosPosts = useMemo(() => generateExploreAllPosts(), []);

  // Empty state flag
  const isEmpty = !EXPLORE_ALL_UNIQUE_VIDEO_IDS.length;

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
  const [activeIndex, setActiveIndex] = useState(0); // Single active reel
  const [likedReels, setLikedReels] = useState<Set<number>>(new Set());
  const [globalMuted, setGlobalMuted] = useState(true);
  const [, setNearbyReels] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const isNavigatingRef = useRef(false);


  // Video observer for autoplay control - single active only
  const { observe, disconnect } = useVideoObserver({
    root: containerRef.current,
    rootMargin: "300px 0px",
    threshold: 0.65, // Slightly higher threshold for cleaner switching
    onActiveChange: (index, isActive) => {
      if (isActive) {
        setActiveIndex(index);
        setCurrentIndex(index);
      }
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
    isCloudflare: reel.isCloudflare ?? false
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
        const items = containerRef.current.querySelectorAll('section[data-reel-id]');
        const target = items[newIndex] as HTMLElement | null;
        const top = target ? target.offsetTop : newIndex * window.innerHeight;
        containerRef.current.scrollTo({
          top,
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

  // Desktop scroll wheel navigation (vertical)
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (window.innerWidth >= 1024) {
        if (Math.abs(e.deltaY) > 30) {
          e.preventDefault();
          navigate(e.deltaY > 0 ? 'next' : 'prev');
        }
      }
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [navigate]);

  // Handle scroll-based navigation and IntersectionObserver (mobile only)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || window.innerWidth >= 1024) return; // Only for mobile

    // Register video elements with observer
    const reelElements = container.querySelectorAll('section[data-reel-id]');
    reelElements.forEach((element, index) => {
      observe(element, index);
    });

    return () => {
      disconnect();
    };
  }, [formattedReels.length, observe, disconnect]);


  return (
    <>
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-2">No reels yet</h2>
            <p className="text-gray-400">Add videos to Explore to see them here.</p>
          </div>
        </div>
      ) : (
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
                ref={(el) => { if (window.innerWidth < 1024) containerRef.current = el; }}
                className="w-full h-full overflow-y-auto snap-y snap-mandatory scrollbar-hidden"
                style={{ WebkitOverflowScrolling: 'touch' }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {formattedReels.map((reel, index) => (
                  <ReelVideo
                    key={reel.id}
                    reel={reel}
                    isActive={index === activeIndex}
                    height={window.innerHeight}
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

        </div>
      </div>
        </>
      )}
    </>
  );
};

// Removed VideoStage component - integrated into main layout

export default ReelsPage;