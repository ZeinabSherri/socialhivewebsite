
import { useState } from 'react';
import { Home, Search, Plus, User } from 'lucide-react';
import HomeFeed from '../components/HomeFeed';
import ExplorePage from '../components/ExplorePage';
import ReelsPage from '../components/ReelsPage';
import ProfilePage from '../components/ProfilePage';
import AddPostPage from '../components/AddPostPage';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showAddPage, setShowAddPage] = useState(false);

  const renderContent = () => {
    if (showAddPage) {
      return <AddPostPage onBack={() => setShowAddPage(false)} />;
    }

    switch (activeTab) {
      case 'home':
        return <HomeFeed />;
      case 'explore':
        return <ExplorePage />;
      case 'reels':
        return <ReelsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomeFeed />;
    }
  };

  const handleAddClick = () => {
    setShowAddPage(true);
  };

  // Official Instagram-style Reels icon component
  const ReelsIcon = ({ size = 24, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="6" stroke="currentColor" strokeWidth="2"/>
      <polygon points="10,8 16,12 10,16" fill="currentColor"/>
    </svg>
  );

  // Don't show header and bottom nav when on add page
  if (showAddPage) {
    return (
      <div className="min-h-screen bg-black text-white">
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black border-b border-gray-800 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-yellow-400">Social Hive</h1>
          <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-black text-sm">🐝</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-16">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 px-4 py-2">
        <div className="max-w-md mx-auto flex justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`p-3 rounded-lg transition-colors ${
              activeTab === 'home' ? 'text-yellow-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Home size={24} />
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`p-3 rounded-lg transition-colors ${
              activeTab === 'explore' ? 'text-yellow-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Search size={24} />
          </button>
          <button
            onClick={handleAddClick}
            className="p-3 rounded-lg text-gray-400 hover:text-yellow-400 transition-colors"
          >
            <Plus size={24} />
          </button>
          <button
            onClick={() => setActiveTab('reels')}
            className={`p-3 rounded-lg transition-colors ${
              activeTab === 'reels' ? 'text-yellow-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ReelsIcon size={24} />
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`p-3 rounded-lg transition-colors ${
              activeTab === 'profile' ? 'text-yellow-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <User size={24} />
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Index;
