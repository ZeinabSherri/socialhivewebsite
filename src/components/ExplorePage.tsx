import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Search } from 'lucide-react';
import { loadStreamItems, thumbSrc } from '../lib/stream';
import { formatCount } from '../lib/format';
import ReelsViewer from './ReelsViewer';
import ExploreCategoryChips from './ExploreCategoryChips';
import type { StreamItem } from '../lib/stream';

type ExploreReel = {
  id: number;
  title: string;
  category: FilterName;
  thumbnail: string;
  videoUrl: string;
  description?: string;
  client?: string;
  likes?: number;
  comments?: number;
  viewCount?: number;
  uid?: string;
  isCloudflare?: boolean;
};

const cfThumb = (uid: string, h = 360) => thumbSrc(uid, h);
// Use CF’s downloadable MP4 so the native <video> keeps your exact UI
const cfMp4 = (uid: string) => `https://videodelivery.net/${uid}/downloads/default.mp4`;

const FILTERS = [
  'Beauty clinics',
  'Real Estate',
  'Restaurants and FnB',
  'Ecommerce',
  'Network operators',
  'Content\u00A0creation', // your label with NBSP
] as const;
type FilterName = (typeof FILTERS)[number];

/* ---- Static reels data - only videos ---- */
const STATIC_REELS: Record<FilterName, ExploreReel[]> = {
  'Beauty clinics': [
    { id: 101, title: 'Viral Marketing Campaign', category: 'Beauty clinics', thumbnail: '/videos/0521.mp4', videoUrl: '/videos/0521.mp4', description: 'Our most successful viral campaign that broke the internet.', client: 'SocialHive Agency', likes: 15420, comments: 2843, viewCount: 1200000 },
    { id: 103, title: 'Record-Breaking Launch', category: 'Beauty clinics', thumbnail: '/videos/0617 (1)(3).MP4', videoUrl: '/videos/0617 (1)(3).MP4', description: 'Product launch that exceeded all expectations and broke company records.', client: 'SocialHive Agency', likes: 12567, comments: 3421, viewCount: 850000 },
    { id: 105, title: 'Innovation Breakthrough', category: 'Beauty clinics', thumbnail: '/videos/0619 (2) (2).mp4', videoUrl: '/videos/0619 (2) (2).mp4', description: 'Revolutionary approach that redefined how brands connect with audiences.', client: 'SocialHive Agency', likes: 11249, comments: 1876, viewCount: 950000 }
  ],
  'Real Estate': [
    { id: 7, title: 'Market Analysis Deep Dive', category: 'Real Estate', thumbnail: '/videos/0626(2).mp4', videoUrl: '/videos/0626(2).mp4', description: 'Strategic analysis that revealed untapped market opportunities.', client: 'SocialHive Agency', likes: 2156, comments: 398, viewCount: 245000 }
  ],
  'Restaurants and FnB': [
    { id: 8, title: 'Visual Identity Revolution', category: 'Restaurants and FnB', thumbnail: '/videos/0627 (1).mp4', videoUrl: '/videos/0627 (1).mp4', description: 'Complete visual overhaul that transformed brand perception.', client: 'SocialHive Agency', likes: 4567, comments: 723, viewCount: 380000 }
  ],
  'Ecommerce': [
    { id: 9, title: 'Digital Marketing Mastery', category: 'Ecommerce', thumbnail: '/videos/0630 (1)(3).mp4', videoUrl: '/videos/0630 (1)(3).mp4', description: 'Multi-channel campaign that maximized reach and conversion.', client: 'SocialHive Agency', likes: 3765, comments: 612, viewCount: 425000 }
  ],
  'Network operators': [
    { id: 10, title: 'Tech Integration Pioneer', category: 'Network operators', thumbnail: '/videos/0703.mp4', videoUrl: '/videos/0703.mp4', description: 'First-to-market integration that set new industry standards.', client: 'SocialHive Agency', likes: 3456, comments: 534, viewCount: 290000 }
  ],
  'Content\u00A0creation': [
    { id: 2002, title: 'Tech Integration Pioneer', category: 'Content\u00A0creation', thumbnail: '/videos/0703.mp4', videoUrl: '/videos/0703.mp4', description: 'First-to-market integration that set new industry standards.', client: 'SocialHive Agency', likes: 3456, comments: 534, viewCount: 290000 }
  ]
};

