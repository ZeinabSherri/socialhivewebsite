import React, { useState, useRef, createRef } from "react";
import PostCard from "./PostCard";
import Stories from "./Stories";
import FlyingBee from "./FlyingBee";
import DrippingHoney from "./DrippingHoney";

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
  id: number;
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

const HomeFeed: React.FC<{ onNavigateToProfile?: () => void }> = ({
  onNavigateToProfile,
}) => {
  const [posts, setPosts] = useState<Post[]>([
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
        { type: "image", url: "/images/IMG-20250728-WA0029.jpg" },
        { type: "video", url: "/videos/VID-20250728-WA0002.mp4" },
        { type: "video", url: "/videos/VID-20250728-WA0001.mp4" },
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
    },
  ]);

  const postRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
  if (postRefs.current.length !== posts.length) {
    postRefs.current = posts.map(() => createRef<HTMLDivElement>());
  }

  const handleLike = (postId: number) => {
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
              isFirstPost={idx === 0}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default HomeFeed