import { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';

interface InstagramPostModalProps {
  post: any;
  allPosts: any[];
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

const InstagramPostModal = ({ post, allPosts, onClose, onNavigate }: InstagramPostModalProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const index = allPosts.findIndex(p => p.id === post.id);
    setCurrentIndex(index);
  }, [post.id, allPosts]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onNavigate('prev');
    }
  };

  const handleNext = () => {
    if (currentIndex < allPosts.length - 1) {
      onNavigate('next');
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  const sampleComments = [
    { id: 1, username: 'designlover23', text: 'This is absolutely stunning! 🔥', time: '2h' },
    { id: 2, username: 'marketing_pro', text: 'How did you achieve this result? Amazing work!', time: '1h' },
    { id: 3, username: 'creative_minds', text: 'Love the attention to detail', time: '45m' },
    { id: 4, username: 'brandstudio', text: 'Incredible creativity! 💯', time: '30m' },
    { id: 5, username: 'visualartist', text: 'The composition is perfect', time: '15m' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-60 text-white hover:text-gray-300 transition-colors"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Navigation arrows */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-60 text-white hover:text-gray-300 transition-colors"
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <span className="text-2xl">‹</span>
          </div>
        </button>
      )}

      {currentIndex < allPosts.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-60 text-white hover:text-gray-300 transition-colors"
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <span className="text-2xl">›</span>
          </div>
        </button>
      )}

      {/* Modal content */}
      <div 
        className="bg-black max-w-5xl w-full h-full max-h-[90vh] flex overflow-hidden rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left side - Media */}
        <div className="flex-1 flex items-center justify-center bg-black">
          {post.mediaType === 'video' ? (
            <video
              src={post.thumbnail}
              controls
              autoPlay
              muted
              loop
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <img
              src={post.thumbnail}
              alt={post.title}
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>

        {/* Right side - Content */}
        <div className="w-80 md:w-96 bg-black border-l border-gray-800 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-800 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img 
                src="/images/socialhive.png" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <span className="text-white font-semibold text-sm">{post.client}</span>
            </div>
            <button className="text-white hover:text-gray-300">
              <MoreHorizontal className="w-6 h-6" />
            </button>
          </div>

          {/* Post content */}
          <div className="flex-1 overflow-y-auto">
            {/* Caption */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex space-x-3">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <img 
                    src="/images/socialhive.png" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-white font-semibold text-sm">{post.client}</span>
                  <span className="text-white text-sm ml-2">{post.description}</span>
                  <div className="mt-2 text-gray-400 text-xs">
                    <span>Results: {post.results}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="p-4 space-y-4">
              {sampleComments.map(comment => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex-shrink-0"></div>
                  <div className="flex-1">
                    <span className="text-white font-semibold text-sm">{comment.username}</span>
                    <span className="text-white text-sm ml-2">{comment.text}</span>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-gray-400 text-xs">{comment.time}</span>
                      <button className="text-gray-400 text-xs hover:text-white">Reply</button>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-red-500">
                    <Heart className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions and footer */}
          <div className="border-t border-gray-800">
            {/* Action buttons */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setIsLiked(!isLiked)}
                    className={`transition-colors ${isLiked ? 'text-red-500' : 'text-white hover:text-gray-300'}`}
                  >
                    <Heart className="w-6 h-6" fill={isLiked ? 'currentColor' : 'none'} />
                  </button>
                  <button className="text-white hover:text-gray-300">
                    <MessageCircle className="w-6 h-6" />
                  </button>
                  <button className="text-white hover:text-gray-300">
                    <Send className="w-6 h-6" />
                  </button>
                </div>
                <button className="text-white hover:text-gray-300">
                  <Bookmark className="w-6 h-6" />
                </button>
              </div>

              {/* Likes count */}
              <div className="text-white font-semibold text-sm">
                {(post.likes + (isLiked ? 1 : 0)).toLocaleString()} likes
              </div>

              {/* Timestamp */}
              <div className="text-gray-400 text-xs uppercase">
                2 days ago
              </div>
            </div>

            {/* Comment input */}
            <div className="border-t border-gray-800 p-4">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="flex-1 bg-transparent text-white text-sm placeholder-gray-400 outline-none"
                />
                <button className="text-blue-500 font-semibold text-sm hover:text-blue-400">
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close */}
      <div 
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
};

export default InstagramPostModal;