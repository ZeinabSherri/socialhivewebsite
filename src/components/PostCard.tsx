import React, { useState } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import VerificationBadge from './VerificationBadge';

interface Comment {
  id: number;
  username: string;
  text: string;
  userAvatar?: string;
}

interface Post {
  id: number;
  username: string;
  userAvatar: string;
  timestamp: string;
  image?: string;
  images?: string[];
  caption: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  staticComments: Comment[];
}

interface PostCardProps {
  post: Post;
  onLike: () => void;
  onUsernameClick?: () => void;
}

const responsive = {
  desktop: {
    breakpoint: {
      max: 3000,
      min: 1024
    },
    items: 1
  },
  tablet: {
    breakpoint: {
      max: 1024,
      min: 464
    },
    items: 1
  },
  mobile: {
    breakpoint: {
      max: 464,
      min: 0
    },
    items: 1
  }
};

const PostCard = ({
  post,
  onLike,
  onUsernameClick
}: PostCardProps) => {
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [showLoveIcon, setShowLoveIcon] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  const truncateCaption = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      if (!post.isLiked) {
        onLike();
      }
      setShowLoveIcon(true);
      setTimeout(() => setShowLoveIcon(false), 1000);
    }
    setLastTap(now);
  };

  return <div className="bg-black border-b border-gray-800 max-w-md mx-auto rounded-lg overflow-hidden">
      {/* Post Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={post.userAvatar} alt={post.username} />
            <AvatarFallback className="p-0 overflow-hidden">
              <img src="/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png" alt="Social Hive Logo" className="w-full h-full object-contain" />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center">
              <p 
                className="font-semibold text-sm cursor-pointer hover:underline"
                onClick={onUsernameClick}
              >
                {post.username}
              </p>
              <VerificationBadge username={post.username} />
            </div>
            <p className="text-gray-400 text-xs">{post.timestamp}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Post Image or Carousel */}
      {post.images && post.images.length > 0 ? <Carousel responsive={responsive} infinite arrows swipeable draggable showDots containerClass="carousel-container" itemClass="carousel-item" renderDotsOutside={true}>
          {post.images.map((imgUrl, idx) => <div key={idx} className="aspect-square bg-gray-900 relative" onTouchEnd={handleDoubleTap} onClick={handleDoubleTap}>
              <img src={imgUrl} alt={`Post image ${idx + 1}`} className="w-full h-full object-cover rounded-lg" loading="lazy" />
            </div>)}
        </Carousel> : post.image ? <div className="aspect-square bg-gray-900 relative" onTouchEnd={handleDoubleTap} onClick={handleDoubleTap}>
          <img src={post.image} alt="Post content" className="w-full h-full object-cover rounded-lg" loading="lazy" />
        </div> : null}

      {showLoveIcon && <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Heart size={80} className="text-white fill-red-500 animate-scale-in" style={{
        animation: 'scale-in 0.6s ease-out, fade-out 0.3s ease-out 0.7s forwards'
      }} />
        </div>}

      {/* Post Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button onClick={onLike} className={`transition-colors ${post.isLiked ? 'text-red-500' : 'text-white hover:text-gray-300'}`} aria-label="Like post">
              <Heart size={24} fill={post.isLiked ? 'currentColor' : 'none'} />
            </button>
            <button className="text-white hover:text-gray-300" aria-label="Comment on post">
              <MessageCircle size={24} />
            </button>
            <button className="text-white hover:text-gray-300" aria-label="Share post">
              <Send size={24} />
            </button>
          </div>
          <button className="text-white hover:text-gray-300" aria-label="Save post">
            <Bookmark size={24} />
          </button>
        </div>

        {/* Likes Count */}
        <p className="font-semibold text-sm mb-2">{post.likes.toLocaleString()} likes</p>

        {/* Caption */}
        <div className="text-sm mb-2">
          <span 
            className="font-semibold cursor-pointer hover:underline"
            onClick={onUsernameClick}
          >
            {post.username}
          </span>
          <span className="text-gray-100 ml-1">
            {showFullCaption ? post.caption : truncateCaption(post.caption)}
          </span>
          {post.caption.length > 100 && <button onClick={() => setShowFullCaption(!showFullCaption)} className="text-gray-400 ml-1 hover:text-gray-300">
              {showFullCaption ? 'less' : 'more'}
            </button>}
        </div>

        {/* Static Comments */}
        <div className="mt-2 space-y-1">
          {post.staticComments.map(comment => <div key={comment.id} className="flex items-start space-x-3 text-left group">
              
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm leading-5 break-words">
                  <span className="font-semibold cursor-pointer hover:underline text-white">
                    {comment.username}
                  </span>
                  <span className="text-gray-200 font-normal ml-1">
                    {comment.text}
                  </span>
                </p>
                <div className="flex items-center space-x-4 mt-1">
                  <button className="text-gray-400 text-xs font-medium hover:text-gray-300 transition-colors">
                    2h
                  </button>
                  <button className="text-gray-400 text-xs font-medium hover:text-gray-300 transition-colors">
                    Reply
                  </button>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart size={12} className="text-gray-400 hover:text-red-500 transition-colors" />
                  </button>
                </div>
              </div>
            </div>)}
        </div>

        {/* Comments Link */}
        
      </div>
    </div>;
};

export default PostCard;
