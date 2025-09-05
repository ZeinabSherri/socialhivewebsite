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
  // These would be existing posts that users have created
  // For demo purposes, we're starting with an empty array
  // Real implementation would fetch from backend/localStorage
];

// Helper function to get existing posts (could fetch from API/localStorage)
export const getExistingHomePosts = (): LegacyPost[] => {
  // In a real app, this would fetch from a backend or localStorage
  // For now, return the legacy posts array
  return [...LEGACY_HOME_POSTS];
};