
import { useState } from 'react';
import { Grid, Play, Tag, Settings, ChevronDown } from 'lucide-react';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedProfile, setSelectedProfile] = useState('Agency');
  const [showProfileSelector, setShowProfileSelector] = useState(false);

  const profileOptions = [
    { id: 'agency', name: 'Agency', followers: '125K', posts: 847 },
    { id: 'restaurants', name: 'Restaurants', followers: '89K', posts: 342 },
    { id: 'beauty', name: 'Beauty', followers: '67K', posts: 256 },
    { id: 'clinics', name: 'Clinics', followers: '45K', posts: 189 },
    { id: 'ecommerce', name: 'E-Commerce', followers: '78K', posts: 298 },
    { id: 'realestate', name: 'Real Estate', followers: '34K', posts: 167 },
    { id: 'education', name: 'Education', followers: '23K', posts: 134 }
  ];

  const currentProfile = profileOptions.find(p => p.name === selectedProfile) || profileOptions[0];

  const posts = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    image: `https://images.unsplash.com/photo-${1649972904349 + i}`,
    type: i % 3 === 0 ? 'reel' : 'post'
  }));

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

  return (
    <div className="max-w-md mx-auto">
      {/* Profile Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="relative">
            <button
              onClick={() => setShowProfileSelector(!showProfileSelector)}
              className="flex items-center space-x-2 text-lg font-semibold"
            >
              <span>socialhive.{selectedProfile.toLowerCase()}</span>
              <ChevronDown size={16} />
            </button>
            
            {/* Profile Selector Dropdown */}
            {showProfileSelector && (
              <div className="absolute top-full left-0 mt-2 bg-gray-900 rounded-lg shadow-lg z-10 min-w-48">
                {profileOptions.map(profile => (
                  <button
                    key={profile.id}
                    onClick={() => {
                      setSelectedProfile(profile.name);
                      setShowProfileSelector(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-800 first:rounded-t-lg last:rounded-b-lg"
                  >
                    <div className="font-medium">socialhive.{profile.name.toLowerCase()}</div>
                    <div className="text-sm text-gray-400">{profile.followers} followers</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="text-gray-400 hover:text-white">
            <Settings size={24} />
          </button>
        </div>

        <div className="flex items-start space-x-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center">
            <span className="text-black text-3xl">🐝</span>
          </div>
          
          <div className="flex-1">
            <div className="flex space-x-8 mb-3">
              <div className="text-center">
                <div className="font-semibold">{currentProfile.posts}</div>
                <div className="text-gray-400 text-sm">posts</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{currentProfile.followers}</div>
                <div className="text-gray-400 text-sm">followers</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">1,247</div>
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
        <div className="flex space-x-2 mb-6">
          <button className="flex-1 bg-yellow-400 text-black font-semibold py-2 rounded-md">
            Get Quote
          </button>
          <button className="flex-1 bg-gray-800 text-white font-semibold py-2 rounded-md">
            Message
          </button>
          <button className="bg-gray-800 text-white p-2 rounded-md">
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Highlights */}
        <div className="flex space-x-4 mb-6">
          {['Results', 'Team', 'Process', 'Clients'].map((highlight, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 rounded-full bg-gray-800 mb-1"></div>
              <p className="text-xs text-gray-400">{highlight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-t border-gray-800">
        <div className="flex">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 flex items-center justify-center ${
              activeTab === 'posts' ? 'border-t-2 border-yellow-400' : ''
            }`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setActiveTab('reels')}
            className={`flex-1 py-3 flex items-center justify-center ${
              activeTab === 'reels' ? 'border-t-2 border-yellow-400' : ''
            }`}
          >
            <Play size={20} />
          </button>
          <button
            onClick={() => setActiveTab('tagged')}
            className={`flex-1 py-3 flex items-center justify-center ${
              activeTab === 'tagged' ? 'border-t-2 border-yellow-400' : ''
            }`}
          >
            <Tag size={20} />
          </button>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-3 gap-1">
        {posts.map(post => (
          <div key={post.id} className="aspect-square bg-gray-900 relative">
            <img
              src={post.image}
              alt={`Post ${post.id}`}
              className="w-full h-full object-cover"
            />
            {post.type === 'reel' && (
              <div className="absolute top-2 right-2">
                <Play size={16} className="text-white" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;
