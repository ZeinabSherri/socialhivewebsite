import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, X } from 'lucide-react';
import PostCard from './PostCard';
import ReelModal, { Reel } from './ReelModal';
import { loadStreamItems, thumbSrc } from '../lib/stream';
import type { StreamItem } from '../lib/stream';

type ExploreCard = {
  id: number;
  title: string;
  industry: FilterName;
  type: string;
  thumbnail: string;              // image src OR poster for video
  mediaType: 'image' | 'video';
  description?: string;
  results?: string;
  client?: string;
  likes?: number;
  comments?: number;
  uid?: string;                   // CF UID when present
  isCloudflare?: boolean;
};

const cfThumb = (uid: string, h = 360) => thumbSrc(uid, h);
// Use CF’s downloadable MP4 so the native <video> keeps your exact UI
const cfMp4 = (uid: string) => `https://videodelivery.net/${uid}/downloads/default.mp4`;

const FILTERS = [
  'Beauty clinics',
  'Real Estate',
  'Restaurants and FnB',
  'Ecommerce',
  'Network operators',
  'Content\u00A0creation', // your label with NBSP
] as const;
type FilterName = (typeof FILTERS)[number];

/* ---- static content unchanged visually ---- */
const STATIC_PROJECTS: Record<FilterName, ExploreCard[]> = {
  'Beauty clinics': [
    { id: 101, title: 'Viral Marketing Campaign', industry: 'Beauty clinics', type: 'Post', thumbnail: '/videos/0521.mp4', mediaType: 'video', description: 'Our most successful viral campaign that broke the internet.', results: '10M views, 500K shares, 2M new followers', client: 'SocialHive Agency', likes: 15420, comments: 2843 },
    { id: 102, title: 'Award-Winning Design', industry: 'Beauty clinics', type: 'Post', thumbnail: '/images/IMG-20250728-WA0026.jpg', mediaType: 'image', description: 'Design that won 3 international awards and redefined the brand.', results: 'Gold at Cannes, Design of the Year, 400% brand lift', client: 'SocialHive Agency', likes: 8932, comments: 1205 },
    { id: 103, title: 'Record-Breaking Launch', industry: 'Beauty clinics', type: 'Post', thumbnail: '/videos/0617 (1)(3).MP4', mediaType: 'video', description: 'Product launch that exceeded all expectations and broke company records.', results: '1M pre-orders, sold out in 24 hours, 300% ROI', client: 'SocialHive Agency', likes: 12567, comments: 3421 },
    { id: 104, title: 'Cultural Impact Campaign', industry: 'Beauty clinics', type: 'Post', thumbnail: '/images/IMG-20250728-WA0027.jpg', mediaType: 'image', description: 'Campaign that started a movement and changed industry standards.', results: 'Featured in TIME, 50M reach, industry standard shift', client: 'SocialHive Agency', likes: 9834, comments: 2156 },
    { id: 105, title: 'Innovation Breakthrough', industry: 'Beauty clinics', type: 'Post', thumbnail: '/videos/0619 (2) (2).mp4', mediaType: 'video', description: 'Revolutionary approach that redefined how brands connect with audiences.', results: 'Patent filed, 800% engagement increase, industry adoption', client: 'SocialHive Agency', likes: 11249, comments: 1876 },
    { id: 106, title: 'Global Brand Transformation', industry: 'Beauty clinics', type: 'Post', thumbnail: '/images/IMG-20250728-WA0028.jpg', mediaType: 'image', description: 'Complete brand overhaul that resulted in global market domination.', results: 'Market leader position, 600% value increase, global expansion', client: 'SocialHive Agency', likes: 13567, comments: 2987 }
  ],
  'Real Estate': [
    { id: 1, title: 'Brand Strategy Portfolio', industry: 'Real Estate', type: 'Post', thumbnail: '/images/IMG-20250728-WA0026.jpg', mediaType: 'image', description: 'Comprehensive brand strategy showcasing our methodology and results.', results: '300% increase in brand awareness, 15% conversion rate', client: 'SocialHive Agency', likes: 3421, comments: 567 },
    { id: 7, title: 'Market Analysis Deep Dive', industry: 'Real Estate', type: 'Post', thumbnail: '/videos/0626(2).mp4', mediaType: 'video', description: 'Strategic analysis that revealed untapped market opportunities.', results: 'New market entry, 250% growth, competitive advantage', client: 'SocialHive Agency', likes: 2156, comments: 398 }
  ],
  'Restaurants and FnB': [
    { id: 2, title: 'Creative Design Showcase', industry: 'Restaurants and FnB', type: 'Post', thumbnail: '/images/IMG-20250728-WA0027.jpg', mediaType: 'image', description: 'Creative design portfolio highlighting our visual storytelling capabilities.', results: '250% engagement boost, 1.8M impressions', client: 'SocialHive Agency', likes: 5234, comments: 891 },
    { id: 8, title: 'Visual Identity Revolution', industry: 'Restaurants and FnB', type: 'Post', thumbnail: '/videos/0627 (1).mp4', mediaType: 'video', description: 'Complete visual overhaul that transformed brand perception.', results: 'Brand recognition +400%, design awards, viral adoption', client: 'SocialHive Agency', likes: 4567, comments: 723 }
  ],
  'Ecommerce': [
    { id: 3, title: 'Marketing Success Story', industry: 'Ecommerce', type: 'Post', thumbnail: '/images/IMG-20250728-WA0028.jpg', mediaType: 'image', description: 'Marketing campaign that delivered exceptional results for our client.', results: '150 qualified leads, 85% lead quality score', client: 'SocialHive Agency', likes: 2987, comments: 445 },
    { id: 9, title: 'Digital Marketing Mastery', industry: 'Ecommerce', type: 'Post', thumbnail: '/videos/0630 (1)(3).mp4', mediaType: 'video', description: 'Multi-channel campaign that maximized reach and conversion.', results: '5M reach, 35% conversion rate, 400% ROAS', client: 'SocialHive Agency', likes: 3765, comments: 612 }
  ],
  'Network operators': [
    { id: 4, title: 'Digital Innovation Case Study', industry: 'Network operators', type: 'Post', thumbnail: '/images/IMG-20250728-WA0029.jpg', mediaType: 'image', description: 'Innovation in digital marketing strategies and implementation.', results: '1M impressions, 500 sign-ups, 25% conversion', client: 'SocialHive Agency', likes: 4123, comments: 678 },
    { id: 10, title: 'Tech Integration Pioneer', industry: 'Network operators', type: 'Post', thumbnail: '/videos/0703.mp4', mediaType: 'video', description: 'First-to-market integration that set new industry standards.', results: 'Industry first, 10 patents, technology adoption', client: 'SocialHive Agency', likes: 3456, comments: 534 }
  ],
  'Content\u00A0creation': [
    { id: 2001, title: 'Digital Innovation Case Study', industry: 'Content\u00A0creation', type: 'Post', thumbnail: '/images/IMG-20250728-WA0029.jpg', mediaType: 'image', description: 'Innovation in digital marketing strategies and implementation.', results: '1M impressions, 500 sign-ups, 25% conversion', client: 'SocialHive Agency', likes: 4123, comments: 678 },
    { id: 2002, title: 'Tech Integration Pioneer', industry: 'Content\u00A0creation', type: 'Post', thumbnail: '/videos/0703.mp4', mediaType: 'video', description: 'First-to-market integration that set new industry standards.', results: 'Industry first, 10 patents, technology adoption', client: 'SocialHive Agency', likes: 3456, comments: 534 }
  ]
};
/* --------------------------------------------------- */

