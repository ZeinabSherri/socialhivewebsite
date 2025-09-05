import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft } from 'lucide-react';
import ReelVideo from './ReelVideo';

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

  // Convert reels to proper format
  const formattedReels = reels.map(reel => ({
    id: reel.id,
    description: reel.description || reel.title || '',
    likes: reel.likes || Math.floor(Math.random() * 50000) + 1000,
    comments: reel.comments || Math.floor(Math.random() * 1000) + 50,
    shares: reel.shares || Math.floor(Math.random() * 500) + 25,
    user: reel.user || 'socialhive.agency',
    avatar: reel.avatar || '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
    audioTitle: reel.audioTitle || 'Original audio',
    videoUrl: reel.videoUrl,
    poster: reel.thumbnail,
    viewCount: reel.viewCount || Math.floor(Math.random() * 100000) + 10000,
    isCloudflare: true // All videos are Cloudflare Stream videos
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
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < formattedReels.length) {
        setCurrentIndex(newIndex);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentIndex, formattedReels.length]);

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
          />
        ))}
      </div>
    </motion.div>
  );
};

export default ReelsViewer;