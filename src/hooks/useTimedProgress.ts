import { useMemo } from 'react';
import type { Item } from '../functions/utils/item/Item';
import { getTaskProgress } from '../functions/utils/item/utils';

/**
 * Shared hook to compute progress, elapsed, remaining, and color classification
 * for a timed Item. It safely guards expensive calculation when disabled.
 */
export interface TimedProgressState {
  progress: number;          // 0-100
  elapsed: number;           // ms elapsed (clamped >=0)
  remaining: number;         // ms remaining (clamped >=0)
  isComplete: boolean;       // whether elapsed >= duration
  color: 'primary' | 'warning' | 'success';
}

export function useTimedProgress(
  item: Pick<Item, 'duration'>,
  currentTime: number,
  startTime: number,
  enabled: boolean
): TimedProgressState {
  return useMemo(() => {
    const duration = item.duration || 0;
    const rawElapsed = Math.max(0, currentTime - startTime);
    if (!enabled || duration <= 0) {
      const remainingDisabled = Math.max(0, duration - rawElapsed);
      const completeDisabled = duration > 0 && rawElapsed >= duration;
      return {
        progress: completeDisabled ? 100 : 0,
        elapsed: rawElapsed,
        remaining: completeDisabled ? 0 : remainingDisabled,
        isComplete: completeDisabled,
        color: completeDisabled ? 'success' : 'primary'
      } as TimedProgressState;
    }
    let progress = 0;
    try {
      // Cast item to unknown then Item to satisfy getTaskProgress signature while keeping input narrow
      progress = getTaskProgress(item as unknown as Item, currentTime, startTime);
    } catch (e) {
      // Fail safe
      progress = 0;
      if (process.env.NODE_ENV !== 'production') console.error('useTimedProgress getTaskProgress error', e);
    }
  const elapsed = rawElapsed;
  const remaining = Math.max(0, duration - rawElapsed);
    const isComplete = elapsed >= duration || progress >= 100;
    const color: TimedProgressState['color'] = progress >= 100 ? 'success' : progress >= 75 ? 'warning' : 'primary';
    return { progress, elapsed, remaining, isComplete, color };
  }, [item, currentTime, startTime, enabled]);
}

export default useTimedProgress;
