export type Reel = {
  id: number;
  title: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  user: string;
  isLiked: boolean;
  streamUid: string; // Paste Cloudflare Stream UID here per reel
};

/**
 * Replace REEL_* placeholders with your actual Cloudflare Stream video UIDs.
 */
export const reelsFromCloudflare: Reel[] = [
  {
    id: 1,
    title: "Social Media Strategy Explained",
    description:
      "Learn how we create winning social media strategies that drive real results for our clients.",
    likes: 15420,
    comments: 234,
    shares: 89,
    user: "socialhive.agency",
    isLiked: false,
    streamUid: "REEL_1_UID",
  },
  {
    id: 2,
    title: "Content Creation Process",
    description:
      "Behind the scenes of our content creation process - from concept to viral post.",
    likes: 12980,
    comments: 189,
    shares: 67,
    user: "socialhive.agency",
    isLiked: false,
    streamUid: "REEL_2_UID",
  },
  {
    id: 3,
    title: "Client Success Story",
    description:
      "How we helped a local restaurant increase their sales by 300% in just 3 months.",
    likes: 18750,
    comments: 312,
    shares: 145,
    user: "socialhive.agency",
    isLiked: false,
    streamUid: "REEL_3_UID",
  },
];

export type ExploreTile =
  | ({ type: "Reel"; streamUid: string } & {
      id: number;
      title: string;
      industry: string;
      thumbnail: string;
      description: string;
      results: string;
      client: string;
    })
  | ({ type: "Post" } & {
      id: number;
      title: string;
      industry: string;
      thumbnail: string;
      description: string;
      results: string;
      client: string;
    });

export const exploreTiles: ExploreTile[] = [
  {
    id: 2,
    title: "Beauty Brand Launch",
    industry: "Beauty",
    type: "Reel",
    thumbnail: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    streamUid: "EXPLORE_REEL_1_UID",
    description: "Successfully launched a new beauty brand with viral content strategy.",
    results: "5M+ views, 25K new followers, 180% sales growth",
    client: "GlowUp Beauty",
  },
];
