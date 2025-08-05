import { motion } from "framer-motion";
import { useReducedMotion } from '../hooks/useReducedMotion';

interface HoneyDripProps {
  className?: string;
}

export default function HoneyDrip({ className = "" }: HoneyDripProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={`absolute top-0 left-0 w-full pointer-events-none z-10 ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 435.03 209.46" width="100%" height="auto" className="opacity-60">
          <defs>
            <style>
              {`.cls-1{fill:none;}.cls-2{isolation:isolate;}.cls-3{fill:#948a84;opacity:0.54;}
                .cls-4{fill:#ffc907;}.cls-5{fill:#d89216;}.cls-6{fill:#ebdc6b;mix-blend-mode:color-dodge;opacity:0.5;}`}
            </style>
          </defs>
          <g className="cls-2">
            <g id="Layer_1" data-name="Layer 1">
              <path className="cls-3" d="M158.95,209.46c-21.24,0-38.46-17.22-38.46-38.46s17.22-38.46,38.46-38.46,38.46,17.22,38.46,38.46-17.22,38.46-38.46,38.46Z"/>
              <path className="cls-4" d="M217.51,0C97.51,0,0,97.51,0,217.51s97.51,217.51,217.51,217.51,217.51-97.51,217.51-217.51S337.51,0,217.51,0Z"/>
              <path className="cls-5" d="M217.51,132.54c-46.91,0-84.97,38.06-84.97,84.97s38.06,84.97,84.97,84.97,84.97-38.06,84.97-84.97-38.06-84.97-84.97-84.97Z"/>
              <path className="cls-6" d="M217.51,170c-26.23,0-47.51,21.28-47.51,47.51s21.28,47.51,47.51,47.51,47.51-21.28,47.51-47.51-21.28-47.51-47.51-47.51Z"/>
            </g>
          </g>
        </svg>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ y: -10, opacity: 0.9 }}
      animate={{ y: 10, opacity: 1 }}
      transition={{ 
        repeat: Infinity, 
        duration: 5 + Math.random() * 2, // Random timing for realism
        ease: "easeInOut", 
        repeatType: "reverse",
        delay: Math.random() * 2 // Random delay
      }}
      className={`absolute top-0 left-0 w-full pointer-events-none z-10 ${className}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 435.03 209.46" width="100%" height="auto">
        <defs>
          <style>
            {`.cls-1{fill:none;}.cls-2{isolation:isolate;}.cls-3{fill:#948a84;opacity:0.54;}
              .cls-4{fill:#F6C35B;}.cls-5{fill:#d89216;}.cls-6{fill:#ebdc6b;mix-blend-mode:color-dodge;opacity:0.5;}`}
          </style>
        </defs>
        <g className="cls-2">
          <g id="Layer_1" data-name="Layer 1">
            {/* Main honey drops */}
            <motion.path 
              className="cls-4" 
              d="M217.51,0c-5,0-9.5,2-12.8,5.2-3.3,3.2-5.2,7.8-5.2,12.8v60c0,8,3,15,8,20l15,15c2,2,5,2,7,0l15-15c5-5,8-12,8-20v-60c0-5-2-9.5-5.2-12.8C227,2,222.51,0,217.51,0Z"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0.7, 1, 0.7] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Secondary honey drops */}
            <motion.circle
              className="cls-4"
              cx="180"
              cy="120"
              r="8"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.2, 1, 0],
                opacity: [0, 0.8, 0.8, 0],
                y: [0, 5, 10, 20]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: 1,
                ease: "easeOut"
              }}
            />
            
            <motion.circle
              className="cls-4"
              cx="255"
              cy="140"
              r="6"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0.8, 0],
                opacity: [0, 0.7, 0.7, 0],
                y: [0, 8, 15, 25]
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                delay: 2,
                ease: "easeOut"
              }}
            />
            
            {/* Tiny droplets */}
            <motion.circle
              className="cls-6"
              cx="200"
              cy="160"
              r="3"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 0.6, 0],
                y: [0, 12]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 3,
                ease: "easeOut"
              }}
            />
          </g>
        </g>
      </svg>
      
      {/* Subtle glow effect */}
      <motion.div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-16 bg-gradient-to-b from-[#F6C35B]/20 to-transparent rounded-full blur-sm"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [0.8, 1.1, 0.8]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
}