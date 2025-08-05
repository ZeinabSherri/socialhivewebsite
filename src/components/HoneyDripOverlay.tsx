import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface HoneyDripOverlayProps {
  className?: string;
}

export default function HoneyDripOverlay({ className = "" }: HoneyDripOverlayProps) {
  const prefersReducedMotion = useReducedMotion();

  const dripVariants = {
    animate: {
      pathLength: [0, 1, 1, 1],
      opacity: [0, 0.7, 0.7, 0],
      y: [0, 0, 0, 20],
    }
  };

  const dripTransition = {
    duration: 4,
    repeat: Infinity,
    ease: [0.4, 0, 0.2, 1] as any,
    times: [0, 0.3, 0.7, 1],
    delay: Math.random() * 2 // Random delay for natural effect
  };

  if (prefersReducedMotion) {
    return (
      <div className={`absolute top-0 right-2 pointer-events-none ${className}`}>
        <svg width="20" height="40" viewBox="0 0 20 40" className="opacity-60">
          <path
            d="M10 0 Q15 8 12 16 Q16 24 10 32 Q4 24 8 16 Q5 8 10 0"
            fill="#F6C35B"
            opacity="0.4"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`absolute top-0 right-2 pointer-events-none ${className}`}>
      <svg width="20" height="40" viewBox="0 0 20 40" className="overflow-visible">
        {/* Main honey drip */}
        <motion.path
          d="M10 0 Q15 8 12 16 Q16 24 10 32 Q4 24 8 16 Q5 8 10 0"
          fill="#F6C35B"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={dripVariants.animate}
          transition={dripTransition}
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(246, 195, 91, 0.3))',
          }}
        />
        
        {/* Secondary smaller drip */}
        <motion.circle
          cx="14"
          cy="35"
          r="2"
          fill="#F6C35B"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 1, 0],
            opacity: [0, 0.8, 0.8, 0],
            y: [0, 0, 0, 8]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: 1.5,
            ease: "easeInOut"
          }}
        />
        
        {/* Tiny honey droplets */}
        <motion.circle
          cx="6"
          cy="38"
          r="1"
          fill="#F6C35B"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 2.8,
            ease: "easeOut"
          }}
        />
      </svg>
      
      {/* Subtle glow effect */}
      <motion.div
        className="absolute top-0 right-0 w-4 h-8 bg-gradient-to-b from-yellow-300/20 to-transparent rounded-full blur-sm"
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scale: [0.8, 1.1, 0.8]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}