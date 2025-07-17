import { useState, useEffect } from 'react';

/**
 * Hook to get the current viewport height
 * @returns The current viewport height in pixels
 */
export function useViewportHeight(): number {
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return height;
}
