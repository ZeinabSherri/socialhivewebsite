import { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Send, VolumeX, Volume2, MoreHorizontal } from 'lucide-react';

const ReelsPage = () => {
  const [currentReel, setCurrentReel] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [likedReels, setLikedReels] = useState<Set<number>>(new Set());
  const [expandedDescription, setExpandedDescription] = useState<Set<number>>(new Set());
  const [showMuteIcon, setShowMuteIcon] = useState(false);
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
    },
    {
      id: 4,
      title: 'New Video Content',
      description: 'Amazing new video content added to our reels! 🎥✨ #NewContent #Video #Viral',
      likes: 8950,
      comments: 156,
      shares: 73,
      user: 'socialhive.agency',
      avatar: '🐝',
      videoUrl: 'https://drive.google.com/uc?export=download&id=1BxjRmZTs1U_KhlU2UeeVDuQ-R3Mqz_Jt'
    }
  ];

  const toggleMute = () => {
    setIsMuted(!isMuted);
    const currentVideo = videoRefs.current[currentReel];
    if (currentVideo) {
      currentVideo.muted = !isMuted;
    }
    
    // Show mute icon in center
    setShowMuteIcon(true);
    setTimeout(() => {
      setShowMuteIcon(false);
    }, 1000);
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
      // Single tap - toggle mute
      toggleMute();
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
    const maxWords = 12; // Show more words for better caption visibility
    return words.slice(0, maxWords).join(' ') + (words.length > maxWords ? '...' : '');
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
      {/* Progress Bar at Top */}
      <div className="absolute top-0 left-0 right-0 z-50 p-2">
        <div className="flex space-x-1">
          {reels.map((_, index) => (
            <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300 ease-linear"
                style={{ 
                  width: index < currentReel ? '100%' : 
                         index === currentReel ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>
      </div>

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
            className="h-screen w-full relative bg-black flex-shrink-0 flex flex-col"
            style={{ 
              scrollSnapAlign: 'start',
              scrollSnapStop: 'always'
            }}
          >
            {/* Video Container - Reduced height to leave space for caption */}
            <div className="relative w-full bg-black flex-1" style={{ height: 'calc(100vh - 70px)' }}>
              {/* User Info - Top level with sound icon */}
              <div className="absolute top-4 left-4 z-30 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center border border-white/50">
                  <span className="text-black text-xs font-bold">{reel.avatar}</span>
                </div>
                <span className="text-white font-semibold text-sm">{reel.user}</span>
                <button className="border border-white text-white px-2 py-1 rounded-full text-xs font-medium hover:bg-white hover:text-black transition-colors">
                  Follow
                </button>
              </div>
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                className="w-full h-full object-cover cursor-pointer"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
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

              {/* Center Mute/Unmute Icon */}
              {showMuteIcon && index === currentReel && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                  <div className="bg-black/70 backdrop-blur-sm rounded-full p-6 border border-white/20 animate-in fade-in-0 zoom-in-50 duration-300">
                    {isMuted ? (
                      <VolumeX size={48} className="text-white" strokeWidth={1.5} />
                    ) : (
                      <Volume2 size={48} className="text-white" strokeWidth={1.5} />
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons - Right Side, positioned within video area */}
              <div className="absolute bottom-4 right-3 z-30 flex flex-col space-y-4">
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

            {/* Caption Area - Always visible below video */}
            <div className="w-full bg-black/70 backdrop-blur-sm px-4 py-2" style={{ height: '70px', minHeight: '70px' }}>
              <div className="pr-16">
                <p className="text-white text-sm leading-[18px]" style={{ fontSize: '14px', lineHeight: '18px' }}>
                  {getTruncatedDescription(reel.description, expandedDescription.has(index))}
                  {reel.description.split(' ').length > 12 && !expandedDescription.has(index) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDescription(index);
                      }}
                      className="text-gray-300 ml-1 hover:text-white transition-colors font-medium"
                    >
                      more
                    </button>
                  )}
                </p>
                {reel.description.split(' ').length > 12 && expandedDescription.has(index) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDescription(index);
                    }}
                    className="text-gray-300 text-sm hover:text-white transition-colors font-medium mt-1"
                  >
                    Show less
                  </button>
                )}
              </div>
              
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-4 h-4 rounded bg-white/20 flex items-center justify-center">
                  <span className="text-white text-xs">♪</span>
                </div>
                <span className="text-white text-xs opacity-75">Original audio</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReelsPage;