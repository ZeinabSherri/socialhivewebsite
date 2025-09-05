import { useState } from 'react';
import { Music } from 'lucide-react';

interface ReelMetaProps {
  user: string;
  description: string;
  audioTitle: string;
  avatar: string;
  layout?: 'mobile' | 'desktop';
}

const ReelMeta = ({ user, description, audioTitle, avatar, layout = 'mobile' }: ReelMetaProps) => {
  const [expandedCaption, setExpandedCaption] = useState(false);

  const truncateText = (text: string, expanded: boolean) => {
    if (expanded) return text;
    const words = text.split(' ');
    if (words.length <= 15) return text;
    return words.slice(0, 15).join(' ') + '...';
  };

  // Desktop layout
  if (layout === 'desktop' || (window.matchMedia('(min-width: 1024px)').matches)) {
    return (
      <div className="text-white space-y-2 bg-transparent">
        {/* User info */}
        <div className="flex items-center space-x-3">
          <img 
            src={avatar} 
            alt={user}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-semibold text-sm">@{user}</span>
          <button className="text-white border border-white px-2 py-1 rounded text-xs hover:bg-white hover:text-black transition-colors">
            Follow
          </button>
        </div>

        {/* Caption */}
        <div>
          <p className="text-xs leading-relaxed">
            {truncateText(description, expandedCaption)}
            {description.split(' ').length > 15 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedCaption(!expandedCaption);
                }}
                className="text-gray-300 ml-1 hover:text-white"
              >
                {expandedCaption ? 'less' : 'more'}
              </button>
            )}
          </p>
        </div>

        {/* Audio */}
        <div className="flex items-center space-x-2">
          <Music size={12} className="text-white" />
          <span className="text-xs text-gray-300">{audioTitle}</span>
        </div>
      </div>
    );
  }

  // Mobile layout (original)
  return (
    <div
      className="absolute bottom-0 left-0 right-16 text-white z-20"
      style={{
        paddingLeft: 'max(14px, env(safe-area-inset-left))',
        paddingBottom: '76px'
      }}
    >
      {/* User info */}
      <div className="flex items-center space-x-2 mb-2">
        <span className="font-semibold text-sm">@{user}</span>
        <button className="text-white border border-white px-2 py-1 rounded text-xs">
          Follow
        </button>
      </div>

      {/* Caption */}
      <div className="mb-2">
        <p className="text-sm leading-relaxed">
          {truncateText(description, expandedCaption)}
          {description.split(' ').length > 15 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpandedCaption(!expandedCaption);
              }}
              className="text-gray-300 ml-1"
            >
              {expandedCaption ? 'less' : 'more'}
            </button>
          )}
        </p>
      </div>

      {/* Audio */}
      <div className="flex items-center space-x-2">
        <Music size={12} className="text-white" />
        <span className="text-xs text-gray-300">{audioTitle}</span>
      </div>
    </div>
  );
};

export default ReelMeta;