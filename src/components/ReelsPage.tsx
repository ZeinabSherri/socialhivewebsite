import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Send, Bookmark, VolumeX, Volume2 } from 'lucide-react';

const ReelsPage = () => {
  const [currentReel, setCurrentReel] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);

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

  const handleSwipe = (direction: 'up' | 'down') => {
    if (direction === 'up' && currentReel < reels.length - 1) {
      setCurrentReel(currentReel + 1);
    } else if (direction === 'down' && currentReel > 0) {
      setCurrentReel(currentReel - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (!touchStartY.current || !touchEndY.current) return;
    
    const distance = touchStartY.current - touchEndY.current;
    const isSignificantSwipe = Math.abs(distance) > 50;

    if (isSignificantSwipe) {
      if (distance > 0) {
        // Swiped up - next reel
        handleSwipe('up');
      } else {
        // Swiped down - previous reel
        handleSwipe('down');
      }
    }

    touchStartY.current = 0;
    touchEndY.current = 0;
  };

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

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') handleSwipe('down');
      if (e.key === 'ArrowDown') handleSwipe('up');
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentReel]);

  return (
    <div 
      className="h-screen overflow-hidden relative bg-black"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      ref={containerRef}
    >
      <div 
        className="h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateY(-${currentReel * 100}vh)` }}
      >
        {reels.map((reel, index) => (
          <div key={reel.id} className="h-screen w-full relative bg-black">
            {/* Video Background */}
            <div className="absolute inset-0">
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
                  <p className="text-gray-300 max-w-xs">{reel.description}</p>
                </div>
              </div>
            </div>

            {/* Mute/Unmute Button */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={toggleMute}
                className="bg-black/50 p-3 rounded-full text-white backdrop-blur-sm"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>

            {/* User Info */}
            <div className="absolute bottom-24 left-4 right-20 z-10">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-white">
                  <span className="text-black text-lg">🐝</span>
                </div>
                <span className="text-white font-semibold text-lg">{reel.user}</span>
                <button className="border border-white text-white px-4 py-1 rounded-md text-sm font-medium">
                  Follow
                </button>
              </div>
              <p className="text-white text-sm leading-relaxed">{reel.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-24 right-4 z-10 flex flex-col space-y-6">
              <button
                onClick={() => toggleLike(index)}
                className="flex flex-col items-center space-y-2"
              >
                <div className={`p-3 rounded-full ${reel.isLiked ? 'text-red-500' : 'text-white'}`}>
                  <Heart size={32} fill={reel.isLiked ? 'currentColor' : 'none'} strokeWidth={1.5} />
                </div>
                <span className="text-white text-xs font-medium">{reel.likes.toLocaleString()}</span>
              </button>

              <button className="flex flex-col items-center space-y-2">
                <div className="p-3 rounded-full text-white">
                  <MessageCircle size={32} strokeWidth={1.5} />
                </div>
                <span className="text-white text-xs font-medium">{reel.comments}</span>
              </button>

              <button className="flex flex-col items-center space-y-2">
                <div className="p-3 rounded-full text-white">
                  <Send size={32} strokeWidth={1.5} />
                </div>
                <span className="text-white text-xs font-medium">{reel.shares}</span>
              </button>

              <button className="flex flex-col items-center space-y-2">
                <div className="p-3 rounded-full text-white">
                  <Bookmark size={32} strokeWidth={1.5} />
                </div>
              </button>
            </div>

            {/* Progress Indicators */}
            <div className="absolute top-4 left-4 flex space-x-1">
              {reels.map((_, i) => (
                <div
                  key={i}
                  className={`h-0.5 rounded-full transition-all duration-300 ${
                    i === currentReel ? 'bg-white w-8' : 'bg-gray-500 w-2'
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReelsPage;
