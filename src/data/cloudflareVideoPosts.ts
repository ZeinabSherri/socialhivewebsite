import { formatCount } from '../lib/format';

export type Comment = { 
  id: string; 
  user: string; 
  text: string; 
  createdAt: string; 
  likes?: number 
};

export type Post = {
  id: string;
  type: 'video' | 'image';
  cloudflareId?: string;
  caption: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  comments: Comment[];
  user: { handle: string; name: string; avatarUrl: string };
  // Legacy fields for compatibility
  username: string;
  userAvatar: string;
  timestamp: string;
  image?: string;
  images?: string[];
  media?: any[];
  likes: number;
  isLiked: boolean;
  staticComments: any[];
};

const DEMO_CAPTIONS = [
  "Behind the scenes of our latest campaign 🎬",
  "Quick tip: hooks that boost watch time ⚡",
  "Client reveal day ✨",
  "Editing flow in 3 steps 🧠",
  "UGC cut that converts 📈",
  "Lighting test vs final shot 💡",
  "Hook • Value • CTA — in action 🚀",
  "Trend remix for local brands 🎵",
  "Before/After: color grade 🎨"
];

const DEMO_COMMENTS = [
  "This is fire! 🔥",
  "Love the transitions 👏",
  "Where was this shot?",
  "Saving this for inspo 🙌",
  "Music choice is perfect 🎶",
  "Teach us that effect please!",
  "Quality is top tier 🔝",
  "Amazing work!",
  "Need this technique 💯",
  "Inspiring content!",
  "Such clean editing ✨",
  "This hit different 🚀"
];

const getRandomComments = (count: number): Comment[] => {
  const shuffled = [...DEMO_COMMENTS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((text, index) => ({
    id: `comment_${Math.random().toString(36).substr(2, 9)}`,
    user: `user${index + 1}`,
    text,
    createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    likes: Math.floor(Math.random() * 50)
  }));
};

export const CLOUDFLARE_POSTS: Post[] = [
  "6c7a065ca867f93420da7508d73c8449",
  "768ee9d9ec7c78a4247615d7bc5e9bc1", 
  "bb04c2938d2330d41a65e502f108dfcd",
  "ed20917ebcafb2fd334fca26634b1f96",
  "7edf6822d44eb173d14b2fb6da69b857",
  "127355e65047eb1f2cb0f94720892cb9",
  "fe00925f0288047a9e62d14f9f6a35d1",
  "618a7f2997f61d91283e4f960ddc9266",
  "266422f6f89edba5a2c83408ea59b768"
].map((videoId, index) => {
  const commentCount = 3 + Math.floor(Math.random() * 3); // 3-5 comments
  const comments = getRandomComments(commentCount);
  const likesCount = Math.floor(Math.random() * 5000) + 500; // 500-5500 likes
  const hoursAgo = index + 9; // Start from 9h ago
  
  return {
    id: `video_${videoId}`,
    type: 'video' as const,
    cloudflareId: videoId,
    caption: DEMO_CAPTIONS[index % DEMO_CAPTIONS.length],
    createdAt: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
    likesCount,
    commentsCount: comments.length,
    comments,
    user: {
      handle: 'socialhive.agency',
      name: 'Social Hive',
      avatarUrl: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png'
    },
    // Legacy compatibility - all required fields
    username: 'socialhive.agency',
    userAvatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
    timestamp: `${hoursAgo}h`,
    likes: likesCount,
    isLiked: false,
    staticComments: comments.slice(0, 2).map((c, i) => ({
      id: i + 1,
      username: c.user,
      text: c.text
    }))
  };
});