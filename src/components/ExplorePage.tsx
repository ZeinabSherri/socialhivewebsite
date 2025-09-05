import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Search } from 'lucide-react';
import { formatCount } from '../lib/format';
import ReelsViewer from './ReelsViewer';
import ExploreCategoryChips from './ExploreCategoryChips';
import { CATEGORY_KEYS, CATEGORY_VIDEOS, generateCategoryPosts, type CategoryKey } from '../data/categoryVideos';

type ExploreReel = {
  id: number;
  title: string;
  category: CategoryKey;
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

const cfThumb = (uid: string, h = 360) => `https://videodelivery.net/${uid}/thumbnails/thumbnail.jpg?time=1s&height=${h}`;

const ExplorePage = () => {
  const [activeFilter, setActiveFilter] = useState<CategoryKey>('Beauty clinics');
  const [showReelsViewer, setShowReelsViewer] = useState(false);
  const [selectedReelIndex, setSelectedReelIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Generate reels from category videos
  const allReels: ExploreReel[] = useMemo(() => {
    const categoryPosts = generateCategoryPosts(activeFilter);
    return categoryPosts.map((post, index) => ({
      id: parseInt(post.id.replace(/\D/g, '')) || index,
      title: post.caption,
      category: activeFilter,
      thumbnail: cfThumb(post.cloudflareId, 360),
      videoUrl: post.cloudflareId, // Use UID directly for CloudflareStreamPlayer
      description: post.caption,
      client: post.user.name,
      likes: post.likesCount,
      comments: post.commentsCount,
      viewCount: Math.floor(Math.random() * 1000000) + 10000,
      uid: post.cloudflareId,
      isCloudflare: true
    }));
  }, [activeFilter]);

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
  const handleCategoryChange = (newCategory: CategoryKey) => {
    setActiveFilter(newCategory);
    setSearchQuery(''); // Clear search when changing category
  };

  // Handle deep linking on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('category') as CategoryKey;
    const reelParam = params.get('reel');
    
    if (categoryParam && CATEGORY_KEYS.includes(categoryParam)) {
      setActiveFilter(categoryParam);
    }
    
    if (reelParam) {
      const reelId = parseInt(reelParam);
      setTimeout(() => {
        const reelIndex = allReels.findIndex(r => r.id === reelId);
        if (reelIndex >= 0) {
          setSelectedReelIndex(reelIndex);
          setShowReelsViewer(true);
        }
      }, 100);
    }
  }, [allReels]);

  const renderReelGridItem = (reel: ExploreReel, index: number) => {
    return (
      <div
        key={reel.id}
        onClick={() => handleReelClick(reel, index)}
        className="aspect-square bg-gray-900 cursor-pointer hover:scale-105 transition-all duration-200 relative group overflow-hidden rounded-sm"
      >
        <img
          src={reel.thumbnail}
          alt={reel.title}
          className="w-full h-full object-cover"
        />

        {/* Play icon overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
          <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="white" />
        </div>

        {/* View counter */}
        <div className="absolute bottom-2 left-2 view-counter bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
          <Play className="w-3 h-3" fill="white" />
          <span>{formatCount(reel.viewCount || 0)}</span>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400 p-8">
      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <Play className="w-8 h-8 opacity-50" />
      </div>
      <p className="text-lg font-medium mb-2">No reels here yet</p>
      <p className="text-sm text-center">This category will have videos soon. Check back later!</p>
    </div>
  );

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
          categories={[...CATEGORY_KEYS]}
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
        ) : searchQuery.trim() ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Search className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No reels found</p>
            <p className="text-sm">Try a different search or category</p>
          </div>
        ) : (
          renderEmptyState()
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
      const reelId = parseInt(reelParam);
      setTimeout(() => {
        const reelIndex = allReels.findIndex(r => r.id === reelId);
        if (reelIndex >= 0) {
          setSelectedReelIndex(reelIndex);
          setShowReelsViewer(true);
        }
      }, 100);
    }
  }, [allReels]);

  const renderReelGridItem = (reel: ExploreReel, index: number) => {
    return (
      <div
        key={reel.id}
        onClick={() => handleReelClick(reel, index)}
        className="aspect-square bg-gray-900 cursor-pointer hover:scale-105 transition-all duration-200 relative group overflow-hidden rounded-sm"
      >
        <img
          src={reel.thumbnail}
          alt={reel.title}
          className="w-full h-full object-cover"
        />

        {/* Play icon overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
          <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="white" />
        </div>

        {/* View counter */}
        <div className="absolute bottom-2 left-2 view-counter bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
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