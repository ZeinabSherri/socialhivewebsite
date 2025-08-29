import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  Volume2,
  VolumeX,
  ArrowLeft,
} from 'lucide-react';
import CloudflareStreamPlayer from './CloudflareStreamPlayer';
import { useCloudflareVideos, CloudflareVideo } from '@/hooks/useCloudflareVideos';
import { Skeleton } from '@/components/ui/skeleton';

const formatNumber = (num: number): string => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
};

const generateMockStats = () => ({
  likes: Math.floor(Math.random() * 50000) + 1000,
  comments: Math.floor(Math.random() * 1000) + 50,
  shares: Math.floor(Math.random() * 500) + 10,
});

const ReelsPage = () => {
  const { videos, loading, error } = useCloudflareVideos('reels');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoStats] = useState(() => 
    videos.reduce((acc, video) => ({
      ...acc,
      [video.uid]: generateMockStats()
    }), {} as Record<string, ReturnType<typeof generateMockStats>>)
  );

  // Calculate reel height dynamically
  const calculateReelHeight = useCallback(() => {
    const vh = window.innerHeight;
    const headerHeight = 0; // No header in reels
    const footerHeight = 64; // Bottom nav
    return vh - headerHeight - footerHeight;
  }, []);

  const [reelHeight, setReelHeight] = useState(calculateReelHeight);

  useEffect(() => {
    const handleResize = () => {
      setReelHeight(calculateReelHeight());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateReelHeight]);

  // Navigation functions
  const navigateToReel = useCallback((direction: 'up' | 'down') => {
    if (!videos.length) return;
    
    setCurrentIndex(prev => {
      if (direction === 'down') {
        return prev < videos.length - 1 ? prev + 1 : prev;
      } else {
        return prev > 0 ? prev - 1 : prev;
      }
    });
  }, [videos.length]);

  // Touch/swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > 50;
    const isDownSwipe = distance < -50;

    if (isUpSwipe) {
      navigateToReel('down');
    } else if (isDownSwipe) {
      navigateToReel('up');
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          navigateToReel('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigateToReel('down');
          break;
        case ' ': // Space bar for mute/unmute
          e.preventDefault();
          setIsMuted(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateToReel]);

  const toggleLike = (uid: string) => {
    setLikedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(uid)) {
        newSet.delete(uid);
      } else {
        newSet.add(uid);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md mx-auto px-4">
          <Skeleton className="h-12 w-3/4 bg-gray-800" />
          <Skeleton className="h-6 w-full bg-gray-800" />
          <Skeleton className="h-6 w-2/3 bg-gray-800" />
        </div>
      </div>
    );
  }

  if (error || !videos.length) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="text-6xl">📹</div>
          <h2 className="text-2xl font-bold">No Reels Available</h2>
          <p className="text-gray-400">
            {error || 'Check back later for new content!'}
          </p>
        </div>
      </div>
    );
  }

  const currentVideo = videos[currentIndex];
  const stats = videoStats[currentVideo.uid] || generateMockStats();

  return (
    <>
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div 
          ref={containerRef}
          className="relative bg-black overflow-hidden"
          style={{ height: `${reelHeight}px` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Current Video */}
          <div className="absolute inset-0">
            <CloudflareStreamPlayer
              uid={currentVideo.uid}
              autoplay
              muted={isMuted}
              controls={false}
              lazyLoad={false}
              className="w-full h-full"
            />
          </div>

          {/* UI Overlay */}
          <div className="absolute inset-0 flex">
            {/* Left side - tap to go to previous */}
            <div 
              className="flex-1 z-10"
              onClick={() => navigateToReel('up')}
            />
            
            {/* Right side - interactions */}
            <div className="w-16 flex flex-col justify-end items-center pb-20 space-y-6 z-20">
              {/* Like */}
              <button 
                onClick={() => toggleLike(currentVideo.uid)}
                className="flex flex-col items-center space-y-1"
              >
                <Heart 
                  size={32} 
                  className={`${
                    likedVideos.has(currentVideo.uid) 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-white'
                  } drop-shadow-lg`}
                />
                <span className="text-white text-xs font-medium drop-shadow-lg">
                  {formatNumber(stats.likes + (likedVideos.has(currentVideo.uid) ? 1 : 0))}
                </span>
              </button>

              {/* Comment */}
              <button className="flex flex-col items-center space-y-1">
                <MessageCircle size={32} className="text-white drop-shadow-lg" />
                <span className="text-white text-xs font-medium drop-shadow-lg">
                  {formatNumber(stats.comments)}
                </span>
              </button>

              {/* Share */}
              <button className="flex flex-col items-center space-y-1">
                <Send size={32} className="text-white drop-shadow-lg" />
                <span className="text-white text-xs font-medium drop-shadow-lg">
                  {formatNumber(stats.shares)}
                </span>
              </button>

              {/* More */}
              <button>
                <MoreHorizontal size={32} className="text-white drop-shadow-lg" />
              </button>

              {/* Mute/Unmute */}
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="mt-4"
              >
                {isMuted ? (
                  <VolumeX size={28} className="text-white drop-shadow-lg" />
                ) : (
                  <Volume2 size={28} className="text-white drop-shadow-lg" />
                )}
              </button>
            </div>
          </div>

          {/* Bottom info overlay */}
          <div className="absolute bottom-0 left-0 right-16 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <div className="space-y-3">
              {/* User info */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                  <span className="text-black font-bold text-sm">SH</span>
                </div>
                <span className="text-white font-semibold">socialhive</span>
                <button className="px-4 py-1 border border-white rounded-md">
                  <span className="text-white text-sm font-medium">Follow</span>
                </button>
              </div>

              {/* Description */}
              <p className="text-white text-sm pr-4">
                {currentVideo.title}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {currentVideo.tags.map((tag, index) => (
                  <span key={index} className="text-white text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="absolute top-4 right-4 bg-black/40 rounded-full px-3 py-1">
            <span className="text-white text-sm">
              {currentIndex + 1} / {videos.length}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="min-h-screen bg-black flex items-center justify-center p-8">
          <div className="relative w-[400px] h-[700px] bg-black rounded-2xl overflow-hidden shadow-2xl">
            {/* Current Video */}
            <CloudflareStreamPlayer
              uid={currentVideo.uid}
              autoplay
              muted={isMuted}
              controls={false}
              lazyLoad={false}
              className="w-full h-full"
            />

            {/* Desktop UI Overlay */}
            <div className="absolute inset-0 flex">
              {/* Left side - navigation */}
              <div className="flex-1 flex flex-col">
                {/* Top half - previous */}
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => navigateToReel('up')}
                />
                {/* Bottom half - next */}  
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => navigateToReel('down')}
                />
              </div>
              
              {/* Right side - interactions */}
              <div className="w-16 flex flex-col justify-end items-center pb-16 space-y-4">
                <button 
                  onClick={() => toggleLike(currentVideo.uid)}
                  className="flex flex-col items-center space-y-1"
                >
                  <Heart 
                    size={28} 
                    className={`${
                      likedVideos.has(currentVideo.uid) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-white'
                    } drop-shadow-lg`}
                  />
                  <span className="text-white text-xs font-medium drop-shadow-lg">
                    {formatNumber(stats.likes + (likedVideos.has(currentVideo.uid) ? 1 : 0))}
                  </span>
                </button>

                <button className="flex flex-col items-center space-y-1">
                  <MessageCircle size={28} className="text-white drop-shadow-lg" />
                  <span className="text-white text-xs font-medium drop-shadow-lg">
                    {formatNumber(stats.comments)}
                  </span>
                </button>

                <button className="flex flex-col items-center space-y-1">
                  <Send size={28} className="text-white drop-shadow-lg" />
                  <span className="text-white text-xs font-medium drop-shadow-lg">
                    {formatNumber(stats.shares)}
                  </span>
                </button>

                <button>
                  <MoreHorizontal size={28} className="text-white drop-shadow-lg" />
                </button>

                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="mt-2"
                >
                  {isMuted ? (
                    <VolumeX size={24} className="text-white drop-shadow-lg" />
                  ) : (
                    <Volume2 size={24} className="text-white drop-shadow-lg" />
                  )}
                </button>
              </div>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-16 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                    <span className="text-black font-bold text-xs">SH</span>
                  </div>
                  <span className="text-white font-semibold text-sm">socialhive</span>
                </div>
                <p className="text-white text-xs">
                  {currentVideo.title}
                </p>
                <div className="flex flex-wrap gap-1">
                  {currentVideo.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="text-white text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="absolute top-4 right-4 bg-black/50 rounded-full px-2 py-1">
              <span className="text-white text-xs">
                {currentIndex + 1} / {videos.length}
              </span>
            </div>
          </div>

          {/* Desktop navigation hints */}
          <div className="absolute left-8 top-1/2 transform -translate-y-1/2 text-white/60 text-sm">
            ↑ Previous
          </div>
          <div className="absolute left-8 top-1/2 transform -translate-y-1/2 mt-8 text-white/60 text-sm">
            ↓ Next
          </div>
        </div>
      </div>
    </>
  );
};

export default ReelsPage;