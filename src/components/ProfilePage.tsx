import { useState } from 'react';
import { Grid, Play, Tag, Settings, ChevronDown, X } from 'lucide-react';
import VerificationBadge from './VerificationBadge';
import PostCard from './PostCard';
import PostHoverStats from './PostHoverStats';
import { useCounterAnimation } from '../hooks/useCounterAnimation';
interface ProfilePageProps {
  onNavigateToContact?: () => void;
}
const ProfilePage = ({
  onNavigateToContact
}: ProfilePageProps) => {
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedProfile, setSelectedProfile] = useState('Agency');
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [showPostsFeed, setShowPostsFeed] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState(0);
  const [hoveredPostId, setHoveredPostId] = useState<number | null>(null);
  const profileOptions = [{
    id: 'agency',
    name: 'Agency',
    followers: 125000,
    followersDisplay: '125K',
    posts: 12
  }, {
    id: 'restaurants',
    name: 'Restaurants',
    followers: 89000,
    followersDisplay: '89K',
    posts: 9
  }, {
    id: 'beauty',
    name: 'Beauty',
    followers: 67000,
    followersDisplay: '67K',
    posts: 9
  }, {
    id: 'clinics',
    name: 'Clinics',
    followers: 45000,
    followersDisplay: '45K',
    posts: 9
  }, {
    id: 'ecommerce',
    name: 'E-Commerce',
    followers: 78000,
    followersDisplay: '78K',
    posts: 9
  }, {
    id: 'realestate',
    name: 'Real Estate',
    followers: 34000,
    followersDisplay: '34K',
    posts: 9
  }, {
    id: 'education',
    name: 'Education',
    followers: 23000,
    followersDisplay: '23K',
    posts: 9
  }];
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

  // Generate posts based on selected profile
  const getPostsForProfile = (profileName: string) => {
    const baseImages = ['https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1553484771-371a605b060b?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1517292987719-0369a794ec0f?auto=format&fit=crop&w=800&q=80'];
    const profileConfigs = {
      agency: {
        captions: ['🐝 Crafting digital experiences that drive results', 'Building brands that buzz with authenticity', 'Your growth is our mission. Let\'s make it happen!', 'Innovative strategies for modern businesses', 'Transforming ideas into digital success stories']
      },
      restaurants: {
        captions: ['🍽️ Bringing food lovers to your table', 'Delicious content that drives foot traffic', 'Making every dish Instagram-worthy', 'From menu to marketing - we\'ve got you covered', 'Taste the difference digital marketing makes']
      },
      beauty: {
        captions: ['💄 Beauty brands that glow online', 'Making every product launch picture-perfect', 'Your beauty deserves to be seen', 'Stunning visuals for stunning products', 'Confidence in every campaign']
      },
      clinics: {
        captions: ['🏥 Building trust through digital presence', 'Healthcare marketing with heart', 'Connecting patients with quality care', 'Professional, compassionate, effective', 'Your health, our digital expertise']
      },
      'e-commerce': {
        captions: ['🛒 Turning browsers into loyal customers', 'E-commerce strategies that convert', 'Shopping experiences that wow', 'From cart to checkout - we optimize it all', 'Digital storefronts that drive sales']
      },
      'real estate': {
        captions: ['🏡 Connecting homes with hearts', 'Property marketing that moves', 'Every listing tells a story', 'Premium properties, premium marketing', 'Making dream homes a reality']
      },
      education: {
        captions: ['📚 Knowledge that reaches further', 'Educational marketing that inspires', 'Learning experiences that engage', 'Empowering minds through digital reach', 'Education meets innovation']
      }
    };
    const config = profileConfigs[profileName.toLowerCase() as keyof typeof profileConfigs] || profileConfigs.agency;
    return Array.from({
      length: 12
    }, (_, i) => ({
      id: i + 1,
      username: `socialhive.${profileName.toLowerCase()}`,
      userAvatar: '/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png',
      timestamp: `${i + 1}h`,
      image: baseImages[i % baseImages.length],
      caption: config.captions[i % config.captions.length],
      likes: Math.floor(Math.random() * 1000) + 100,
      comments: Math.floor(Math.random() * 50) + 5,
      isLiked: false,
      staticComments: [{
        id: 1,
        username: 'user1',
        text: 'Amazing work! 🔥'
      }, {
        id: 2,
        username: 'user2',
        text: 'Love this! 💛'
      }],
      type: i % 3 === 0 ? 'reel' : 'post'
    }));
  };
  const posts = getPostsForProfile(selectedProfile);
  const getBioText = () => {
    switch (selectedProfile.toLowerCase()) {
      case 'restaurants':
        return '🍽️ Crafting delicious digital experiences for restaurants • Driving foot traffic & online orders • 200+ restaurants served 🐝';
      case 'beauty':
        return '💄 Beauty brand marketing specialists • Creating stunning content that converts • Making brands glow ✨🐝';
      case 'clinics':
        return '🏥 Healthcare marketing experts • Building trust through digital presence • Helping clinics grow 🐝';
      case 'e-commerce':
        return '🛒 E-commerce growth specialists • Turning browsers into buyers • ROI-focused strategies 🐝';
      case 'real estate':
        return '🏡 Real estate marketing pros • Connecting properties with perfect buyers • Premium listings 🐝';
      case 'education':
        return '📚 Educational marketing experts • Boosting enrollment & engagement • Learning made visible 🐝';
      default:
        return '🐝 Crafting Buzz. Driving Growth. • Digital Marketing Agency • Managed over 200 brands • Results that speak louder than words ✨';
    }
  };
  const handleContactClick = () => {
    if (onNavigateToContact) {
      onNavigateToContact();
    }
  };
  const handlePostClick = (index: number) => {
    setSelectedPostIndex(index);
    setShowPostsFeed(true);
  };
  const handleLike = (postId: number) => {
    // Handle like functionality if needed
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Profile Header */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          {/* Profile Picture */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-gray-700">
            <img 
              src="/lovable-uploads/28534233-055a-4890-b414-1429c0288a35.png" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">socialhive.{selectedProfile.toLowerCase()}</h1>
                <VerificationBadge />
              </div>
              
              {/* Profile Selector Button */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileSelector(!showProfileSelector)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-400/20 animate-bounce hover:animate-none"
                >
                  <span>Switch Accounts</span>
                  <ChevronDown size={16} className={`transition-transform ${showProfileSelector ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Selector Dropdown */}
                {showProfileSelector && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-lg border border-gray-700 z-50">
                    {profileOptions.map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => {
                          setSelectedProfile(profile.name);
                          setShowProfileSelector(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                          selectedProfile === profile.name ? 'bg-gray-700 text-yellow-400' : ''
                        }`}
                      >
                        <div className="font-medium">{profile.name}</div>
                        <div className="text-sm text-gray-400">{profile.followersDisplay} followers</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mb-4">
              <span><strong>{formatNumber(postsCount)}</strong> posts</span>
              <span><strong>{formatNumber(followersCount)}</strong> followers</span>
              <span><strong>{formatNumber(followingCount)}</strong> following</span>
            </div>

            {/* Bio */}
            <p className="text-sm text-gray-300 mb-4">
              {getBioText()}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={handleContactClick}
                className="px-6 py-2 bg-yellow-600 text-black font-medium rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Contact
              </button>
              <button className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                Following
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-gray-800">
          <div className="flex justify-center">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 px-6 py-4 border-t-2 transition-colors ${
                activeTab === 'posts' 
                  ? 'border-white text-white' 
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Grid size={16} />
              <span className="text-xs uppercase font-medium tracking-wide">Posts</span>
            </button>
            <button
              onClick={() => setActiveTab('reels')}
              className={`flex items-center gap-2 px-6 py-4 border-t-2 transition-colors ${
                activeTab === 'reels' 
                  ? 'border-white text-white' 
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Play size={16} />
              <span className="text-xs uppercase font-medium tracking-wide">Reels</span>
            </button>
            <button
              onClick={() => setActiveTab('tagged')}
              className={`flex items-center gap-2 px-6 py-4 border-t-2 transition-colors ${
                activeTab === 'tagged' 
                  ? 'border-white text-white' 
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Tag size={16} />
              <span className="text-xs uppercase font-medium tracking-wide">Tagged</span>
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="mt-6">
          {activeTab === 'posts' && (
            <div className="grid grid-cols-3 gap-1">
              {posts.slice(0, 9).map((post, index) => (
                <div 
                  key={post.id} 
                  className="aspect-square bg-gray-800 relative cursor-pointer group"
                  onClick={() => handlePostClick(index)}
                  onMouseEnter={() => setHoveredPostId(post.id)}
                  onMouseLeave={() => setHoveredPostId(null)}
                >
                  <img 
                    src={post.image} 
                    alt={`Post ${post.id}`} 
                    className="w-full h-full object-cover"
                  />
                  {post.type === 'reel' && (
                    <div className="absolute top-2 right-2">
                      <Play size={16} className="text-white" fill="white" />
                    </div>
                  )}
                  
                  {/* Hover Stats */}
                  {hoveredPostId === post.id && (
                    <PostHoverStats likes={post.likes} comments={post.comments} isVisible={hoveredPostId === post.id} />
                  )}
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'reels' && (
            <div className="grid grid-cols-3 gap-1">
              {posts.filter(post => post.type === 'reel').map((post, index) => (
                <div 
                  key={post.id} 
                  className="aspect-square bg-gray-800 relative cursor-pointer"
                  onClick={() => handlePostClick(index)}
                >
                  <img 
                    src={post.image} 
                    alt={`Reel ${post.id}`} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Play size={16} className="text-white" fill="white" />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play size={32} className="text-white" fill="white" />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'tagged' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Tag size={48} className="text-gray-600 mb-4" />
              <p className="text-gray-400">No tagged posts yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Posts Feed Modal */}
      {showPostsFeed && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full max-w-4xl max-h-full overflow-auto">
            <button
              onClick={() => setShowPostsFeed(false)}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300"
            >
              <X size={24} />
            </button>
            <PostCard 
              post={posts[selectedPostIndex]} 
              onLike={() => handleLike(posts[selectedPostIndex].id)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default ProfilePage;