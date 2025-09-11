import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft } from 'lucide-react';
import ReelViewer from './reels/ReelViewer';
import type { ReelData } from './reels/ReelViewer';

export interface Reel {
  id: number;
  title: string;
  description?: string;
  thumbnail: string;
  videoUrl: string;
  uid?: string;
  viewCount?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  user?: string;
  avatar?: string;
  audioTitle?: string;
}

interface ReelsViewerProps {
  reels: Reel[];
  initialIndex: number;
  category: string;
  onClose: () => void;
}

const ReelsViewer = ({ reels, initialIndex, category, onClose }: ReelsViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [likedReels, setLikedReels] = useState<Set<number>>(new Set());
  const [globalMuted, setGlobalMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const isNavigatingRef = useRef(false);

  // Convert reels to ReelData format
  const reelData: ReelData[] = reels.map(reel => ({
    id: reel.id,
    title: reel.title,
    description: reel.description,
    thumbnail: reel.thumbnail,
    videoUrl: reel.videoUrl,
    uid: reel.uid,
    viewCount: reel.viewCount,
    likes: reel.likes,
    comments: reel.comments,
    shares: reel.shares,
    user: reel.user,
    avatar: reel.avatar,
    audioTitle: reel.audioTitle,
    isCloudflare: true
  }));

  const navigate = useCallback((direction: 'prev' | 'next') => {
    if (isNavigatingRef.current) return;

    let newIndex = currentIndex;
    if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'next' && currentIndex < reelData.length - 1) {
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
  }, [currentIndex, reelData.length]);

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
          onClose();
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
  }, [navigate, onClose, globalMuted]);

  // Handle scroll-based navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isNavigatingRef.current) return;
      
      const newIndex = Math.round(container.scrollTop / window.innerHeight);
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < reelData.length) {
        setCurrentIndex(newIndex);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentIndex, reelData.length]);

  const handleLike = useCallback((reelId: number) => {
    setLikedReels(prev => {
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

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
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
          onClick={onClose}
          className="relative text-white hover:text-gray-300 p-2"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className="relative text-white text-center">
          <h2 className="font-semibold">{category}</h2>
          <p className="text-xs text-gray-300">{currentIndex + 1} of {reelData.length}</p>
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
        {reelData.map((reel, index) => (
          <ReelViewer
            key={reel.id}
            reel={reel}
            isActive={index === currentIndex}
            layout="mobile"
            onLike={handleLike}
            isLiked={likedReels.has(reel.id)}
            globalMuted={globalMuted}
            onMuteToggle={handleMuteToggle}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default ReelsViewer;