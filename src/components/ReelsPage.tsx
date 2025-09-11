import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { generateExploreAllPosts, EXPLORE_ALL_UNIQUE_VIDEO_IDS } from '../data/categoryVideos';
import ReelVideo from './ReelVideo';

/** Use the same reel type as ReelsViewer for consistency */
interface Reel {
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

const ReelsPage = () => {
  // Use the same data source as ExplorePage - all category videos
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

  // Convert to reel format (same as ExplorePage but with additional fields)
  const reels = useMemo<Reel[]>(() => {
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
      audioTitle: 'Original audio'
    }));
  }, [allVideosPosts]);

  // UI state - same as ReelsViewer
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedReels, setLikedReels] = useState<Set<number>>(new Set());
  const [globalMuted, setGlobalMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const isNavigatingRef = useRef(false);

  // Convert reels to proper format for ReelVideo component
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
    isCloudflare: true // All videos use Cloudflare
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

  // Like handling - same as ReelsViewer
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

  // Handle touch/swipe navigation - same as ReelsViewer
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

  // Keyboard navigation - same as ReelsViewer
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

  // Handle scroll-based navigation - same as ReelsViewer
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

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header - same as ReelsViewer */}
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

      {/* Reels container - vertical scroll for all devices */}
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
            layout="mobile" // Use mobile layout for all devices for consistent vertical scroll
          />
        ))}
      </div>
    </motion.div>
  );
};

export default ReelsPage;