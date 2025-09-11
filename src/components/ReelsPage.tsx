'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { generateExploreAllPosts, EXPLORE_ALL_UNIQUE_VIDEO_IDS } from '../data/categoryVideos';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import ReelActionRail from './ReelActionRail';
import ReelViewer from './reels/ReelViewer';
import type { ReelData } from './reels/ReelViewer';
import { useVideoObserver } from '../hooks/useVideoObserver';

/** Types */

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

  // Convert to ReelData format for ReelViewer
  const reels = useMemo<ReelData[]>(() => {
    return allVideosPosts.map((post, index) => ({
      id: parseInt(post.id.replace(/\D/g, '')) || index,
      title: post.caption,
      description: post.caption,
      thumbnail: `https://videodelivery.net/${post.cloudflareId}/thumbnails/thumbnail.jpg?time=1s&height=720`,
      videoUrl: post.cloudflareId, // Use cloudflareId directly for CloudflareStreamPlayer
      uid: post.cloudflareId,
      viewCount: Math.floor(Math.random() * 100000) + 10000,
      likes: post.likesCount,
      comments: post.commentsCount,
      shares: Math.floor(Math.random() * 100) + 10,
      user: post.user.handle,
      avatar: post.user.avatarUrl,
      audioTitle: 'Original audio',
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

  // No additional processing needed - reels are already in correct format

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
        const isMobile = window.innerWidth < 1024;
        if (isMobile) {
          containerRef.current.scrollTo({
            top: newIndex * window.innerHeight,
            behavior: 'smooth'
          });
        } else {
          // Desktop: scroll to centered card
          const cardHeight = window.innerHeight * 0.8; // Approximate card height
          const gap = 32; // Gap between cards
          containerRef.current.scrollTo({
            top: newIndex * (cardHeight + gap),
            behavior: 'smooth'
          });
        }
      }

      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 300);
    }
  }, [currentIndex, reels.length]);

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

    // Register video elements with observer
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
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Mobile Layout (< md) - Full Screen */}
      <div className="md:hidden">
        <motion.div
          className="fixed inset-0 bg-black z-50"
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
              {reels.map((reel, index) => (
                <ReelViewer
                  key={reel.id}
                  reel={reel}
                  isActive={activeReels.has(index)}
                  layout="mobile"
                  onLike={handleLike}
                  isLiked={likedReels.has(reel.id)}
                  globalMuted={globalMuted}
                  onMuteToggle={handleMuteToggle}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Desktop & Tablet Layout (md+) - Instagram-style centered cards */}
      <div className="hidden md:grid grid-cols-[240px_minmax(420px,540px)_72px_1fr] gap-8 min-h-screen">
        {/* Left Sidebar */}
        <LeftSidebar 
          activeTab="reels"
          onTabChange={() => {}}
          onAddClick={() => {}}
          showAddPage={false}
        />

        {/* Main content - Centered cards with vertical scroll */}
        <main className="overflow-y-auto snap-y snap-mandatory py-8 space-y-8 scrollbar-hidden">
          {reels.map((reel, index) => (
            <ReelViewer
              key={reel.id}
              reel={reel}
              isActive={activeReels.has(index)}
              layout="centered-card"
              onLike={handleLike}
              isLiked={likedReels.has(reel.id)}
              globalMuted={globalMuted}
              onMuteToggle={handleMuteToggle}
              className="mb-8"
            />
          ))}
        </main>

        {/* Action Rail (sticky) */}
        <div className="sticky top-24 h-fit">
          {reels.length > 0 && reels[currentIndex] && (
            <ReelActionRail
              likes={reels[currentIndex].likes || 0}
              comments={reels[currentIndex].comments || 0}
              shares={reels[currentIndex].shares || 0}
              isLiked={likedReels.has(reels[currentIndex].id)}
              onLike={() => handleLike(reels[currentIndex].id)}
              avatar={reels[currentIndex].avatar || '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png'}
              user={reels[currentIndex].user || 'socialhive.agency'}
            />
          )}
        </div>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </div>
  );
};

// Removed VideoStage component - integrated into main layout

export default ReelsPage;