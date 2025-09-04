import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { formatNumber } from '../lib/format';

interface ReelActionRailProps {
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  onLike: () => void;
  avatar: string;
  user: string;
}

const ReelActionRail = ({
  likes,
  comments,
  shares,
  isLiked,
  onLike,
  avatar,
  user
}: ReelActionRailProps) => {
  return (
    <div
      className="absolute right-0 flex flex-col space-y-5 z-20 pointer-events-auto"
      style={{ 
        bottom: '72px',
        paddingRight: 'max(14px, env(safe-area-inset-right))'
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onLike();
        }}
        className="flex flex-col items-center text-white"
      >
        <Heart
          size={28}
          className={`transition-colors ${
            isLiked ? 'fill-red-500 text-red-500' : ''
          }`}
        />
        <span className="text-xs mt-1">{formatNumber(likes + (isLiked ? 1 : 0))}</span>
      </button>

      <button className="flex flex-col items-center text-white">
        <MessageCircle size={28} />
        <span className="text-xs mt-1">{formatNumber(comments)}</span>
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

      {/* Profile picture */}
      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
        <img
          src={avatar}
          alt={user}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default ReelActionRail;