
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
      title: 'Restaurant Chain Campaign',
      industry: 'Restaurants',
      type: 'Post',
      thumbnail: 'https://images.unsplash.com/photo-1517022812141-23620dba5c23',
      description: 'Increased online orders by 300% for a local restaurant chain through targeted social media campaigns.',
      results: '300% increase in online orders, 2.5M reach, 15% engagement rate',
      client: 'Bella Vista Restaurants'
    },
    {
      id: 2,
      title: 'Beauty Brand Launch',
      industry: 'Beauty',
      type: 'Reel',
      thumbnail: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      description: 'Successfully launched a new beauty brand with viral content strategy.',
      results: '5M+ views, 25K new followers, 180% sales increase',
      client: 'Glow Beauty Co.'
    },
    {
      id: 3,
      title: 'Medical Clinic Growth',
      industry: 'Clinics',
      type: 'Post',
      thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
      description: 'Helped a medical clinic establish trusted online presence and increase patient bookings.',
      results: '400% increase in online bookings, 95% positive reviews',
      client: 'HealthFirst Clinic'
    },
    {
      id: 4,
      title: 'E-commerce Success Story',
      industry: 'E-Commerce',
      type: 'Post',
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      description: 'Transformed an e-commerce store with data-driven marketing strategies.',
      results: '250% ROI, 1.8M impressions, 12% conversion rate',
      client: 'TechGadgets Pro'
    },
    {
      id: 5,
      title: 'Real Estate Portfolio',
      industry: 'Real Estate',
      type: 'Reel',
      thumbnail: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      description: 'Generated quality leads for luxury real estate properties through premium content.',
      results: '150 qualified leads, 85% lead quality score, $2M in sales',
      client: 'Luxury Estates Group'
    },
    {
      id: 6,
      title: 'Educational Platform Growth',
      industry: 'Education',
      type: 'Post',
      thumbnail: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b',
      description: 'Boosted enrollment for online education platform with engaging video content.',
      results: '500% enrollment increase, 3.2M video views',
      client: 'LearnTech Academy'
    },
    {
      id: 7,
      title: 'Fashion Brand Viral',
      industry: 'Fashion',
      type: 'Reel',
      thumbnail: 'https://images.unsplash.com/photo-1445205170230-053b83016050',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      description: 'Created viral fashion content that boosted brand awareness.',
      results: '10M+ views, 50K new followers, 300% engagement',
      client: 'Style Forward'
    },
    {
      id: 8,
      title: 'Tech Startup Launch',
      industry: 'Technology',
      type: 'Post',
      thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
      description: 'Launched a tech startup with strategic social media presence.',
      results: '1M impressions, 500 sign-ups, 25% conversion',
      client: 'InnovateTech'
    },
    {
      id: 9,
      title: 'Fitness Studio Growth',
      industry: 'Fitness',
      type: 'Reel',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      description: 'Helped fitness studio double their membership through engaging reels.',
      results: '200% membership increase, 3M reel views',
      client: 'FitLife Studios'
    },
    // New posts for industries that only had reels
    {
      id: 10,
      title: 'Beauty Salon Campaign',
      industry: 'Beauty',
      type: 'Post',
      thumbnail: 'https://images.unsplash.com/photo-1560066984-138dadb4c035',
      description: 'Increased bookings for beauty salon through stunning before/after posts.',
      results: '400% booking increase, 150K impressions, 18% engagement rate',
      client: 'Glamour Beauty Salon'
    },
    {
      id: 11,
      title: 'Luxury Property Sales',
      industry: 'Real Estate',
      type: 'Post',
      thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
      description: 'Sold luxury properties through high-quality photography and targeted ads.',
      results: '$5M in property sales, 200 qualified leads, 75% conversion rate',
      client: 'Elite Real Estate'
    },
    {
      id: 12,
      title: 'Fashion Brand Growth',
      industry: 'Fashion',
      type: 'Post',
      thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
      description: 'Built fashion brand awareness through styled photoshoots and influencer partnerships.',
      results: '600% follower growth, $200K in sales, 22% engagement rate',
      client: 'Urban Fashion Co.'
    },
    {
      id: 13,
      title: 'Fitness Center Marketing',
      industry: 'Fitness',
      type: 'Post',
      thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
      description: 'Attracted new members through motivational content and success stories.',
      results: '350% membership growth, 1.2M reach, 500 new sign-ups',
      client: 'PowerFit Gym'
    }
  ];

  const filters = ['Best results', 'Restaurants', 'Beauty', 'Clinics', 'E-Commerce', 'Real Estate', 'Education', 'Fashion', 'Technology', 'Fitness'];

  const filteredProjects = activeFilter === 'Best results' 
    ? projects.filter(project => project.type === 'Reel')
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
    // Auto-play and mute all videos
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        video.muted = true;
        video.play().catch(console.log);
      }
    });
  }, [filteredProjects]);

  const renderGridItem = (project: any, index: number) => {
    const isReel = project.type === 'Reel';
    
    if (isReel) {
      return (
        <div
          key={project.id}
          onClick={() => handleProjectClick(project)}
          className="aspect-[9/16] bg-gray-900 cursor-pointer hover:opacity-80 transition-opacity relative group overflow-hidden rounded-sm"
        >
          <video
            ref={(el) => (videoRefs.current[project.id] = el)}
            src={project.videoUrl}
            poster={project.thumbnail}
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
            onLoadedData={() => {
              const video = videoRefs.current[project.id];
              if (video) {
                video.play().catch(console.log);
              }
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
            <div className="absolute top-2 left-2">
              <Play size={16} className="text-white" fill="white" />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute(project.id);
              }}
              className="absolute top-2 right-2 bg-black bg-opacity-50 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {mutedVideos.has(project.id) ? (
                <VolumeX size={16} className="text-white" />
              ) : (
                <Volume2 size={16} className="text-white" />
              )}
            </button>
            <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 px-2 py-1 rounded">
              {project.type}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div
        key={project.id}
        onClick={() => handleProjectClick(project)}
        className="aspect-[9/16] bg-gray-900 cursor-pointer hover:opacity-80 transition-opacity relative group overflow-hidden rounded-sm"
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
      {/* Search Bar */}
      <div className="px-4 py-3 border-b border-gray-800">
        <input
          type="text"
          placeholder="Search projects, industries..."
          className="w-full bg-gray-900 text-white placeholder-gray-400 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      {/* Filters */}
      <div className="px-4 py-3 border-b border-gray-800">
        <div className="flex space-x-2 overflow-x-auto">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {filter}
            </button>
          ))}
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
