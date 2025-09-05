// Legacy posts data for Home feed (to be preserved)
export interface LegacyPost {
  id: number | string;
  username: string;
  userAvatar: string;
  timestamp: string;
  image?: string;
  images?: string[];
  media?: any[];
  caption: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  staticComments: any[];
  type?: 'image' | 'video';
  cloudflareId?: string;
}

export const LEGACY_HOME_POSTS: LegacyPost[] = [
  {
    id: 1,
    username: "socialhive.agency",
    userAvatar: "/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png",
    timestamp: "2h",
    image: "/images/feel-the-flavour-post.png",
    caption: "Taste the difference with Social Hive! 🍯✨ Our premium honey brings natural sweetness to your day. #SocialHive #NaturalHoney #PureGoodness",
    likes: 1247,
    comments: 23,
    isLiked: false,
    staticComments: [
      { id: 1, username: "foodie_lover", text: "This looks absolutely delicious! 😍" },
      { id: 2, username: "health_enthusiast", text: "Love natural honey products!" },
      { id: 3, username: "sweet_treats", text: "Where can I get this? 🍯" }
    ]
  },
  {
    id: 2,
    username: "socialhive.agency",
    userAvatar: "/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png",
    timestamp: "4h",
    images: [
      "/images/IMG-20250728-WA0026.jpg",
      "/images/IMG-20250728-WA0027.jpg",
      "/images/IMG-20250728-WA0028.jpg"
    ],
    caption: "Behind the scenes at Social Hive! From hive to jar, every drop of our honey is crafted with care. 🐝💛 #BehindTheScenes #HoneyMaking #Artisan",
    likes: 892,
    comments: 15,
    isLiked: true,
    staticComments: [
      { id: 4, username: "nature_love", text: "Amazing process! Keep up the great work 🐝" },
      { id: 5, username: "local_supporter", text: "Proud to support local businesses!" }
    ]
  },
  {
    id: 3,
    username: "socialhive.agency",
    userAvatar: "/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png",
    timestamp: "1d",
    image: "/images/burger-only.png",
    caption: "Honey-glazed perfection! 🍔🍯 Try our signature honey burger - a sweet twist on a classic favorite. Available now! #HoneyBurger #SocialHiveEats #Foodie",
    likes: 2156,
    comments: 47,
    isLiked: false,
    staticComments: [
      { id: 6, username: "burger_fan", text: "This looks incredible! Can't wait to try it 🤤" },
      { id: 7, username: "honey_lover", text: "Honey on everything! Yes please!" },
      { id: 8, username: "restaurant_reviewer", text: "Best burger I've had in years! 5 stars ⭐⭐⭐⭐⭐" }
    ]
  },
  {
    id: 4,
    username: "socialhive.agency", 
    userAvatar: "/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png",
    timestamp: "2d",
    image: "/images/feel-flavour-bg.png",
    caption: "Feel the flavour, taste the difference! 🌟 Social Hive brings you the finest honey experiences. Each jar tells a story of dedication and passion. #FeelTheFlavour #PremiumHoney #TasteTheQuality",
    likes: 1834,
    comments: 31,
    isLiked: true,
    staticComments: [
      { id: 9, username: "gourmet_chef", text: "Using this in my restaurant - customers love it!" },
      { id: 10, username: "wellness_guru", text: "Perfect for my morning tea routine 🍵" },
      { id: 11, username: "family_kitchen", text: "Kids love this honey! Finally found their favorite ❤️" }
    ]
  }
];

// Helper function to get existing posts (could fetch from API/localStorage)
export const getExistingHomePosts = (): LegacyPost[] => {
  // In a real app, this would fetch from a backend or localStorage
  // For now, return the legacy posts array
  return [...LEGACY_HOME_POSTS];
};