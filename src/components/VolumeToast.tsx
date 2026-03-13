import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

interface VolumeToastProps {
  isMuted: boolean;
  isVisible: boolean;
}

const VolumeToast = ({ isMuted, isVisible }: VolumeToastProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-black/70 rounded-full px-4 py-3 flex items-center space-x-2">
            {isMuted ? (
              <VolumeX size={24} className="text-white" />
            ) : (
              <Volume2 size={24} className="text-white" />
            )}
            <span className="text-white text-sm font-medium">
              {isMuted ? 'Muted' : 'Unmuted'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VolumeToast;