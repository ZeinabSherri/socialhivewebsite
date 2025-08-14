import React, { useState } from 'react'
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
  id: number
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
  isFirstPost?: boolean
}

const responsive = {
  desktop: { breakpoint: { max: 3000, min: 1024 }, items: 1 },
  tablet:  { breakpoint: { max: 1024, min: 464 },  items: 1 },
  mobile:  { breakpoint: { max: 464,  min: 0   },  items: 1 },
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onUsernameClick,
  isFirstPost = false
}) => {
  const [showFullCaption, setShowFullCaption] = useState(false)
  const [showLoveIcon, setShowLoveIcon]     = useState(false)
  const [lastTap, setLastTap]               = useState(0)
  const [videoMuted, setVideoMuted]         = useState(true)

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

  const toggleSound = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const videos = document.querySelectorAll('video')
    videos.forEach(async (video) => {
      if (videoMuted) {
        // Unmuting - need to trigger play with sound
        video.muted = false
        try {
          await video.play()
        } catch (error) {
          console.log('Video play failed:', error)
        }
      } else {
        // Muting
        video.muted = true
      }
    })
    setVideoMuted(m => !m)
  }

  const renderMedia = () => (
    <div className="relative overflow-visible">
      {/* only one drip overlay per post */}
      {isFirstPost && <DrippingHoney />}

      {/* carousel / single media */}
      {post.media && post.media.length > 0 ? (
        <Carousel
          responsive={responsive}
          infinite arrows swipeable draggable
          containerClass="carousel-container"
          itemClass="carousel-item"
          renderDotsOutside
        >
          {post.media.map((m,i) => (
            <div
              key={i}
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
                    muted={videoMuted}
                    loop
                    playsInline
                    className="w-full h-full object-cover rounded-lg"
                  >
                    <source src={m.url} type="video/mp4" />
                  </video>
                  <button
                    onClick={toggleSound}
                    className="absolute bottom-3 right-3 bg-black/70 text-white p-2 rounded-full z-20"
                  >
                    {videoMuted
                      ? <VolumeX size={18}/>
                      : <Volume2 size={18}/>}
                  </button>
                </div>
              )}
              {/* heart animation */}
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
        <Carousel
          responsive={responsive}
          infinite arrows swipeable draggable
          containerClass="carousel-container"
          itemClass="carousel-item"
          renderDotsOutside
        >
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
          className={`relative bg-gray-900 ${
            post.image.includes('feel-the-flavour') 
              ? 'overflow-visible' 
              : 'aspect-[4/5]'
          }`}
          onClick={handleDoubleTap}
          onTouchEnd={handleDoubleTap}
        >
          <img
            src={post.image}
            className={`w-full rounded-lg ${
              post.image.includes('feel-the-flavour')
                ? 'object-contain'
                : 'h-full object-cover'
            }`}
            loading="lazy"
          />
        </div>
      ) : null}
    </div>
  )

  return (
    <div className={`bg-black border-b border-gray-800 max-w-md mx-auto rounded-lg ${
      post.image?.includes('feel-the-flavour') ? 'overflow-visible' : 'overflow-hidden'
    }`}>
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
        <MoreHorizontal size={20} className="text-gray-400 hover:text-white"/>
      </div>

      {/* media + drip */}
      {renderMedia()}

      {/* actions / likes / caption / comments */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={onLike}
              className={`transition-colors ${
                post.isLiked
                  ? 'text-red-500'
                  : 'text-white hover:text-gray-300'
              }`}
            >
              <Heart size={24} fill={post.isLiked ? 'currentColor' : 'none'} />
            </button>
            <MessageCircle size={24} className="text-white hover:text-gray-300"/>
            <Send          size={24} className="text-white hover:text-gray-300"/>
          </div>
          <Bookmark size={24} className="text-white hover:text-gray-300"/>
        </div>

        <p className="font-semibold text-sm mb-2">
          {post.likes.toLocaleString()} likes
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
