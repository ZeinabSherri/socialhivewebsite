import { useState, useEffect, useRef } from 'react';
import { Grid, Play, Tag, Settings, ChevronDown, X } from 'lucide-react';
import VerificationBadge from './VerificationBadge';
import PostCard from './PostCard';
import PostHoverStats from './PostHoverStats';
import WhatsAppIcon from './WhatsAppIcon';
import ReelsViewer from './ReelsViewer';
import { useCounterAnimation } from '../hooks/useCounterAnimation';
import { useSingleActiveVideo } from '../hooks/useSingleActiveVideo';
import { useReelPager } from '../hooks/useReelPager';
import { generateCategoryPosts, CATEGORY_KEYS, type CategoryKey } from '../data/categoryVideos';

interface ProfilePageProps {
  onNavigateToContact?: () => void;
}

// Add IntersectionObserver to ProfilePage for proper video control
const ProfilePage = ({
  onNavigateToContact
}: ProfilePageProps) => {
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedProfile, setSelectedProfile] = useState<CategoryKey | 'Agency'>('Agency');
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [showPostsFeed, setShowPostsFeed] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState(0);
  const [selectedReelIndex, setSelectedReelIndex] = useState(0);
  const [showReelsViewer, setShowReelsViewer] = useState(false);
  const [hoveredPostId, setHoveredPostId] = useState<number | null>(null);
  const [showRecommendationsDropdown, setShowRecommendationsDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Single active video hook for profile grid
  useSingleActiveVideo('.profile-grid video');

  // Enable scroll navigation on grid items
  useReelPager({
    container: gridRef,
    itemSelector: '.aspect-square'
  });

  // Profile options: main agency + 6 category profiles
  const profileOptions = [
    {
      id: 'agency',
      name: 'Agency' as const,
      followers: 125000,
      followersDisplay: '125K',
      posts: 12,
      isCategory: false
    },
    ...CATEGORY_KEYS.map(category => ({
      id: category.toLowerCase().replace(/\s+/g, '-'),
      name: category,
      followers: Math.floor(Math.random() * 50000) + 20000,
      followersDisplay: `${Math.floor((Math.random() * 50 + 20))}K`,
      posts: generateCategoryPosts(category).length,
      isCategory: true as const
    }))
  ];

  const currentProfile = profileOptions.find(p => p.name === selectedProfile) || profileOptions[0];

  // Counter animations for main stats - reset when profile changes
  const postsCount = useCounterAnimation({
    targetValue: currentProfile.posts,
    duration: 1500,
    startDelay: 100
  });
  const followersCount = useCounterAnimation({
    targetValue: currentProfile.followers,
    duration: 2000,
    startDelay: 300
  });
  const followingCount = useCounterAnimation({
    targetValue: 1247,
    duration: 2000,
    startDelay: 600
  });

  // Helper function to format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  // Generate posts based on selected profile using category videos
  const getPostsForProfile = (profileName: CategoryKey | 'Agency') => {
    // If it's the main agency profile, return some demo posts
    if (profileName === 'Agency') {
      return Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        username: 'socialhive.agency',
        userAvatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
        timestamp: `${i + 1}h`,
        image: `https://images.unsplash.com/photo-${600000000000 + i * 1000000}?auto=format&fit=crop&w=800&q=80`,
        caption: `🐝 Crafting digital experiences that drive results`,
        likes: Math.floor(Math.random() * 1000) + 100,
        comments: Math.floor(Math.random() * 50) + 5,
        isLiked: false,
        staticComments: [
          { id: 1, username: 'user1', text: 'Amazing work! 🔥' },
          { id: 2, username: 'user2', text: 'Love this! 💛' }
        ],
        type: 'image' as const
      }));
    }

    // For category profiles, use category videos
    const videoPosts = generateCategoryPosts(profileName as CategoryKey);
    
    return videoPosts.map((post: {
      id: string;
      cloudflareId: string;
      user: { handle: string; avatarUrl: string };
      caption: string;
      likesCount: number;
      commentsCount: number;
      comments: Array<{ user: string; text: string }>;
    }, index: number) => ({
      id: index + 1,
      username: post.user.handle,
      userAvatar: post.user.avatarUrl,
      timestamp: `${index + 1}h`,
      image: `https://videodelivery.net/${post.cloudflareId}/thumbnails/thumbnail.jpg?time=1s&height=720`,
      caption: post.caption,
      likes: post.likesCount,
      comments: post.commentsCount,
      isLiked: false,
      staticComments: post.comments.slice(0, 2).map((c: { user: string; text: string }, i: number) => ({
        id: i + 1,
        username: c.user,
        text: c.text
      })),
      type: 'video' as const,
      cloudflareId: post.cloudflareId
    }));
  };
  const posts = getPostsForProfile(selectedProfile);
  const getBioText = () => {
    if (selectedProfile === 'Agency') {
      return '🐝 Crafting Buzz. Driving Growth. • Digital Marketing Agency • Managed over 200 brands • Results that speak louder than words ✨';
    }
    
    switch (selectedProfile) {
      case 'Beauty clinics':
        return '💄 Beauty clinic marketing specialists • Creating stunning content that converts • Making clinics glow ✨🐝';
      case 'Content creation':
        return '🎬 Content creation experts • Behind-the-scenes magic • Teaching creators to succeed 🐝';
      case 'Real Estate':
        return '🏡 Real estate marketing pros • Connecting properties with perfect buyers • Premium listings 🐝';
      case 'Restaurants and FnB':
        return '🍽️ Restaurant marketing specialists • Driving foot traffic & online orders • Taste the success 🐝';
      case 'Ecommerce':
        return '🛒 E-commerce growth specialists • Turning browsers into buyers • ROI-focused strategies 🐝';
      case 'Network operators':
        return '📡 Network & telecom marketing • Connecting communities • Building digital infrastructure 🐝';
      default:
        return '🐝 Crafting Buzz. Driving Growth. • Digital Marketing Agency • Results that speak louder than words ✨';
    }
  };
  const handleContactClick = () => {
    if (onNavigateToContact) {
      onNavigateToContact();
    }
  };
  const handlePostClick = (post: {
    id: number;
    type: 'video' | 'image';
    cloudflareId?: string;
    image: string;
  }, index: number) => {
    if (post.type === 'video') {
      setSelectedReelIndex(index);
      setShowReelsViewer(true);
    } else {
      setSelectedPostIndex(index);
      setShowPostsFeed(true);
    }
  };

  // Get video posts for ReelsViewer
  const getVideoPosts = () => {
    return posts.filter(post => post.type === 'video').map(post => ({
      id: post.id,
      title: post.caption,
      description: post.caption,
      thumbnail: post.image,
      videoUrl: post.cloudflareId || post.image,
      likes: post.likes,
      comments: post.comments,
      shares: Math.floor(Math.random() * 100) + 10,
      user: post.username,
      avatar: post.userAvatar,
      audioTitle: 'Original audio'
    }));
  };
  const handleLike = (postId: number) => {
    // Handle like functionality if needed
  };

  // Single active item control for profile grid
  useEffect(() => {
    if (!gridRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
            const gridItems = Array.from(gridRef.current?.children || []);
            const index = gridItems.indexOf(entry.target);
            if (index !== -1 && index !== activeIndex) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        threshold: 0.7,
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    const gridItems = Array.from(gridRef.current.children);
    gridItems.forEach((item) => {
      observer.observe(item);
    });

    return () => observer.disconnect();
  }, [posts.length, activeIndex]);

  // Handle outside click for recommendations dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowRecommendationsDropdown(false);
      }
    };

    if (showRecommendationsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRecommendationsDropdown]);
  return <div className="max-w-md mx-auto">
      {/* Profile Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="relative">
            <button onClick={() => setShowProfileSelector(!showProfileSelector)} className="flex items-center space-x-2 text-lg font-semibold">
              <div className="flex items-center">
                <span>socialhive.{selectedProfile.toLowerCase().replace(/\s+/g, '')}</span>
                <VerificationBadge username={`socialhive.${selectedProfile.toLowerCase().replace(/\s+/g, '')}`} />
              </div>
              <ChevronDown size={16} />
            </button>
            
            {/* Profile Selector Dropdown */}
            {showProfileSelector && <div className="absolute top-full left-0 mt-2 bg-gray-900 rounded-lg shadow-lg z-10 min-w-48">
                {profileOptions.map(profile => <button key={profile.id} onClick={() => {
              setSelectedProfile(profile.name);
              setShowProfileSelector(false);
              // Update URL for deep linking
              window.history.pushState({}, '', `/profiles/${profile.id}`);
            }} className="w-full text-left px-4 py-3 hover:bg-gray-800 first:rounded-t-lg last:rounded-b-lg">
                    <div className="flex items-center">
                      <div className="font-medium">socialhive.{profile.name.toLowerCase().replace(/\s+/g, '')}</div>
                      <VerificationBadge username={`socialhive.${profile.name.toLowerCase().replace(/\s+/g, '')}`} />
                    </div>
                    <div className="text-sm text-gray-400">{profile.followersDisplay} followers</div>
                  </button>)}
              </div>}
          </div>
        </div>

        <div className="flex items-start space-x-4 mb-4">
          <div className="w-20 h-20 rounded-full overflow-hidden">
            <img src="/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png" alt="Social Hive Logo" className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1">
            <div className="flex space-x-8 mb-3">
              <div className="text-center">
                <div className="font-semibold">{postsCount}</div>
                <div className="text-gray-400 text-sm">posts</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{formatNumber(followersCount)}</div>
                <div className="text-gray-400 text-sm">followers</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{followingCount.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">following</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-4">
          <h2 className="font-semibold mb-1">Social Hive Agency</h2>
          <p className="text-sm text-gray-300">{getBioText()}</p>
          <a href="#" className="text-yellow-400 text-sm">socialhive.agency</a>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mb-6 relative">
          <button onClick={() => setShowProfileSelector(!showProfileSelector)} className="flex-1 bg-yellow-400 text-black font-semibold py-2 rounded-md transition-all duration-300 hover:scale-105 hover:bg-yellow-300 active:scale-95 animate-move hover:animate-none">
            Switch Accounts
          </button>
          <button onClick={handleContactClick} className="flex-1 text-white font-semibold py-2 rounded-md bg-[#25D366] hover:bg-[#20b858] flex items-center justify-center gap-1">
            <WhatsAppIcon size={16} />
            Message
          </button>
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowRecommendationsDropdown(!showRecommendationsDropdown)}
              className="bg-gray-800 text-white p-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              <ChevronDown size={20} />
            </button>
            
            {/* Recommendations Dropdown */}
            {showRecommendationsDropdown && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg z-20 border border-gray-700">
                <div className="p-4 text-center">
                  <p className="text-yellow-400 font-medium">No recommendations — only us!</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Highlights */}
        <div className="flex space-x-4 mb-6">
          {['Results', 'Team', 'Process', 'Clients'].map((highlight, index) => <div key={index} className="text-center">
              <div className="w-16 h-16 rounded-full bg-gray-800 mb-1"></div>
              <p className="text-xs text-gray-400">{highlight}</p>
            </div>)}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-t border-gray-800">
        <div className="flex">
          <button onClick={() => setActiveTab('posts')} className={`flex-1 py-3 flex items-center justify-center ${activeTab === 'posts' ? 'border-t-2 border-yellow-400' : ''}`}>
            <Grid size={20} />
          </button>
          <button onClick={() => setActiveTab('reels')} className={`flex-1 py-3 flex items-center justify-center ${activeTab === 'reels' ? 'border-t-2 border-yellow-400' : ''}`}>
            <Play size={20} />
          </button>
        </div>
      </div>

      <div ref={gridRef} className="grid grid-cols-3 gap-1">
        {posts.map((post, index) => <div key={post.id} className="aspect-square bg-gray-900 relative cursor-pointer group" onClick={() => handlePostClick(post, index)} onMouseEnter={() => setHoveredPostId(post.id)} onMouseLeave={() => setHoveredPostId(null)}>
            <img src={post.image} alt={`Post ${post.id}`} className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-80" />
            {post.type === 'video' && <div className="absolute top-2 right-2">
                <Play size={16} className="text-white" />
              </div>}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-center">
                <PostHoverStats likes={post.likes} comments={post.comments} isVisible={hoveredPostId === post.id} />
              </div>
            </div>
          </div>)}
      </div>

      {/* Posts Feed Modal */}
      {showPostsFeed && <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold">Posts</h2>
            <button onClick={() => setShowPostsFeed(false)} className="text-gray-400 hover:text-white p-2">
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-md mx-auto space-y-0">
              {posts.slice(selectedPostIndex).map(post => <PostCard key={post.id} post={post} onLike={() => handleLike(post.id)} onUsernameClick={() => {}} />)}
            </div>
          </div>
        </div>}

      {/* Reels Viewer */}
      {showReelsViewer && (
        <ReelsViewer
          reels={getVideoPosts()}
          initialIndex={selectedReelIndex}
          category={selectedProfile === 'Agency' ? 'Profile' : selectedProfile}
          onClose={() => setShowReelsViewer(false)}
        />
      )}
    </div>;
};
export default ProfilePage;