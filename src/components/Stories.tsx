
import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Story {
  id: number;
  title: string;
  image: string;
  content: string;
  timestamp: string;
}

const Stories = () => {
  const [selectedStory, setSelectedStory] = useState<number | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const storyDuration = 5000; // 5 seconds per story

  const stories: Story[] = [
    {
      id: 1,
      title: 'Your story',
      image: '/lovable-uploads/social-hive-logo.png',
      content: '🐝 Welcome to Social Hive! Ready to create buzz for your brand?',
      timestamp: '2h'
    },
    {
      id: 2,
      title: 'About Us',
      image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81',
      content: '✨ Meet our creative team! These amazing minds work tirelessly to bring your brand vision to life.',
      timestamp: '4h'
    },
    {
      id: 3,
      title: 'Partners',
      image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
      content: '🚀 Our latest projects showcase innovative digital marketing strategies across various industries.',
      timestamp: '6h'
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
    if (selectedStory && !isPaused) {
      startTimer();
    }

    return () => {
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, [selectedStory, currentStoryIndex, isPaused]);

  const openStory = (index: number) => {
    setSelectedStory(stories[index].id);
    setCurrentStoryIndex(index);
    setProgress(0);
    setIsPaused(false);
  };

  const closeStory = () => {
    setSelectedStory(null);
    setProgress(0);
    if (progressRef.current) {
      clearInterval(progressRef.current);
    }
  };

  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      const nextIndex = currentStoryIndex + 1;
      setCurrentStoryIndex(nextIndex);
      setSelectedStory(stories[nextIndex].id);
      setProgress(0);
    } else {
      closeStory();
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      const prevIndex = currentStoryIndex - 1;
      setCurrentStoryIndex(prevIndex);
      setSelectedStory(stories[prevIndex].id);
      setProgress(0);
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

  const currentStory = stories[currentStoryIndex];

  return (
    <>
      {/* Stories Row */}
      <div className="px-4 py-3 border-b border-gray-800">
        <div className="flex space-x-4 overflow-x-auto">
          {stories.map((story, index) => (
            <div 
              key={story.id} 
              className="flex-shrink-0 text-center cursor-pointer"
              onClick={() => openStory(index)}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600 p-0.5 hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-black overflow-hidden">
                  {index === 0 ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl">🐝</span>
                    </div>
                  ) : (
                    <img 
                      src={story.image} 
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
              <p className="text-xs mt-1 text-gray-300">{story.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full max-w-md h-full max-h-screen bg-black">
            {/* Story Progress Bars */}
            <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
              {stories.map((_, index) => (
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
                    {currentStoryIndex === 0 ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-sm">🐝</span>
                      </div>
                    ) : (
                      <img 
                        src={currentStory?.image} 
                        alt={currentStory?.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{currentStory?.title}</p>
                  <p className="text-gray-300 text-xs">{currentStory?.timestamp}</p>
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
                  backgroundImage: `url(${currentStory?.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-30" />
              </div>
              
              {/* Story Text */}
              <div className="absolute bottom-20 left-4 right-4">
                <p className="text-white text-lg font-medium">
                  {currentStory?.content}
                </p>
              </div>

              {/* Navigation Areas */}
              <button 
                onClick={prevStory}
                className="absolute left-0 top-0 w-1/3 h-full bg-transparent"
                disabled={currentStoryIndex === 0}
              />
              <button 
                onClick={nextStory}
                className="absolute right-0 top-0 w-1/3 h-full bg-transparent"
              />

              {/* Navigation Arrows (visible on hover) */}
              {currentStoryIndex > 0 && (
                <button 
                  onClick={prevStory}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white opacity-50 hover:opacity-100"
                >
                  <ChevronLeft size={32} />
                </button>
              )}
              {currentStoryIndex < stories.length - 1 && (
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
