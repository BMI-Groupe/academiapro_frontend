import { useEffect, useState } from 'react';

interface UseCountAnimationProps {
  targetValue: number;
  duration?: number;
  enabled?: boolean;
}

export function useCountAnimation({ 
  targetValue, 
  duration = 2000,
  enabled = true 
}: UseCountAnimationProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled || targetValue === 0) {
      setCount(targetValue);
      return;
    }

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(easeOut * targetValue);

      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(targetValue);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [targetValue, duration, enabled]);

  return count;
}

