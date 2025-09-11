import { useInfiniteQuery } from '@tanstack/react-query';
import { generateExploreAllPosts, type VideoPost } from '../data/categoryVideos';

export interface VideosPage {
  items: VideoPost[];
  nextCursor: string | null;
}

const ITEMS_PER_PAGE = 12;

// Simulate paginated API using the existing data
const fetchVideosPage = async (cursor: string | null): Promise<VideosPage> => {
  // Get all videos from the existing data source
  const allVideos = generateExploreAllPosts();
  
  // Parse cursor (offset)
  const offset = cursor ? parseInt(cursor) : 0;
  
  // Slice the data for this page
  const items = allVideos.slice(offset, offset + ITEMS_PER_PAGE);
  
  // Calculate next cursor
  const nextOffset = offset + ITEMS_PER_PAGE;
  const nextCursor = nextOffset < allVideos.length ? nextOffset.toString() : null;
  
  return { items, nextCursor };
};

export function useInfiniteVideos() {
  return useInfiniteQuery({
    queryKey: ['infinite-videos'],
    queryFn: ({ pageParam }) => fetchVideosPage(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null as string | null,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}