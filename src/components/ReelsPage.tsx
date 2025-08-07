import { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Send, VolumeX, Volume2, MoreHorizontal } from 'lucide-react';

const ReelsPage = () => {
  const [currentReel, setCurrentReel] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [likedReels, setLikedReels] = useState<Set<number>>(new Set());
  const [expandedDescription, setExpandedDescription] = useState<Set<number>>(new Set());
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isNavigatingRef = useRef(false);
  const lastTapRef = useRef(0);

  const reels = [
    {
      id: 1,
      title: 'Social Media Strategy Explained',
      description: 'Learn how we create winning social media strategies that drive real results for our clients. 🚀✨ #SocialMedia #Marketing #Strategy',
      likes: 15420,
      comments: 234,
      shares: 89,
      user: 'socialhive.agency',
      avatar: '🐝',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
      id: 2,
      title: 'Content Creation Process',
      description: 'Behind the scenes of our content creation process - from concept to viral post. 🎬💡 #ContentCreation #BTS #Creative',
      likes: 12890,
      comments: 187,
      shares: 56,
      user: 'socialhive.agency',
      avatar: '🐝',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    },
    {
      id: 3,
      title: 'Client Success Story',
      description: 'How we helped a local restaurant increase their sales by 300% in just 3 months. 📈🍕 #Success #ROI #Results',
      likes: 18750,
      comments: 312,
      shares: 145,
      user: 'socialhive.agency',
      avatar: '🐝',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    }
  ];

  const toggleMute = () => {
    setIsMuted(!isMuted);
    const currentVideo = videoRefs.current[currentReel];
    if (currentVideo) {
      currentVideo.muted = !isMuted;
    }
  };

  const togglePlayPause = () => {
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

  const handleVideoClick = (e: React.MouseEvent) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    
    if (timeSinceLastTap < 300) {
      // Double tap - like the video
      e.preventDefault();
      toggleLike(currentReel);
    } else {
      // Single tap - play/pause
      togglePlayPause();
    }
    
    lastTapRef.current = now;
  };

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

  const toggleDescription = (index: number) => {
    setExpandedDescription(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const getTruncatedDescription = (description: string, isExpanded: boolean) => {
    if (isExpanded) return description;
    const words = description.split(' ');
    return words.slice(0, 4).join(' ') + (words.length > 4 ? '...' : '');
  };

  const navigateToReel = useCallback((newIndex: number) => {
    if (isNavigatingRef.current || newIndex < 0 || newIndex >= reels.length) return;
    
    isNavigatingRef.current = true;
    setCurrentReel(newIndex);
    setProgress(0);
    
    const container = containerRef.current;
    if (container) {
      container.scrollTo({
        top: newIndex * window.innerHeight,
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

  // Handle video playback and autoplay
  useEffect(() => {
    const currentVideo = videoRefs.current[currentReel];
    if (!currentVideo) return;

    // Reset and setup current video
    currentVideo.currentTime = 0;
    currentVideo.muted = isMuted;
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

    // Handle video end
    const handleEnded = () => {
      setProgress(0);
      currentVideo.currentTime = 0;
      currentVideo.play().catch(console.error);
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
  }, [currentReel, isMuted, isPlaying, updateProgress]);

  // Handle scroll snap detection
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isNavigatingRef.current) return;
      
      const scrollTop = container.scrollTop;
      const itemHeight = window.innerHeight;
      const newIndex = Math.round(scrollTop / itemHeight);
      
      if (newIndex !== currentReel && newIndex >= 0 && newIndex < reels.length) {
        setCurrentReel(newIndex);
        setProgress(0);
      }
    };

    let scrollTimeout: NodeJS.Timeout;
    const debouncedScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 50);
    };

    container.addEventListener('scroll', debouncedScroll);
    return () => {
      container.removeEventListener('scroll', debouncedScroll);
      clearTimeout(scrollTimeout);
    };
  }, [currentReel, reels.length]);

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
        togglePlayPause();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
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

  return (
    <div className="h-screen w-screen bg-black overflow-hidden fixed inset-0">
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
            className="h-screen w-full relative bg-black flex-shrink-0"
            style={{ 
              scrollSnapAlign: 'start',
              scrollSnapStop: 'always'
            }}
          >
            <div className="relative w-full h-full overflow-hidden bg-black">
              {/* Video Background */}
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                className="w-full h-full object-cover cursor-pointer"
                loop
                muted={isMuted}
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

              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Black overlay when description is expanded */}
              {expandedDescription.has(index) && (
                <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none" />
              )}

              {/* Bottom Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
                <div 
                  className="h-full bg-white transition-all duration-75 ease-linear"
                  style={{ 
                    width: `${index === currentReel ? progress : 0}%`,
                    transition: index === currentReel ? 'width 0.1s linear' : 'width 0.3s ease-out'
                  }}
                />
              </div>

              {/* User Info - Bottom Left */}
              <div className={`absolute bottom-6 left-4 right-20 z-20 transition-all duration-300 ${
                expandedDescription.has(index) ? 'z-30' : ''
              }`}>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center border border-white/50 shadow-lg">
                    <span className="text-black text-xs font-bold">{reel.avatar}</span>
                  </div>
                  <span className="text-white font-semibold text-sm">{reel.user}</span>
                  <button className="border border-white text-white px-2 py-1 rounded text-xs font-medium hover:bg-white hover:text-black transition-colors">
                    Follow
                  </button>
                </div>
                
                <div className="mb-2">
                  <p className="text-white text-sm leading-relaxed pr-4 mb-1">
                    {getTruncatedDescription(reel.description, expandedDescription.has(index))}
                    {reel.description.split(' ').length > 4 && !expandedDescription.has(index) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDescription(index);
                        }}
                        className="text-gray-300 ml-1 hover:text-white transition-colors"
                      >
                        more
                      </button>
                    )}
                  </p>
                  {reel.description.split(' ').length > 4 && expandedDescription.has(index) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDescription(index);
                      }}
                      className="text-gray-300 text-xs hover:text-white transition-colors"
                    >
                      Show less
                    </button>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-white/20 flex items-center justify-center">
                    <span className="text-white text-xs">♪</span>
                  </div>
                  <span className="text-white text-xs opacity-75">Original audio</span>
                </div>
              </div>

              {/* Action Buttons - Right Side */}
              <div className="absolute bottom-6 right-3 z-20 flex flex-col space-y-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(index);
                  }}
                  className="flex flex-col items-center space-y-1 group"
                >
                  <div className={`transition-transform group-active:scale-95 ${
                    likedReels.has(index) ? 'text-red-500' : 'text-white'
                  }`}>
                    <Heart 
                      size={32} 
                      fill={likedReels.has(index) ? 'currentColor' : 'none'} 
                      strokeWidth={likedReels.has(index) ? 0 : 1.5}
                      className="drop-shadow-lg"
                    />
                  </div>
                  <span className="text-white text-xs font-medium drop-shadow-lg">
                    {(reel.likes + (likedReels.has(index) ? 1 : 0)).toLocaleString()}
                  </span>
                </button>

                <button className="flex flex-col items-center space-y-1 group">
                  <div className="text-white transition-transform group-active:scale-95">
                    <MessageCircle size={32} strokeWidth={1.5} className="drop-shadow-lg" />
                  </div>
                  <span className="text-white text-xs font-medium drop-shadow-lg">{reel.comments}</span>
                </button>

                <button className="flex flex-col items-center space-y-1 group">
                  <div className="text-white transition-transform group-active:scale-95">
                    <Send size={32} strokeWidth={1.5} className="drop-shadow-lg" />
                  </div>
                  <span className="text-white text-xs font-medium drop-shadow-lg">{reel.shares}</span>
                </button>

                <button className="flex flex-col items-center space-y-1 group">
                  <div className="text-white transition-transform group-active:scale-95">
                    <MoreHorizontal size={32} strokeWidth={1.5} className="drop-shadow-lg" />
                  </div>
                </button>

                {/* Mute/Unmute Button */}
                <button
                  onClick={toggleMute}
                  className="w-8 h-8 rounded-full bg-black/50 text-white backdrop-blur-sm transition-transform active:scale-95 border border-white/20 flex items-center justify-center"
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReelsPage;