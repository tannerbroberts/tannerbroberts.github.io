import { useEffect, useState } from 'react';

/**
 * Hook that provides the current time and updates it at regular intervals
 * @param intervalMs - Update interval in milliseconds (default: 20ms)
 * @returns Current timestamp
 */
export function useCurrentTime(intervalMs: number = 20): number {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return currentTime;
}
