import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  ChevronDown,
  Camera,
  Music,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { loadStreamItems, thumbSrc } from '../lib/stream';

/** Types */
type Reel = {
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
};

/** Cloudflare helpers */
const cfThumb = (uid: string, h = 720) => thumbSrc(uid, h);
const cfMp4 = (uid: string) => `https://videodelivery.net/${uid}/downloads/default.mp4`;

/** Small helpers */
const formatNumber = (num: number): string => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
};

const ReelsPage = () => {
  /** Cloudflare reels loaded from /videos.json (section === "reels") */
  const [cfReels, setCfReels] = useState<Reel[]>([]);

  /** Your existing demo/local reels */
  const baseReels = useMemo<Reel[]>(
    () => [
      {
        id: 1,
        description:
          'Behind the scenes of our content creation process. From ideation to final production – see how we craft engaging content that converts! 🎬💡 #ContentCreation #BTS #Creative #VideoMarketing',
        likes: 16800,
        comments: 234,
        shares: 98,
        user: 'socialhive.agency',
        avatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
        audioTitle: 'Creative Process Mix',
        videoUrl: '/videos/demo1.mp4',
        poster: '/videos/demo1.jpg',
      },
      {
        id: 2,
        description:
          'Transform your social media presence with data-driven insights. Track performance and optimize content for maximum engagement! 📊✨ #Analytics #DataDriven',
        likes: 18420,
        comments: 287,
        shares: 142,
        user: 'socialhive.agency',
        avatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
        audioTitle: 'Analytics Trending Audio',
        videoUrl: '/videos/demo2.mp4',
        poster: '/videos/demo2.jpg',
      },
    ],
    []
  );

  /** Merge CF reels first so they appear on top */
  const reels = useMemo<Reel[]>(() => [...cfReels, ...baseReels], [cfReels, baseReels]);

  /** UI state */
  const [currentReel, setCurrentReel] = useState(0);
  const [progress, setProgress] = useState(0);
  const [likedReels, setLikedReels] = useState<Set<number>>(new Set());
  const [expandedCaptions, setExpandedCaptions] = useState<Set<number>>(new Set());
  const [isMuted, setIsMuted] = useState(true);
  const [muteIconAnimation, setMuteIconAnimation] = useState(false);
  const [heartAnimation, setHeartAnimation] = useState(false);

  /** Layout */
  const [reelViewportHeight, setReelViewportHeight] = useState(0);
  const [bottomNavHeight, setBottomNavHeight] = useState(0);

  /** Refs */
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const isNavigatingRef = useRef(false);
  const tapTimeoutRef = useRef<number | null>(null);
  const tapCountRef = useRef(0);
  const pressStateRef = useRef<{ isPressed: boolean; wasPlaying: boolean; holdTimeout?: number }>(
    { isPressed: false, wasPlaying: false }
  );

  /** “Lower” UI tweaks to feel like Instagram */
  const ACTIONS_BOTTOM_OFFSET = 72; // px above bottom nav
  const TEXT_BOTTOM_OFFSET = 4;     // px above bottom nav
  const HEADER_HEIGHT = 40;

  /** Load Cloudflare reels */
  useEffect(() => {
    (async () => {
      try {
        const items = await loadStreamItems();
        const mapped: Reel[] = items
          .filter((v) => v.section === 'reels')
          .map((v, i) => ({
            id: 90000 + i,
            description: v.title || 'Reel',
            likes: 0,
            comments: 0,
            shares: 0,
            user: 'cloudflare.stream',
            avatar: '/images/socialhive.png',
            audioTitle: 'Original audio',
            videoUrl: cfMp4(v.uid),
            poster: cfThumb(v.uid, 720),
          }));
        setCfReels(mapped);
      } catch (e) {
        console.error('CF reels load failed', e);
      }
    })();
  }, []);

  /** Captions */
  const toggleCaption = (idx: number) => {
    setExpandedCaptions((prev) => {
      const s = new Set(prev);
      if (s.has(idx)) s.delete(idx);
      else s.add(idx);
      return s;
    });
  };
  const truncateText = (text: string, isExpanded: boolean) => {
    if (isExpanded) return text;
    const words = text.split(' ');
    if (words.length <= 15) return text;
    return words.slice(0, 15).join(' ') + '...';
  };

  /** Likes */
  const toggleLike = (idx: number) => {
    setLikedReels((prev) => {
      const s = new Set(prev);
      if (s.has(idx)) s.delete(idx);
      else s.add(idx);
      return s;
    });
  };
  const showHeartAnimation = () => {
    setHeartAnimation(true);
    toggleLike(currentReel);
    window.setTimeout(() => setHeartAnimation(false), 900);
  };

  /** Layout calc */
  const calculateReelHeight = useCallback(() => {
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const headerHeight = headerRef.current?.getBoundingClientRect().height ?? HEADER_HEIGHT;

    const bottomNavEl = document.querySelector(
      'nav[class*="fixed"][class*="bottom-0"]'
    ) as HTMLElement | null;
    const bottomNavCalculated = bottomNavEl ? bottomNavEl.getBoundingClientRect().height : 64;

    setBottomNavHeight(bottomNavCalculated);
    const h = Math.max(viewportHeight - headerHeight - bottomNavCalculated, 240);
    setReelViewportHeight(h);
  }, []);

  /** Navigation helpers */
  const navigateToReel = useCallback(
    (newIndex: number) => {
      if (isNavigatingRef.current) return;

      let target = newIndex;
      if (newIndex < 0) target = reels.length - 1;
      if (newIndex >= reels.length) target = 0;

      isNavigatingRef.current = true;
      setCurrentReel(target);
      setProgress(0);

      const c = containerRef.current;
      if (c && reelViewportHeight > 0) {
        c.scrollTo({ top: target * reelViewportHeight, behavior: 'smooth' });
      }

      window.setTimeout(() => {
        isNavigatingRef.current = false;
      }, 300);
    },
    [reels.length, reelViewportHeight]
  );

  /** Touch navigation */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    containerRef.current?.setAttribute('data-start-y', `${e.touches[0].clientY}`);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const startY = parseFloat(containerRef.current?.getAttribute('data-start-y') || '0');
      const endY = e.changedTouches[0].clientY;
      const diff = startY - endY;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          navigateToReel(currentReel + 1);
        } else {
          navigateToReel(currentReel - 1);
        }
      }
    },
    [currentReel, navigateToReel]
  );

  /** Progress updater */
  const updateProgress = useCallback(() => {
    const vid = videoRefs.current[currentReel];
    if (vid?.duration) {
      setProgress((vid.currentTime / vid.duration) * 100);
    }
  }, [currentReel]);

  /** Toggle mute (single tap) */
  const toggleMute = useCallback(() => {
    const vid = videoRefs.current[currentReel];
    if (!vid) return;

    const t = vid.currentTime;
    const paused = vid.paused;

    vid.muted = !vid.muted;
    setIsMuted(vid.muted);

    if (!paused) vid.play().catch(() => {});
    vid.currentTime = t;

    setMuteIconAnimation(true);
    window.setTimeout(() => setMuteIconAnimation(false), 800);
  }, [currentReel]);

  /** Press & hold pause */
  const handlePressStart = (
    e: React.PointerEvent | React.MouseEvent | React.TouchEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const vid = videoRefs.current[currentReel];
    if (!vid || pressStateRef.current.isPressed) return;

    pressStateRef.current.isPressed = true;
    pressStateRef.current.wasPlaying = !vid.paused;

    pressStateRef.current.holdTimeout = window.setTimeout(() => {
      if (pressStateRef.current.isPressed) {
        vid.pause();
      }
    }, 300);
  };

  const handlePressEnd = (
    e: React.PointerEvent | React.MouseEvent | React.TouchEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const vid = videoRefs.current[currentReel];
    if (!vid) return;

    if (pressStateRef.current.holdTimeout) {
      window.clearTimeout(pressStateRef.current.holdTimeout);
      pressStateRef.current.holdTimeout = undefined;
    }
    const shouldResume =
      pressStateRef.current.isPressed && pressStateRef.current.wasPlaying;

    pressStateRef.current.isPressed = false;
    if (shouldResume) {
      vid.play().catch(() => {});
    }
  };

  /** Tap handler (single = mute, double = like) */
  const handleVideoClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pressStateRef.current.isPressed) return;

    tapCountRef.current += 1;
    if (tapTimeoutRef.current) {
      window.clearTimeout(tapTimeoutRef.current);
    }

    tapTimeoutRef.current = window.setTimeout(() => {
      if (tapCountRef.current === 1) {
        toggleMute();
      } else if (tapCountRef.current === 2) {
        showHeartAnimation();
      }
      tapCountRef.current = 0;
    }, 250);
  };

  /** When the current reel changes, start it (muted) and reset others */
  useEffect(() => {
    const vid = videoRefs.current[currentReel];
    if (!vid) return;

    setProgress(0);
    vid.muted = true;
    setIsMuted(true);
    vid.play().catch(() => {});

    videoRefs.current.forEach((v, i) => {
      if (v && i !== currentReel) {
        v.pause();
        v.currentTime = 0;
      }
    });

    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
    }
    progressIntervalRef.current = window.setInterval(updateProgress, 100);

    const onEnded = () => navigateToReel(currentReel + 1);
    vid.addEventListener('ended', onEnded);

    return () => {
      vid.removeEventListener('ended', onEnded);
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentReel, navigateToReel, updateProgress]);

  /** Keep video element's muted prop in sync */
  useEffect(() => {
    const vid = videoRefs.current[currentReel];
    if (vid) vid.muted = isMuted;
  }, [isMuted, currentReel]);

  /** Height + viewport listeners */
  useEffect(() => {
    const handleResize = () => calculateReelHeight();
    calculateReelHeight();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    window.addEventListener('pageshow', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('pageshow', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, [calculateReelHeight]);

  /** Scroll -> update reel index */
  useEffect(() => {
    const c = containerRef.current;
    if (!c || reelViewportHeight === 0) return;

    const onScroll = () => {
      if (isNavigatingRef.current) return;
      const newIndex = Math.round(c.scrollTop / reelViewportHeight);
      if (newIndex !== currentReel && newIndex >= 0 && newIndex < reels.length) {
        setCurrentReel(newIndex);
        setProgress(0);
      }
    };

    c.addEventListener('scroll', onScroll, { passive: true });
    return () => c.removeEventListener('scroll', onScroll);
  }, [currentReel, reels.length, reelViewportHeight]);

  return (
    <>
      {/* Tiny helpers for fade/scale animations */}
      <style>{`
        .animate-fade-in { animation: fadeIn 0.2s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(.95); } to { opacity: 1; transform: scale(1); } }
        .animate-scale-in { animation: pop .35s ease-out; }
        @keyframes pop { 0% { transform: scale(.7); opacity: .2 } 60% { transform: scale(1.15); opacity: 1 } 100% { transform: scale(1); opacity: 1 } }
      `}</style>

      {/* MOBILE */}
      <div className="lg:hidden fixed inset-0 bg-black flex flex-col">
        {/* Header — overlay style like IG */}
        <div
          ref={headerRef}
          className="relative flex items-center justify-between px-4 z-40"
          style={{
            height: `calc(${HEADER_HEIGHT}px + env(safe-area-inset-top, 0px))`,
            paddingTop: 'env(safe-area-inset-top, 0px)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
          <div className="relative flex items-center space-x-2">
            <span className="text-white font-semibold text-lg">Reels</span>
            <ChevronDown size={20} className="text-white" />
          </div>
          <button className="relative text-white">
            <Camera size={24} />
          </button>
        </div>

        {/* Scroll container */}
        <div
          ref={containerRef}
          className="relative w-full overflow-y-auto snap-y snap-mandatory scrollbar-hidden"
          style={{
            height: reelViewportHeight > 0 ? `${reelViewportHeight}px` : '100vh',
            WebkitOverflowScrolling: 'touch',
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {reels.map((reel, idx) => (
            <section
              key={reel.id}
              className="relative bg-black w-full snap-start snap-always"
              style={{
                height:
                  reelViewportHeight > 0 ? `${reelViewportHeight}px` : '100vh',
                scrollSnapStop: 'always',
              }}
            >
              {/* Video */}
              <video
                ref={(el) => (videoRefs.current[idx] = el)}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: 'center center' }}
                loop
                muted
                playsInline
                preload="metadata"
                poster={reel.poster}
                onClick={handleVideoClick}
                onPointerDown={handlePressStart}
                onPointerUp={handlePressEnd}
                onPointerLeave={handlePressEnd}
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
              >
                <source src={reel.videoUrl} type="video/mp4" />
              </video>

              {/* Mute icon (center) */}
              {idx === currentReel && muteIconAnimation && (
                <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/60 rounded-full p-4 animate-fade-in">
                    {isMuted ? (
                      <VolumeX size={48} className="text-white" />
                    ) : (
                      <Volume2 size={48} className="text-white" />
                    )}
                  </div>
                </div>
              )}

              {/* Heart pop (center) */}
              {idx === currentReel && heartAnimation && (
                <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                  <Heart
                    size={88}
                    className="text-red-500 fill-red-500 drop-shadow-lg animate-scale-in"
                    strokeWidth={0}
                  />
                </div>
              )}

              {/* Right action rail */}
              <div
                className="absolute right-3 flex flex-col space-y-5 z-20 pointer-events-auto"
                style={{ bottom: `${bottomNavHeight + ACTIONS_BOTTOM_OFFSET}px` }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(idx);
                  }}
                  className="flex flex-col items-center space-y-1"
                >
                  <Heart
                    size={28}
                    className={`${
                      likedReels.has(idx)
                        ? 'text-red-500 fill-red-500'
                        : 'text-white'
                    } drop-shadow-lg`}
                    strokeWidth={likedReels.has(idx) ? 0 : 1.5}
                  />
                  <span className="text-white text-xs font-medium drop-shadow-lg">
                    {formatNumber(reel.likes + (likedReels.has(idx) ? 1 : 0))}
                  </span>
                </button>

                <button className="flex flex-col items-center space-y-1">
                  <MessageCircle
                    size={28}
                    className="text-white drop-shadow-lg"
                    strokeWidth={1.5}
                  />
                  <span className="text-white text-xs font-medium drop-shadow-lg">
                    {formatNumber(reel.comments)}
                  </span>
                </button>

                <button className="flex flex-col items-center space-y-1">
                  <Send
                    size={28}
                    className="text-white drop-shadow-lg"
                    strokeWidth={1.5}
                  />
                  <span className="text-white text-xs font-medium drop-shadow-lg">
                    {formatNumber(reel.shares)}
                  </span>
                </button>

                <MoreHorizontal
                  size={28}
                  className="text-white drop-shadow-lg"
                  strokeWidth={1.5}
                />

                <button className="mt-2 w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-yellow-500 flex items-center justify-center border border-white">
                  <Music size={16} className="text-white" />
                </button>
              </div>

              {/* Profile & Caption */}
              <div
                className="absolute left-4 right-20 z-20"
                style={{ bottom: `${bottomNavHeight + TEXT_BOTTOM_OFFSET}px` }}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30">
                    <img
                      src={reel.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-white font-semibold text-sm">
                    {reel.user}
                  </span>
                  <span className="text-white text-sm font-semibold">• Follow</span>
                </div>

                <div
                  className={`${
                    expandedCaptions.has(idx)
                      ? 'max-h-32 overflow-y-auto'
                      : 'max-h-16'
                  } transition-all duration-300`}
                >
                  <p className="text-white text-sm leading-5 max-w-xs mb-2 pr-2">
                    {truncateText(reel.description, expandedCaptions.has(idx))}
                    {reel.description.split(' ').length > 15 && (
                      <button
                        onClick={() => toggleCaption(idx)}
                        className="text-gray-300 ml-1 font-medium"
                      >
                        {expandedCaptions.has(idx) ? 'less' : 'more'}
                      </button>
                    )}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Music size={12} className="text-white" />
                  <span className="text-white text-xs">
                    {reel.user} • {reel.audioTitle}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div
                className="absolute left-0 right-0 h-1 bg-white/20 z-30"
                style={{ bottom: `${bottomNavHeight}px` }}
              >
                <div
                  className="h-full bg-white transition-all ease-linear"
                  style={{ width: `${idx === currentReel ? progress : 0}%` }}
                />
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden lg:block bg-black min-h-screen">
        <div
          ref={containerRef}
          className="h-screen overflow-y-auto scrollbar-hidden"
          style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none' }}
        >
          {reels.map((reel, idx) => (
            <section
              key={reel.id}
              className="min-h-screen flex items-center justify-center"
              style={{ scrollSnapAlign: 'center', scrollSnapStop: 'always' }}
            >
              <div className="relative w-[420px] h-[min(86vh,900px)] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-black">
                <video
                  ref={(el) => (videoRefs.current[idx] = el)}
                  className="w-full h-full object-cover"
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  poster={reel.poster}
                  onClick={handleVideoClick}
                  onPointerDown={handlePressStart}
                  onPointerUp={handlePressEnd}
                  onPointerLeave={handlePressEnd}
                  onMouseDown={handlePressStart}
                  onMouseUp={handlePressEnd}
                  onMouseLeave={handlePressEnd}
                  onTouchStart={handlePressStart}
                  onTouchEnd={handlePressEnd}
                >
                  <source src={reel.videoUrl} type="video/mp4" />
                </video>

                {idx === currentReel && muteIconAnimation && (
                  <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/60 rounded-full p-4 animate-fade-in">
                      {isMuted ? (
                        <VolumeX size={48} className="text-white" />
                      ) : (
                        <Volume2 size={48} className="text-white" />
                      )}
                    </div>
                  </div>
                )}

                {idx === currentReel && heartAnimation && (
                  <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                    <Heart
                      size={88}
                      className="text-red-500 fill-red-500 drop-shadow-lg animate-scale-in"
                      strokeWidth={0}
                    />
                  </div>
                )}

                <div className="absolute right-3 bottom-24 flex flex-col space-y-6 z-30">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(idx);
                    }}
                    className="flex flex-col items-center space-y-1"
                  >
                    <Heart
                      size={28}
                      className={`${
                        likedReels.has(idx)
                          ? 'text-red-500 fill-red-500'
                          : 'text-white'
                      } drop-shadow-lg`}
                      strokeWidth={likedReels.has(idx) ? 0 : 1.5}
                    />
                    <span className="text-white text-xs font-medium drop-shadow-lg">
                      {formatNumber(reel.likes + (likedReels.has(idx) ? 1 : 0))}
                    </span>
                  </button>

                  <button className="flex flex-col items-center space-y-1">
                    <MessageCircle
                      size={28}
                      className="text-white drop-shadow-lg"
                      strokeWidth={1.5}
                    />
                    <span className="text-white text-xs font-medium drop-shadow-lg">
                      {formatNumber(reel.comments)}
                    </span>
                  </button>

                  <button className="flex flex-col items-center space-y-1">
                    <Send
                      size={28}
                      className="text-white drop-shadow-lg"
                      strokeWidth={1.5}
                    />
                    <span className="text-white text-xs font-medium drop-shadow-lg">
                      {formatNumber(reel.shares)}
                    </span>
                  </button>

                  <MoreHorizontal
                    size={28}
                    className="text-white drop-shadow-lg"
                    strokeWidth={1.5}
                  />

                  <button className="mt-4 w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-yellow-500 flex items-center justify-center border border-white">
                    <Music size={16} className="text-white" />
                  </button>
                </div>

                <div className="absolute bottom-6 left-4 right-4 z-30 pt-8">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30">
                      <img
                        src={reel.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-white font-semibold text-sm">
                      {reel.user}
                    </span>
                    <span className="text-white text-sm font-semibold">
                      • Follow
                    </span>
                  </div>

                  <p className="text-white text-sm leading-5 max-w-xs mb-2">
                    {truncateText(reel.description, expandedCaptions.has(idx))}
                    {reel.description.split(' ').length > 15 && (
                      <button
                        onClick={() => toggleCaption(idx)}
                        className="text-gray-300 ml-1 font-medium"
                      >
                        {expandedCaptions.has(idx) ? 'less' : 'more'}
                      </button>
                    )}
                  </p>

                  <div className="flex items-center space-x-2 pb-2">
                    <Music size={12} className="text-white" />
                    <span className="text-white text-xs">
                      {reel.user} • {reel.audioTitle}
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
                  <div
                    className="h-full bg-white transition-all ease-linear"
                    style={{ width: `${idx === currentReel ? progress : 0}%` }}
                  />
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
};

export default ReelsPage;
