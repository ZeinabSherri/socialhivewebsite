import { useState, useEffect } from 'react';

interface UseCounterAnimationProps {
  targetValue: number;
  duration?: number;
  startDelay?: number;
}

export const useCounterAnimation = ({ 
  targetValue, 
  duration = 2000, 
  startDelay = 0 
}: UseCounterAnimationProps) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    // Reset to 0 when target value changes
    setCurrentValue(0);
    
    const timer = setTimeout(() => {
      let startTime: number;
      let animationId: number;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const newValue = Math.floor(easeOutQuart * targetValue);
        
        setCurrentValue(newValue);
        
        if (progress < 1) {
          animationId = requestAnimationFrame(animate);
        }
      };

      animationId = requestAnimationFrame(animate);

      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      };
    }, startDelay);

    return () => clearTimeout(timer);
  }, [targetValue, duration, startDelay]);

  return currentValue;
};