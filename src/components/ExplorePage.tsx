import { useState, useRef, useEffect } from 'react';
import { Play, Search, Filter, X } from 'lucide-react';
import { useCloudflareVideos, getCloudflareStreamThumbnail } from '@/hooks/useCloudflareVideos';
import CloudflareStreamPlayer from './CloudflareStreamPlayer';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ExplorePage = () => {
  const { videos, loading, error } = useCloudflareVideos('explore');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState('Newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filters = ['Newest', 'A→Z', 'Z→A', 'Shortest', 'Longest'];

  // Filter and sort videos
  const filteredVideos = videos
    .filter(video => {
      if (!searchQuery) return true;
      return (
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    })
    .sort((a, b) => {
      switch (activeFilter) {
        case 'A→Z':
          return a.title.localeCompare(b.title);
        case 'Z→A':
          return b.title.localeCompare(a.title);
        case 'Shortest':
          return a.duration - b.duration;
        case 'Longest':
          return b.duration - a.duration;
        case 'Newest':
        default:
          return new Date(b.created).getTime() - new Date(a.created).getTime();
      }
    });

  const handleVideoClick = (uid: string) => {
    const index = filteredVideos.findIndex(video => video.uid === uid);
    setSelectedVideo(uid);
    setSelectedVideoIndex(index);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedVideo(null);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? Math.max(0, selectedVideoIndex - 1)
      : Math.min(filteredVideos.length - 1, selectedVideoIndex + 1);
    
    setSelectedVideoIndex(newIndex);
    setSelectedVideo(filteredVideos[newIndex].uid);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-6 space-y-4">
            <Skeleton className="h-10 w-48 bg-gray-800" />
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-20 bg-gray-800" />
              ))}
            </div>
          </div>
          
          {/* Grid skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-video w-full bg-gray-800" />
                <Skeleton className="h-4 w-3/4 bg-gray-800" />
                <Skeleton className="h-3 w-1/2 bg-gray-800" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !videos.length) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="text-6xl">🎬</div>
          <h2 className="text-2xl font-bold">No Videos Available</h2>
          <p className="text-gray-400">
            {error || 'Check back later for new content!'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Explore Videos</h1>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap ${
                  activeFilter === filter
                    ? 'bg-yellow-400 text-black hover:bg-yellow-500'
                    : 'border-gray-600 text-white hover:bg-gray-800'
                }`}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-gray-400 mb-4">
          {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''} found
        </p>

        {/* Video Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredVideos.map((video) => (
            <div
              key={video.uid}
              className="group cursor-pointer"
              onClick={() => handleVideoClick(video.uid)}
            >
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900">
                <img
                  src={getCloudflareStreamThumbnail(video.uid, { height: 360 })}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
                
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                  <div className="bg-black/60 rounded-full p-3 group-hover:scale-110 transition-transform duration-200">
                    <Play size={24} className="text-white fill-white ml-1" />
                  </div>
                </div>

                {/* Duration */}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </div>
              </div>

              {/* Video info */}
              <div className="mt-2 space-y-1">
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-yellow-400 transition-colors">
                  {video.title}
                </h3>
                <div className="flex flex-wrap gap-1">
                  {video.tags.slice(0, 2).map((tag, index) => (
                    <span key={index} className="text-xs text-gray-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <Search size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No videos found</h3>
            <p className="text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {showModal && selectedVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl aspect-video">
            {/* Close button */}
            <button
              onClick={handleModalClose}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 z-10"
            >
              <X size={32} />
            </button>

            {/* Navigation */}
            {selectedVideoIndex > 0 && (
              <button
                onClick={() => handleNavigate('prev')}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-10"
              >
                ←
              </button>
            )}
            
            {selectedVideoIndex < filteredVideos.length - 1 && (
              <button
                onClick={() => handleNavigate('next')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-10"
              >
                →
              </button>
            )}

            {/* Video Player */}
            <CloudflareStreamPlayer
              uid={selectedVideo}
              autoplay
              muted={false}
              controls
              lazyLoad={false}
              className="w-full h-full rounded-lg"
            />

            {/* Video info */}
            <div className="absolute -bottom-16 left-0 right-0 text-white">
              <h3 className="text-lg font-semibold mb-1">
                {filteredVideos[selectedVideoIndex]?.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {filteredVideos[selectedVideoIndex]?.tags.map((tag, index) => (
                  <span key={index} className="text-sm text-gray-300">
                    #{tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {selectedVideoIndex + 1} of {filteredVideos.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;