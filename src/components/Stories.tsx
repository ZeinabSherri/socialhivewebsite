
import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Story {
  id: number;
  image: string;
  content: string;
  timestamp: string;
}

interface User {
  id: number;
  username: string;
  avatar: string;
  stories: Story[];
  isYourStory?: boolean;
}

const Stories = () => {
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const storyDuration = 5000; // 5 seconds per story

  const users: User[] = [
    {
      id: 1,
      username: 'Your story',
      avatar: '/lovable-uploads/social-hive-logo.png',
      isYourStory: true,
      stories: [
        {
          id: 1,
          image: '/lovable-uploads/social-hive-logo.png',
          content: '🐝 Welcome to Social Hive! Ready to create buzz for your brand?',
          timestamp: '2h'
        },
        {
          id: 2,
          image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71',
          content: '✨ Just posted our latest campaign! What do you think?',
          timestamp: '1h'
        }
      ]
    },
    {
      id: 2,
      username: 'Creative Team',
      avatar: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81',
      stories: [
        {
          id: 3,
          image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81',
          content: '✨ Meet our creative team! These amazing minds work tirelessly to bring your brand vision to life.',
          timestamp: '4h'
        },
        {
          id: 4,
          image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
          content: '🎨 Behind the scenes of our latest design session!',
          timestamp: '3h'
        },
        {
          id: 5,
          image: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d',
          content: '💡 Brainstorming innovative solutions for our clients.',
          timestamp: '2h'
        }
      ]
    },
    {
      id: 3,
      username: 'Partners',
      avatar: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
      stories: [
        {
          id: 6,
          image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
          content: '🚀 Our latest projects showcase innovative digital marketing strategies across various industries.',
          timestamp: '6h'
        },
        {
          id: 7,
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
          content: '📈 Incredible growth results from our recent campaigns!',
          timestamp: '5h'
        }
      ]
    }
  ];

  const startTimer = () => {
    setProgress(0);
    
    progressRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + (100 / (storyDuration / 100));
      });
    }, 100);
  };

  const pauseTimer = () => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
    }
  };

  const resumeTimer = () => {
    if (!isPaused) {
      progressRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            nextStory();
            return 0;
          }
          return prev + (100 / (storyDuration / 100));
        });
      }, 100);
    }
  };

  useEffect(() => {
    if (selectedUserIndex !== null && !isPaused) {
      startTimer();
    }

    return () => {
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, [selectedUserIndex, currentStoryIndex, isPaused]);

  const openUserStories = (userIndex: number) => {
    setSelectedUserIndex(userIndex);
    setCurrentStoryIndex(0);
    setProgress(0);
    setIsPaused(false);
  };

  const closeStory = () => {
    setSelectedUserIndex(null);
    setCurrentStoryIndex(0);
    setProgress(0);
    if (progressRef.current) {
      clearInterval(progressRef.current);
    }
  };

  const nextStory = () => {
    if (selectedUserIndex === null) return;
    
    const currentUser = users[selectedUserIndex];
    
    if (currentStoryIndex < currentUser.stories.length - 1) {
      // Next story in current user's collection
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    } else {
      // Move to next user's stories
      if (selectedUserIndex < users.length - 1) {
        setSelectedUserIndex(prev => prev! + 1);
        setCurrentStoryIndex(0);
        setProgress(0);
      } else {
        // Last user, last story - close
        closeStory();
      }
    }
  };

  const prevStory = () => {
    if (selectedUserIndex === null) return;
    
    if (currentStoryIndex > 0) {
      // Previous story in current user's collection
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
    } else {
      // Move to previous user's stories (last story of previous user)
      if (selectedUserIndex > 0) {
        const prevUserIndex = selectedUserIndex - 1;
        const prevUser = users[prevUserIndex];
        setSelectedUserIndex(prevUserIndex);
        setCurrentStoryIndex(prevUser.stories.length - 1);
        setProgress(0);
      }
    }
  };

  const handleMouseDown = () => {
    setIsPaused(true);
    pauseTimer();
  };

  const handleMouseUp = () => {
    setIsPaused(false);
    resumeTimer();
  };

  const currentUser = selectedUserIndex !== null ? users[selectedUserIndex] : null;
  const currentStory = currentUser ? currentUser.stories[currentStoryIndex] : null;

  return (
    <>
      {/* Stories Row */}
      <div className="px-4 py-3 border-b border-gray-800">
        <div className="flex space-x-4 overflow-x-auto">
          {users.map((user, index) => (
            <div 
              key={user.id} 
              className="flex-shrink-0 text-center cursor-pointer"
              onClick={() => openUserStories(index)}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600 p-0.5 hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-black overflow-hidden">
                  {user.isYourStory ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl">🐝</span>
                    </div>
                  ) : (
                    <img 
                      src={user.avatar} 
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
              <p className="text-xs mt-1 text-gray-300">{user.username}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {selectedUserIndex !== null && currentUser && currentStory && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full max-w-md h-full max-h-screen bg-black">
            {/* Story Progress Bars - Only for current user's stories */}
            <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
              {currentUser.stories.map((_, index) => (
                <div 
                  key={index}
                  className="flex-1 h-0.5 rounded-full bg-gray-600 overflow-hidden"
                >
                  <div 
                    className={`h-full bg-white transition-all duration-75 ease-linear ${
                      index < currentStoryIndex 
                        ? 'w-full' 
                        : index === currentStoryIndex 
                        ? '' 
                        : 'w-0'
                    }`}
                    style={
                      index === currentStoryIndex 
                        ? { width: `${progress}%` } 
                        : {}
                    }
                  />
                </div>
              ))}
            </div>

            {/* Story Header */}
            <div className="absolute top-12 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600 p-0.5">
                  <div className="w-full h-full rounded-full bg-black overflow-hidden">
                    {currentUser.isYourStory ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-sm">🐝</span>
                      </div>
                    ) : (
                      <img 
                        src={currentUser.avatar} 
                        alt={currentUser.username}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{currentUser.username}</p>
                  <p className="text-gray-300 text-xs">{currentStory.timestamp}</p>
                </div>
              </div>
              <button 
                onClick={closeStory}
                className="text-white hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            {/* Story Content */}
            <div 
              className="w-full h-full flex items-center justify-center relative"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
            >
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${currentStory.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-30" />
              </div>
              
              {/* Story Text */}
              <div className="absolute bottom-20 left-4 right-4">
                <p className="text-white text-lg font-medium">
                  {currentStory.content}
                </p>
              </div>

              {/* Navigation Areas */}
              <button 
                onClick={prevStory}
                className="absolute left-0 top-0 w-1/3 h-full bg-transparent"
                disabled={selectedUserIndex === 0 && currentStoryIndex === 0}
              />
              <button 
                onClick={nextStory}
                className="absolute right-0 top-0 w-1/3 h-full bg-transparent"
              />

              {/* Navigation Arrows (visible on hover) */}
              {(selectedUserIndex > 0 || currentStoryIndex > 0) && (
                <button 
                  onClick={prevStory}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white opacity-50 hover:opacity-100"
                >
                  <ChevronLeft size={32} />
                </button>
              )}
              {(selectedUserIndex < users.length - 1 || currentStoryIndex < currentUser.stories.length - 1) && (
                <button 
                  onClick={nextStory}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white opacity-50 hover:opacity-100"
                >
                  <ChevronRight size={32} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Stories;
