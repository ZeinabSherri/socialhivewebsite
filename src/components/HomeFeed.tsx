import { useState } from 'react';
import PostCard from './PostCard';
import Stories from './Stories';
import VerificationBadge from './VerificationBadge';

interface Comment {
  id: number;
  username: string;
  text: string;
}

interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

interface Post {
  id: number;
  username: string;
  userAvatar: string;
  timestamp: string;
  image?: string;       // single image for posts 1-3
  images?: string[];    // multiple images for carousel posts 4-8
  media?: MediaItem[];  // media array for posts with mixed media
  caption: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  staticComments: Comment[];
}

const HomeFeed = ({ onNavigateToProfile }: { onNavigateToProfile?: () => void }) => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      username: 'socialhive.agency',
      userAvatar: '/lovable-uploads/social-hive-logo.png',
      timestamp: 'Now',
      image: "/images/IMG-20250728-WA0027.jpg",
      caption: '🐝 Crafting Buzz. Driving Growth. Your partner in digital success.',
      likes: 1200,
      comments: 2,
      isLiked: false,
      staticComments: [
        { id: 1, username: 'user1', text: 'Love the new branding! 🔥' },
        { id: 2, username: 'user2', text: 'So inspiring 🐝💛' },
      ],
    },
    {
      id: 2,
      username: 'socialhive.agency',
      userAvatar: '/lovable-uploads/social-hive-logo.png',
      timestamp: '1h',
      image: '/images/IMG-20250728-WA0026.jpg',
      caption: 'About Us: We create digital experiences that resonate and convert.',
      likes: 850,
      comments: 2,
      isLiked: false,
      staticComments: [
        { id: 1, username: 'client1', text: 'Amazing team and vision! 👏' },
        { id: 2, username: 'client2', text: 'Highly recommend Social Hive! ⭐️' },
      ],
    },
    {
      id: 3,
      username: 'socialhive.agency',
      userAvatar: '/lovable-uploads/social-hive-logo.png',
      timestamp: '2h',
      image: '/images/IMG-20250728-WA0028.jpg',
      caption: 'Why Social Hive? Because your brand deserves the buzz.',
      likes: 950,
      comments: 2,
      isLiked: false,
      staticComments: [
        { id: 1, username: 'marketer', text: 'Their strategy works wonders! 💡' },
        { id: 2, username: 'fan123', text: 'I saw amazing results. 🚀' },
      ],
    },
    // Post 4 with carousel images for Services
    {
      id: 4,
      username: 'socialhive.agency',
      userAvatar: '/lovable-uploads/social-hive-logo.png',
      timestamp: '3h',
      media: [
       {type: 'image', url: '/images/IMG-20250728-WA0029.jpg'}, 
        {type: 'video', url: '/videos/VID-20250728-WA0002.mp4'},
         {type: 'video', url: '/videos/VID-20250728-WA0001.mp4'},
      ],
      caption: 'Our Services: Swipe to explore what we offer.',
      likes: 780,
      comments: 2,
      isLiked: false,
      staticComments: [
        { id: 1, username: 'businessOwner', text: 'Great range of services. 👌' },
        { id: 2, username: 'entrepreneur', text: 'Helped my brand grow fast! 🙌' },
      ],
    },
    // Post 5 with carousel images for Founders & Managers
    {
      id: 5,
      username: 'socialhive.agency',
      userAvatar: '/lovable-uploads/social-hive-logo.png',
      timestamp: '4h',
      images: [
        'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
      ],
      caption: 'Founders & Managers: The visionaries behind Social Hive.',
      likes: 670,
      comments: 2,
      isLiked: false,
      staticComments: [
        { id: 1, username: 'teamMember', text: 'Proud to be part of this team! 💼' },
        { id: 2, username: 'clientX', text: 'Such leadership inspires confidence. 🙏' },
      ],
    },
    // Post 6 with carousel images for Content Creators
    {
      id: 6,
      username: 'socialhive.agency',
      userAvatar: '/lovable-uploads/social-hive-logo.png',
      timestamp: '5h',
      images: [
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=800&q=80',
      ],
      caption: 'Content Creators: Creativity fuels our campaigns.',
      likes: 720,
      comments: 2,
      isLiked: false,
      staticComments: [
        { id: 1, username: 'creatorFan', text: 'Your content always amazes me. 🎨' },
        { id: 2, username: 'socialGuru', text: 'Talented team indeed! 💯' },
      ],
    },
    // Post 7 with carousel images for Producers
    {
      id: 7,
      username: 'socialhive.agency',
      userAvatar: '/lovable-uploads/social-hive-logo.png',
      timestamp: '6h',
      images: [
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
      ],
      caption: 'Producers: Bringing ideas to life with precision.',
      likes: 690,
      comments: 2,
      isLiked: false,
      staticComments: [
        { id: 1, username: 'videoPro', text: 'Top-notch production quality! 🎥' },
        { id: 2, username: 'happyClient', text: 'Professional and timely delivery. 👍' },
      ],
    },
    // Post 8 with carousel images for Graphic Designers
    {
      id: 8,
      username: 'socialhive.agency',
      userAvatar: '/lovable-uploads/social-hive-logo.png',
      timestamp: '7h',
      images: [
        'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
      ],
      caption: 'Graphic Designers: Crafting visual magic for your brand.',
      likes: 730,
      comments: 2,
      isLiked: false,
      staticComments: [
        { id: 1, username: 'designerLover', text: 'Love the aesthetics here! 🎨' },
        { id: 2, username: 'artFan', text: 'The designs are always fresh. 🖌️' },
      ],
    },
  ]);


  const handleLike = (postId: number) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        }
        : post
    ));
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Stories Section */}
      <Stories />

      {/* Posts Feed */}
      <div className="space-y-0">
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onLike={() => handleLike(post.id)}
            onUsernameClick={onNavigateToProfile}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeFeed;
