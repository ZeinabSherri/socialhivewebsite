import { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, Heart, MessageCircle, Send, Bookmark, MoreHorizontal,
  Volume2, VolumeX, ChevronLeft, ChevronRight
} from 'lucide-react';

export type Reel = {
  id: number;
  title?: string;
  client?: string;
  description?: string;
  industry?: string;
  thumbnail?: string;
  /** Always provide a playable URL (local mp4 or CF mp4) */
  videoUrl: string;
  /** Present when the source is Cloudflare (optional) */
  uid?: string;
};

type ReelModalProps = {
  reel: Reel;
  allReels: Reel[];
  onClose: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
};

const ReelModal = ({ reel, allReels, onClose, onNavigate }: ReelModalProps) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // figure out where we are in the list
  useEffect(() => {
    const idx = allReels.findIndex(r => r.id === reel.id);
    setCurrentIndex(idx >= 0 ? idx : 0);
  }, [reel.id, allReels]);

  // keep mute/play behaviour for the native <video>
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(() => {});
    }
  }, [isMuted, reel.id]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0 && onNavigate) onNavigate('prev');
  }, [currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < allReels.length - 1 && onNavigate) onNavigate('next');
  }, [currentIndex, allReels.length, onNavigate]);

  // keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext, onClose]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <X size={24} />
      </button>

      {/* Arrows */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
        >
          <ChevronLeft size={32} />
        </button>
      )}
      {currentIndex < allReels.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
        >
          <ChevronRight size={32} />
        </button>
      )}

      <div className="relative w-full max-w-sm h-full flex items-center justify-center">
        {/* Player wrapper (same shell) */}
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

          {/* Mute */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="absolute top-4 left-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/70"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          {/* Right actions */}
          <div className="absolute right-4 bottom-20 flex flex-col items-center space-y-6">
            <button onClick={() => setIsLiked(!isLiked)} className="flex flex-col items-center text-white">
              <Heart size={28} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
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

          {/* Bottom meta */}
          <div className="absolute bottom-4 left-4 right-16 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"
                alt="User"
                className="w-8 h-8 rounded-full"
              />
              <span className="font-medium text-sm">{reel.client}</span>
              <button className="text-white border border-white px-2 py-1 rounded text-xs">Follow</button>
            </div>
            <p className="text-sm mb-2">{reel.description}</p>
            <p className="text-xs text-gray-300">
              #{(reel.industry || '').toLowerCase()} #socialmedia #viral
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReelModal;
