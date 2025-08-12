
import { useState, useRef, useEffect } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import InstagramPostModal from './InstagramPostModal';

const ExplorePage = () => {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState('Best results');
  const [mutedVideos, setMutedVideos] = useState<Set<number>>(new Set());
  const [modalType, setModalType] = useState<'reel' | 'post' | null>(null);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

  const allProjects = {
    'Best results': [
      {
        id: 101,
        title: 'Viral Marketing Campaign',
        industry: 'Best results',
        type: 'Post',
        thumbnail: '/videos/0521.mp4',
        mediaType: 'video',
        description: 'Our most successful viral campaign that broke the internet.',
        results: '10M views, 500K shares, 2M new followers',
        client: 'SocialHive Agency',
        likes: 15420,
        comments: 2843
      },
      {
        id: 102,
        title: 'Award-Winning Design',
        industry: 'Best results',
        type: 'Post',
        thumbnail: '/images/IMG-20250728-WA0026.jpg',
        mediaType: 'image',
        description: 'Design that won 3 international awards and redefined the brand.',
        results: 'Gold at Cannes, Design of the Year, 400% brand lift',
        client: 'SocialHive Agency',
        likes: 8932,
        comments: 1205
      },
      {
        id: 103,
        title: 'Record-Breaking Launch',
        industry: 'Best results',
        type: 'Post',
        thumbnail: '/videos/0617 (1)(3).MP4',
        mediaType: 'video',
        description: 'Product launch that exceeded all expectations and broke company records.',
        results: '1M pre-orders, sold out in 24 hours, 300% ROI',
        client: 'SocialHive Agency',
        likes: 12567,
        comments: 3421
      },
      {
        id: 104,
        title: 'Cultural Impact Campaign',
        industry: 'Best results',
        type: 'Post',
        thumbnail: '/images/IMG-20250728-WA0027.jpg',
        mediaType: 'image',
        description: 'Campaign that started a movement and changed industry standards.',
        results: 'Featured in TIME, 50M reach, industry standard shift',
        client: 'SocialHive Agency',
        likes: 9834,
        comments: 2156
      },
      {
        id: 105,
        title: 'Innovation Breakthrough',
        industry: 'Best results',
        type: 'Post',
        thumbnail: '/videos/0619 (2) (2).mp4',
        mediaType: 'video',
        description: 'Revolutionary approach that redefined how brands connect with audiences.',
        results: 'Patent filed, 800% engagement increase, industry adoption',
        client: 'SocialHive Agency',
        likes: 11249,
        comments: 1876
      },
      {
        id: 106,
        title: 'Global Brand Transformation',
        industry: 'Best results',
        type: 'Post',
        thumbnail: '/images/IMG-20250728-WA0028.jpg',
        mediaType: 'image',
        description: 'Complete brand overhaul that resulted in global market domination.',
        results: 'Market leader position, 600% value increase, global expansion',
        client: 'SocialHive Agency',
        likes: 13567,
        comments: 2987
      }
    ],
    Strategy: [
      {
        id: 1,
        title: 'Brand Strategy Portfolio',
        industry: 'Strategy',
        type: 'Post',
        thumbnail: '/images/IMG-20250728-WA0026.jpg',
        mediaType: 'image',
        description: 'Comprehensive brand strategy showcasing our methodology and results.',
        results: '300% increase in brand awareness, 15% conversion rate',
        client: 'SocialHive Agency',
        likes: 3421,
        comments: 567
      },
      {
        id: 7,
        title: 'Market Analysis Deep Dive',
        industry: 'Strategy',
        type: 'Post',
        thumbnail: '/videos/0626(2).mp4',
        mediaType: 'video',
        description: 'Strategic analysis that revealed untapped market opportunities.',
        results: 'New market entry, 250% growth, competitive advantage',
        client: 'SocialHive Agency',
        likes: 2156,
        comments: 398
      }
    ],
    Creative: [
      {
        id: 2,
        title: 'Creative Design Showcase',
        industry: 'Creative',
        type: 'Post',
        thumbnail: '/images/IMG-20250728-WA0027.jpg',
        mediaType: 'image',
        description: 'Creative design portfolio highlighting our visual storytelling capabilities.',
        results: '250% engagement boost, 1.8M impressions',
        client: 'SocialHive Agency',
        likes: 5234,
        comments: 891
      },
      {
        id: 8,
        title: 'Visual Identity Revolution',
        industry: 'Creative',
        type: 'Post',
        thumbnail: '/videos/0627 (1).mp4',
        mediaType: 'video',
        description: 'Complete visual overhaul that transformed brand perception.',
        results: 'Brand recognition +400%, design awards, viral adoption',
        client: 'SocialHive Agency',
        likes: 4567,
        comments: 723
      }
    ],
    Marketing: [
      {
        id: 3,
        title: 'Marketing Success Story',
        industry: 'Marketing',
        type: 'Post',
        thumbnail: '/images/IMG-20250728-WA0028.jpg',
        mediaType: 'image',
        description: 'Marketing campaign that delivered exceptional results for our client.',
        results: '150 qualified leads, 85% lead quality score',
        client: 'SocialHive Agency',
        likes: 2987,
        comments: 445
      },
      {
        id: 9,
        title: 'Digital Marketing Mastery',
        industry: 'Marketing',
        type: 'Post',
        thumbnail: '/videos/0630 (1)(3).mp4',
        mediaType: 'video',
        description: 'Multi-channel campaign that maximized reach and conversion.',
        results: '5M reach, 35% conversion rate, 400% ROAS',
        client: 'SocialHive Agency',
        likes: 3765,
        comments: 612
      }
    ],
    Innovation: [
      {
        id: 4,
        title: 'Digital Innovation Case Study',
        industry: 'Innovation',
        type: 'Post',
        thumbnail: '/images/IMG-20250728-WA0029.jpg',
        mediaType: 'image',
        description: 'Innovation in digital marketing strategies and implementation.',
        results: '1M impressions, 500 sign-ups, 25% conversion',
        client: 'SocialHive Agency',
        likes: 4123,
        comments: 678
      },
      {
        id: 10,
        title: 'Tech Integration Pioneer',
        industry: 'Innovation',
        type: 'Post',
        thumbnail: '/videos/0703.mp4',
        mediaType: 'video',
        description: 'First-to-market integration that set new industry standards.',
        results: 'Industry first, 10 patents, technology adoption',
        client: 'SocialHive Agency',
        likes: 3456,
        comments: 534
      }
    ]
  };

  const filters = ['Best results', 'Strategy', 'Creative', 'Marketing', 'Innovation'];

  const filteredProjects = allProjects[activeFilter as keyof typeof allProjects] || [];

  const reels = filteredProjects.filter(project => project.type === 'Reel');
  const posts = filteredProjects.filter(project => project.type === 'Post');

  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
    setModalType(project.type === 'Reel' ? 'reel' : 'post');
  };

  const handleModalNavigate = (direction: 'prev' | 'next') => {
    if (!selectedProject) return;

    const currentList = selectedProject.type === 'Reel' ? reels : posts;
    const currentIndex = currentList.findIndex(p => p.id === selectedProject.id);
    
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedProject(currentList[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < currentList.length - 1) {
      setSelectedProject(currentList[currentIndex + 1]);
    }
  };

  const closeModal = () => {
    setSelectedProject(null);
    setModalType(null);
  };

  const toggleMute = (videoId: number) => {
    const newMutedVideos = new Set(mutedVideos);
    if (mutedVideos.has(videoId)) {
      newMutedVideos.delete(videoId);
    } else {
      newMutedVideos.add(videoId);
    }
    setMutedVideos(newMutedVideos);
    
    const video = videoRefs.current[videoId];
    if (video) {
      video.muted = newMutedVideos.has(videoId);
    }
  };

  useEffect(() => {
    // Just mute all videos, don't auto-play in grid
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        video.muted = true;
      }
    });
  }, [filteredProjects]);

  const renderGridItem = (project: any, index: number) => {
    return (
      <div
        key={project.id}
        onClick={() => handleProjectClick(project)}
        className="aspect-square bg-gray-900 cursor-pointer hover:opacity-80 transition-opacity relative group overflow-hidden rounded-sm"
      >
        {project.mediaType === 'video' ? (
          <video
            ref={(el) => {
              if (el) {
                videoRefs.current[project.id] = el;
              }
            }}
            src={project.thumbnail}
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
            onLoadedData={(e) => {
              const video = e.currentTarget;
              video.play().catch(() => {
                // Autoplay failed, will play on user interaction
              });
            }}
          />
        ) : (
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
          <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 px-2 py-1 rounded">
            {project.type}
          </span>
        </div>
        {project.mediaType === 'video' && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-4 h-4 text-white" fill="white" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto h-full">
      {/* Filters */}
      <div className="px-4 py-3 bg-black sticky top-0 z-10">
        {/* Mobile/Tablet: Vertical layout */}
        <div className="block md:hidden">
          <div className="flex flex-wrap gap-1.5">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  activeFilter === filter
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-800 text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop: Staggered grid layout */}
        <div className="hidden md:block">
          <div className="flex flex-wrap gap-1.5">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  activeFilter === filter
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-800 text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Instagram-style Grid - Scrollable */}
      <div className="flex-1 overflow-y-auto" style={{ height: 'calc(100vh - 120px - env(safe-area-inset-bottom))' }}>
        <div className="grid grid-cols-3 gap-1 p-1 pb-20">
          {filteredProjects.map((project, index) => renderGridItem(project, index))}
        </div>
      </div>

      {/* Instagram-style Post Modal */}
      {selectedProject && modalType === 'post' && (
        <InstagramPostModal
          post={selectedProject}
          allPosts={filteredProjects}
          onClose={closeModal}
          onNavigate={handleModalNavigate}
        />
      )}
    </div>
  );
};

export default ExplorePage;
