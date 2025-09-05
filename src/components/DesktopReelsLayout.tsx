import React, { forwardRef } from 'react';
import ReelVideo from './ReelVideo';
import ReelActionRail from './ReelActionRail';

interface DesktopReelsLayoutProps {
  reels: any[];
  currentIndex: number;
  activeReels: Set<number>;
  likedReels: Set<number>;
  globalMuted: boolean;
  handleLike: (id: number) => void;
  handleMuteToggle: () => void;
  navigate: (direction: 'prev' | 'next') => void;
}

const DesktopReelsLayout = forwardRef<HTMLDivElement, DesktopReelsLayoutProps>(
  ({ 
    reels, 
    currentIndex, 
    activeReels, 
    likedReels, 
    globalMuted, 
    handleLike, 
    handleMuteToggle, 
    navigate 
  }, ref) => {
    
    return (
      <div className="hidden lg:block">
        <div className="relative flex">
          {/* Center scroll container */}
          <div 
            ref={ref}
            className="flex-1 overflow-y-auto snap-y snap-mandatory scrollbar-hidden bg-transparent"
            style={{ 
              height: 'calc(100vh - 0px)',
              WebkitOverflowScrolling: 'touch'
            }}
            onWheel={(e) => {
              e.preventDefault();
              const direction = e.deltaY > 0 ? 'next' : 'prev';
              navigate(direction);
            }}
          >
            {reels.map((reel, index) => (
              <div 
                key={reel.id} 
                className="snap-start snap-always flex justify-center items-center bg-transparent"
                style={{ minHeight: '100vh' }}
                data-reel-index={index}
              >
                {/* Video Stage - Ensure non-zero dimensions */}
                <div 
                  className="relative bg-transparent"
                  style={{
                    width: 'clamp(420px, 32vw, 620px)',
                    aspectRatio: '9 / 16',
                    maxHeight: '86vh',
                    minWidth: '420px', // Force minimum width
                    minHeight: '620px' // Force minimum height  
                  }}
                >
                  <ReelVideo
                    reel={reel}
                    isActive={activeReels.has(index)}
                    height={0} // Height controlled by aspect ratio
                    onLike={handleLike}
                    isLiked={likedReels.has(reel.id)}
                    globalMuted={globalMuted}
                    onMuteToggle={handleMuteToggle}
                    layout="desktop-mobile-like"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Action Rail - Sticky beside the center */}
          <div 
            className="fixed z-20"
            style={{
              left: 'calc(50% + clamp(420px, 32vw, 620px) / 2 + 20px)',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            {reels.length > 0 && (
              <ReelActionRail
                likes={reels[currentIndex].likes}
                comments={reels[currentIndex].comments}
                shares={reels[currentIndex].shares || 0}
                isLiked={likedReels.has(reels[currentIndex].id)}
                onLike={() => handleLike(reels[currentIndex].id)}
                avatar={reels[currentIndex].avatar}
                user={reels[currentIndex].user}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
);

DesktopReelsLayout.displayName = 'DesktopReelsLayout';

export default DesktopReelsLayout;