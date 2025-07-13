import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface IPhoneNotificationProps {
  message: string;
  onDismiss?: () => void;
}

export const IPhoneNotification = ({ message, onDismiss }: IPhoneNotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleDismiss = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
      <div 
        className={`
          bg-white/95 backdrop-blur-md border border-black/10 
          rounded-2xl px-4 py-3 shadow-lg shadow-black/20
          max-w-sm w-full mx-4 pointer-events-auto
          flex items-center justify-between gap-3
          transition-all duration-300 ease-out
          ${isAnimating ? 'opacity-0 transform translate-y-[-20px]' : 'opacity-100 transform translate-y-0'}
        `}
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segmented UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-black leading-tight">
              {message}
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="w-6 h-6 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors duration-200"
        >
          <X className="w-3 h-3 text-black/60" />
        </button>
      </div>
    </div>
  );
};