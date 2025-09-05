import React, { useState, useRef, createRef } from "react";
import PostCard from "./PostCard";
import Stories from "./Stories";
import FlyingBee from "./FlyingBee";
import DrippingHoney from "./DrippingHoney";
import { CLOUDFLARE_POSTS, type Post as CloudflarePost } from "../data/cloudflareVideoPosts";

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

const HomeFeed: React.FC<{ onNavigateToProfile?: () => void }> = ({
  onNavigateToProfile,
}) => {
  // Use Cloudflare video posts for instant mobile playback
  // Convert CloudflarePost to HomeFeed Post format for compatibility
  const [posts, setPosts] = useState<Post[]>(CLOUDFLARE_POSTS.map(post => ({
    ...post,
    comments: post.commentsCount, // Convert comments array length to number
    // All other fields are already compatible
  })));
  const [likedPosts, setLikedPosts] = useState<Set<number | string>>(new Set());
  const videoRefs = useRef<{ [key: string]: React.RefObject<HTMLVideoElement> }>({});

  // Initialize video refs for each post
  posts.forEach(post => {
    if (!videoRefs.current[post.id]) {
      videoRefs.current[post.id] = createRef<HTMLVideoElement>();
    }
  });

  const handleLike = (postId: number | string) => {
    setLikedPosts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(postId)) {
        newLiked.delete(postId);
      } else {
        newLiked.add(postId);
      }
      return newLiked;
    });

    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              likes: likedPosts.has(postId) ? post.likes - 1 : post.likes + 1,
              isLiked: !likedPosts.has(postId)
            }
          : post
      )
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-md">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Social Hive
          </h1>
          <FlyingBee postRefs={[]} />
        </div>
      </div>

      <Stories />

      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={() => handleLike(post.id)}
            onUsernameClick={onNavigateToProfile}
          />
        ))}
      </div>

      <div className="h-16" />
      <DrippingHoney />
    </div>
  );
};

export default HomeFeed;