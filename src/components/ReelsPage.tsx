
import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Send, Bookmark, Play, VolumeX, Volume2 } from 'lucide-react';

const ReelsPage = () => {
  const [currentReel, setCurrentReel] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const reels = [
    {
      id: 1,
      title: 'Social Media Strategy Explained',
      description: 'Learn how we create winning social media strategies that drive real results for our clients.',
      likes: 15420,
      comments: 234,
      shares: 89,
      user: 'socialhive.agency',
      isLiked: false
    },
    {
      id: 2,
      title: 'Content Creation Process',
      description: 'Behind the scenes of our content creation process - from concept to viral post.',
      likes: 12890,
      comments: 187,
      shares: 56,
      user: 'socialhive.agency',
      isLiked: true
    },
    {
      id: 3,
      title: 'Client Success Story',
      description: 'How we helped a local restaurant increase their sales by 300% in just 3 months.',
      likes: 18750,
      comments: 312,
      shares: 145,
      user: 'socialhive.agency',
      isLiked: false
    }
  ];

  const handleScroll = (direction: 'up' | 'down') => {
    if (direction === 'up' && currentReel > 0) {
      setCurrentReel(currentReel - 1);
    } else if (direction === 'down' && currentReel < reels.length - 1) {
      setCurrentReel(currentReel + 1);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    videoRefs.current.forEach(video => {
      if (video) {
        video.muted = !isMuted;
      }
    });
  };

  const toggleLike = (index: number) => {
    // This would update the like status in a real app
    console.log('Liked reel:', index);
  };

  useEffect(() => {
    // Auto-scroll functionality could be added here
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') handleScroll('up');
      if (e.key === 'ArrowDown') handleScroll('down');
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentReel]);

  return (
    <div className="h-screen overflow-hidden relative">
      <div 
        className="h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateY(-${currentReel * 100}vh)` }}
      >
        {reels.map((reel, index) => (
          <div key={reel.id} className="h-screen w-full relative bg-black flex items-center justify-center">
            {/* Video Background Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-black flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-black text-3xl">🐝</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{reel.title}</h3>
                <p className="text-gray-300 max-w-xs">{reel.description}</p>
              </div>
            </div>

            {/* Controls Overlay */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={toggleMute}
                className="bg-black bg-opacity-50 p-2 rounded-full text-white"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>

            {/* User Info and Actions */}
            <div className="absolute bottom-20 left-4 right-16 z-10">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
                  <span className="text-black">🐝</span>
                </div>
                <span className="text-white font-semibold">{reel.user}</span>
                <button className="border border-white text-white px-3 py-1 rounded-md text-sm">
                  Follow
                </button>
              </div>
              <p className="text-white text-sm mb-4">{reel.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-20 right-4 z-10 flex flex-col space-y-6">
              <button
                onClick={() => toggleLike(index)}
                className="flex flex-col items-center space-y-1"
              >
                <div className={`p-3 rounded-full ${reel.isLiked ? 'text-red-500' : 'text-white'}`}>
                  <Heart size={28} fill={reel.isLiked ? 'currentColor' : 'none'} />
                </div>
                <span className="text-white text-xs">{reel.likes.toLocaleString()}</span>
              </button>

              <button className="flex flex-col items-center space-y-1">
                <div className="p-3 rounded-full text-white">
                  <MessageCircle size={28} />
                </div>
                <span className="text-white text-xs">{reel.comments}</span>
              </button>

              <button className="flex flex-col items-center space-y-1">
                <div className="p-3 rounded-full text-white">
                  <Send size={28} />
                </div>
                <span className="text-white text-xs">{reel.shares}</span>
              </button>

              <button className="flex flex-col items-center space-y-1">
                <div className="p-3 rounded-full text-white">
                  <Bookmark size={28} />
                </div>
              </button>
            </div>

            {/* Navigation Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {reels.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i === currentReel ? 'bg-yellow-400' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Scroll Navigation */}
      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-32 flex flex-col space-y-4 z-20">
        {currentReel > 0 && (
          <button
            onClick={() => handleScroll('up')}
            className="bg-black bg-opacity-50 p-2 rounded-full text-white"
          >
            ↑
          </button>
        )}
        {currentReel < reels.length - 1 && (
          <button
            onClick={() => handleScroll('down')}
            className="bg-black bg-opacity-50 p-2 rounded-full text-white"
          >
            ↓
          </button>
        )}
      </div>
    </div>
  );
};

export default ReelsPage;
