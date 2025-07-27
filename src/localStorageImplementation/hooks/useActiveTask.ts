import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Item, getCurrentTaskChain, getTaskStartTime } from '../../functions/utils/item/index';
import type { BaseCalendarEntry } from '../../functions/reducers/AppReducer';

interface UseActiveTaskOptions {
  items: Item[];
  baseCalendar: Map<string, BaseCalendarEntry>;
  currentTime: number;
  // refreshInterval?: number; // Currently unused
  performanceMode?: 'realtime' | 'optimized' | 'minimal';
  onTaskChange?: (newTask: Item | null, previousTask: Item | null) => void;
  onError?: (error: Error) => void;
}

interface UseActiveTaskResult {
  taskChain: Item[];
  currentTask: Item | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
  taskStartTime: number;
  taskProgress?: number;
  remainingTime?: number;
  nextTask?: Item | null;
  nextTaskStartTime?: number;
}

export function useActiveTask({
  items,
  baseCalendar,
  currentTime,
  // refreshInterval: _refreshInterval = 1000, // Currently unused
  performanceMode = 'optimized',
  onTaskChange,
  onError
}: UseActiveTaskOptions): UseActiveTaskResult {
  const [taskChain, setTaskChain] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const previousTaskRef = useRef<Item | null>(null);
  const calculationTimeoutRef = useRef<number | undefined>(undefined);

  // Memoized task chain calculation with performance optimization
  const calculateTaskChain = useCallback(async (): Promise<void> => {
    if (items.length === 0) {
      setTaskChain([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const startTime = performance.now();

      // Use requestIdleCallback for non-urgent calculations in optimized mode
      const doCalculation = () => {
        try {
          const chain = getCurrentTaskChain(items, currentTime, baseCalendar);
          const calculationTime = performance.now() - startTime;

          setTaskChain(chain);
          setLastUpdated(calculationTime);

          // Detect task changes
          const currentTask = chain[chain.length - 1] || null;
          if (currentTask?.id !== previousTaskRef.current?.id) {
            onTaskChange?.(currentTask, previousTaskRef.current);
            previousTaskRef.current = currentTask;
          }

          setIsLoading(false);

          // Log performance in development
          if (process.env.NODE_ENV === 'development' && calculationTime > 50) {
            console.warn(`Task chain calculation took ${calculationTime.toFixed(2)}ms`);
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          setError(errorMessage);
          setIsLoading(false);
          onError?.(err instanceof Error ? err : new Error(errorMessage));
        }
      };

      if (performanceMode === 'optimized' && 'requestIdleCallback' in window) {
        requestIdleCallback(doCalculation, { timeout: 100 });
      } else {
        doCalculation();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsLoading(false);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  }, [items, baseCalendar, currentTime, performanceMode, onTaskChange, onError]);

  // Debounced recalculation for performance
  useEffect(() => {
    if (calculationTimeoutRef.current) {
      clearTimeout(calculationTimeoutRef.current);
    }

    let delay: number;
    if (performanceMode === 'realtime') {
      delay = 0;
    } else if (performanceMode === 'optimized') {
      delay = 100;
    } else {
      delay = 500; // minimal mode
    }

    calculationTimeoutRef.current = window.setTimeout(calculateTaskChain, delay);

    return () => {
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current);
      }
    };
  }, [calculateTaskChain, performanceMode]);

  // Derived values
  const currentTask = useMemo(() => taskChain[taskChain.length - 1] || null, [taskChain]);

  const taskStartTime = useMemo(() => {
    if (!currentTask || taskChain.length === 0) return 0;
    try {
      return getTaskStartTime(taskChain, currentTask, baseCalendar);
    } catch {
      return currentTime; // Fallback to current time
    }
  }, [currentTask, taskChain, baseCalendar, currentTime]);

  const taskProgress = useMemo(() => {
    if (!currentTask || taskStartTime === 0) return undefined;
    const elapsed = currentTime - taskStartTime;
    return Math.min((elapsed / currentTask.duration) * 100, 100);
  }, [currentTask, currentTime, taskStartTime]);

  const remainingTime = useMemo(() => {
    if (!currentTask || taskStartTime === 0) return undefined;
    const elapsed = currentTime - taskStartTime;
    return Math.max(0, currentTask.duration - elapsed);
  }, [currentTask, currentTime, taskStartTime]);

  return {
    taskChain,
    currentTask,
    isLoading,
    error,
    lastUpdated,
    taskStartTime,
    taskProgress,
    remainingTime
  };
}

// Utility hook for getting upcoming tasks
export function useUpcomingTasks(items: Item[], _baseCalendar: Map<string, BaseCalendarEntry>, _currentTime: number, limit: number = 5): Item[] {
  return useMemo(() => {
    // This is a simplified implementation - you can enhance it based on your needs
    return items.slice(0, limit);
  }, [items, limit]);
}

// Utility hook for task change notifications
export function useTaskChangeNotifications(): {
  notifyTaskChange: (newTask: Item | null, previousTask: Item | null) => void;
  clearNotifications: () => void;
} {
  const notifyTaskChange = useCallback((newTask: Item | null, previousTask: Item | null) => {
    console.log('Task changed:', { newTask, previousTask });
    // Implementation for notifications can be added here
  }, []);

  const clearNotifications = useCallback(() => {
    console.log('Clearing notifications');
    // Implementation for clearing notifications can be added here
  }, []);

  return {
    notifyTaskChange,
    clearNotifications
  };
}
