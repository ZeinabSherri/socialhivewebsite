import { useEffect, useRef, useState, useCallback } from 'react';
import ReelPlayer from './ReelPlayer';
import ReelActionRail from './ReelActionRail';
import ReelMeta from './ReelMeta';

interface ReelVideoProps {
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
  };
  isActive: boolean;
  height: number;
  onLike: (reelId: number) => void;
  isLiked: boolean;
  globalMuted: boolean;
  onMuteToggle: () => void;
  layout?: 'mobile' | 'desktop';
}

const ReelVideo = ({
  reel,
  isActive,
  height,
  onLike,
  isLiked,
  globalMuted,
  onMuteToggle,
  layout = 'mobile'
}: ReelVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);

  // Progress tracking
  useEffect(() => {
    if (!isActive || !videoRef.current) return;

    const video = videoRef.current;
    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const interval = setInterval(updateProgress, 100);
    return () => clearInterval(interval);
  }, [isActive]);

  const handleLikeClick = useCallback(() => {
    onLike(reel.id);
  }, [onLike, reel.id]);

  if (layout === 'desktop') {
    return (
      <div className="flex flex-col h-full">
        {/* Video container - fills the stage */}
        <div className="relative bg-black flex-1 min-h-0">
          {/* Video Player */}
          <ReelPlayer
            videoUrl={reel.videoUrl}
            poster={reel.poster}
            isActive={isActive}
            globalMuted={globalMuted}
            onMuteToggle={onMuteToggle}
            onLike={handleLikeClick}
            height={0} // Height controlled by parent
          />

          {/* Progress bar */}
          {isActive && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 z-30">
              <div
                className="h-full bg-white transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Meta info below video */}
        <div className="mt-4 px-4">
          <ReelMeta
            user={reel.user}
            description={reel.description}
            audioTitle={reel.audioTitle}
            avatar={reel.avatar}
          />
        </div>
      </div>
    );
  }

  // Mobile layout (original)
  return (
    <section
      className="relative bg-black w-full snap-start snap-always"
      style={{ height: `${height}px`, scrollSnapStop: 'always' }}
    >
      {/* Video Player with interactions */}
      <ReelPlayer
        videoUrl={reel.videoUrl}
        poster={reel.poster}
        isActive={isActive}
        globalMuted={globalMuted}
        onMuteToggle={onMuteToggle}
        onLike={handleLikeClick}
        height={height}
      />

      {/* Progress bar */}
      {isActive && (
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30 z-30"
          style={{
            paddingLeft: 'max(14px, env(safe-area-inset-left))',
            paddingRight: 'max(14px, env(safe-area-inset-right))',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)'
          }}
        >
          <div
            className="h-full bg-white transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Right Action Rail */}
      <ReelActionRail
        likes={reel.likes}
        comments={reel.comments}
        shares={reel.shares || 0}
        isLiked={isLiked}
        onLike={handleLikeClick}
        avatar={reel.avatar}
        user={reel.user}
      />

      {/* Bottom Meta Info */}
      <ReelMeta
        user={reel.user}
        description={reel.description}
        audioTitle={reel.audioTitle}
        avatar={reel.avatar}
      />
    </section>
  );
};

export default ReelVideo;