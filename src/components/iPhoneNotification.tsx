
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
            bg-gradient-to-b from-gray-100/95 via-gray-50/95 to-white/95
            backdrop-blur-md
            rounded-2xl shadow-lg
            border border-gray-200/50
            px-6 py-4
            max-w-sm w-full mx-4
            transition-all duration-300 ease-out
            ${isEntering ? 'opacity-0 transform -translate-y-8' : 'opacity-100 transform translate-y-0'}
            ${isAnimating ? 'opacity-0 transform -translate-y-8' : ''}
          `}
          style={{
            boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Notification content */}
          <div className="flex items-center justify-center">
            <p className="text-gray-800 text-sm font-medium text-center">
              {message}
            </p>
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