const ExplorePage = () => {
  const [activeFilter, setActiveFilter] = useState<FilterName>('Beauty clinics');
  const [showReelsViewer, setShowReelsViewer] = useState(false);
  const [selectedReelIndex, setSelectedReelIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [cfReels, setCfReels] = useState<ExploreReel[]>([]);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});

  // guess category when videos.json has no "industry"
  const guessCategory = (title?: string, tags?: string[]): FilterName => {
    const text = `${title || ''} ${(tags || []).join(' ')}`.toLowerCase();
    if (text.includes('real estate')) return 'Real Estate';
    if (/(restaurant|fnb|food|cafe|coffee|kitchen)/.test(text)) return 'Restaurants and FnB';
    if (/(e-?commerce|shop|store|retail|cart)/.test(text)) return 'Ecommerce';
    if (/(network|operator|telecom|telco|isp)/.test(text)) return 'Network operators';
    if (/(content|creator|influencer|production|editing)/.test(text)) return 'Content\u00A0creation';
    return 'Beauty clinics';
  };

  // Load Cloudflare "explore" reels
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = await loadStreamItems();
        type ItemX = StreamItem & { category?: FilterName };
        const mapped: ExploreReel[] = (items as ItemX[])
          .filter((v) => v.section === 'explore')
          .map((v, idx) => ({
            id: 80000 + idx,
            title: v.title || 'Explore Reel',
            category: v.category ?? guessCategory(v.title, v.tags),
            thumbnail: cfThumb(v.uid, 360),
            videoUrl: cfMp4(v.uid),
            client: 'Cloudflare Stream',
            likes: Math.floor(Math.random() * 50000) + 1000,
            comments: Math.floor(Math.random() * 1000) + 50,
            viewCount: Math.floor(Math.random() * 1000000) + 10000,
            uid: v.uid,
            isCloudflare: true
          }));
        if (mounted) setCfReels(mapped);
      } catch (err) {
        console.error('Failed to load videos.json', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filters = [...FILTERS];

  // Combined reels: CF first, then static
  const allReels: ExploreReel[] = useMemo(() => {
    const staticReels = STATIC_REELS[activeFilter] || [];
    const cfInThisCategory = cfReels.filter(r => r.category === activeFilter);
    return [...cfInThisCategory, ...staticReels];
  }, [activeFilter, cfReels]);

  // Filtered reels based on search
  const filteredReels = useMemo(() => {
    if (!searchQuery.trim()) return allReels;
    const query = searchQuery.toLowerCase();
    return allReels.filter(reel => 
      reel.title.toLowerCase().includes(query) ||
      reel.description?.toLowerCase().includes(query) ||
      reel.client?.toLowerCase().includes(query)
    );
  }, [allReels, searchQuery]);

  // Keep grid videos muted and auto-play
  useEffect(() => {
    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        video.muted = true;
        video.play().catch(() => {});
      }
    });
  }, [filteredReels]);

  // Handle reel click
  const handleReelClick = (reel: ExploreReel, index: number) => {
    setSelectedReelIndex(index);
    setShowReelsViewer(true);
    
    // Update URL with deep link
    const params = new URLSearchParams();
    params.set('category', activeFilter);
    params.set('reel', reel.id.toString());
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  // Handle category change
  const handleCategoryChange = (newCategory: FilterName) => {
    setActiveFilter(newCategory);
    setSearchQuery(''); // Clear search when changing category
  };


  // Handle deep linking on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('category') as FilterName;
    const reelParam = params.get('reel');
    
    if (categoryParam && FILTERS.includes(categoryParam)) {
      setActiveFilter(categoryParam);
    }
    
    if (reelParam) {
      // Will be handled once reels are loaded
      const reelId = parseInt(reelParam);
      setTimeout(() => {
        const allReelsFlat = Object.values(STATIC_REELS).flat().concat(cfReels);
        const reelIndex = allReelsFlat.findIndex(r => r.id === reelId);
        if (reelIndex >= 0) {
          setSelectedReelIndex(reelIndex);
          setShowReelsViewer(true);
        }
      }, 100);
    }
  }, [cfReels]);

  const renderReelGridItem = (reel: ExploreReel, index: number) => {
    const isCF = !!reel.uid;
    return (
      <div
        key={reel.id}
        onClick={() => handleReelClick(reel, index)}
        className="aspect-square bg-gray-900 cursor-pointer hover:scale-105 transition-all duration-200 relative group overflow-hidden rounded-sm"
      >
        <video
          ref={(el) => { if (el) videoRefs.current[reel.id] = el; }}
          src={reel.videoUrl}
          poster={reel.thumbnail}
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
          onLoadedData={(e) => { void e.currentTarget.play().catch(() => {}); }}
        />

        {/* Play icon overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
          <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="white" />
        </div>

        {/* View counter */}
        <div className="absolute bottom-2 left-2 view-counter text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
          <Play className="w-3 h-3" fill="white" />
          <span>{formatCount(reel.viewCount || 0)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto h-full bg-black">
      {/* Header with search */}
      <div className="reels-safe-padding reels-safe-top py-2 bg-black sticky top-0 z-20">
        <div className="flex items-center space-x-3 mb-3 mt-2">
          <h1 className="text-white text-xl font-bold">Explore</h1>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search reels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>

        <ExploreCategoryChips
          categories={filters}
          selectedCategory={activeFilter}
          onSelect={handleCategoryChange}
        />
      </div>

      {/* Reels grid */}
      <div 
        className="flex-1 overflow-y-auto reels-safe-bottom" 
        style={{ height: 'calc(100vh - 140px - env(safe-area-inset-bottom))' }}
      >
        {filteredReels.length > 0 ? (
          <motion.div 
            className="grid grid-cols-3 gap-1 p-1 pb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filteredReels.map((reel, index) => (
              <motion.div
                key={reel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                {renderReelGridItem(reel, index)}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Search className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No reels found</p>
            <p className="text-sm">Try a different search or category</p>
          </div>
        )}
      </div>

      {/* Full-screen reels viewer */}
      <AnimatePresence>
        {showReelsViewer && (
          <ReelsViewer
            reels={filteredReels.map(reel => ({
              id: reel.id,
              title: reel.title,
              description: reel.description,
              thumbnail: reel.thumbnail,
              videoUrl: reel.videoUrl,
              uid: reel.uid,
              viewCount: reel.viewCount,
              likes: reel.likes,
              comments: reel.comments,
              user: reel.client,
              avatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
              audioTitle: 'Original audio'
            }))}
            initialIndex={selectedReelIndex}
            category={activeFilter}
            onClose={() => {
              setShowReelsViewer(false);
              // Clear URL params
              window.history.pushState({}, '', window.location.pathname);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExplorePage;
