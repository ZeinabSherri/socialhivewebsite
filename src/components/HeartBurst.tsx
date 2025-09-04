import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface HeartBurstProps {
  onComplete?: () => void;
}

const HeartBurst = ({ onComplete }: HeartBurstProps) => {
  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={onComplete}
    >
      <motion.div
        initial={{ scale: 0, rotate: -12 }}
        animate={{ 
          scale: [0, 1.2, 1], 
          rotate: [0, 8, 0],
          opacity: [1, 1, 0.8, 0]
        }}
        transition={{ 
          duration: 0.8,
          times: [0, 0.15, 0.3, 1],
          ease: "easeOut"
        }}
      >
        <Heart
          size={88}
          className="text-red-500 fill-red-500 drop-shadow-2xl"
          strokeWidth={0}
        />
      </motion.div>
    </motion.div>
  );
};

export default HeartBurst;