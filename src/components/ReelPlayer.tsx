import { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import HeartBurst from './HeartBurst';
import VolumeToast from './VolumeToast';
import CloudflareStreamPlayer from './CloudflareStreamPlayer';

interface ReelPlayerProps {
  videoUrl: string;
  poster?: string;
  isActive: boolean;
  globalMuted: boolean;
  onMuteToggle: () => void;
  onLike: () => void;
  height: number;
}

const ReelPlayer = ({
  videoUrl,
  poster,
  isActive,
  globalMuted,
  onMuteToggle,
  onLike,
  height
}: ReelPlayerProps) => {
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showVolumeToast, setShowVolumeToast] = useState(false);

  return (
    <>
      {/* Unified Cloudflare Stream Player */}
      <CloudflareStreamPlayer
        videoId={videoUrl}
        isActive={isActive}
        muted={globalMuted}
        loop={true}
        controls={false}
        poster={poster}
        className="absolute inset-0 w-full h-full"
        onTap={() => {
          onMuteToggle();
          setShowVolumeToast(true);
          setTimeout(() => setShowVolumeToast(false), 1000);
        }}
        onDoubleTap={() => {
          onLike();
          setShowHeartBurst(true);
        }}
      />

      {/* Volume toast */}
      <VolumeToast isMuted={globalMuted} isVisible={showVolumeToast} />

      {/* Heart burst animation */}
      <AnimatePresence>
        {showHeartBurst && (
          <HeartBurst onComplete={() => setShowHeartBurst(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default ReelPlayer;