'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import CloudflareStreamPlayer from '../CloudflareStreamPlayer';
import ReelActionRail from '../ReelActionRail';
import ReelMeta from '../ReelMeta';

export interface ReelData {
  id: number;
  title: string;
  description?: string;
  thumbnail: string;
  videoUrl: string;
  uid?: string;
  viewCount?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  user?: string;
  avatar?: string;
  audioTitle?: string;
  isCloudflare?: boolean;
}

interface ReelViewerProps {
  reel: ReelData;
  isActive: boolean;
  layout: 'mobile' | 'desktop' | 'centered-card';
  onLike?: (reelId: number) => void;
  isLiked?: boolean;
  globalMuted?: boolean;
  onMuteToggle?: () => void;
  className?: string;
}

const ReelViewer = ({
  reel,
  isActive,
  layout = 'mobile',
  onLike,
  isLiked = false,
  globalMuted = true,
  onMuteToggle,
  className = ''
}: ReelViewerProps) => {
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Progress tracking
  useEffect(() => {
    if (!isActive) return;

    const video = document.querySelector(`[data-reel-id="${reel.id}"] video`) as HTMLVideoElement;
    if (!video) return;

    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const interval = setInterval(updateProgress, 100);
    return () => clearInterval(interval);
  }, [isActive, reel.id]);

  const handleLikeClick = useCallback(() => {
    onLike?.(reel.id);
  }, [onLike, reel.id]);

  // Format reel data for components
  const formattedReel = {
    id: reel.id,
    description: reel.description || reel.title || '',
    likes: reel.likes || Math.floor(Math.random() * 50000) + 1000,
    comments: reel.comments || Math.floor(Math.random() * 1000) + 50,
    shares: reel.shares || Math.floor(Math.random() * 500) + 25,
    user: reel.user || 'socialhive.agency',
    avatar: reel.avatar || '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
    audioTitle: reel.audioTitle || 'Original audio',
    videoUrl: reel.videoUrl || reel.uid || '',
    poster: reel.thumbnail,
    viewCount: reel.viewCount || Math.floor(Math.random() * 100000) + 10000,
    isCloudflare: reel.isCloudflare !== false
  };

  // Mobile layout (full screen)
  if (layout === 'mobile') {
    return (
      <section
        className={`relative bg-black w-full snap-start snap-always ${className}`}
        style={{ height: '100vh', scrollSnapStop: 'always' }}
        data-reel-id={reel.id}
      >
        {/* Video Player */}
        <CloudflareStreamPlayer
          videoId={formattedReel.videoUrl}
          isActive={isActive}
          muted={globalMuted}
          loop={true}
          controls={false}
          className="absolute inset-0 w-full h-full"
          onTap={onMuteToggle}
          onDoubleTap={() => onLike?.(reel.id)}
          warmupLoad={!isActive}
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
          likes={formattedReel.likes}
          comments={formattedReel.comments}
          shares={formattedReel.shares}
          isLiked={isLiked}
          onLike={handleLikeClick}
          avatar={formattedReel.avatar}
          user={formattedReel.user}
        />

        {/* Bottom Meta Info */}
        <ReelMeta
          user={formattedReel.user}
          description={formattedReel.description}
          audioTitle={formattedReel.audioTitle}
          avatar={formattedReel.avatar}
        />
      </section>
    );
  }

  // Centered card layout (Instagram-style for desktop/tablet)
  if (layout === 'centered-card') {
    return (
      <div className={`mx-auto w-full max-w-[540px] ${className}`}>
        <motion.div
          className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-2xl snap-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          data-reel-id={reel.id}
        >
          {/* Video Player */}
          <CloudflareStreamPlayer
            videoId={formattedReel.videoUrl}
            isActive={isActive}
            muted={globalMuted}
            loop={true}
            controls={false}
            className="absolute inset-0 h-full w-full object-cover"
            onTap={onMuteToggle}
            onDoubleTap={() => onLike?.(reel.id)}
            warmupLoad={!isActive}
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

          {/* Bottom Meta Info */}
          <div className="absolute bottom-4 left-4 right-4 text-white z-20">
            <ReelMeta
              user={formattedReel.user}
              description={formattedReel.description}
              audioTitle={formattedReel.audioTitle}
              avatar={formattedReel.avatar}
              layout="desktop"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // Desktop layout (original desktop behavior)
  return (
    <div className={`relative bg-transparent w-full h-full ${className}`}>
      <CloudflareStreamPlayer
        videoId={formattedReel.videoUrl}
        isActive={isActive}
        muted={globalMuted}
        loop={true}
        controls={false}
        className="w-full h-full"
        onTap={onMuteToggle}
        onDoubleTap={() => onLike?.(reel.id)}
        warmupLoad={!isActive}
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

      {/* Bottom Meta Info */}
      <div className="absolute bottom-4 left-4 right-16 text-white z-20">
        <ReelMeta
          user={formattedReel.user}
          description={formattedReel.description}
          audioTitle={formattedReel.audioTitle}
          avatar={formattedReel.avatar}
          layout="desktop"
        />
      </div>
    </div>
  );
};

export default ReelViewer;