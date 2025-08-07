import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Send, Bookmark, VolumeX, Volume2, MoreHorizontal } from 'lucide-react';

const ReelsPage = () => {
  const [currentReel, setCurrentReel] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [likedReels, setLikedReels] = useState<Set<number>>(new Set());
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const updateProgress = () => {
    const currentVideo = videoRefs.current[currentReel];
    if (currentVideo) {
      const progressPercent = (currentVideo.currentTime / currentVideo.duration) * 100;
      setProgress(progressPercent);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0 && currentReel < reels.length - 1) {
        // Swipe up - next reel
        setCurrentReel(currentReel + 1);
      } else if (diff < 0 && currentReel > 0) {
        // Swipe down - previous reel
        setCurrentReel(currentReel - 1);
      }
    }
  };

  // Handle video playback and autoplay
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentReel) {
          video.currentTime = 0;
          video.muted = isMuted;
          if (isPlaying) {
            video.play().catch(console.error);
          }
          
          // Set up progress tracking
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          progressIntervalRef.current = setInterval(updateProgress, 100);
          
          // Handle video end
          const handleEnded = () => {
            setProgress(0);
            video.currentTime = 0;
            video.play().catch(console.error);
          };
          
          video.addEventListener('ended', handleEnded);
          return () => video.removeEventListener('ended', handleEnded);
        } else {
          video.pause();
        }
      }
    });
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentReel, isMuted, isPlaying]);

  // Handle scroll snap detection
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const itemHeight = container.clientHeight;
      const newIndex = Math.round(scrollTop / itemHeight);
      
      if (newIndex !== currentReel && newIndex >= 0 && newIndex < reels.length) {
        setCurrentReel(newIndex);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentReel, reels.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const container = containerRef.current;
      if (!container) return;

      if (e.key === 'ArrowUp' && currentReel > 0) {
        container.scrollTo({
          top: (currentReel - 1) * container.clientHeight,
          behavior: 'smooth'
        });
      } else if (e.key === 'ArrowDown' && currentReel < reels.length - 1) {
        container.scrollTo({
          top: (currentReel + 1) * container.clientHeight,
          behavior: 'smooth'
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentReel, reels.length]);

  return (
    <div className="h-screen bg-black overflow-hidden">
      <div 
        ref={containerRef}
        className="h-full overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {reels.map((reel, index) => (
          <div 
            key={reel.id} 
            className={`absolute inset-0 w-full h-full transition-transform duration-300 ease-out ${
              index === currentReel ? 'translate-y-0' : 
              index < currentReel ? '-translate-y-full' : 'translate-y-full'
            }`}
            style={{ zIndex: index === currentReel ? 10 : 0 }}
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
                onClick={togglePlayPause}
                poster={`data:image/svg+xml;base64,${btoa(`
                  <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100%" height="100%" fill="#000"/>
                    <circle cx="50" cy="50" r="20" fill="#FCD34D"/>
                    <text x="50" y="58" text-anchor="middle" fill="#000" font-size="16">SH</text>
                  </svg>
                `)}`}
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

              {/* Progress Bar - Bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
                <div 
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{ width: `${index === currentReel ? progress : 0}%` }}
                />
              </div>

              {/* Reel indicators - Top */}
              <div className="absolute top-4 left-4 right-4 flex space-x-1 z-20">
                {reels.map((_, i) => (
                  <div
                    key={i}
                    className={`h-0.5 rounded-full transition-all duration-300 flex-1 ${
                      i === currentReel ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>

              {/* User Info - Bottom Left */}
              <div className="absolute bottom-20 left-4 right-20 z-20">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center border border-white/50 shadow-lg">
                    <span className="text-black text-xs font-bold">{reel.avatar}</span>
                  </div>
                  <span className="text-white font-semibold text-sm">{reel.user}</span>
                  <button className="border border-white text-white px-2 py-1 rounded text-xs font-medium hover:bg-white hover:text-black transition-colors">
                    Follow
                  </button>
                </div>
                <p className="text-white text-sm leading-relaxed pr-4 mb-2">{reel.description}</p>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-white/20 flex items-center justify-center">
                    <span className="text-white text-xs">♪</span>
                  </div>
                  <span className="text-white text-xs opacity-75">Original audio</span>
                </div>
              </div>

              {/* Action Buttons - Right Side */}
              <div className="absolute bottom-20 right-3 z-20 flex flex-col space-y-6">
                <button
                  onClick={() => toggleLike(index)}
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
                    <Bookmark size={32} strokeWidth={1.5} className="drop-shadow-lg" />
                  </div>
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

              {/* Navigation hints for desktop */}
              <div className="hidden md:block absolute top-1/2 left-4 transform -translate-y-1/2 z-20">
                {currentReel > 0 && (
                  <button
                    onClick={() => setCurrentReel(currentReel - 1)}
                    className="w-10 h-10 rounded-full bg-black/50 text-white backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    ↑
                  </button>
                )}
              </div>
              
              <div className="hidden md:block absolute top-1/2 right-4 transform -translate-y-1/2 z-20">
                {currentReel < reels.length - 1 && (
                  <button
                    onClick={() => setCurrentReel(currentReel + 1)}
                    className="w-10 h-10 rounded-full bg-black/50 text-white backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    ↓
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReelsPage;