import { useState, useEffect } from 'react';

export const useCurrentTime = (intervalMs: number = 30000) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  return currentTime;
};
