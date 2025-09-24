import React, { useState, useEffect, useRef, useCallback } from 'react'
import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Volume2,
  VolumeX
} from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import VerificationBadge from './VerificationBadge'
import DrippingHoney from './DrippingHoney'
import CloudflareStreamPlayer from './CloudflareStreamPlayerSSR'
import CFStreamIframe from './CFStreamIframe';
import VideoErrorBoundary from './VideoErrorBoundary';
import { useMuteController } from '../hooks/useMuteController';
import PostVideoLegacy from './PostVideoLegacy';
import { formatCount } from '../lib/format'
import styles from './PostCard.module.css'

interface Comment {
  id: number
  username: string
  text: string
}

interface MediaItem {
  type: 'image' | 'video'
  url: string
}

interface Post {
  id: number | string
  type?: 'video' | 'image'
  cloudflareId?: string
  username: string
  userAvatar: string
  timestamp: string
  image?: string
  images?: string[]
  media?: MediaItem[]
  caption: string
  likes: number
  comments: number
  isLiked: boolean
  staticComments: Comment[]
}

interface PostCardProps {
  post: Post
  onLike: () => void
  onUsernameClick?: () => void
  onDelete?: () => void
  isFirstPost?: boolean
  isActive?: boolean
}

const responsive = {
  desktop: { breakpoint: { max: 3000, min: 1024 }, items: 1 },
  tablet:  { breakpoint: { max: 1024, min: 464 },  items: 1 },
  mobile:  { breakpoint: { max: 464,  min: 0   },  items: 1 },
}

