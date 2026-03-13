import { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import HeartBurst from './HeartBurst';
import VolumeToast from './VolumeToast';
import CFStreamIframe from './CFStreamIframe';
import { useMuteController } from '../hooks/useMuteController';

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toggleMute } = useMuteController(iframeRef);

  const handleTap = useCallback(() => {
    toggleMute();
    onMuteToggle();
    setShowVolumeToast(true);
    setTimeout(() => setShowVolumeToast(false), 1000);
  }, [toggleMute, onMuteToggle]);

  const handleDoubleTap = useCallback(() => {
    onLike();
    setShowHeartBurst(true);
  }, [onLike]);

  return (
    <>
      {/* Unified Cloudflare Stream Player */}
      <div 
        className="absolute inset-0 w-full h-full"
        onClick={handleTap}
        onDoubleClick={handleDoubleTap}
      >
        <CFStreamIframe
          ref={iframeRef}
          id={videoUrl}
          className="w-full h-full"
          autoPlay={isActive}
          muted={globalMuted}
          controls={false}
          title={`Reel video ${videoUrl}`}
        />
      </div>

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