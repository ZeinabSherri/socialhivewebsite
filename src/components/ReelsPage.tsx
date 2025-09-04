import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { loadStreamItems, thumbSrc } from '../lib/stream';
import ReelVideo from './ReelVideo';

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

/** Cloudflare helpers */
const cfThumb = (uid: string, h = 720) => thumbSrc(uid, h);
const cfMp4 = (uid: string) => `https://videodelivery.net/${uid}/downloads/default.mp4`;

const ReelsPage = () => {
  /** Cloudflare reels loaded from /videos.json (section === "reels") */
  const [cfReels, setCfReels] = useState<Reel[]>([]);

  /** Your existing demo/local reels */
  const baseReels = useMemo<Reel[]>(
    () => [
      {
        id: 1,
        description:
          'Behind the scenes of our content creation process. From ideation to final production – see how we craft engaging content that converts! 🎬💡 #ContentCreation #BTS #Creative #VideoMarketing',
        likes: 16800,
        comments: 234,
        shares: 98,
        user: 'socialhive.agency',
        avatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
        audioTitle: 'Creative Process Mix',
        videoUrl: '/videos/demo1.mp4',
        poster: '/videos/demo1.jpg',
      },
      {
        id: 2,
        description:
          'Transform your social media presence with data-driven insights. Track performance and optimize content for maximum engagement! 📊✨ #Analytics #DataDriven',
        likes: 18420,
        comments: 287,
        shares: 142,
        user: 'socialhive.agency',
        avatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
        audioTitle: 'Analytics Trending Audio',
        videoUrl: '/videos/demo2.mp4',
        poster: '/videos/demo2.jpg',
      },
    ],
    []
  );

  /** Merge CF reels first so they appear on top */
  const reels = useMemo<Reel[]>(() => [...cfReels, ...baseReels], [cfReels, baseReels]);

  /** UI state */
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedReels, setLikedReels] = useState<Set<number>>(new Set());
  const [globalMuted, setGlobalMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const isNavigatingRef = useRef(false);

  /** Load Cloudflare reels */
  useEffect(() => {
    (async () => {
      try {
        const items = await loadStreamItems();
        const mapped: Reel[] = items
          .filter((v) => v.section === 'reels')
          .map((v, i) => ({
            id: 90000 + i,
            description: v.title || 'Reel',
            likes: 0,
            comments: 0,
            shares: 0,
            user: 'cloudflare.stream',
            avatar: '/images/socialhive.png',
            audioTitle: 'Original audio',
            videoUrl: cfMp4(v.uid),
            poster: cfThumb(v.uid, 720),
          }));
        setCfReels(mapped);
      } catch (e) {
        console.error('CF reels load failed', e);
      }
    })();
  }, []);

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
    viewCount: Math.floor(Math.random() * 100000) + 10000
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

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Mobile/Tablet Layout (< lg) */}
      <div className="lg:hidden w-full h-full">
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

      {/* Desktop Layout (lg+) */}
      <div className="hidden lg:flex w-full h-full">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-gradient-to-b from-black/60 to-transparent">
          <button
            onClick={() => window.history.back()}
            className="text-white hover:text-gray-300 p-2"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="text-white text-center">
            <h2 className="text-lg font-semibold">Reels</h2>
            <p className="text-sm text-gray-300">{currentIndex + 1} of {formattedReels.length}</p>
          </div>
          
          <div className="w-10" />
        </div>

        {/* Desktop content container */}
        <div className="flex-1 flex items-center justify-center pt-20 pb-8 px-8">
          {/* Main video column */}
          <div className="flex items-center gap-8">
            {/* Video container */}
            <div className="w-[520px] flex flex-col">
              {formattedReels.length > 0 && (
                <ReelVideo
                  key={formattedReels[currentIndex].id}
                  reel={formattedReels[currentIndex]}
                  isActive={true}
                  height={720} // 9:16 aspect ratio height for 520px width
                  onLike={handleLike}
                  isLiked={likedReels.has(formattedReels[currentIndex].id)}
                  globalMuted={globalMuted}
                  onMuteToggle={handleMuteToggle}
                  layout="desktop"
                />
              )}
            </div>

            {/* Navigation arrows */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => navigate('prev')}
                disabled={currentIndex === 0}
                className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} className="rotate-90" />
              </button>
              
              <button
                onClick={() => navigate('next')}
                disabled={currentIndex === formattedReels.length - 1}
                className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} className="-rotate-90" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReelsPage;