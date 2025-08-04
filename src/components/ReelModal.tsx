import { useState, useRef, useEffect } from 'react';
import { X, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';

interface ReelModalProps {
  reel: any;
  allReels: any[];
  onClose: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
}

const ReelModal = ({ reel, allReels, onClose, onNavigate }: ReelModalProps) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const currentReelIndex = allReels.findIndex(r => r.id === reel.id);
    setCurrentIndex(currentReelIndex);
  }, [reel.id, allReels]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(console.log);
    }
  }, [isMuted, reel.id]);

  const handlePrevious = () => {
    if (currentIndex > 0 && onNavigate) {
      onNavigate('prev');
    }
  };

  const handleNext = () => {
    if (currentIndex < allReels.length - 1 && onNavigate) {
      onNavigate('next');
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onClose();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <X size={24} />
      </button>

      {/* Navigation arrows */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
        >
          <ChevronLeft size={32} />
        </button>
      )}
      
      {currentIndex < allReels.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
        >
          <ChevronRight size={32} />
        </button>
      )}

      <div className="relative w-full max-w-sm h-full flex items-center justify-center">
        {/* Video container */}
        <div className="relative w-full aspect-[9/16] bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            src={reel.videoUrl}
            poster={reel.thumbnail}
            className="w-full h-full object-cover"
            loop
            muted={isMuted}
            playsInline
            autoPlay
          />

          {/* Mute/Unmute button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="absolute top-4 left-4 bg-black bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-70"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          {/* Right side actions */}
          <div className="absolute right-4 bottom-20 flex flex-col items-center space-y-6">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="flex flex-col items-center text-white"
            >
              <Heart 
                size={28} 
                className={isLiked ? 'fill-red-500 text-red-500' : ''} 
              />
              <span className="text-xs mt-1">85.2K</span>
            </button>

            <button className="flex flex-col items-center text-white">
              <MessageCircle size={28} />
              <span className="text-xs mt-1">1,249</span>
            </button>

            <button className="flex flex-col items-center text-white">
              <Send size={28} />
              <span className="text-xs mt-1">Share</span>
            </button>

            <button className="flex flex-col items-center text-white">
              <Bookmark size={28} />
            </button>

            <button className="flex flex-col items-center text-white">
              <MoreHorizontal size={28} />
            </button>
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-4 left-4 right-16 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"
                alt="User"
                className="w-8 h-8 rounded-full"
              />
              <span className="font-medium text-sm">{reel.client}</span>
              <button className="text-white border border-white px-2 py-1 rounded text-xs">
                Follow
              </button>
            </div>
            <p className="text-sm mb-2">{reel.description}</p>
            <p className="text-xs text-gray-300">#{reel.industry.toLowerCase()} #socialmedia #viral</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReelModal;