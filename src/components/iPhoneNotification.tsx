
import { useState, useEffect } from "react";
import { X } from "lucide-react";

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
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Blurred background overlay */}
      <div className={`
        absolute inset-0 backdrop-blur-sm transition-opacity duration-300
        ${isEntering ? 'opacity-0' : 'opacity-100'}
        ${isAnimating ? 'opacity-0' : ''}
      `} />
      
      {/* Notification banner */}
      <div className="flex justify-center pt-4 px-4">
        <div 
          className={`
            relative pointer-events-auto
            bg-gradient-to-br from-gray-800/90 via-gray-900/95 to-black/90
            backdrop-blur-xl
            rounded-2xl shadow-2xl
            border border-white/10
            max-w-sm w-full mx-4
            transition-all duration-300 ease-out
            ${isEntering ? 'opacity-0 transform -translate-y-4 scale-95' : 'opacity-100 transform translate-y-0 scale-100'}
            ${isAnimating ? 'opacity-0 transform -translate-y-4 scale-95' : ''}
          `}
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* Notification content */}
          <div className="px-4 py-3 flex items-center space-x-3">
            {/* App icon */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">SH</span>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-white font-medium text-sm truncate">
                  Social Hive
                </p>
                <span className="text-white/60 text-xs ml-2">now</span>
              </div>
              <p className="text-white/90 text-sm mt-0.5 leading-tight">
                {message}
              </p>
            </div>
          </div>
          
          {/* Bottom handle/indicator */}
          <div className="flex justify-center pb-2">
            <div className="w-8 h-1 bg-white/20 rounded-full" />
          </div>
          
          {/* Dismiss button (invisible but clickable) */}
          <button
            onClick={handleDismiss}
            className="absolute inset-0 w-full h-full bg-transparent"
            aria-label="Dismiss notification"
          />
        </div>
      </div>
    </div>
  );
};
