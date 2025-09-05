import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { generateAllReelsPosts, ALL_REELS_IDS } from '../data/categoryVideos';
import ReelVideo from './ReelVideo';
import ReelActionRail from './ReelActionRail';

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

  /** UI state */
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedReels, setLikedReels] = useState<Set<number>>(new Set());
  const [globalMuted, setGlobalMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const isNavigatingRef = useRef(false);

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

    // IntersectionObserver for desktop autoplay
    let observer: IntersectionObserver | null = null;
    
    if (window.matchMedia('(min-width: 1024px)').matches) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
              const index = parseInt(entry.target.getAttribute('data-index') || '0');
              if (index !== currentIndex && index >= 0 && index < formattedReels.length) {
                setCurrentIndex(index);
              }
            }
          });
        },
        {
          root: container,
          threshold: 0.6,
          rootMargin: '-10% 0px -10% 0px'
        }
      );

      // Observe all reel containers
      const reelElements = container.querySelectorAll('[data-index]');
      reelElements.forEach((element) => observer!.observe(element));
    } else {
      // Mobile scroll handler
      const handleScroll = () => {
        if (isNavigatingRef.current) return;
        
        const newIndex = Math.round(container.scrollTop / window.innerHeight);
        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < formattedReels.length) {
          setCurrentIndex(newIndex);
        }
      };

      container.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [currentIndex, formattedReels.length]);

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
                isActive={index === currentIndex}
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

      {/* Desktop Layout (lg+) - Mobile-like vertical scroller */}
      <div className="hidden lg:block">
        <div className="relative flex">
          {/* Center scroll container */}
          <div 
            ref={containerRef}
            className="flex-1 overflow-y-auto snap-y snap-mandatory scrollbar-hidden bg-transparent"
            style={{ 
              height: 'calc(100vh - 0px)',
              WebkitOverflowScrolling: 'touch'
            }}
            onWheel={(e) => {
              e.preventDefault();
              const direction = e.deltaY > 0 ? 'next' : 'prev';
              navigate(direction);
            }}
          >
            {formattedReels.map((reel, index) => (
              <div 
                key={reel.id} 
                className="snap-start snap-always flex justify-center items-center bg-transparent"
                style={{ minHeight: '100vh' }}
                data-index={index}
              >
                {/* Video Stage */}
                <div 
                  className="relative bg-transparent"
                  style={{
                    width: 'clamp(420px, 32vw, 620px)',
                    aspectRatio: '9 / 16',
                    maxHeight: '86vh'
                  }}
                  ref={(el) => {
                    // Debug sizing
                    if (el && index === currentIndex) {
                      const rect = el.getBoundingClientRect();
                      console.log(`Stage ${index} dimensions:`, rect.width, 'x', rect.height);
                      if (rect.width === 0 || rect.height === 0) {
                        console.warn('Stage has zero dimensions!');
                      }
                    }
                  }}
                >
                  <ReelVideo
                    reel={reel}
                    isActive={index === currentIndex}
                    height={0} // Height controlled by aspect ratio
                    onLike={handleLike}
                    isLiked={likedReels.has(reel.id)}
                    globalMuted={globalMuted}
                    onMuteToggle={handleMuteToggle}
                    layout="desktop-mobile-like"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Action Rail - Sticky beside the center */}
          <div 
            className="fixed z-20"
            style={{
              left: 'calc(50% + clamp(420px, 32vw, 620px) / 2 + 20px)',
              top: '50%',
              transform: 'translateY(-50%)'
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
  );
};

// Removed VideoStage component - integrated into main layout

export default ReelsPage;