const ExplorePage = () => {
  const [selectedProject, setSelectedProject] = useState<ExploreCard | null>(null);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<FilterName>('Beauty clinics');
  const [showPostsFeed, setShowPostsFeed] = useState(false);
  const [showReelModal, setShowReelModal] = useState(false);
  const [cfProjects, setCfProjects] = useState<ExploreCard[]>([]);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});

  // guess category when videos.json has no "industry"
  const guessIndustry = (title?: string, tags?: string[]): FilterName => {
    const text = `${title || ''} ${(tags || []).join(' ')}`.toLowerCase();
    if (text.includes('real estate')) return 'Real Estate';
    if (/(restaurant|fnb|food|cafe|coffee|kitchen)/.test(text)) return 'Restaurants and FnB';
    if (/(e-?commerce|shop|store|retail|cart)/.test(text)) return 'Ecommerce';
    if (/(network|operator|telecom|telco|isp)/.test(text)) return 'Network operators';
    if (/(content|creator|influencer|production|editing)/.test(text)) return 'Content\u00A0creation';
    return 'Beauty clinics';
  };

  // Load Cloudflare "explore" items
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = await loadStreamItems();
        type ItemX = StreamItem & { industry?: FilterName };
        const mapped: ExploreCard[] = (items as ItemX[])
          .filter((v) => v.section === 'explore')
          .map((v, idx) => ({
            id: 80000 + idx,
            title: v.title || 'Explore Clip',
            industry: v.industry ?? guessIndustry(v.title, v.tags),
            type: 'Post',
            thumbnail: cfThumb(v.uid, 360), // poster for grid <video>
            mediaType: 'video',
            client: 'Cloudflare Stream',
            likes: 0,
            comments: 0,
            uid: v.uid,
            isCloudflare: true
          }));
        if (mounted) setCfProjects(mapped);
      } catch (err) {
        console.error('Failed to load videos.json', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filters = [...FILTERS];

  // active tab: show CF items first, then your static items
  const filteredProjects: ExploreCard[] = useMemo(() => {
    const base = STATIC_PROJECTS[activeFilter] || [];
    const cfInThisCategory = cfProjects.filter(p => p.industry === activeFilter);
    return [...cfInThisCategory, ...base];
  }, [activeFilter, cfProjects]);

  const reels = useMemo(
    () => filteredProjects.filter((p) => p.mediaType === 'video'),
    [filteredProjects]
  );

  // keep grid videos muted
  useEffect(() => {
    Object.values(videoRefs.current).forEach((video) => {
      if (video) video.muted = true;
    });
  }, [filteredProjects]);

  const handleProjectClick = (project: ExploreCard, index: number) => {
    setSelectedProject(project);
    setSelectedProjectIndex(index);
    if (project.mediaType === 'video') setShowReelModal(true);
    else setShowPostsFeed(true);
  };

  const handleReelNavigate = (direction: 'prev' | 'next') => {
    if (!selectedProject) return;
    const currentIndex = reels.findIndex((p) => p.id === selectedProject.id);
    if (direction === 'prev' && currentIndex > 0) setSelectedProject(reels[currentIndex - 1]);
    else if (direction === 'next' && currentIndex < reels.length - 1) setSelectedProject(reels[currentIndex + 1]);
  };

  const renderGridItem = (project: ExploreCard, index: number) => {
    const isCF = !!project.uid;
    return (
      <div
        key={project.id}
        onClick={() => handleProjectClick(project, index)}
        className="aspect-square bg-gray-900 cursor-pointer hover:opacity-80 transition-opacity relative group overflow-hidden rounded-sm"
      >
        {project.mediaType === 'video' ? (
          <video
            ref={(el) => { if (el) videoRefs.current[project.id] = el; }}
            src={isCF ? cfMp4(project.uid!) : project.thumbnail}
            poster={project.thumbnail}
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
            onLoadedData={(e) => { void e.currentTarget.play().catch(() => {}); }}
          />
        ) : (
          <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
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
        <div className="block md:hidden">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter as FilterName)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  activeFilter === filter ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <div className="hidden md:block">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter as FilterName)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  activeFilter === filter ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto" style={{ height: 'calc(100vh - 120px - env(safe-area-inset-bottom))' }}>
        <div className="grid grid-cols-3 gap-1 p-1 pb-20">
          {filteredProjects.map((project, index) => renderGridItem(project, index))}
        </div>
      </div>

      {/* Posts Feed Modal */}
      {showPostsFeed && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold">Posts</h2>
            <button onClick={() => setShowPostsFeed(false)} className="text-gray-400 hover:text-white p-2">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-md mx-auto space-y-0">
              {filteredProjects.slice(selectedProjectIndex).map((project) => (
                <PostCard
                  key={project.id}
                  post={{
                    id: project.id,
                    username: project.client || 'SocialHive',
                    userAvatar: '/images/socialhive.png',
                    timestamp: '2h',
                    image: project.thumbnail,
                    caption: project.description || '',
                    likes: project.likes || 0,
                    comments: project.comments || 0,
                    isLiked: false,
                    staticComments: [
                      { id: 1, username: 'user1', text: 'Amazing work! 🔥' },
                      { id: 2, username: 'user2', text: 'Love this! 💛' }
                    ]
                  }}
                  onLike={() => {}}
                  onUsernameClick={() => {}}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* One modal for both local & Cloudflare (same design) */}
      {showReelModal && selectedProject && (
        <ReelModal
          reel={{
            id: selectedProject.id,
            title: selectedProject.title,
            client: selectedProject.client,
            description: selectedProject.description,
            industry: selectedProject.industry,
            thumbnail: selectedProject.thumbnail,
            videoUrl: selectedProject.uid ? cfMp4(selectedProject.uid) : selectedProject.thumbnail,
            uid: selectedProject.uid
          }}
          allReels={reels.map<Reel>((r) => ({
            id: r.id,
            title: r.title,
            client: r.client,
            description: r.description,
            industry: r.industry,
            thumbnail: r.thumbnail,
            videoUrl: r.uid ? cfMp4(r.uid) : r.thumbnail,
            uid: r.uid
          }))}
          onClose={() => setShowReelModal(false)}
          onNavigate={handleReelNavigate}
        />
      )}
    </div>
  );
};

export default ExplorePage;
