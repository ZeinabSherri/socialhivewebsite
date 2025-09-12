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
  "Restaurants and FnB": [
    "d60236f226abebe1ccf0379fb5d4f38d",
    "d0337c3443d4e12a07a31c606bf88689",
    "4aea4656f3720905990b18628c93c599",
    "ee87a01981d364fbeffbe1a1136f8b4b",
    "ba3580c9b5ed10e8d318e174bed2e8db",
    "cf82a8848059dcd29ba0b7d88effba7a",
    "6e6c4575b6a8518005cf82d946ed9ec3",
    "999a85b19657f9df96973b4736d0e37e",
    "454a6cbcbce63e68019a756bb92e38d4",
    "02ee28b7ab7c23f81b46a2006e34d35b",
    "10c242d2edd8084f0d9dda8400295429",
    "bef816ab6439a67708c4131bbd4b59a2",
    "d1f27d4cc34c09585ff14a381ebbf4cd",
    "9def9f5347b44891d0267fc47a114b93",
    "4e4e4f28a348cf8a339ea7637c31b2f4",
    "818e6d8227a48457970a4a6ed18de869",
    "8aa5eb1e5bd8394b673bd87a5d9b1694",
    "98eaec4da3ea0c33dcb4695c941784d8",
    "2d1386de58f6053a3ff5ad54a52a5847",
    "d416121ac100bcd2adf7a00a2a86ec47",
    "bdfb08d1af01979653ef60422447ea50",
    "11339ed850a57ceb49f845939acf8a9f",
    "0008a7741f114f7e9f5eaed524a0ec50",
    "d96381d9bb4123f22e3c3c52b0257734",
    "4ffda627285ff6e4744eeaf420c04043",
    "a2a1e36a6c4cf73224ac2bace4e62f07",
    "02d29d3a874715b86df251dc602fa5cf",
    "e9090fed324b68dedf9b0f58623b2add",
  ],
  "Ecommerce": [
    "5a2c663f987a7e3274a6e7b5d293c090",
    "a75e47df3e4c732b43e04990c069442c",
    "7a00241de9423aa47e642ee09479c5a0",
    "c95a2527bceb00024357be29ec03c015",
    "c5cf61eb8766de77d3f33c44255e9bc2",
    "0cc7f36c5f731d1c285010e5deae2a33",
    "5846d5ef04b22e66b5d2ee6ff3e4bb19",
    "33d018b3e2cdfb0e38fa9cc5e81e3ea8",
  ],
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

// Flatten all Explore videos into one list, preserving category order and in-category order
export const EXPLORE_ALL_VIDEO_IDS: string[] = CATEGORY_KEYS
  .flatMap(k => CATEGORY_VIDEOS[k])
  .filter(Boolean);

// Optional safety: dedupe in case a video id appears in multiple places
export const EXPLORE_ALL_UNIQUE_VIDEO_IDS = Array.from(new Set(EXPLORE_ALL_VIDEO_IDS));

// All reels for the Reels page (kept for backwards compatibility)
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

// Generate posts for Explore videos only (all categories)
export const generateExploreAllPosts = (): VideoPost[] => {
  return ALL_CATEGORY_POSTS;
};

// Generate posts for all reels (Home + Categories) - kept for backwards compatibility
export const generateAllReelsPosts = (): VideoPost[] => {
  const homePosts = generateHomePosts();
  return [...homePosts, ...ALL_CATEGORY_POSTS];
};