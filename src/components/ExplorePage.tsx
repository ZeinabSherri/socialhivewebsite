
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
      title: 'Latest Social Media Strategy',
      industry: 'Strategy',
      type: 'Reel',
      thumbnail: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      videoUrl: '/videos/47072fb1-0d9d-4b10-8e0b-347ecdeae27e.MP4',
      description: 'Latest insights on social media marketing strategies that drive engagement and conversions.',
      results: '300% increase in engagement, 2.5M reach, 15% conversion rate',
      client: 'SocialHive Agency'
    },
    {
      id: 2,
      title: 'Advanced Content Creation',
      industry: 'Content',
      type: 'Reel',
      thumbnail: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      videoUrl: '/videos/0715(3).mp4',
      description: 'Advanced content creation techniques that convert viewers into customers.',
      results: '5M+ views, 25K new followers, 180% sales increase',
      client: 'SocialHive Agency'
    },
    {
      id: 3,
      title: 'Client Transformation Story',
      industry: 'Success',
      type: 'Reel',
      thumbnail: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      videoUrl: '/videos/0710 (1).mp4',
      description: 'Amazing client transformation using our proven methodology.',
      results: '400% increase in ROI, 95% client satisfaction',
      client: 'SocialHive Agency'
    },
    {
      id: 4,
      title: 'Behind the Scenes Magic',
      industry: 'Creative',
      type: 'Reel',
      thumbnail: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      videoUrl: '/videos/0709(1).mp4',
      description: 'Behind the scenes of our creative process.',
      results: '250% engagement boost, 1.8M impressions, 12% conversion rate',
      client: 'SocialHive Agency'
    },
    {
      id: 5,
      title: 'Marketing Strategy Deep Dive',
      industry: 'Marketing',
      type: 'Reel',
      thumbnail: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      videoUrl: '/videos/0703.mp4',
      description: 'Deep dive into our marketing strategies that have helped hundreds of businesses scale.',
      results: '150 qualified leads, 85% lead quality score, $2M in sales',
      client: 'SocialHive Agency'
    },
    {
      id: 6,
      title: 'Creative Campaign Launch',
      industry: 'Campaign',
      type: 'Reel',
      thumbnail: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      videoUrl: '/videos/0630 (1)(3).mp4',
      description: 'Launching a creative campaign that broke all engagement records.',
      results: '500% enrollment increase, 3.2M video views',
      client: 'SocialHive Agency'
    },
    {
      id: 7,
      title: 'Brand Storytelling Mastery',
      industry: 'Branding',
      type: 'Reel',
      thumbnail: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      videoUrl: '/videos/0627 (1).mp4',
      description: 'Mastering the art of brand storytelling through visual content.',
      results: '10M+ views, 50K new followers, 300% engagement',
      client: 'SocialHive Agency'
    },
    {
      id: 8,
      title: 'Digital Innovation Workshop',
      industry: 'Innovation',
      type: 'Reel',
      thumbnail: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      videoUrl: '/videos/0626(2).mp4',
      description: 'Digital innovation workshop highlights.',
      results: '1M impressions, 500 sign-ups, 25% conversion',
      client: 'SocialHive Agency'
    },
    {
      id: 9,
      title: 'Content Strategy Breakthrough',
      industry: 'Strategy',
      type: 'Reel',
      thumbnail: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      videoUrl: '/videos/0619 (2)(3).mp4',
      description: 'Content strategy breakthrough session.',
      results: '200% membership increase, 3M reel views',
      client: 'SocialHive Agency'
    },
    {
      id: 10,
      title: 'Creative Process Unveiled',
      industry: 'Creative',
      type: 'Reel',
      thumbnail: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      videoUrl: '/videos/0619 (2) (2).mp4',
      description: 'Creative process unveiled - from brainstorming to final execution.',
      results: '400% booking increase, 150K impressions, 18% engagement rate',
      client: 'SocialHive Agency'
    },
    {
      id: 11,
      title: 'Marketing Insights Session',
      industry: 'Marketing',
      type: 'Reel',
      thumbnail: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      videoUrl: '/videos/0617 (1)(3).MP4',
      description: 'Marketing insights session revealing the trends and strategies.',
      results: '$5M in revenue growth, 200 qualified leads, 75% conversion rate',
      client: 'SocialHive Agency'
    },
    {
      id: 12,
      title: 'Foundation Building Strategy',
      industry: 'Foundation',
      type: 'Reel',
      thumbnail: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      videoUrl: '/videos/0521.mp4',
      description: 'Foundation building strategy for long-term success.',
      results: '600% follower growth, $200K in sales, 22% engagement rate',
      client: 'SocialHive Agency'
    }
  ];

  const filters = ['Best results', 'Strategy', 'Content', 'Success', 'Creative', 'Marketing', 'Campaign', 'Branding', 'Innovation', 'Foundation'];

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
