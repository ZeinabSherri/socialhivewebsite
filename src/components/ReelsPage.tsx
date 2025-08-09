import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  ChevronDown,
  Camera,
  Home,
  Search,
  Plus,
  Play,
  User,
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
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isNavigatingRef = useRef(false);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tapCountRef = useRef(0);

  const reels = [
    {
      id: 1,
      title: 'Latest Social Media Strategy',
      description:
        'Latest insights on social media marketing strategies that drive engagement and conversions. Watch how we transform brands through data-driven approaches! 🚀✨ #SocialMedia #Marketing #Strategy #DigitalMarketing #BusinessGrowth',
      likes: 18420,
      comments: 287,
      shares: 142,
      user: 'socialhive.agency',
      avatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      isFollowing: false,
      audioTitle: 'Latest Trending Audio',
      videoUrl: '/videos/47072fb1-0d9d-4b10-8e0b-347ecdeae27e.MP4'
    },
    {
      id: 2,
      title: 'Advanced Content Creation',
      description:
        'Advanced content creation techniques that convert viewers into customers. See our proven process in action! 🎬💡 #ContentCreation #BTS #Creative #VideoMarketing #ConversionOptimization',
      likes: 16750,
      comments: 234,
      shares: 98,
      user: 'socialhive.agency',
      avatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      isFollowing: false,
      audioTitle: 'Creative Process Mix',
      videoUrl: '/videos/0715(3).mp4'
    },
    {
      id: 3,
      title: 'Client Transformation Story',
      description:
        'Amazing client transformation using our proven methodology. From struggling business to market leader in just months! 📈🎯 #Success #ROI #Results #BusinessGrowth #Transformation',
      likes: 14890,
      comments: 198,
      shares: 76,
      user: 'socialhive.agency',
      avatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      isFollowing: false,
      audioTitle: 'Success Stories Audio',
      videoUrl: '/videos/0710 (1).mp4'
    },
    {
      id: 4,
      title: 'Behind the Scenes Magic',
      description:
        'Behind the scenes of our creative process. Watch how we turn ideas into viral content that drives real business results! ✨🎥 #BTS #Creative #Process #ContentStrategy',
      likes: 13240,
      comments: 167,
      shares: 54,
      user: 'socialhive.agency',
      avatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      isFollowing: false,
      audioTitle: 'Creative Vibes',
      videoUrl: '/videos/0709(1).mp4'
    },
    {
      id: 5,
      title: 'Marketing Strategy Deep Dive',
      description:
        'Deep dive into our marketing strategies that have helped hundreds of businesses scale. Learn the secrets of successful campaigns! 🚀📊 #Marketing #Strategy #Growth #BusinessTips',
      likes: 12670,
      comments: 143,
      shares: 67,
      user: 'socialhive.agency',
      avatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      isFollowing: false,
      audioTitle: 'Strategy Sessions',
      videoUrl: '/videos/0703.mp4'
    },
    {
      id: 6,
      title: 'Creative Campaign Launch',
      description:
        'Launching a creative campaign that broke all engagement records. See the strategy and execution that made it possible! 🎯🔥 #Campaign #Creative #Launch #Engagement #Viral',
      likes: 15430,
      comments: 189,
      shares: 89,
      user: 'socialhive.agency',
      avatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      isFollowing: false,
      audioTitle: 'Campaign Launch Mix',
      videoUrl: '/videos/0630 (1)(3).mp4'
    },
    {
      id: 7,
      title: 'Brand Storytelling Mastery',
      description:
        'Mastering the art of brand storytelling through visual content. Transform your brand narrative into compelling stories! 📖✨ #Storytelling #Brand #Content #Narrative #Visual',
      likes: 11890,
      comments: 156,
      shares: 78,
      user: 'socialhive.agency',
      avatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      isFollowing: false,
      audioTitle: 'Storytelling Audio',
      videoUrl: '/videos/0627 (1).mp4'
    },
    {
      id: 8,
      title: 'Digital Innovation Workshop',
      description:
        'Digital innovation workshop highlights. Discover cutting-edge techniques that are reshaping the marketing landscape! 💡🔬 #Innovation #Digital #Workshop #Tech #Future',
      likes: 13560,
      comments: 172,
      shares: 95,
      user: 'socialhive.agency',
      avatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      isFollowing: false,
      audioTitle: 'Innovation Sounds',
      videoUrl: '/videos/0626(2).mp4'
    },
    {
      id: 9,
      title: 'Content Strategy Breakthrough',
      description:
        'Content strategy breakthrough session. Learn how we develop content that not only engages but converts at scale! 🎯📈 #Content #Strategy #Breakthrough #Conversion #Scale',
      likes: 10420,
      comments: 134,
      shares: 62,
      user: 'socialhive.agency',
      avatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      isFollowing: false,
      audioTitle: 'Strategy Beats',
      videoUrl: '/videos/0619 (2)(3).mp4'
    },
    {
      id: 10,
      title: 'Creative Process Unveiled',
      description:
        'Creative process unveiled - from brainstorming to final execution. See how great ideas become viral content! 🧠⚡ #Creative #Process #Brainstorming #Execution #Ideas',
      likes: 9870,
      comments: 118,
      shares: 45,
      user: 'socialhive.agency',
      avatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      isFollowing: false,
      audioTitle: 'Creative Flow',
      videoUrl: '/videos/0619 (2) (2).mp4'
    },
    {
      id: 11,
      title: 'Marketing Insights Session',
      description:
        'Marketing insights session revealing the trends and strategies shaping the future of digital marketing! 🔍📊 #Marketing #Insights #Trends #Future #Digital',
      likes: 12340,
      comments: 167,
      shares: 83,
      user: 'socialhive.agency',
      avatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      isFollowing: false,
      audioTitle: 'Insights Mix',
      videoUrl: '/videos/0617 (1)(3).MP4'
    },
    {
      id: 12,
      title: 'Foundation Building Strategy',
      description:
        'Foundation building strategy for long-term success. Learn the fundamentals that every successful business needs! 🏗️💪 #Foundation #Strategy #Success #Business #Fundamentals',
      likes: 8960,
      comments: 102,
      shares: 38,
      user: 'socialhive.agency',
      avatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      isFollowing: false,
      audioTitle: 'Foundation Audio',
      videoUrl: '/videos/0521.mp4'
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
      if (c) {
        c.scrollTo({
          top: target * c.clientHeight,
          behavior: 'smooth'
        });
      }
      setTimeout(() => (isNavigatingRef.current = false), 300);
    },
    [reels.length]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const y = e.touches[0].clientY;
    containerRef.current?.setAttribute('data-start-y', `${y}`);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const startY = parseFloat(containerRef.current?.getAttribute('data-start-y') || '0');
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
    if (vid?.duration) {
      setProgress((vid.currentTime / vid.duration) * 100);
    }
  }, [currentReel]);

  const toggleMute = () => {
    const vid = videoRefs.current[currentReel];
    if (!vid) return;
    vid.muted = !vid.muted;
    setIsMuted(vid.muted);
    
    // Show mute icon animation in center
    setMuteIconAnimation({ show: true });
    setTimeout(() => {
      setMuteIconAnimation(null);
    }, 800);
  };

  const showHeartAnimation = () => {
    setHeartAnimation({ show: true });
    toggleLike(currentReel);
    
    setTimeout(() => {
      setHeartAnimation(null);
    }, 1000);
  };

  const handleVideoClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    tapCountRef.current += 1;
    
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    
    tapTimeoutRef.current = setTimeout(() => {
      if (tapCountRef.current === 1) {
        // Single tap - toggle mute and show icon
        toggleMute();
      } else if (tapCountRef.current === 2) {
        // Double tap - like and show heart
        showHeartAnimation();
      }
      tapCountRef.current = 0;
    }, 250);
  };

  useEffect(() => {
    const vid = videoRefs.current[currentReel];
    if (!vid) return;
    vid.currentTime = 0;
    vid.muted = isMuted;
    setProgress(0);
    if (isPlaying) vid.play().catch(console.error);
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
  }, [currentReel, isPlaying, isMuted, navigateToReel, updateProgress]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') navigateToReel(currentReel - 1);
      if (e.key === 'ArrowDown') navigateToReel(currentReel + 1);
      if (e.key === ' ') {
        e.preventDefault();
        toggleMute();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentReel, navigateToReel]);

  return (
    <div className="w-screen bg-black overflow-hidden fixed inset-0 flex flex-col">
      {/* Header */}
      <div className="h-11 bg-black flex items-center justify-between px-4 z-50 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <span className="text-white font-semibold text-lg">Reels</span>
          <ChevronDown size={20} className="text-white" />
        </div>
        <button className="text-white">
          <Camera size={24} />
        </button>
      </div>

      {/* Scrollable Reels Area */}
      <div
        ref={containerRef}
        className="relative w-full overflow-y-auto scrollbar-hidden"
        style={{
          height: 'calc(100vh - 44px - 56px)',
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {reels.map((reel, idx) => (
          <div
            key={reel.id}
            className="relative bg-black flex-shrink-0 h-full"
            style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
          >
            {/* Video */}
            <video
              ref={el => (videoRefs.current[idx] = el)}
              className="w-full h-full object-cover cursor-pointer"
              loop
              muted
              playsInline
              preload="metadata"
              onClick={handleVideoClick}
            >
              <source src={reel.videoUrl} type="video/mp4" />
            </video>

            {/* Mute Icon Animation - center overlay for current reel */}
            {idx === currentReel && muteIconAnimation?.show && (
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

            {/* Heart Animation - center overlay for current reel */}
            {idx === currentReel && heartAnimation?.show && (
              <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                <Heart
                  size={80}
                  className="text-red-500 fill-red-500 drop-shadow-lg animate-scale-in"
                  strokeWidth={0}
                />
              </div>
            )}

            {/* Right Side Actions */}
            <div className="absolute right-3 bottom-24 flex flex-col space-y-6 z-20">
              <button
                onClick={e => {
                  e.stopPropagation();
                  toggleLike(idx);
                }}
                className="flex flex-col items-center space-y-1"
              >
                <Heart
                  size={28}
                  className={`${likedReels.has(idx) ? 'text-red-500 fill-red-500' : 'text-white'} drop-shadow-lg`}
                  strokeWidth={likedReels.has(idx) ? 0 : 1.5}
                />
                <span className="text-white text-xs font-medium drop-shadow-lg">
                  {formatNumber(reel.likes + (likedReels.has(idx) ? 1 : 0))}
                </span>
              </button>

              <button className="flex flex-col items-center space-y-1">
                <MessageCircle size={28} className="text-white drop-shadow-lg" strokeWidth={1.5} />
                <span className="text-white text-xs font-medium drop-shadow-lg">
                  {formatNumber(reel.comments)}
                </span>
              </button>

              <button className="flex flex-col items-center space-y-1">
                <Send size={28} className="text-white drop-shadow-lg" strokeWidth={1.5} />
                <span className="text-white text-xs font-medium drop-shadow-lg">
                  {formatNumber(reel.shares)}
                </span>
              </button>

              <MoreHorizontal size={28} className="text-white drop-shadow-lg" strokeWidth={1.5} />

              <button className="mt-4 w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-yellow-500 flex items-center justify-center border border-white">
                <Music size={16} className="text-white" />
              </button>
            </div>

            {/* Profile & Caption Overlay */}
            <div className="absolute bottom-6 left-4 right-20 z-20 pt-8">
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
                <span className="text-white text-xs">
                  {reel.user} • {reel.audioTitle}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
              <div
                className="h-full bg-white transition-all ease-linear"
                style={{
                  width: `${idx === currentReel ? progress : 0}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="h-14 bg-black border-t border-gray-800/50 flex items-center justify-around px-4 z-50">
        <Home size={24} className="text-white" strokeWidth={1.5} />
        <Search size={24} className="text-white" strokeWidth={1.5} />
        <Plus size={24} className="text-white" strokeWidth={1.5} />
        <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
          <Play size={16} className="text-black" fill="black" />
        </div>
        <User size={24} className="text-white" strokeWidth={1.5} />
      </div>
    </div>
  );
};

export default ReelsPage;
