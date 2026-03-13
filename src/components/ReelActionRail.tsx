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
  // Desktop layout
  const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
  
  if (isDesktop) {
    return (
      <div className="flex flex-col space-y-6 text-white">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          className="flex flex-col items-center group"
        >
          <Heart
            size={32}
            className={`transition-colors group-hover:scale-110 ${
              isLiked ? 'fill-red-500 text-red-500' : 'hover:text-red-400'
            }`}
          />
          <span className="text-sm mt-1">{formatNumber(likes + (isLiked ? 1 : 0))}</span>
        </button>

        <button className="flex flex-col items-center group">
          <MessageCircle size={32} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm mt-1">{formatNumber(comments)}</span>
        </button>

        <button className="flex flex-col items-center group">
          <Send size={32} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm mt-1">Share</span>
        </button>

        <button className="flex flex-col items-center group">
          <Bookmark size={32} className="group-hover:scale-110 transition-transform" />
        </button>

        <button className="flex flex-col items-center group">
          <MoreHorizontal size={32} className="group-hover:scale-110 transition-transform" />
        </button>

        {/* Profile picture */}
        <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden mt-2">
          <img
            src={avatar}
            alt={user}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  // Mobile layout (original)
  return (
    <div
      className="absolute right-0 flex flex-col space-y-5 z-20 pointer-events-none"
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
        className="flex flex-col items-center text-white pointer-events-auto"
      >
        <Heart
          size={28}
          className={`transition-colors ${
            isLiked ? 'fill-red-500 text-red-500' : ''
          }`}
        />
        <span className="text-xs mt-1">{formatNumber(likes + (isLiked ? 1 : 0))}</span>
      </button>

      <button className="flex flex-col items-center text-white pointer-events-auto">
        <MessageCircle size={28} />
        <span className="text-xs mt-1">{formatNumber(comments)}</span>
      </button>

      <button className="flex flex-col items-center text-white pointer-events-auto">
        <Send size={28} />
        <span className="text-xs mt-1">Share</span>
      </button>

      <button className="flex flex-col items-center text-white pointer-events-auto">
        <Bookmark size={28} />
      </button>

      <button className="flex flex-col items-center text-white pointer-events-auto">
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