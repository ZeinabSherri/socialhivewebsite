
import { useState, useEffect } from "react";

interface IPhoneNotificationProps {
  message: string;
  onDismiss?: () => void;
}

export const IPhoneNotification = ({
  message,
  onDismiss
}: IPhoneNotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  
  useEffect(() => {
    // Start entrance animation
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 100);
    
    // Auto dismiss after 10 seconds
    const autoDismissTimer = setTimeout(() => {
      handleDismiss();
    }, 10000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(autoDismissTimer);
    };
  }, []);

  const handleDismiss = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
      {/* Notification banner */}
      <div className="pt-3 px-4">
        <div 
          className={`
            relative pointer-events-auto
            bg-gray-800/95 backdrop-blur-md
            rounded-2xl shadow-2xl
            px-4 py-3
            w-full
            transition-all duration-300 ease-out
            ${isEntering ? 'opacity-0 transform -translate-y-full' : 'opacity-100 transform translate-y-0'}
            ${isAnimating ? 'opacity-0 transform -translate-y-full' : ''}
          `}
          style={{
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Notification content */}
          <div className="flex items-start space-x-3">
            {/* App logo */}
            <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
              <img 
                src="/images/socialhive.png" 
                alt="Social Hive" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold text-sm">Social Hive</p>
                <span className="text-gray-300 text-xs">now</span>
              </div>
              <p className="text-gray-200 text-sm mt-0.5 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
          
          {/* Dismiss button (invisible but clickable) */}
          <button
            onClick={handleDismiss}
            className="absolute inset-0 w-full h-full bg-transparent rounded-2xl"
            aria-label="Dismiss notification"
          />
        </div>
      </div>
    </div>
  );
};
