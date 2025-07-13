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
  const handleDismiss = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300);
  };
  if (!isVisible) return null;
  return <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none px-4">
      <div className={`
          bg-white/95 backdrop-blur-md
          rounded-2xl shadow-2xl shadow-black/30
          w-72 mx-4 pointer-events-auto
          transition-all duration-300 ease-out
          ${isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}
        `} style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segmented UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
        <div className="px-6 pt-6 pb-4 text-center bg-black rounded-t-2xl">
          <h2 className="text-lg font-semibold mb-2 text-white">
            Notification
          </h2>
          <p className="text-sm leading-relaxed text-white">
            {message}
          </p>
        </div>
        
        <div className="border-t border-gray-200">
          <button onClick={handleDismiss} className="w-full py-4 transition-colors duration-200 bg-black text-[ebde01] font-normal text-[#ebde01] rounded-b-2xl">
            OK
          </button>
        </div>
      </div>
    </div>;
};