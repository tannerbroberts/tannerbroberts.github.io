import { useMemo } from 'react';

/**
 * useDynamicTimelineScale
 * Provides a per-view ms/segment override so a timeline fits within a readable
 * vertical band relative to the viewport. It zooms in for short durations and
 * zooms out for long ones by adjusting millisecondsPerSegment locally.
 */
export function useDynamicTimelineScale(
  duration: number,
  pixelsPerSegment: number,
  baseMillisecondsPerSegment: number,
  viewportHeight: number,
  options: { minViewportMultiplier?: number; maxViewportMultiplier?: number } = {}
) {
  const { minViewportMultiplier = 0.9, maxViewportMultiplier = 2 } = options;
  return useMemo(() => {
    if (duration <= 0 || pixelsPerSegment <= 0 || baseMillisecondsPerSegment <= 0 || viewportHeight <= 0) {
      return {
        effectiveMillisecondsPerSegment: baseMillisecondsPerSegment,
        targetHeight: 0,
        naturalHeight: 0,
        didUpscale: false,
        didDownscale: false,
      } as const;
    }

    const naturalHeight = (duration * pixelsPerSegment) / baseMillisecondsPerSegment;
  const minHeight = viewportHeight * minViewportMultiplier;
  const maxHeight = viewportHeight * maxViewportMultiplier;
    const targetHeight = Math.min(Math.max(naturalHeight, minHeight), maxHeight);
    const effectiveMillisecondsPerSegment = (duration * pixelsPerSegment) / targetHeight;
    const didDownscale = targetHeight > naturalHeight; // zoomed in (smaller ms/segment)
    const didUpscale = targetHeight < naturalHeight;   // compressed (larger ms/segment)

    return {
      effectiveMillisecondsPerSegment,
      targetHeight,
      naturalHeight,
      didUpscale,
      didDownscale,
    } as const;
  }, [duration, pixelsPerSegment, baseMillisecondsPerSegment, viewportHeight, minViewportMultiplier, maxViewportMultiplier]);
}

export default useDynamicTimelineScale;
