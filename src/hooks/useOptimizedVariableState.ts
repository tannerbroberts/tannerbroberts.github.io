/**
 * Optimized state management hook for variable operations
 * Part of Step 11: Performance Optimization
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { usePerformanceMonitor } from '../functions/utils/performance/variablePerformanceMonitor';
import { useDebouncedValue } from './useDebouncedValue';

interface OptimizedVariableState<T> {
  value: T;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
}

interface UseOptimizedVariableStateOptions<T> {
  debounceMs?: number;
  maxUpdatesPerSecond?: number;
  enableBatching?: boolean;
  onUpdate?: (value: T) => void;
  onError?: (error: string) => void;
}

export function useOptimizedVariableState<T>(
  initialValue: T,
  options: UseOptimizedVariableStateOptions<T> = {}
) {
  const {
    debounceMs = 300,
    maxUpdatesPerSecond = 10,
    enableBatching = true,
    onUpdate,
    onError
  } = options;

  const { measure } = usePerformanceMonitor();

  const [state, setState] = useState<OptimizedVariableState<T>>({
    value: initialValue,
    isLoading: false,
    error: null,
    lastUpdated: Date.now()
  });

  const debouncedValue = useDebouncedValue(state.value, debounceMs);
  const updateQueue = useRef<Array<{ value: T; timestamp: number }>>([]);
  const lastUpdateTime = useRef(Date.now());
  const batchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Throttle updates based on maxUpdatesPerSecond
  const canUpdate = useCallback(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTime.current;
    const minInterval = 1000 / maxUpdatesPerSecond;
    return timeSinceLastUpdate >= minInterval;
  }, [maxUpdatesPerSecond]);

  // Process batched updates
  const processBatch = useCallback(() => {
    if (updateQueue.current.length === 0) return;

    measure('batch-variable-update', () => {
      // Get the latest value from the queue
      const latestUpdate = updateQueue.current[updateQueue.current.length - 1];
      updateQueue.current = [];

      setState(prevState => ({
        ...prevState,
        value: latestUpdate.value,
        lastUpdated: latestUpdate.timestamp,
        isLoading: false
      }));

      lastUpdateTime.current = Date.now();

      if (onUpdate) {
        onUpdate(latestUpdate.value);
      }
    });
  }, [measure, onUpdate]);

  // Update value with optimizations
  const updateValue = useCallback((newValue: T) => {
    const timestamp = Date.now();

    if (enableBatching) {
      // Add to queue
      updateQueue.current.push({ value: newValue, timestamp });

      // Clear existing timeout
      if (batchTimeout.current) {
        clearTimeout(batchTimeout.current);
      }

      // Set new timeout for batch processing
      batchTimeout.current = setTimeout(processBatch, debounceMs);
    } else if (canUpdate()) {
      // Immediate update if not batching and can update
      measure('immediate-variable-update', () => {
        setState(prevState => ({
          ...prevState,
          value: newValue,
          lastUpdated: timestamp,
          isLoading: false
        }));

        if (onUpdate) {
          onUpdate(newValue);
        }
      });

      lastUpdateTime.current = timestamp;
    } else {
      // Skip update due to throttling
      console.debug('Variable update skipped due to throttling');
    }
  }, [enableBatching, canUpdate, debounceMs, processBatch, measure, onUpdate]);

  // Set loading state
  const setLoading = useCallback((loading: boolean) => {
    setState(prevState => ({
      ...prevState,
      isLoading: loading
    }));
  }, []);

  // Set error state
  const setError = useCallback((error: string | null) => {
    setState(prevState => ({
      ...prevState,
      error,
      isLoading: false
    }));

    if (error && onError) {
      onError(error);
    }
  }, [onError]);

  // Async update with error handling
  const updateValueAsync = useCallback(async (
    asyncFn: () => Promise<T>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await measure('async-variable-update', asyncFn);
      updateValue(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
    }
  }, [updateValue, setLoading, setError, measure]);

  // Batch multiple updates
  const batchUpdates = useCallback((updates: T[]) => {
    if (!enableBatching) {
      // Process immediately
      updates.forEach(updateValue);
      return;
    }

    measure('batch-variable-updates', () => {
      const timestamp = Date.now();
      const batchedUpdates = updates.map(value => ({ value, timestamp }));
      updateQueue.current.push(...batchedUpdates);

      // Clear existing timeout
      if (batchTimeout.current) {
        clearTimeout(batchTimeout.current);
      }

      // Process batch immediately for multiple updates
      processBatch();
    });
  }, [enableBatching, updateValue, measure, processBatch]);

  // Reset state
  const reset = useCallback(() => {
    setState({
      value: initialValue,
      isLoading: false,
      error: null,
      lastUpdated: Date.now()
    });

    // Clear any pending updates
    updateQueue.current = [];
    if (batchTimeout.current) {
      clearTimeout(batchTimeout.current);
    }
  }, [initialValue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (batchTimeout.current) {
        clearTimeout(batchTimeout.current);
      }
    };
  }, []);

  // Memoized return object to prevent unnecessary re-renders
  const returnValue = useMemo(() => ({
    // Current state
    value: state.value,
    debouncedValue,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated,

    // Update functions
    updateValue,
    updateValueAsync,
    batchUpdates,
    setLoading,
    setError,
    reset,

    // Utility functions
    canUpdate,
    queueLength: updateQueue.current.length
  }), [
    state.value,
    debouncedValue,
    state.isLoading,
    state.error,
    state.lastUpdated,
    updateValue,
    updateValueAsync,
    batchUpdates,
    setLoading,
    setError,
    reset,
    canUpdate
  ]);

  return returnValue;
}

// Specialized hook for variable arrays
export function useOptimizedVariableArray<T>(
  initialArray: T[],
  options: UseOptimizedVariableStateOptions<T[]> = {}
) {
  const optimizedState = useOptimizedVariableState(initialArray, options);

  const addItem = useCallback((item: T) => {
    optimizedState.updateValue([...optimizedState.value, item]);
  }, [optimizedState]);

  const removeItem = useCallback((index: number) => {
    const newArray = optimizedState.value.filter((_, i) => i !== index);
    optimizedState.updateValue(newArray);
  }, [optimizedState]);

  const updateItem = useCallback((index: number, item: T) => {
    const newArray = [...optimizedState.value];
    newArray[index] = item;
    optimizedState.updateValue(newArray);
  }, [optimizedState]);

  const batchUpdateItems = useCallback((updates: Array<{ index: number; item: T }>) => {
    const newArray = [...optimizedState.value];
    updates.forEach(({ index, item }) => {
      newArray[index] = item;
    });
    optimizedState.updateValue(newArray);
  }, [optimizedState]);

  return {
    ...optimizedState,
    addItem,
    removeItem,
    updateItem,
    batchUpdateItems,
    length: optimizedState.value.length
  };
}

// Hook for optimized variable filtering
export function useOptimizedVariableFiltering<T>(
  items: T[],
  filterFn: (item: T) => boolean,
  options: { debounceMs?: number; maxItems?: number } = {}
) {
  const { debounceMs = 200, maxItems = 1000 } = options;
  const { measure } = usePerformanceMonitor();

  const debouncedFilterFn = useDebouncedValue(filterFn, debounceMs);

  const filteredItems = useMemo(() => {
    return measure('variable-array-filter', () => {
      const filtered = items.filter(debouncedFilterFn);
      // Limit results to prevent performance issues
      return filtered.slice(0, maxItems);
    });
  }, [items, debouncedFilterFn, maxItems, measure]);

  return {
    filteredItems,
    originalCount: items.length,
    filteredCount: filteredItems.length,
    isLimited: filteredItems.length === maxItems && items.length > maxItems
  };
}