/** iOS/Safari-safe helper: unmute and keep playback in the SAME gesture */
function unmuteAndPlay(video: HTMLVideoElement) {
  try {
    video.muted = false
    video.defaultMuted = false
    video.removeAttribute('muted')

    video.playsInline = true
    video.setAttribute('playsinline', 'true')
    video.setAttribute('webkit-playsinline', 'true')

    if (video.volume === 0) video.volume = 1.0

    const p = video.play()
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        /* ignore autoplay block until gesture */
      })
    }
  } catch {
    /* no-op */
  }
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onUsernameClick,
  onDelete,
  isFirstPost,
  isActive = false
}) => {
  const [showFullCaption, setShowFullCaption] = useState(false)
  const [showLoveIcon, setShowLoveIcon] = useState(false)
  const [lastTap, setLastTap] = useState(0)
  const [lastPlayTime, setLastPlayTime] = useState(0)
  const [videoMuted, setVideoMuted] = useState(true) // Legacy mute state for post videos
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLocallyActive, setIsLocallyActive] = useState(false)
  const { toggleMute } = useMuteController(iframeRef);

  // Remove individual IntersectionObserver since HomeFeed handles it globally
  // useEffect(() => {
  //   if (post.type !== 'video' || !containerRef.current) return;
  //   ...
  // }, [post.type]);

  // Remove manual video control since player handles it
  // useEffect(() => {
  //   const video = videoRef.current;
  //   ...
  // }, [isVideoActive, post.type]);

  // ====== BURGER LOGIC (unchanged) =========================================
  const isBurgerPost = post.id === 9
  const BURGER_OVERLAY_SRC = '/images/burger-only.png'

  // Background and burger tuning knobs (unchanged)
  const BG_POS_Y = 15
  const BURGER_WIDTH_PCT = 65
  const BURGER_BOTTOM_PX = -100
  const BURGER_X_PX = 80
  const BURGER_SCALE = 0.98
  // ========================================================================

  const truncate = (text:string, max=100) =>
    text.length <= max ? text : text.slice(0,max) + '...'

  const handleDoubleTap = (e: React.TouchEvent|React.MouseEvent) => {
    e.preventDefault()
    const now = Date.now()
    if (now - lastTap < 300) {
      if (!post.isLiked) onLike()
      setShowLoveIcon(true)
      setTimeout(() => setShowLoveIcon(false), 1000)
    }
    setLastTap(now)
  }


  const carouselProps = {
    responsive,
    infinite: true,
    arrows: true,
    swipeable: true,
    draggable: true,
    containerClass: 'carousel-container',
    itemClass: 'carousel-item',
    renderDotsOutside: true,
  }

  const renderMedia = () => (
    <div className="relative overflow-visible">
      {post.type === 'video' && post.cloudflareId ? (
        <div
          ref={containerRef}
          className="relative aspect-[4/5]"
          onClick={handleDoubleTap}
          onTouchEnd={handleDoubleTap}
        >
          <VideoErrorBoundary>
            <div 
              className="w-full h-full rounded-lg overflow-hidden post-card"
              onDoubleClick={() => {
                // Double tap like
                if (!post.isLiked) onLike();
                setShowLoveIcon(true);
                setTimeout(() => setShowLoveIcon(false), 1000);
              }}
              onClick={(e) => {
                // Single tap to toggle mute for legacy video
                if (e.detail === 1) {
                  setTimeout(() => {
                    if (e.detail === 1) {
                      setVideoMuted(m => !m);
                    }
                  }, 200);
                }
              }}
            >
              <PostVideoLegacy
                id={post.cloudflareId!}
                className="w-full h-full post-video-el"
                muted={videoMuted}
                autoPlay={isActive}
              />
            </div>
          </VideoErrorBoundary>

          {/* Mute indicator */}
          <div className="absolute top-2 right-2 z-30">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setVideoMuted(m => !m);
              }}
              className="bg-black/50 rounded-full p-1 text-white hover:bg-black/70 transition-colors"
              aria-label={videoMuted ? "Unmute" : "Mute"}
            >
              {videoMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>

          {showLoveIcon && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <Heart
                size={120}
                className="text-red-500 fill-red-500"
                style={{ animation: 'instagram-heart 1s ease-out forwards' }}
              />
            </div>
          )}
        </div>
      ) : post.media && post.media.length > 0 ? (
        <Carousel {...carouselProps}>
          {post.media.map((m,i) => (
            <div
              key={i}
              ref={i === 0 ? containerRef : undefined}
              className="aspect-[4/5] bg-gray-900 relative"
              onClick={handleDoubleTap}
              onTouchEnd={handleDoubleTap}
            >
              {m.type === 'image' ? (
                <img
                  src={m.url}
                  className="w-full h-full object-cover rounded-lg"
                  loading="lazy"
                />
              ) : (
                <div className="relative w-full h-full">
                  <video
                    autoPlay
                    loop
                    muted={!isLocallyActive}
                    playsInline
                    webkit-playsinline="true"
                    preload="auto"
                    className="w-full h-full object-cover rounded-lg"
                    onPlay={() => setIsLocallyActive(true)}
                    onPause={() => setIsLocallyActive(false)}
                  >
                    <source src={m.url} type="video/mp4" />
                  </video>
                </div>
              )}

              {showLoveIcon && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                  <Heart
                    size={120}
                    className="text-red-500 fill-red-500"
                    style={{ animation: 'instagram-heart 1s ease-out forwards' }}
                  />
                </div>
              )}
            </div>
          ))}
        </Carousel>
      ) : post.images && post.images.length > 0 ? (
        <Carousel {...carouselProps}>
          {post.images.map((url,i) => (
            <div
              key={i}
              className="aspect-[4/5] bg-gray-900 relative"
              onClick={handleDoubleTap}
              onTouchEnd={handleDoubleTap}
            >
              <img
                src={url}
                className="w-full h-full object-cover rounded-lg"
                loading="lazy"
              />
            </div>
          ))}
        </Carousel>
      ) : post.image ? (
        <div
          className="relative aspect-[4/5]"
          onClick={handleDoubleTap}
          onTouchEnd={handleDoubleTap}
        >
          {/* background image */}
          <img
            src={post.image}
            className="w-full h-full object-cover rounded-lg"
            loading="lazy"
            style={{ objectPosition: `center ${BG_POS_Y}%` }}
          />

          {/* 🍯 Dripping honey (like before) — only on the first post */}
          {isFirstPost && <DrippingHoney />}

          {/* burger overlay (unchanged) */}
          {isBurgerPost && (
            <img
              src={BURGER_OVERLAY_SRC}
              alt=""
              className="absolute max-w-none pointer-events-none z-30"
              style={{
                width: `${BURGER_WIDTH_PCT}%`,
                left: '50%',
                bottom: BURGER_BOTTOM_PX,
                transform: `translateX(calc(-50% + ${BURGER_X_PX}px)) scale(${BURGER_SCALE})`,
                transformOrigin: 'bottom center',
              }}
            />
          )}

          {showLoveIcon && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
              <Heart
                size={120}
                className="text-red-500 fill-red-500"
                style={{ animation: 'instagram-heart 1s ease-out forwards' }}
              />
            </div>
          )}
        </div>
      ) : null}
    </div>
  )

  return (
    <div className={`bg-black border-b border-gray-800 max-w-md mx-auto rounded-lg overflow-visible ${styles['post-card']}`}>
      {/* header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={post.userAvatar} alt={post.username}/>
            <AvatarFallback>
              <img
                src="/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png"
                alt="Hive"
                className="w-full h-full object-contain"
              />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center">
              <p
                className="font-semibold text-sm cursor-pointer hover:underline"
                onClick={onUsernameClick}
              >
                {post.username}
              </p>
              <VerificationBadge username={post.username}/>
            </div>
            <p className="text-gray-400 text-xs">{post.timestamp}</p>
          </div>
        </div>
        <button onClick={onDelete} className="text-gray-400 hover:text-white">
          <MoreHorizontal size={20}/>
        </button>
      </div>

      {/* media */}
      {renderMedia()}

      {/* actions / likes / caption / comments */}
      <div className="px-3 pt-2 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={onLike}
              className={`transition-colors ${post.isLiked ? 'text-red-500' : 'text-white hover:text-gray-300'}`}
            >
              <Heart size={24} fill={post.isLiked ? 'currentColor' : 'none'} />
            </button>
            <MessageCircle size={24} className="text-white hover:text-gray-300"/>
            <Send size={24} className="text-white hover:text-gray-300"/>
          </div>
          <Bookmark size={24} className="text-white hover:text-gray-300"/>
        </div>

        <p className="font-semibold text-sm mb-2">
          {formatCount(post.likes)} likes
        </p>

        <div className="text-sm mb-2">
          <span
            className="font-semibold cursor-pointer hover:underline"
            onClick={onUsernameClick}
          >
            {post.username}
          </span>
          <span className="text-gray-100 ml-1">
            {showFullCaption ? post.caption : truncate(post.caption)}
          </span>
          {post.caption.length > 100 && (
            <button
              onClick={() => setShowFullCaption(f => !f)}
              className="text-gray-400 ml-1 hover:text-gray-300"
            >
              {showFullCaption ? 'less' : 'more'}
            </button>
          )}
        </div>

        <div className="mt-2 space-y-1">
          {post.staticComments.map(c => (
            <div key={c.id} className="flex items-start space-x-3 group">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm leading-5 break-words">
                  <span className="font-semibold hover:underline cursor-pointer">
                    {c.username}
                  </span>{' '}
                  <span className="text-gray-200">{c.text}</span>
                </p>
                <div className="flex items-center space-x-4 mt-1 text-gray-400 text-xs">
                  <button>2h</button>
                  <button>Reply</button>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PostCard
