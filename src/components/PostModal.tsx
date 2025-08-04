import { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

interface PostModalProps {
  post: any;
  allPosts: any[];
  onClose: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
}

const PostModal = ({ post, allPosts, onClose, onNavigate }: PostModalProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const currentPostIndex = allPosts.findIndex(p => p.id === post.id);
    setCurrentIndex(currentPostIndex);
  }, [post.id, allPosts]);

  const handlePrevious = () => {
    if (currentIndex > 0 && onNavigate) {
      onNavigate('prev');
    }
  };

  const handleNext = () => {
    if (currentIndex < allPosts.length - 1 && onNavigate) {
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
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
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
      
      {currentIndex < allPosts.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
        >
          <ChevronRight size={32} />
        </button>
      )}

      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex overflow-hidden">
        {/* Image section */}
        <div className="flex-1 bg-black flex items-center justify-center">
          <img
            src={post.thumbnail}
            alt={post.title}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Content section */}
        <div className="w-80 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"
                alt="User"
                className="w-8 h-8 rounded-full"
              />
              <span className="font-medium text-sm">{post.client}</span>
            </div>
            <button className="text-gray-600 hover:text-gray-800">
              <MoreHorizontal size={20} />
            </button>
          </div>

          {/* Comments section */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face"
                  alt="User"
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
                <div>
                  <span className="font-medium text-sm">{post.client}</span>
                  <span className="text-sm ml-2">{post.description}</span>
                  <div className="text-xs text-gray-500 mt-1">2h</div>
                </div>
              </div>

              {/* Sample comments */}
              <div className="flex space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b123?w=32&h=32&fit=crop&crop=face"
                  alt="User"
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
                <div>
                  <span className="font-medium text-sm">sarah_m</span>
                  <span className="text-sm ml-2">This is amazing! 🔥</span>
                  <div className="text-xs text-gray-500 mt-1">1h</div>
                </div>
              </div>

              <div className="flex space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=32&h=32&fit=crop&crop=face"
                  alt="User"
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
                <div>
                  <span className="font-medium text-sm">alex_design</span>
                  <span className="text-sm ml-2">Great work! Can you share more details?</span>
                  <div className="text-xs text-gray-500 mt-1">45m</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="hover:text-gray-600"
                >
                  <Heart 
                    size={24} 
                    className={isLiked ? 'fill-red-500 text-red-500' : ''} 
                  />
                </button>
                <button className="hover:text-gray-600">
                  <MessageCircle size={24} />
                </button>
                <button className="hover:text-gray-600">
                  <Send size={24} />
                </button>
              </div>
              <button className="hover:text-gray-600">
                <Bookmark size={24} />
              </button>
            </div>
            
            <div className="text-sm font-medium mb-2">1,234 likes</div>
            <div className="text-xs text-gray-500 mb-3">2 hours ago</div>

            {/* Comment input */}
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 text-sm outline-none"
              />
              <button className="text-blue-500 font-medium text-sm">Post</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;