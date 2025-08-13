import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  ChevronDown,
  Camera,
  Music,
  Volume2,
  VolumeX
} from 'lucide-react';

const ReelsPage = () => {
  const [currentReel, setCurrentReel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [likedReels, setLikedReels] = useState<Set<number>>(new Set());
  const [expandedCaptions, setExpandedCaptions] = useState<Set<number>>(new Set());
  const [isMuted, setIsMuted] = useState(true);
  const [muteIconAnimation, setMuteIconAnimation] = useState<{ show: boolean } | null>(null);
  const [heartAnimation, setHeartAnimation] = useState<{ show: boolean } | null>(null);

  const [reelViewportHeight, setReelViewportHeight] = useState(0);
  const [bottomNavHeight, setBottomNavHeight] = useState(0);
  const [safeBottom, setSafeBottom] = useState(0);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const mobileScrollerRef = useRef<HTMLDivElement>(null);
  const desktopScrollerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isNavigatingRef = useRef(false);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tapCountRef = useRef(0);
  const pressStateRef = useRef<{
    isPressed: boolean;
    wasPlaying: boolean;
    holdTimeout?: ReturnType<typeof setTimeout>;
  }>({ isPressed: false, wasPlaying: false });

  // ---- Demo reels (replace with your /public/videos/* when ready)
  const reels = [
    {
      id: 1,
      title: 'Demo Reel #1',
      description:
        'Latest insights on social media marketing strategies that drive engagement and conversions. Watch how we transform brands through data-driven approaches! 🚀✨',
      likes: 18420,
      comments: 287,
      shares: 142,
      user: 'socialhive.agency',
      avatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      isFollowing: false,
      audioTitle: 'Latest Trending Audio',
      // Public demo MP4
      videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
    },
    {
      id: 2,
      title: 'Demo Reel #2',
      description:
        'Behind the scenes of our content creation process. From ideation to final production—see how we craft engaging content that converts! 🎬💡',
      likes: 16750,
      comments: 234,
      shares: 98,
      user: 'socialhive.agency',
      avatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      isFollowing: false,
      audioTitle: 'Creative Process Mix',
      // Public demo MP4
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    }
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
  };

  const toggleLike = (index: number) => {
    setLikedReels(prev => {
      const s = new Set(prev);
      if (s.has(index)) s.delete(index);
      else s.add(index);
      return s;
    });
  };

  const toggleCaption = (index: number) => {
    setExpandedCaptions(prev => {
      const s = new Set(prev);
      if (s.has(index)) s.delete(index);
      else s.add(index);
      return s;
    });
  };

  const truncateText = (text: string, isExpanded: boolean) => {
    if (isExpanded) return text;
    const words = text.split(' ');
    if (words.length <= 15) return text;
    return words.slice(0, 15).join(' ') + '...';
  };

  // --------- Runtime viewport height calc (mobile)
  const calculateReelHeight = useCallback(() => {
    const header = headerRef.current;
    if (!header) return;

    const vv = (window as any).visualViewport;
    const viewportHeight = vv?.height || window.innerHeight;
    const headerHeight = header.getBoundingClientRect().height;

    // safe-area bottom from CSS
    const sb =
      parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--safe-b')
          .replace('px', '')
      ) || 0;
    setSafeBottom(sb);

    // try to find a fixed bottom nav (your app shell)
    let navH = 64; // fallback
    const candidates = Array.from(document.querySelectorAll<HTMLElement>('nav, footer, div'));
    const fixedBottom = candidates.find((el) => {
      const cs = getComputedStyle(el);
      return cs.position === 'fixed' && cs.bottom === '0px' && el.offsetHeight >= 40;
    });
    if (fixedBottom) navH = fixedBottom.getBoundingClientRect().height;
    setBottomNavHeight(navH);

    const calc = viewportHeight - headerHeight - navH - sb;
    setReelViewportHeight(Math.max(calc, 200));
  }, []);

  const navigateToReel = useCallback(
    (newIndex: number) => {
      if (isNavigatingRef.current) return;
      let target = newIndex;
      if (newIndex < 0) target = reels.length - 1;
      if (newIndex >= reels.length) target = 0;
      isNavigatingRef.current = true;
      setCurrentReel(target);
      setProgress(0);

      const scroller = mobileScrollerRef.current || desktopScrollerRef.current;
      const slideH = mobileScrollerRef.current ? reelViewportHeight : (desktopScrollerRef.current?.clientHeight || 0);
      if (scroller && slideH > 0) {
        scroller.scrollTo({ top: target * slideH, behavior: 'smooth' });
      }
      setTimeout(() => (isNavigatingRef.current = false), 300);
    },
    [reels.length, reelViewportHeight]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const y = e.touches[0].clientY;
    mobileScrollerRef.current?.setAttribute('data-start-y', `${y}`);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const startY = parseFloat(mobileScrollerRef.current?.getAttribute('data-start-y') || '0');
      const endY = e.changedTouches[0].clientY;
      const diff = startY - endY;
      if (Math.abs(diff) > 50) {
        diff > 0 ? navigateToReel(currentReel + 1) : navigateToReel(currentReel - 1);
      }
    },
    [currentReel, navigateToReel]
  );

  const updateProgress = useCallback(() => {
    const vid = videoRefs.current[currentReel];
    if (vid?.duration) setProgress((vid.currentTime / vid.duration) * 100);
  }, [currentReel]);

  const toggleMute = () => {
    const vid = videoRefs.current[currentReel];
    if (!vid) return;
    const t = vid.currentTime;
    const wasPaused = vid.paused;
    vid.muted = !vid.muted;
    setIsMuted(vid.muted);
    if (!wasPaused) vid.play().catch(() => {});
    vid.currentTime = t;

    setMuteIconAnimation({ show: true });
    setTimeout(() => setMuteIconAnimation(null), 800);
  };

  const showHeartAnimation = () => {
    setHeartAnimation({ show: true });
    toggleLike(currentReel);
    setTimeout(() => setHeartAnimation(null), 1000);
  };

  const handlePressStart = (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); e.stopPropagation();
    const vid = videoRefs.current[currentReel];
    if (!vid || pressStateRef.current.isPressed) return;
    pressStateRef.current.isPressed = true;
    pressStateRef.current.wasPlaying = !vid.paused;
    pressStateRef.current.holdTimeout = setTimeout(() => {
      if (pressStateRef.current.isPressed) vid.pause();
    }, 300);
  };

  const handlePressEnd = (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); e.stopPropagation();
    const vid = videoRefs.current[currentReel];
    if (!vid) return;
    if (pressStateRef.current.holdTimeout) {
      clearTimeout(pressStateRef.current.holdTimeout);
      pressStateRef.current.holdTimeout = undefined;
    }
    const shouldResume = pressStateRef.current.isPressed && pressStateRef.current.wasPlaying;
    pressStateRef.current.isPressed = false;
    if (shouldResume) vid.play().catch(() => {});
  };

  const handleVideoClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (pressStateRef.current.isPressed) return;
    tapCountRef.current += 1;
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = setTimeout(() => {
      if (tapCountRef.current === 1) toggleMute();
      else if (tapCountRef.current === 2) showHeartAnimation();
      tapCountRef.current = 0;
    }, 250);
  };

  // ----- A) Reel change & autoplay (no resetting on mute)
  useEffect(() => {
    const vid = videoRefs.current[currentReel];
    if (!vid) return;

    setProgress(0);
    vid.muted = true;
    setIsMuted(true);

    const playPromise = vid.play();
    if (playPromise) {
      playPromise.catch(() => setIsPlaying(false));
    }

    videoRefs.current.forEach((v, i) => {
      if (v && i !== currentReel) {
        v.pause();
        v.currentTime = 0;
      }
    });

    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(updateProgress, 100);

    const onEnded = () => navigateToReel(currentReel + 1);
    vid.addEventListener('ended', onEnded);
    return () => {
      vid.removeEventListener('ended', onEnded);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentReel, navigateToReel, updateProgress]);

  // ----- B) Mute state only
  useEffect(() => {
    const vid = videoRefs.current[currentReel];
    if (vid) vid.muted = isMuted;
  }, [isMuted, currentReel]);

  // ----- Keyboard (desktop)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') navigateToReel(currentReel - 1);
      if (e.key === 'ArrowDown') navigateToReel(currentReel + 1);
      if (e.key === ' ') { e.preventDefault(); toggleMute(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentReel, navigateToReel]);

  // ----- Runtime sizing listeners (mobile)
  useEffect(() => {
    calculateReelHeight();
    const onResize = () => calculateReelHeight();
    const onOrient = () => setTimeout(calculateReelHeight, 100);
    const onPageShow = () => calculateReelHeight();

    window.addEventListener('load', onResize);
    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onOrient);
    (window as any).visualViewport?.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('load', onResize);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onOrient);
      (window as any).visualViewport?.removeEventListener('resize', onResize);
    };
  }, [calculateReelHeight]);

  // ----- Auto-detect current reel on scroll (mobile)
  useEffect(() => {
    const container = mobileScrollerRef.current;
    if (!container || reelViewportHeight === 0) return;
    const handleScroll = () => {
      if (isNavigatingRef.current) return;
      const newIndex = Math.round(container.scrollTop / reelViewportHeight);
      if (newIndex !== currentReel && newIndex >= 0 && newIndex < reels.length) {
        setCurrentReel(newIndex);
        setProgress(0);
      }
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentReel, reels.length, reelViewportHeight]);

  return (
    <>
      <style>{`:root{--safe-t: env(safe-area-inset-top,0px);--safe-b: env(safe-area-inset-bottom,0px);--safe-l: env(safe-area-inset-left,0px);--safe-r: env(safe-area-inset-right,0px);}`}</style>

      {/* ========== MOBILE ========== */}
      <div className="lg:hidden w-screen bg-black overflow-hidden fixed inset-0 flex flex-col">
        {/* Header */}
        <div
          ref={headerRef}
          className="bg-black flex items-center justify-between px-4 z-50 border-b border-gray-800"
          style={{
            height: 'calc(44px + var(--safe-t))',
            paddingTop: 'var(--safe-t)',
            paddingLeft: 'max(16px, calc(var(--safe-l) + 16px))',
            paddingRight: 'max(16px, calc(var(--safe-r) + 16px))'
          }}
        >
          <div className="flex items-center space-x-2">
            <span className="text-white font-semibold text-lg">Reels</span>
            <ChevronDown size={20} className="text-white" />
          </div>
          <button className="text-white"><Camera size={24} /></button>
        </div>

        {/* Scrollable area (height computed at runtime) */}
        <div
          ref={mobileScrollerRef}
          className="relative w-full overflow-y-auto scrollbar-hidden overscroll-contain snap-y snap-mandatory"
          style={{
            height: reelViewportHeight > 0 ? `${reelViewportHeight}px` : '100%',
            scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch'
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {reels.map((reel, idx) => (
            <section
              key={reel.id}
              className="relative bg-black w-full snap-start snap-always"
              style={{ height: reelViewportHeight > 0 ? `${reelViewportHeight}px` : '100vh', scrollSnapStop: 'always' }}
            >
              {/* Video */}
              <video
                ref={el => (videoRefs.current[idx] = el)}
                className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                style={{ WebkitTransform: 'translateZ(0)', objectPosition: 'center center' }}
                loop muted playsInline preload="metadata"
                onClick={handleVideoClick}
                onPointerDown={handlePressStart} onPointerUp={handlePressEnd} onPointerLeave={handlePressEnd}
                onMouseDown={handlePressStart} onMouseUp={handlePressEnd} onMouseLeave={handlePressEnd}
                onTouchStart={handlePressStart} onTouchEnd={handlePressEnd}
              >
                <source src={reel.videoUrl} type="video/mp4" />
              </video>

              {/* Mute Icon Animation */}
              {idx === currentReel && muteIconAnimation?.show && (
                <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/60 rounded-full p-4">
                    {isMuted ? <VolumeX size={48} className="text-white" /> : <Volume2 size={48} className="text-white" />}
                  </div>
                </div>
              )}

              {/* Heart Animation */}
              {idx === currentReel && heartAnimation?.show && (
                <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                  <Heart size={80} className="text-red-500 fill-red-500 drop-shadow-lg" strokeWidth={0} />
                </div>
              )}

              {/* Right Actions */}
              <div
                className="absolute right-3 flex flex-col space-y-5 z-20 pointer-events-auto"
                style={{ bottom: `${bottomNavHeight + safeBottom + 72}px` }}
              >
                <button onClick={(e) => { e.stopPropagation(); toggleLike(idx); }} className="flex flex-col items-center space-y-1">
                  <Heart size={28} className={`${likedReels.has(idx) ? 'text-red-500 fill-red-500' : 'text-white'} drop-shadow-lg`} strokeWidth={likedReels.has(idx) ? 0 : 1.5} />
                  <span className="text-white text-xs font-medium drop-shadow-lg">{formatNumber(reel.likes + (likedReels.has(idx) ? 1 : 0))}</span>
                </button>
                <button className="flex flex-col items-center space-y-1">
                  <MessageCircle size={28} className="text-white drop-shadow-lg" strokeWidth={1.5} />
                  <span className="text-white text-xs font-medium drop-shadow-lg">{formatNumber(reel.comments)}</span>
                </button>
                <button className="flex flex-col items-center space-y-1">
                  <Send size={28} className="text-white drop-shadow-lg" strokeWidth={1.5} />
                  <span className="text-white text-xs font-medium drop-shadow-lg">{formatNumber(reel.shares)}</span>
                </button>
                <MoreHorizontal size={28} className="text-white drop-shadow-lg" strokeWidth={1.5} />
                <button className="mt-2 w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-yellow-500 flex items-center justify-center border border-white">
                  <Music size={16} className="text-white" />
                </button>
              </div>

              {/* Caption */}
              <div
                className="absolute left-4 right-20 z-20"
                style={{ bottom: `${bottomNavHeight + safeBottom + 8}px` }}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30">
                    <img src={reel.avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-white font-semibold text-sm">{reel.user}</span>
                  <span className="text-white text-sm font-semibold">• Follow</span>
                </div>

                <div className={`${expandedCaptions.has(idx) ? 'max-h-32 overflow-y-auto' : 'max-h-16'} transition-all duration-300`}>
                  <p className="text-white text-sm leading-5 max-w-xs mb-2 pr-2">
                    {truncateText(reel.description, expandedCaptions.has(idx))}
                    {reel.description.split(' ').length > 15 && (
                      <button onClick={() => toggleCaption(idx)} className="text-gray-300 ml-1 font-medium">
                        {expandedCaptions.has(idx) ? 'less' : 'more'}
                      </button>
                    )}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Music size={12} className="text-white" />
                  <span className="text-white text-xs">{reel.user} • {reel.audioTitle}</span>
                </div>
              </div>

              {/* Progress */}
              <div
                className="absolute left-0 right-0 h-1 bg-white/20 z-30"
                style={{ bottom: `${bottomNavHeight + safeBottom}px` }}
              >
                <div className="h-full bg-white transition-all ease-linear" style={{ width: `${idx === currentReel ? progress : 0}%` }} />
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* ========== DESKTOP ========== */}
      <div className="hidden lg:block bg-black min-h-screen">
        <div
          ref={desktopScrollerRef}
          className="h-screen overflow-y-auto scrollbar-hidden"
          style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {reels.map((reel, idx) => (
            <section
              key={reel.id}
              className="min-h-screen flex items-center justify-center"
              style={{ scrollSnapAlign: 'center', scrollSnapStop: 'always' }}
            >
              <div className="relative w-[420px] h-[min(86vh,900px)] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-black">
                <video
                  ref={el => (videoRefs.current[idx] = el)}
                  className="w-full h-full object-cover cursor-pointer"
                  loop muted playsInline preload="metadata"
                  onClick={handleVideoClick}
                  onPointerDown={handlePressStart} onPointerUp={handlePressEnd} onPointerLeave={handlePressEnd}
                  onMouseDown={handlePressStart} onMouseUp={handlePressEnd} onMouseLeave={handlePressEnd}
                  onTouchStart={handlePressStart} onTouchEnd={handlePressEnd}
                >
                  <source src={reel.videoUrl} type="video/mp4" />
                </video>

                {idx === currentReel && muteIconAnimation?.show && (
                  <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/60 rounded-full p-4">
                      {isMuted ? <VolumeX size={48} className="text-white" /> : <Volume2 size={48} className="text-white" />}
                    </div>
                  </div>
                )}

                {idx === currentReel && heartAnimation?.show && (
                  <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                    <Heart size={80} className="text-red-500 fill-red-500 drop-shadow-lg" strokeWidth={0} />
                  </div>
                )}

                {/* Actions */}
                <div className="absolute right-3 bottom-24 flex flex-col space-y-6 z-20 pointer-events-auto">
                  <button onClick={(e) => { e.stopPropagation(); toggleLike(idx); }} className="flex flex-col items-center space-y-1">
                    <Heart size={28} className={`${likedReels.has(idx) ? 'text-red-500 fill-red-500' : 'text-white'} drop-shadow-lg`} strokeWidth={likedReels.has(idx) ? 0 : 1.5} />
                    <span className="text-white text-xs font-medium drop-shadow-lg">{formatNumber(reel.likes + (likedReels.has(idx) ? 1 : 0))}</span>
                  </button>
                  <button className="flex flex-col items-center space-y-1">
                    <MessageCircle size={28} className="text-white drop-shadow-lg" strokeWidth={1.5} />
                    <span className="text-white text-xs font-medium drop-shadow-lg">{formatNumber(reel.comments)}</span>
                  </button>
                  <button className="flex flex-col items-center space-y-1">
                    <Send size={28} className="text-white drop-shadow-lg" strokeWidth={1.5} />
                    <span className="text-white text-xs font-medium drop-shadow-lg">{formatNumber(reel.shares)}</span>
                  </button>
                  <MoreHorizontal size={28} className="text-white drop-shadow-lg" strokeWidth={1.5} />
                  <button className="mt-4 w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-yellow-500 flex items-center justify-center border border-white">
                    <Music size={16} className="text-white" />
                  </button>
                </div>

                {/* Caption */}
                <div className="absolute bottom-6 left-4 right-4 z-20 pt-8">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30">
                      <img src={reel.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-white font-semibold text-sm">{reel.user}</span>
                    <span className="text-white text-sm font-semibold">• Follow</span>
                  </div>
                  <p className="text-white text-sm leading-5 max-w-xs mb-2">
                    {truncateText(reel.description, expandedCaptions.has(idx))}
                    {reel.description.split(' ').length > 15 && (
                      <button onClick={() => toggleCaption(idx)} className="text-gray-300 ml-1 font-medium">
                        {expandedCaptions.has(idx) ? 'less' : 'more'}
                      </button>
                    )}
                  </p>
                  <div className="flex items-center space-x-2 pb-2">
                    <Music size={12} className="text-white" />
                    <span className="text-white text-xs">{reel.user} • {reel.audioTitle}</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
                  <div className="h-full bg-white transition-all ease-linear" style={{ width: `${idx === currentReel ? progress : 0}%` }} />
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
