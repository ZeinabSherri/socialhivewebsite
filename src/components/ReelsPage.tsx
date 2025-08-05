import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Send, Bookmark, VolumeX, Volume2 } from 'lucide-react';

const ReelsPage = () => {
  const [currentReel, setCurrentReel] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const reels = [
    {
      id: 1,
      title: 'Social Media Strategy Explained',
      description: 'Learn how we create winning social media strategies that drive real results for our clients.',
      likes: 15420,
      comments: 234,
      shares: 89,
      user: 'socialhive.agency',
      isLiked: false,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
      id: 2,
      title: 'Content Creation Process',
      description: 'Behind the scenes of our content creation process - from concept to viral post.',
      likes: 12890,
      comments: 187,
      shares: 56,
      user: 'socialhive.agency',
      isLiked: true,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    },
    {
      id: 3,
      title: 'Client Success Story',
      description: 'How we helped a local restaurant increase their sales by 300% in just 3 months.',
      likes: 18750,
      comments: 312,
      shares: 145,
      user: 'socialhive.agency',
      isLiked: false,
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

  const toggleLike = (index: number) => {
    console.log('Liked reel:', index);
  };

  // Handle video playback and autoplay
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentReel) {
          video.currentTime = 0;
          video.play().catch(console.error);
          video.muted = isMuted;
        } else {
          video.pause();
        }
      }
    });
  }, [currentReel, isMuted]);

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
    <div className="h-screen bg-black">
      {/* Desktop: Centered with margins, Mobile: Full width */}
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto scroll-smooth scrollbar-hidden"
        style={{
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        
        {reels.map((reel, index) => (
          <div 
            key={reel.id} 
            className="h-screen w-full relative flex items-center justify-center bg-black"
            style={{ scrollSnapAlign: 'start' }}
          >
            {/* Desktop: Centered 4:5 container, Mobile: Full width */}
            <div className="relative w-full max-w-sm mx-auto h-full md:h-[80vh] md:max-h-[600px] md:w-[480px] overflow-hidden">
              {/* Instagram-style rounded container with shadow */}
              <div className="relative w-full h-full md:rounded-2xl md:shadow-2xl md:shadow-black/50 overflow-hidden bg-black">
                {/* Video Background */}
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  className="w-full h-full object-cover"
                  loop
                  muted={isMuted}
                  playsInline
                  preload="metadata"
                  poster={`data:image/svg+xml;base64,${btoa(`
                    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                      <rect width="100%" height="100%" fill="#000"/>
                      <circle cx="50" cy="50" r="20" fill="#FCD34D"/>
                      <text x="50" y="58" text-anchor="middle" fill="#000" font-size="16">SH</text>
                    </svg>
                  `)}`}
                  onLoadedData={() => {
                    const video = videoRefs.current[index];
                    if (video && index === currentReel) {
                      video.play().catch(console.error);
                    }
                  }}
                >
                  <source src={reel.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Fallback content when video doesn't load */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-yellow-400/20 to-black">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <span className="text-black text-3xl">🐝</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{reel.title}</h3>
                    <p className="text-gray-300 max-w-xs px-4">{reel.description}</p>
                  </div>
                </div>

                {/* Gradient overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Progress Indicators - Top */}
                <div className="absolute top-3 left-3 right-3 flex space-x-1 z-20">
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
                <div className="absolute bottom-4 left-4 right-16 z-20">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-white shadow-lg">
                      <span className="text-black text-sm font-bold">🐝</span>
                    </div>
                    <span className="text-white font-semibold text-sm">{reel.user}</span>
                    <button className="border border-white text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-white hover:text-black transition-colors">
                      Follow
                    </button>
                  </div>
                  <p className="text-white text-sm leading-relaxed pr-2">{reel.description}</p>
                </div>

                {/* Action Buttons - Right Side */}
                <div className="absolute bottom-4 right-3 z-20 flex flex-col space-y-4">
                  <button
                    onClick={() => toggleLike(index)}
                    className="flex flex-col items-center space-y-1 group"
                  >
                    <div className={`p-2 rounded-full transition-transform group-active:scale-95 ${
                      reel.isLiked ? 'text-red-500' : 'text-white'
                    }`}>
                      <Heart 
                        size={28} 
                        fill={reel.isLiked ? 'currentColor' : 'none'} 
                        strokeWidth={reel.isLiked ? 0 : 2}
                        className="drop-shadow-lg"
                      />
                    </div>
                    <span className="text-white text-xs font-medium drop-shadow-lg">
                      {reel.likes.toLocaleString()}
                    </span>
                  </button>

                  <button className="flex flex-col items-center space-y-1 group">
                    <div className="p-2 rounded-full text-white transition-transform group-active:scale-95">
                      <MessageCircle size={28} strokeWidth={2} className="drop-shadow-lg" />
                    </div>
                    <span className="text-white text-xs font-medium drop-shadow-lg">{reel.comments}</span>
                  </button>

                  <button className="flex flex-col items-center space-y-1 group">
                    <div className="p-2 rounded-full text-white transition-transform group-active:scale-95">
                      <Send size={28} strokeWidth={2} className="drop-shadow-lg" />
                    </div>
                    <span className="text-white text-xs font-medium drop-shadow-lg">{reel.shares}</span>
                  </button>

                  <button className="flex flex-col items-center space-y-1 group">
                    <div className="p-2 rounded-full text-white transition-transform group-active:scale-95">
                      <Bookmark size={28} strokeWidth={2} className="drop-shadow-lg" />
                    </div>
                  </button>

                  {/* Mute/Unmute Button - Bottom Right */}
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-full bg-black/40 text-white backdrop-blur-sm transition-transform active:scale-95 border border-white/20"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReelsPage;