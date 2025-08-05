import { Player } from '@lottiefiles/react-lottie-player';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function FlyingBee() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Create zigzag motion based on scroll
  const x = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], [0, -50, 20, -30, 40, -10]);
  
  // Rotation for more natural flying motion
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [0, 10, -5]);

  if (prefersReducedMotion) {
    return (
      <div className="hidden lg:block fixed top-20 right-10 z-40 pointer-events-none">
        <Player
          autoplay
          loop
          src="/Bee Flying.json"
          style={{ height: '60px', width: '60px' }}
          className="opacity-70"
        />
      </div>
    );
  }

  return (
    <motion.div
      className="hidden lg:block fixed top-20 right-10 z-40 pointer-events-none"
      style={{ x, y, rotate }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 0.8, scale: 1 }}
      transition={{ 
        duration: 1.5, 
        ease: "easeOut",
        delay: 2 // Delay appearance to not interfere with page load
      }}
    >
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <Player
          autoplay
          loop
          src="/Bee Flying.json"
          style={{ height: '60px', width: '60px' }}
          className="drop-shadow-lg"
        />
      </motion.div>
      
      {/* Optional: Bee trail effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-yellow-300/20 to-transparent rounded-full blur-sm"
        animate={{ 
          scale: [0.8, 1.2, 0.8],
          opacity: [0.3, 0.1, 0.3]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
    </motion.div>
  );
}