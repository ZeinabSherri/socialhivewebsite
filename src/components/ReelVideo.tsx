import { useEffect, useRef, useState, useCallback } from 'react';
import { useImperativeMuteToggle } from '../hooks/useImperativeMuteToggle';
import { AnimatePresence } from 'framer-motion';
import ReelPlayer from './ReelPlayer';
import ReelActionRail from './ReelActionRail';
import ReelMeta from './ReelMeta';
import CloudflareStreamPlayer from './CloudflareStreamPlayer';
import VolumeToast from './VolumeToast';
import HeartBurst from './HeartBurst';

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
    isCloudflare?: boolean;
  };
  isActive: boolean;
  height: number;
  onLike: (reelId: number) => void;
  isLiked: boolean;
  globalMuted: boolean;
  onMuteToggle: () => void;
  layout?: 'mobile' | 'desktop' | 'desktop-mobile-like';
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
  const [showVolumeToast, setShowVolumeToast] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  // Progress tracking - use the ref directly instead of DOM query
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

  // Imperatively sync mute state (no restart)
  const toggleMute = useImperativeMuteToggle(videoRef);
  useEffect(() => {
    toggleMute(globalMuted);
  }, [globalMuted, toggleMute]);

  // Ensure video is played on activation (autoplay fix)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Always set inline playback attributes to avoid iOS forcing fullscreen/black screen.
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('x-webkit-airplay', 'allow');
    video.playsInline = true;

    // Performance: preload metadata only and hint autoplay. Keep muted initially to satisfy
    // autoplay policies — we will toggle mute imperatively elsewhere so avoid binding props here.
    video.preload = 'metadata';
    video.autoplay = true;
    video.muted = true; // start muted imperatively

    // Helper to attempt playback when the element is ready. This won't throw if blocked.
    const tryPlay = () => video.play?.().catch(() => {});
    video.addEventListener('loadedmetadata', tryPlay);
    video.addEventListener('canplay', tryPlay);

    // Only manage source attachment for non-Cloudflare reels. Cloudflare player manages its own
    // HLS attachment and src; touching src there can cause reloads/black screens.
    if (!reel.isCloudflare) {
      (async () => {
        try {
          const srcCandidate = reel.videoUrl || '';
          if (!srcCandidate) return;

          const src = /^https?:\/\//i.test(srcCandidate)
            ? srcCandidate
            : srcCandidate.endsWith('.m3u8')
              ? srcCandidate
              : srcCandidate + '';

          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && (navigator as unknown as { maxTouchPoints?: number }).maxTouchPoints > 1);
          const canPlayHlsNatively = typeof video.canPlayType === 'function' && video.canPlayType('application/vnd.apple.mpegurl') !== '';

          if (src.endsWith('.m3u8')) {
            if (isIOS && canPlayHlsNatively) {
              if (video.src !== src) video.src = src; // native HLS on iOS
            } else {
              // Non-iOS: use hls.js when supported
              try {
                // Dynamic import and usage of hls.js — allow explicit any in this small block
                /* eslint-disable @typescript-eslint/no-explicit-any */
                const HlsMod = await import('hls.js');
                const Hls = ((HlsMod as unknown) as { default?: any }).default ?? (HlsMod as unknown as any);
                if (Hls && Hls.isSupported && Hls.isSupported()) {
                  const hls = new Hls({ autoStartLoad: true });
                  hls.loadSource(src);
                  hls.attachMedia(video);
                  // cleanup on unload
                  const cleanup = () => hls.destroy();
                  video.addEventListener('emptied', cleanup, { once: true });
                } else if (canPlayHlsNatively) {
                  if (video.src !== src) video.src = src;
                }
                /* eslint-enable @typescript-eslint/no-explicit-any */
              } catch {
                if (canPlayHlsNatively) {
                  if (video.src !== src) video.src = src;
                }
              }
            }
          } else {
            // mp4 or progressive
            if (video.src !== src) video.src = src;
          }
        } catch {
          // ignore
        }
      })();
    }

    // Pause when not active to avoid background playback
    if (isActive) {
      tryPlay();
    } else {
      video.pause();
    }

    return () => {
      video.removeEventListener('loadedmetadata', tryPlay);
      video.removeEventListener('canplay', tryPlay);
    };
  }, [isActive, globalMuted, reel.videoUrl, reel.isCloudflare]);

  const handleLikeClick = useCallback(() => {
    onLike(reel.id);
  }, [onLike, reel.id]);

  const handleMuteToggle = useCallback(() => {
    onMuteToggle();
    setShowVolumeToast(true);
    setTimeout(() => setShowVolumeToast(false), 1000);
  }, [onMuteToggle]);

  const handleDoubleTap = useCallback(() => {
    onLike(reel.id);
    setShowHeartBurst(true);
  }, [onLike, reel.id]);

  if (layout === 'desktop') {
    return (
      <div className="flex flex-col h-full w-full">
        {/* Video container - fills the stage */}
        <div className="relative flex-1 min-h-0 w-full h-full">
          {/* Video Player */}
        {reel.isCloudflare ? (
          <CloudflareStreamPlayer
            ref={videoRef}
            videoId={reel.videoUrl}
            isActive={isActive}
            loop={true}
            controls={false}
            className="w-full h-full"
            onTap={handleMuteToggle}
            onDoubleTap={handleDoubleTap}
            warmupLoad={!isActive}
          />
        ) : (
          <ReelPlayer
            videoUrl={reel.videoUrl}
            poster={reel.poster}
            isActive={isActive}
            globalMuted={globalMuted}
            onMuteToggle={onMuteToggle}
            onLike={handleLikeClick}
            height={0} // Height controlled by parent
          />
        )}

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
            layout="desktop"
          />
        </div>
      </div>
    );
  }

  if (layout === 'desktop-mobile-like') {
    return (
      <div className="relative bg-transparent w-full h-full">
        {/* Video Player with interactions - fills the stage */}
        {reel.isCloudflare ? (
          <CloudflareStreamPlayer
            ref={videoRef}
            videoId={reel.videoUrl}
            isActive={isActive}
            muted={globalMuted}
            loop={true}
            controls={false}
            className="w-full h-full"
            onTap={handleMuteToggle}
            onDoubleTap={handleDoubleTap}
            warmupLoad={!isActive}
          />
        ) : (
          <ReelPlayer
            videoUrl={reel.videoUrl}
            poster={reel.poster}
            isActive={isActive}
            globalMuted={globalMuted}
            onMuteToggle={onMuteToggle}
            onLike={handleLikeClick}
            height={0} // Height controlled by parent aspect ratio
          />
        )}

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
            user={reel.user}
            description={reel.description}
            audioTitle={reel.audioTitle}
            avatar={reel.avatar}
            layout="desktop"
          />
        </div>

        {/* Volume Toast */}
        <VolumeToast isMuted={globalMuted} isVisible={showVolumeToast} />

        {/* Heart burst animation */}
        <AnimatePresence>
          {showHeartBurst && (
            <HeartBurst onComplete={() => setShowHeartBurst(false)} />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Mobile layout (original)
  return (
    <section
      className="relative bg-black w-full snap-start snap-always"
      style={{ height: `${height}px`, scrollSnapStop: 'always' }}
      data-reel-id={reel.id}
    >
      {/* Video Player with interactions */}
        {reel.isCloudflare ? (
          <CloudflareStreamPlayer
            ref={videoRef}
            videoId={reel.videoUrl}
            isActive={isActive}
            loop={true}
            controls={false}
            className="absolute inset-0 w-full h-full"
            onTap={handleMuteToggle}
            onDoubleTap={handleDoubleTap}
            warmupLoad={!isActive}
          />
        ) : (
          <ReelPlayer
            videoUrl={reel.videoUrl}
            poster={reel.poster}
            isActive={isActive}
            globalMuted={globalMuted}
            onMuteToggle={onMuteToggle}
            onLike={handleLikeClick}
            height={height}
          />
        )}

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

      {/* Volume Toast */}
      <VolumeToast isMuted={globalMuted} isVisible={showVolumeToast} />

      {/* Heart burst animation */}
      <AnimatePresence>
        {showHeartBurst && (
          <HeartBurst onComplete={() => setShowHeartBurst(false)} />
        )}
      </AnimatePresence>
    </section>
  );
};

export default ReelVideo;