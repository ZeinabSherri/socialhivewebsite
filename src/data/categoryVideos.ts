import { formatCount } from '../lib/format';

export type Comment = { 
  id: string; 
  user: string; 
  text: string; 
  createdAt: string; 
  likes?: number 
};

export type VideoPost = {
  id: string;
  type: 'video';
  cloudflareId: string;
  caption: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  comments: Comment[];
  user: { handle: string; name: string; avatarUrl: string };
  category: string;
};

// Canonical categories - tuple for proper TS const inference
export const CATEGORY_KEYS = [
  "Beauty clinics",
  "Real Estate", 
  "Restaurants and FnB",
  "Ecommerce",
  "Network operators",
  "Content creation",
] as const;

export type CategoryKey = typeof CATEGORY_KEYS[number];

// Source of truth for categories → Cloudflare video IDs
export const CATEGORY_VIDEOS: Record<CategoryKey, string[]> = {
  "Beauty clinics": [
    "076587b81c514566c26b3691aca9e841",
  ],
  "Content creation": [
    "292f6b0d3e3c63aec2ee2db80c391870",
  ],
  "Real Estate": [
    "c6829e0f2c96c0ff1b9f9d76ae46b816",
    "385533ff9e9ac080967a5067c739d6bd", 
    "51c84960d6f584c7e9001cd9b5318942",
    "202dba979e199bae3aadd1ce70682dee",
  ],
  "Restaurants and FnB": [],
  "Ecommerce": [],
  "Network operators": [],
};

// 9 Home-feed videos we already added
export const HOME_CLOUDFLARE_IDS = [
  "6c7a065ca867f93420da7508d73c8449",
  "768ee9d9ec7c78a4247615d7bc5e9bc1", 
  "bb04c2938d2330d41a65e502f108dfcd",
  "ed20917ebcafb2fd334fca26634b1f96",
  "7edf6822d44eb173d14b2fb6da69b857",
  "127355e65047eb1f2cb0f94720892cb9",
  "fe00925f0288047a9e62d14f9f6a35d1",
  "618a7f2997f61d91283e4f960ddc9266",
  "266422f6f89edba5a2c83408ea59b768",
];

// All reels for the Reels page
export const ALL_REELS_IDS = HOME_CLOUDFLARE_IDS.concat(
  ...CATEGORY_KEYS.map(k => CATEGORY_VIDEOS[k])
).filter(Boolean);

const DEMO_CAPTIONS = [
  "Behind the scenes of our latest campaign 🎬",
  "Quick tip: hooks that boost watch time ⚡",
  "Client reveal day ✨", 
  "Editing flow in 3 steps 🧠",
  "UGC cut that converts 📈",
  "Lighting test vs final shot 💡",
  "Hook • Value • CTA — in action 🚀",
  "Trend remix for local brands 🎵",
  "Before/After: color grade 🎨",
  "Beauty transformation magic ✨",
  "Property showcase perfection 🏡",
  "Content creation workflow 📱",
  "Real estate reveal day 🔑"
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

// Generate posts for a specific category
export const generateCategoryPosts = (category: CategoryKey): VideoPost[] => {
  const videoIds = CATEGORY_VIDEOS[category] || [];
  
  return videoIds.map((videoId, index) => {
    const commentCount = 3 + Math.floor(Math.random() * 3); // 3-5 comments
    const comments = getRandomComments(commentCount);
    const likesCount = Math.floor(Math.random() * 5000) + 500; // 500-5500 likes
    const hoursAgo = index + 1; // Stagger by hours
    
    return {
      id: `${category.toLowerCase().replace(/\s+/g, '_')}_${videoId}`,
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
      category
    };
  });
};

// Generate all category posts
export const ALL_CATEGORY_POSTS = CATEGORY_KEYS.flatMap(category => 
  generateCategoryPosts(category)
);

// Generate posts for Home feed (9 videos)
export const generateHomePosts = (): VideoPost[] => {
  return HOME_CLOUDFLARE_IDS.map((videoId, index) => {
    const commentCount = 3 + Math.floor(Math.random() * 3);
    const comments = getRandomComments(commentCount);
    const likesCount = Math.floor(Math.random() * 5000) + 500;
    const hoursAgo = index + 9; // Start from 9h ago for home posts
    
    return {
      id: `home_${videoId}`,
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
      category: 'Home'
    };
  });
};

// Generate posts for all reels (Home + Categories)
export const generateAllReelsPosts = (): VideoPost[] => {
  const homePosts = generateHomePosts();
  return [...homePosts, ...ALL_CATEGORY_POSTS];
};