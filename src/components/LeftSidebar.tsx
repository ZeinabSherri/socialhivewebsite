import { Home, Search, Compass, Film, MessageCircle, Heart, Plus, User, Menu } from 'lucide-react';

interface LeftSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
  showAddPage: boolean;
}

const LeftSidebar = ({ activeTab, onTabChange, onAddClick, showAddPage }: LeftSidebarProps) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'reels', label: 'Reels', icon: Film },
    { id: 'create', label: 'Create', icon: Plus },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleItemClick = (itemId: string) => {
    if (itemId === 'create') {
      onAddClick();
    } else {
      onTabChange(itemId);
    }
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-black border-r border-gray-800 p-4 overflow-y-auto">
      {/* Logo */}
      <div className="mb-8 px-2">
        <h1 className="text-[#edbe01] font-extrabold text-2xl">
          <span className="font-extrabold text-white">Social </span>Hive
        </h1>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.id === 'create' ? showAddPage : activeTab === item.id;
          
          return (
            <button
              key={`${item.id}-${index}`}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center space-x-4 px-3 py-3 rounded-lg transition-colors text-left ${
                isActive 
                  ? 'text-yellow-400 bg-gray-900' 
                  : 'text-white hover:bg-gray-900 hover:text-yellow-400'
              }`}
            >
              <Icon size={24} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
        
        {/* More button */}
        <button className="w-full flex items-center space-x-4 px-3 py-3 rounded-lg transition-colors text-left text-white hover:bg-gray-900 hover:text-yellow-400">
          <Menu size={24} />
          <span className="font-medium">More</span>
        </button>
      </nav>
    </div>
  );
};

export default LeftSidebar;