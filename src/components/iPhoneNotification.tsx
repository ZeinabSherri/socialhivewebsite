
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
    
    // Auto dismiss after 3 seconds
    const autoDismissTimer = setTimeout(() => {
      handleDismiss();
    }, 3000);
    
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
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {/* Notification banner */}
      <div className="flex justify-center pt-3 px-4">
        <div 
          className={`
            relative pointer-events-auto
            bg-gradient-to-b from-gray-700/95 via-gray-800/95 to-gray-900/95
            backdrop-blur-lg
            rounded-full shadow-lg
            border border-white/10
            px-6 py-3
            max-w-xs w-auto
            transition-all duration-300 ease-out
            ${isEntering ? 'opacity-0 transform -translate-y-8' : 'opacity-100 transform translate-y-0'}
            ${isAnimating ? 'opacity-0 transform -translate-y-8' : ''}
          `}
          style={{
            boxShadow: '0 8px 25px -8px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)'
          }}
        >
          {/* Notification content */}
          <div className="flex items-center justify-center">
            <p className="text-white text-sm font-medium text-center whitespace-nowrap">
              {message}
            </p>
          </div>
          
          {/* Bottom handle/indicator */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="w-6 h-1 bg-white/30 rounded-full" />
          </div>
          
          {/* Dismiss button (invisible but clickable) */}
          <button
            onClick={handleDismiss}
            className="absolute inset-0 w-full h-full bg-transparent rounded-full"
            aria-label="Dismiss notification"
          />
        </div>
      </div>
    </div>
  );
};
