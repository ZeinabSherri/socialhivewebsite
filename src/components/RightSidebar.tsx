import { Button } from './ui/button';

const RightSidebar = () => {
  const suggestedUsers = [
    {
      id: 1,
      username: 'creative_agency',
      avatar: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0',
      subtitle: 'Followed by team_lead + 3 more'
    },
    {
      id: 2,
      username: 'marketing_pro',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b6b372e1',
      subtitle: 'Followed by social_hive + 2 more'
    },
    {
      id: 3,
      username: 'design_studio',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      subtitle: 'Followed by creative_team + 1 more'
    },
    {
      id: 4,
      username: 'brand_expert',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
      subtitle: 'Popular'
    },
    {
      id: 5,
      username: 'social_growth',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
      subtitle: 'Suggested for you'
    }
  ];

  const footerLinks = [
    'About', 'Help', 'Press', 'API', 'Jobs', 'Privacy', 'Terms', 
    'Locations', 'Language', 'Meta Verified'
  ];

  return (
    <div className="fixed right-0 top-0 h-screen w-80 bg-black p-6 overflow-y-auto">
      {/* User Profile Summary */}
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600 p-0.5">
            <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center">
              <span className="text-xl">🐝</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold">socialhive_official</p>
            <p className="text-gray-400 text-sm">Social Hive</p>
          </div>
          <Button variant="ghost" size="sm" className="text-yellow-400 hover:text-yellow-300">
            Switch
          </Button>
        </div>
      </div>

      {/* Suggested for you */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-400 font-semibold">Suggested for you</h3>
          <Button variant="ghost" size="sm" className="text-white hover:text-gray-300 p-0">
            See All
          </Button>
        </div>
        
        <div className="space-y-3">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img 
                  src={user.avatar} 
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user.username}</p>
                <p className="text-gray-400 text-xs truncate">{user.subtitle}</p>
              </div>
              <Button variant="ghost" size="sm" className="text-yellow-400 hover:text-yellow-300 text-xs">
                Follow
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-auto">
        <div className="flex flex-wrap gap-1 mb-4">
          {footerLinks.map((link, index) => (
            <span key={link} className="text-gray-500 text-xs">
              {link}
              {index < footerLinks.length - 1 && ' · '}
            </span>
          ))}
        </div>
        <p className="text-gray-500 text-xs">© 2025 SOCIAL HIVE FROM META</p>
      </div>
    </div>
  );
};

export default RightSidebar;