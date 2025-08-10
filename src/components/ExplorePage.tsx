
import { useState, useRef, useEffect } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import ReelModal from './ReelModal';
import PostModal from './PostModal';

const ExplorePage = () => {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState('Best results');
  const [mutedVideos, setMutedVideos] = useState<Set<number>>(new Set());
  const [modalType, setModalType] = useState<'reel' | 'post' | null>(null);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

  const projects = [
    {
      id: 1,
      title: 'Brand Strategy Portfolio',
      industry: 'Strategy',
      type: 'Post',
      thumbnail: '/images/IMG-20250728-WA0026.jpg',
      description: 'Comprehensive brand strategy showcasing our methodology and results.',
      results: '300% increase in brand awareness, 15% conversion rate',
      client: 'SocialHive Agency'
    },
    {
      id: 2,
      title: 'Creative Design Showcase',
      industry: 'Creative',
      type: 'Post',
      thumbnail: '/images/IMG-20250728-WA0027.jpg',
      description: 'Creative design portfolio highlighting our visual storytelling capabilities.',
      results: '250% engagement boost, 1.8M impressions',
      client: 'SocialHive Agency'
    },
    {
      id: 3,
      title: 'Marketing Success Story',
      industry: 'Marketing',
      type: 'Post',
      thumbnail: '/images/IMG-20250728-WA0028.jpg',
      description: 'Marketing campaign that delivered exceptional results for our client.',
      results: '150 qualified leads, 85% lead quality score',
      client: 'SocialHive Agency'
    },
    {
      id: 4,
      title: 'Digital Innovation Case Study',
      industry: 'Innovation',
      type: 'Post',
      thumbnail: '/images/IMG-20250728-WA0029.jpg',
      description: 'Innovation in digital marketing strategies and implementation.',
      results: '1M impressions, 500 sign-ups, 25% conversion',
      client: 'SocialHive Agency'
    }
  ];

  const filters = ['Best results', 'Strategy', 'Creative', 'Marketing', 'Innovation'];

  const filteredProjects = activeFilter === 'Best results' 
    ? projects
    : projects.filter(project => project.industry === activeFilter);

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
        <img
          src={project.thumbnail}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
          <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 px-2 py-1 rounded">
            {project.type}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto">

      {/* Filters */}
      <div className="px-4 py-3 bg-black">
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

      {/* Instagram-style Grid */}
      <div className="grid grid-cols-3 gap-1 p-1">
        {filteredProjects.map((project, index) => renderGridItem(project, index))}
      </div>

      {/* Modals */}
      {selectedProject && modalType === 'reel' && (
        <ReelModal
          reel={selectedProject}
          allReels={reels}
          onClose={closeModal}
          onNavigate={handleModalNavigate}
        />
      )}

      {selectedProject && modalType === 'post' && (
        <PostModal
          post={selectedProject}
          allPosts={posts}
          onClose={closeModal}
          onNavigate={handleModalNavigate}
        />
      )}
    </div>
  );
};

export default ExplorePage;
