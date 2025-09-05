import { useRef, useState, useEffect } from 'react';
import CloudflareStreamPlayer from './CloudflareStreamPlayer';
import ReelActionRail from './ReelActionRail';
import ReelMeta from './ReelMeta';
import HeartBurst from './HeartBurst';

interface ReelItemProps {
  reel: {
    id: number;
    description: string;
    likes: number;
    comments: number;
    shares: number;
    user: string;
    avatar: string;
    audioTitle: string;
    videoUrl: string;
    poster?: string;
    viewCount?: number;
    isCloudflare?: boolean;
  };
  isActive: boolean;
  isNearby: boolean;
  onLike: (reelId: number) => void;
  isLiked: boolean;
  globalMuted: boolean;
  onMuteToggle: () => void;
  layout?: 'mobile' | 'desktop';
}

const ReelItem = ({
  reel,
  isActive,
  isNearby,
  onLike,
  isLiked,
  globalMuted,
  onMuteToggle,
  layout = 'mobile'
}: ReelItemProps) => {
  const [showLoveIcon, setShowLoveIcon] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLike = () => {
    onLike(reel.id);
    setShowLoveIcon(true);
    setTimeout(() => setShowLoveIcon(false), 1000);
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      handleLike();
    }
  };

  if (layout === 'desktop') {
    return (
      <div 
        ref={containerRef}
        className="relative bg-black w-full h-full overflow-hidden rounded-xl"
        data-reel-id={reel.id}
      >
        {/* Player fills the entire container */}
        <CloudflareStreamPlayer
          videoId={reel.videoUrl}
          isActive={isActive}
          muted={globalMuted}
          loop={true}
          controls={false}
          className="w-full h-full"
          onTap={onMuteToggle}
          onDoubleTap={handleDoubleTap}
          warmupLoad={isNearby}
        />

        {/* Heart burst animation */}
        {showLoveIcon && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <HeartBurst />
          </div>
        )}

        {/* Bottom meta overlay */}
        <div className="absolute bottom-4 left-4 right-16 text-white z-20 pointer-events-none">
          <ReelMeta
            user={reel.user}
            description={reel.description}
            audioTitle={reel.audioTitle}
            avatar={reel.avatar}
            layout="desktop"
          />
        </div>
      </div>
    );
  }

  // Mobile layout
  return (
    <section
      ref={containerRef}
      className="relative bg-black w-full snap-start snap-always"
      style={{ height: '100vh', scrollSnapStop: 'always' }}
      data-reel-id={reel.id}
    >
      {/* Player fills the screen */}
      <CloudflareStreamPlayer
        videoId={reel.videoUrl}
        isActive={isActive}
        muted={globalMuted}
        loop={true}
        controls={false}
        className="absolute inset-0 w-full h-full"
        onTap={onMuteToggle}
        onDoubleTap={handleDoubleTap}
        warmupLoad={isNearby}
      />

      {/* Heart burst animation */}
      {showLoveIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <HeartBurst />
        </div>
      )}

      {/* Right Action Rail */}
      <div className="absolute right-0 bottom-20 z-20">
        <ReelActionRail
          likes={reel.likes}
          comments={reel.comments}
          shares={reel.shares || 0}
          isLiked={isLiked}
          onLike={handleLike}
          avatar={reel.avatar}
          user={reel.user}
        />
      </div>

      {/* Bottom Meta Info */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
        <ReelMeta
          user={reel.user}
          description={reel.description}
          audioTitle={reel.audioTitle}
          avatar={reel.avatar}
          layout="mobile"
        />
      </div>
    </section>
  );
};

export default ReelItem;