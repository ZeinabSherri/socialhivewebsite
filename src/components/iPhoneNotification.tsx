
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
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
      {/* Notification banner - positioned as overlay */}
      <div className="flex justify-center pt-2 px-4">
        <div 
          className={`
            relative pointer-events-auto
            bg-gradient-to-b from-white/95 via-gray-50/95 to-gray-100/95
            backdrop-blur-sm
            rounded-full shadow-lg
            border border-gray-200/50
            px-6 py-3
            max-w-xs w-auto mx-4
            transition-all duration-300 ease-out
            ${isEntering ? 'opacity-0 transform -translate-y-full' : 'opacity-100 transform translate-y-0'}
            ${isAnimating ? 'opacity-0 transform -translate-y-full' : ''}
          `}
          style={{
            boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
        >
          {/* Notification content */}
          <div className="flex items-center justify-center">
            <p className="text-gray-800 text-sm font-medium text-center whitespace-nowrap">
              {message}
            </p>
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
