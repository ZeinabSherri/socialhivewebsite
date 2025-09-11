'use client';

import { useMemo } from 'react';
import { useInfiniteVideos } from '../../hooks/useInfiniteVideos';
import ReelViewer from './ReelViewer';
import LoadMoreSentinel from './LoadMoreSentinel';
import type { ReelData } from './ReelViewer';

const InfiniteReelsFeed = () => {
  const { data, isLoading, isError } = useInfiniteVideos();

  // Convert VideoPost[] to ReelData[]
  const reels = useMemo<ReelData[]>(() => {
    if (!data?.pages) return [];
    
    return data.pages.flatMap(page => 
      page.items.map((post, globalIndex) => ({
        id: parseInt(post.id.replace(/\D/g, '')) || globalIndex,
        title: post.caption,
        description: post.caption,
        thumbnail: `https://videodelivery.net/${post.cloudflareId}/thumbnails/thumbnail.jpg?time=1s&height=720`,
        videoUrl: post.cloudflareId, // Use cloudflareId directly for CloudflareStreamPlayer
        uid: post.cloudflareId,
        viewCount: Math.floor(Math.random() * 100000) + 10000,
        likes: post.likesCount,
        comments: post.commentsCount,
        shares: Math.floor(Math.random() * 100) + 10,
        user: post.user.handle,
        avatar: post.user.avatarUrl,
        audioTitle: 'Original audio',
        isCloudflare: true
      }))
    );
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white">Loading reels...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-red-400">Error loading reels</div>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[540px] space-y-8 overflow-y-auto snap-y snap-mandatory py-8">
      {reels.map((reel, index) => (
        <ReelViewer
          key={reel.id}
          reel={reel}
          isActive={true} // For now, let intersection observer handle this
          layout="centered-card"
          className="snap-start"
        />
      ))}
      <LoadMoreSentinel />
    </main>
  );
};

export default InfiniteReelsFeed;