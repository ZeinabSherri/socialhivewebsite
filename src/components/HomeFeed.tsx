import React, { useState, useRef, createRef, useEffect } from "react";
import PostCard from "./PostCard";
import Stories from "./Stories";
import FlyingBee from "./FlyingBee";
import DrippingHoney from "./DrippingHoney";
import { CLOUDFLARE_POSTS } from "../data/cloudflareVideoPosts";

interface Comment {
  id: number;
  username: string;
  text: string;
}

interface MediaItem {
  type: "image" | "video";
  url: string;
}

export interface Post {
  id: number | string;
  type?: 'video' | 'image';
  cloudflareId?: string;
  username: string;
  userAvatar: string;
  timestamp: string;
  image?: string;
  images?: string[];
  media?: MediaItem[];
  caption: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  staticComments: Comment[];
}

// Now update the page controllers to use IntersectionObserver for single active item control
// Add IntersectionObserver logic to HomeFeed
const HomeFeed: React.FC<{ onNavigateToProfile?: () => void }> = ({
  onNavigateToProfile,
}) => {
  const REMOVE_CAPTION_PREFIXES = [
    "Founders & Managers",
    "Content Creators", 
    "Producers: Bringing ideas",
    "Graphic Designers",
  ];

  const shouldRemove = (p: Post) =>
    typeof p.caption === "string" &&
    REMOVE_CAPTION_PREFIXES.some(prefix => p.caption.startsWith(prefix));

  const originalPosts = [
    {
      id: 1,
      username: "socialhive.agency",
      userAvatar: "/lovable-uploads/social-hive-logo.png",
      timestamp: "Now",
      image: "/images/IMG-20250728-WA0027.jpg",
      caption:
        "🐝 Crafting Buzz. Driving Growth. Your partner in digital success.",
      likes: 1200,
      comments: 2,
      isLiked: false,
      staticComments: [
        { id: 1, username: "user1", text: "Love the new branding! 🔥" },
        { id: 2, username: "user2", text: "So inspiring 🐝💛" },
      ],
    },
    {
      id: 2,
      username: "socialhive.agency",
      userAvatar: "/lovable-uploads/social-hive-logo.png",
      timestamp: "1h",
      image: "/images/IMG-20250728-WA0026.jpg",
      caption:
        "About Us: We create digital experiences that resonate and convert.",
      likes: 850,
      comments: 2,
      isLiked: false,
      staticComments: [
        { id: 1, username: "client1", text: "Amazing team and vision! 👏" },
        { id: 2, username: "client2", text: "Highly recommend Social Hive! ⭐️" },
      ],
    },
    {
      id: 3,
      username: "socialhive.agency",
      userAvatar: "/lovable-uploads/social-hive-logo.png",
      timestamp: "2h",
      image: "/images/IMG-20250728-WA0028.jpg",
      caption: "Why Social Hive? Because your brand deserves the buzz.",
      likes: 950,
      comments: 2,
      isLiked: false,
      staticComments: [
        { id: 1, username: "marketer", text: "Their strategy works wonders! 💡" },
        { id: 2, username: "fan123", text: "I saw amazing results. 🚀" },
      ],
    },
    {
      id: 4,
      username: "socialhive.agency",
      userAvatar: "/lovable-uploads/social-hive-logo.png",
      timestamp: "3h",
      media: [
        { type: "image" as const, url: "/images/IMG-20250728-WA0029.jpg" },
        { type: "video" as const, url: "/videos/VID-20250728-WA0002.mp4" },
        { type: "video" as const, url: "/videos/VID-20250728-WA0001.mp4" },
      ],
      caption: "Our Services: Swipe to explore what we offer.",
      likes: 780,
      comments: 2,
      isLiked: false,
      staticComments: [
        {
          id: 1,
          username: "businessOwner",
          text: "Great range of services. 👌",
        },
        {
          id: 2,
          username: "entrepreneur",
          text: "Helped my brand grow fast! 🙌",
        },
      ],
    },
    {
      id: 5,
      username: "socialhive.agency",
      userAvatar: "/lovable-uploads/social-hive-logo.png",
      timestamp: "4h",
      images: [
        "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
      ],
      caption: "Founders & Managers: The visionaries behind Social Hive.",
      likes: 670,
      comments: 2,
      isLiked: false,
      staticComments: [
        {
          id: 1,
          username: "teamMember",
          text: "Proud to be part of this team! 💼",
        },
        {
          id: 2,
          username: "clientX",
          text: "Such leadership inspires confidence. 🙏",
        },
      ],
    },
    {
      id: 6,
      username: "socialhive.agency",
      userAvatar: "/lovable-uploads/social-hive-logo.png",
      timestamp: "5h",
      images: [
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=800&q=80",
      ],
      caption: "Content Creators: Creativity fuels our campaigns.",
      likes: 720,
      comments: 2,
      isLiked: false,
      staticComments: [
        {
          id: 1,
          username: "creatorFan",
          text: "Your content always amazes me. 🎨",
        },
        {
          id: 2,
          username: "socialGuru",
          text: "Talented team indeed! 💯",
        },
      ],
    },
    {
      id: 7,
      username: "socialhive.agency",
      userAvatar: "/lovable-uploads/social-hive-logo.png",
      timestamp: "6h",
      images: [
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
      ],
      caption: "Producers: Bringing ideas to life with precision.",
      likes: 690,
      comments: 2,
      isLiked: false,
      staticComments: [
        {
          id: 1,
          username: "videoPro",
          text: "Top-notch production quality! 🎥",
        },
        {
          id: 2,
          username: "happyClient",
          text: "Professional and timely delivery. 👍",
        },
      ],
    },
    {
      id: 8,
      username: "socialhive.agency",
      userAvatar: "/lovable-uploads/social-hive-logo.png",
      timestamp: "7h",
      images: [
        "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
      ],
      caption: "Graphic Designers: Crafting visual magic for your brand.",
      likes: 730,
      comments: 2,
      isLiked: false,
      staticComments: [
        {
          id: 1,
          username: "designerLover",
          text: "Love the aesthetics here! 🎨",
        },
        {
          id: 2,
          username: "artFan",
          text: "The designs are always fresh. 🖌️",
        },
      ],
    },
    {
      id: 9,
      username: "socialhive.agency",
      userAvatar: "/lovable-uploads/social-hive-logo.png",
      timestamp: "8h",
      image: "/images/feel-flavour-bg.png",
      caption: "Savor the taste, feel the drip. 🍔🍯",
      likes: 1450,
      comments: 3,
      isLiked: false,
      staticComments: [
        { id: 1, username: "foodie_lover", text: "Now I'm hungry! 🤤" },
        { id: 2, username: "chefqueen", text: "Looks delicious!" },
        { id: 3, username: "buzzbite", text: "That honey drizzle 🔥🐝" },
      ],
    }
  ];

  const cloudflarePosts = CLOUDFLARE_POSTS.map(cloudPost => ({
    ...cloudPost,
    comments: cloudPost.commentsCount // Map array to count for compatibility
  }));

  const dedup = (arr: Post[]) =>
    arr.filter((p, i, a) =>
      a.findIndex(q => (q.id ?? q.cloudflareId) === (p.id ?? p.cloudflareId)) === i
    );

  const allPosts = dedup([...originalPosts, ...cloudflarePosts]).filter(p => !shouldRemove(p));

  const [posts, setPosts] = useState<Post[]>(allPosts);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const postRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
  if (postRefs.current.length !== posts.length) {
    postRefs.current = posts.map(() => createRef<HTMLDivElement>());
  }

  // Single active item control with IntersectionObserver for video autoplay/unmute
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = postRefs.current.findIndex(ref => ref.current === entry.target);
          if (index === -1) return;
          const post = posts[index];
          // Only handle video posts
          if (post.type === 'video' && post.cloudflareId && postRefs.current[index]?.current) {
            const video = postRefs.current[index].current.querySelector('video');
            if (!video) return;
            // Set required attributes always
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');
            video.playsInline = true;
            video.preload = 'metadata';
            video.autoplay = true;
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
              // Play and try to unmute (homepage requirement)
              video.muted = false;
              import('../lib/tryUnmute').then(({ tryUnmute }) => tryUnmute(video));
              setActiveIndex(index);
            } else {
              video.pause();
            }
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '-10% 0px -10% 0px'
      }
    );
    postRefs.current.forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });
    return () => observer.disconnect();
  }, [posts, postRefs]);

  const handleLike = (postId: number | string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked: !p.isLiked,
              likes: p.isLiked ? p.likes - 1 : p.likes + 1,
            }
          : p
      )
    );
  };

  const handleDelete = (postId: number | string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className="max-w-md mx-auto">
      {/* bee flying behind posts */}
      <FlyingBee postRefs={postRefs.current} />

      {/* stories */}
      <Stories />

      {/* feed */}
      <div className="space-y-0">
        {posts.map((post, idx) => (
          <div
            key={post.id}
            ref={postRefs.current[idx]}
            className="relative overflow-visible"
          >
            <PostCard
              post={post}
              onLike={() => handleLike(post.id)}
              onUsernameClick={onNavigateToProfile}
              onDelete={() => handleDelete(post.id)}
              isFirstPost={idx === 0}
              isActive={idx === activeIndex}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default HomeFeed