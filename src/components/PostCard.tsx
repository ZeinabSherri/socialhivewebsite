import { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

interface Post {
  id: number;
  username: string;
  userAvatar: string;
  timestamp: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

interface PostCardProps {
  post: Post;
  onLike: () => void;
}

const PostCard = ({ post, onLike }: PostCardProps) => {
  const [showFullCaption, setShowFullCaption] = useState(false);

  const truncateCaption = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-black border-b border-gray-800">
      {/* Post Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={post.userAvatar} alt={post.username} />
            <AvatarFallback className="bg-yellow-400 text-black text-sm">
              🐝
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{post.username}</p>
            <p className="text-gray-400 text-xs">{post.timestamp}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Post Image */}
      <div className="aspect-square bg-gray-900">
        <img
          src={post.image}
          alt="Post content"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Post Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={onLike}
              className={`transition-colors ${
                post.isLiked ? 'text-red-500' : 'text-white hover:text-gray-300'
              }`}
            >
              <Heart size={24} fill={post.isLiked ? 'currentColor' : 'none'} />
            </button>
            <button className="text-white hover:text-gray-300">
              <MessageCircle size={24} />
            </button>
            <button className="text-white hover:text-gray-300">
              <Send size={24} />
            </button>
          </div>
          <button className="text-white hover:text-gray-300">
            <Bookmark size={24} />
          </button>
        </div>

        {/* Likes Count */}
        <p className="font-semibold text-sm mb-2">
          {post.likes.toLocaleString()} likes
        </p>

        {/* Caption */}
        <div className="text-sm">
          <span className="font-semibold mr-2">{post.username}</span>
          <span className="text-gray-100">
            {showFullCaption ? post.caption : truncateCaption(post.caption)}
          </span>
          {post.caption.length > 100 && (
            <button
              onClick={() => setShowFullCaption(!showFullCaption)}
              className="text-gray-400 ml-1 hover:text-gray-300"
            >
              {showFullCaption ? 'less' : 'more'}
            </button>
          )}
        </div>

        {/* Comments Link */}
        <button className="text-gray-400 text-sm mt-2 hover:text-gray-300">
          View all {post.comments} comments
        </button>

        {/* Add Comment */}
        <div className="mt-3 flex items-center space-x-3">
          <input
            type="text"
            placeholder="Add a comment..."
            className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-500 outline-none"
          />
          <button className="text-yellow-400 text-sm font-semibold hover:text-yellow-300">
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
