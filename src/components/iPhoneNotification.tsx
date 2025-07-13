import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface IPhoneNotificationProps {
  message: string;
  onDismiss?: () => void;
}

const iPhoneNotification = ({ message, onDismiss }: IPhoneNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [startY, setStartY] = useState(0);

  useEffect(() => {
    // Show notification after a brief delay
    const showTimer = setTimeout(() => setIsVisible(true), 500);
    
    // Auto-dismiss after 10 seconds
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, 10000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    
    // Only allow upward swipe
    if (deltaY < 0) {
      setDragY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // If dragged up more than 50px, dismiss
    if (dragY < -50) {
      handleDismiss();
    } else {
      // Snap back to original position
      setDragY(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const currentY = e.clientY;
    const deltaY = currentY - startY;
    
    // Only allow upward swipe
    if (deltaY < 0) {
      setDragY(deltaY);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // If dragged up more than 50px, dismiss
    if (dragY < -50) {
      handleDismiss();
    } else {
      // Snap back to original position
      setDragY(0);
    }
  };

  if (!isVisible && dragY === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none">
      <div
        className={`
          bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50
          max-w-sm w-full p-4 flex items-center space-x-3
          transition-all duration-300 ease-out pointer-events-auto
          ${isVisible ? 'transform translate-y-0 opacity-100' : 'transform -translate-y-full opacity-0'}
          ${isDragging ? 'transition-none' : ''}
        `}
        style={{
          transform: `translateY(${isVisible ? dragY : -100}px)`,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* App Icon */}
        <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center flex-shrink-0">
          <span className="text-black text-lg font-bold">🐝</span>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-white text-sm font-medium leading-tight">
            Social Hive
          </div>
          <div className="text-gray-300 text-sm leading-tight mt-0.5">
            {message}
          </div>
        </div>
        
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800/50"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default iPhoneNotification;