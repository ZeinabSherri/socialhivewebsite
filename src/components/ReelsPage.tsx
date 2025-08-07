import { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Send, MoreHorizontal, ChevronDown, Camera, Home, Search, Plus, Play, User, Music } from 'lucide-react';

const ReelsPage = () => {
  const [currentReel, setCurrentReel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [likedReels, setLikedReels] = useState<Set<number>>(new Set());
  const [expandedCaptions, setExpandedCaptions] = useState<Set<number>>(new Set());
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isNavigatingRef = useRef(false);

  const reels = [
    {
      id: 1,
      title: 'Social Media Strategy Explained',
      description: 'Learn how we create winning social media strategies that drive real results for our clients. Transform your business with proven digital marketing techniques that actually work! 🚀✨ #SocialMedia #Marketing #Strategy #DigitalMarketing #BusinessGrowth',
      likes: 15420,
      comments: 234,
      shares: 89,
      user: 'socialhive.agency',
      avatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      isFollowing: false,
      audioTitle: 'Original Audio',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
      id: 2,
      title: 'Content Creation Process',
      description: 'Behind the scenes of our content creation process - from concept to viral post. See how we craft engaging content that converts! 🎬💡 #ContentCreation #BTS #Creative #VideoMarketing',
      likes: 12890,
      comments: 187,
      shares: 56,
      user: 'socialhive.agency',
      avatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      isFollowing: false,
      audioTitle: 'Trending Audio',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    },
    {
      id: 3,
      title: 'Client Success Story',
      description: 'How we helped a local restaurant increase their sales by 300% in just 3 months through strategic social media marketing! 📈🍕 #Success #ROI #Results #RestaurantMarketing',
      likes: 18750,
      comments: 312,
      shares: 145,
      user: 'socialhive.agency',
      avatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      isFollowing: false,
      audioTitle: 'Success Stories Mix',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    }
  ];

  const toggleLike = (index: number) => {
    setLikedReels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleCaption = (index: number) => {
    setExpandedCaptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const navigateToReel = useCallback((newIndex: number) => {
    if (isNavigatingRef.current) return;
    
    // Handle infinite loop
    let targetIndex = newIndex;
    if (newIndex < 0) {
      targetIndex = reels.length - 1;
    } else if (newIndex >= reels.length) {
      targetIndex = 0;
    }
    
    isNavigatingRef.current = true;
    setCurrentReel(targetIndex);
    setProgress(0);
    
    const container = containerRef.current;
    if (container) {
      container.scrollTo({
        top: targetIndex * (window.innerHeight - 44 - 55),
        behavior: 'smooth'
      });
    }
    
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 300);
  }, [reels.length]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    containerRef.current?.setAttribute('data-start-y', touch.clientY.toString());
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;
    
    const startY = parseFloat(container.getAttribute('data-start-y') || '0');
    const endY = e.changedTouches[0].clientY;
    const diff = startY - endY;
    const threshold = 50;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe up - next reel
        navigateToReel(currentReel + 1);
      } else {
        // Swipe down - previous reel
        navigateToReel(currentReel - 1);
      }
    }
  }, [currentReel, navigateToReel]);

  const updateProgress = useCallback(() => {
    const currentVideo = videoRefs.current[currentReel];
    if (currentVideo && currentVideo.duration) {
      const progressPercent = (currentVideo.currentTime / currentVideo.duration) * 100;
      setProgress(progressPercent);
    }
  }, [currentReel]);

  const handleVideoClick = () => {
    const currentVideo = videoRefs.current[currentReel];
    if (currentVideo) {
      if (isPlaying) {
        currentVideo.pause();
      } else {
        currentVideo.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle video playback and autoplay
  useEffect(() => {
    const currentVideo = videoRefs.current[currentReel];
    if (!currentVideo) return;

    // Reset and setup current video
    currentVideo.currentTime = 0;
    setProgress(0);

    if (isPlaying) {
      currentVideo.play().catch(console.error);
    }

    // Pause all other videos
    videoRefs.current.forEach((video, index) => {
      if (video && index !== currentReel) {
        video.pause();
        video.currentTime = 0;
      }
    });

    // Set up progress tracking
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    progressIntervalRef.current = setInterval(updateProgress, 100);

    // Handle video end - loop to next
    const handleEnded = () => {
      navigateToReel(currentReel + 1);
    };

    currentVideo.addEventListener('ended', handleEnded);
    currentVideo.addEventListener('timeupdate', updateProgress);

    return () => {
      currentVideo.removeEventListener('ended', handleEnded);
      currentVideo.removeEventListener('timeupdate', updateProgress);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentReel, isPlaying, updateProgress, navigateToReel]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigateToReel(currentReel - 1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigateToReel(currentReel + 1);
      } else if (e.key === ' ') {
        e.preventDefault();
        handleVideoClick();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentReel, navigateToReel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const truncateText = (text: string, isExpanded: boolean): string => {
    if (isExpanded) return text;
    const words = text.split(' ');
    if (words.length <= 15) return text;
    return words.slice(0, 15).join(' ') + '...';
  };

  const currentReelData = reels[currentReel];

  return (
    <div className="h-screen w-screen bg-black overflow-hidden fixed inset-0 flex flex-col">
      {/* Header */}
      <div className="h-11 bg-black flex items-center justify-between px-4 z-50 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <span className="text-white font-semibold text-lg">Reels</span>
          <ChevronDown size={20} className="text-white" />
        </div>
        <button className="text-white">
          <Camera size={24} />
        </button>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative overflow-hidden">
        <div 
          ref={containerRef}
          className="h-full w-full overflow-y-auto scrollbar-hidden"
          style={{
            scrollSnapType: 'y mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {reels.map((reel, index) => (
            <div 
              key={reel.id} 
              className="relative bg-black flex-shrink-0"
              style={{ 
                height: `calc(100vh - 44px - 55px)`,
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always'
              }}
            >
              {/* Video */}
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                className="w-full h-full object-cover cursor-pointer"
                loop
                muted
                playsInline
                preload="metadata"
                onClick={handleVideoClick}
                onLoadedData={() => {
                  const video = videoRefs.current[index];
                  if (video && index === currentReel && isPlaying) {
                    video.play().catch(console.error);
                  }
                }}
              >
                <source src={reel.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Right Side Actions */}
              <div className="absolute right-3 bottom-24 flex flex-col space-y-6 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(index);
                  }}
                  className="flex flex-col items-center space-y-1"
                >
                  <Heart 
                    size={28} 
                    className={`${likedReels.has(index) ? 'text-red-500 fill-red-500' : 'text-white'} drop-shadow-lg`}
                    strokeWidth={likedReels.has(index) ? 0 : 1.5}
                  />
                  <span className="text-white text-xs font-medium drop-shadow-lg">
                    {formatNumber(reel.likes + (likedReels.has(index) ? 1 : 0))}
                  </span>
                </button>

                <button className="flex flex-col items-center space-y-1">
                  <MessageCircle size={28} className="text-white drop-shadow-lg" strokeWidth={1.5} />
                  <span className="text-white text-xs font-medium drop-shadow-lg">
                    {formatNumber(reel.comments)}
                  </span>
                </button>

                <button className="flex flex-col items-center space-y-1">
                  <Send size={28} className="text-white drop-shadow-lg" strokeWidth={1.5} />
                  <span className="text-white text-xs font-medium drop-shadow-lg">
                    {formatNumber(reel.shares)}
                  </span>
                </button>

                <button className="flex flex-col items-center space-y-1">
                  <MoreHorizontal size={28} className="text-white drop-shadow-lg" strokeWidth={1.5} />
                </button>

                {/* Audio Icon */}
                <button className="mt-4 w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-yellow-500 flex items-center justify-center border border-white">
                  <Music size={16} className="text-white" />
                </button>
              </div>

              {/* Profile & Caption Overlay */}
              <div className="absolute bottom-6 left-4 right-20 z-20 bg-gradient-to-t from-black/60 to-transparent pt-8">
                {/* Profile Info */}
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30">
                    <img src={reel.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-white font-semibold text-sm">{reel.user}</span>
                  {!reel.isFollowing && (
                    <span className="text-white text-sm font-semibold">• Follow</span>
                  )}
                </div>

                {/* Caption */}
                <div className="mb-2">
                  <p className="text-white text-sm leading-5 max-w-xs">
                    {truncateText(reel.description, expandedCaptions.has(index))}
                    {reel.description.split(' ').length > 15 && (
                      <button 
                        onClick={() => toggleCaption(index)}
                        className="text-gray-300 ml-1 font-medium"
                      >
                        {expandedCaptions.has(index) ? ' less' : ' more'}
                      </button>
                    )}
                  </p>
                </div>

                {/* Audio Info */}
                <div className="flex items-center space-x-2 pb-2">
                  <Music size={12} className="text-white" />
                  <span className="text-white text-xs">
                    {reel.user} • {reel.audioTitle}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
                <div 
                  className="h-full bg-white transition-all duration-75 ease-linear"
                  style={{ 
                    width: `${index === currentReel ? progress : 0}%`,
                    transition: index === currentReel ? 'width 0.1s linear' : 'width 0.3s ease-out'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="h-14 bg-black border-t border-gray-800/50 flex items-center justify-around px-4 z-50">
        <button className="flex flex-col items-center space-y-1">
          <Home size={24} className="text-white" strokeWidth={1.5} />
        </button>
        <button className="flex flex-col items-center space-y-1">
          <Search size={24} className="text-white" strokeWidth={1.5} />
        </button>
        <button className="flex flex-col items-center space-y-1">
          <Plus size={24} className="text-white" strokeWidth={1.5} />
        </button>
        <button className="flex flex-col items-center space-y-1">
          <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
            <Play size={16} className="text-black" fill="black" />
          </div>
        </button>
        <button className="flex flex-col items-center space-y-1">
          <User size={24} className="text-white" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default ReelsPage;