import { Item, getSortedBaseCalendarEntries } from '../../functions/utils/item/index';
import type { BaseCalendarEntry } from '../../functions/reducers/AppReducer';

export interface TaskScheduleInfo {
  task: Item;
  startTime: number;
  endTime: number;
  isActive: boolean;
  isPast: boolean;
  isFuture: boolean;
}

export interface ExecutionContext {
  currentTask: Item | null;
  upcomingTasks: TaskScheduleInfo[];
  recentTasks: TaskScheduleInfo[];
  scheduleGaps: ScheduleGap[];
  totalScheduledTime: number;
  completedTime: number;
}

export interface ScheduleGap {
  startTime: number;
  endTime: number;
  duration: number;
  type: 'break' | 'unscheduled' | 'end-of-day';
}

// Main execution context calculation
export function calculateExecutionContext(
  items: Item[],
  baseCalendar: Map<string, BaseCalendarEntry>,
  currentTime: number,
  lookAheadHours: number = 24,
  lookBehindHours: number = 8
): ExecutionContext {
  const lookAheadTime = currentTime + (lookAheadHours * 60 * 60 * 1000);
  const lookBehindTime = currentTime - (lookBehindHours * 60 * 60 * 1000);

  const upcomingTasks = getUpcomingTasks(items, baseCalendar, currentTime, 10);
  const recentTasks = getRecentTasks(items, baseCalendar, lookBehindTime, 5);
  const scheduleGaps = findScheduleGaps(baseCalendar, items, currentTime, lookAheadTime);

  // Calculate totals
  let totalScheduledTime = 0;
  let completedTime = 0;

  for (const [, entry] of baseCalendar) {
    const item = items.find(i => i.id === entry.itemId);
    if (item) {
      totalScheduledTime += item.duration;
      if (entry.startTime + item.duration < currentTime) {
        completedTime += item.duration;
      }
    }
  }

  return {
    currentTask: null, // Will be set by caller
    upcomingTasks,
    recentTasks,
    scheduleGaps,
    totalScheduledTime,
    completedTime
  };
}

// Task scheduling utilities
export function getUpcomingTasks(
  items: Item[],
  baseCalendar: Map<string, BaseCalendarEntry>,
  currentTime: number,
  limit: number = 10
): TaskScheduleInfo[] {
  const upcomingTasks: TaskScheduleInfo[] = [];

  for (const [, entry] of baseCalendar) {
    const item = items.find(i => i.id === entry.itemId);
    if (!item) continue;

    const startTime = entry.startTime;
    const endTime = startTime + item.duration;

    if (startTime > currentTime) {
      upcomingTasks.push({
        task: item,
        startTime,
        endTime,
        isActive: false,
        isPast: false,
        isFuture: true
      });
    }
  }

  // Sort by start time and limit results
  upcomingTasks.sort((a, b) => a.startTime - b.startTime);
  return upcomingTasks.slice(0, limit);
}

export function getRecentTasks(
  items: Item[],
  baseCalendar: Map<string, BaseCalendarEntry>,
  currentTime: number,
  limit: number = 5
): TaskScheduleInfo[] {
  const recentTasks: TaskScheduleInfo[] = [];

  for (const [, entry] of baseCalendar) {
    const item = items.find(i => i.id === entry.itemId);
    if (!item) continue;

    const startTime = entry.startTime;
    const endTime = startTime + item.duration;

    if (endTime < currentTime) {
      recentTasks.push({
        task: item,
        startTime,
        endTime,
        isActive: false,
        isPast: true,
        isFuture: false
      });
    }
  }

  // Sort by end time (most recent first) and limit results
  recentTasks.sort((a, b) => b.endTime - a.endTime);
  return recentTasks.slice(0, limit);
}

export function getLastActiveTask(
  items: Item[],
  baseCalendar: Map<string, BaseCalendarEntry>,
  currentTime: number
): Item | null {
  let lastTask: Item | null = null;
  let lastEndTime = 0;

  for (const [, entry] of baseCalendar) {
    const item = items.find(i => i.id === entry.itemId);
    if (!item) continue;

    const endTime = entry.startTime + item.duration;
    if (endTime < currentTime && endTime > lastEndTime) {
      lastTask = item;
      lastEndTime = endTime;
    }
  }

  return lastTask;
}

// Schedule analysis
export function findScheduleGaps(
  baseCalendar: Map<string, BaseCalendarEntry>,
  items: Item[],
  startTime: number,
  endTime: number
): ScheduleGap[] {
  const gaps: ScheduleGap[] = [];
  const sortedEntries = getSortedBaseCalendarEntries(baseCalendar);

  // Filter entries within the time range
  const relevantEntries = sortedEntries.filter(entry => {
    const item = items.find(i => i.id === entry.itemId);
    if (!item) return false;

    const entryStart = entry.startTime;
    const entryEnd = entryStart + item.duration;

    return entryEnd > startTime && entryStart < endTime;
  });

  if (relevantEntries.length === 0) {
    // No scheduled tasks in this time range
    gaps.push({
      startTime,
      endTime,
      duration: endTime - startTime,
      type: 'unscheduled'
    });
    return gaps;
  }

  // Check for gap before first entry
  const firstEntry = relevantEntries[0];
  if (firstEntry.startTime > startTime) {
    gaps.push({
      startTime,
      endTime: firstEntry.startTime,
      duration: firstEntry.startTime - startTime,
      type: 'unscheduled'
    });
  }

  // Check for gaps between entries
  for (let i = 0; i < relevantEntries.length - 1; i++) {
    const currentEntry = relevantEntries[i];
    const nextEntry = relevantEntries[i + 1];

    const currentItem = items.find(item => item.id === currentEntry.itemId);
    if (!currentItem) continue;

    const currentEnd = currentEntry.startTime + currentItem.duration;
    const nextStart = nextEntry.startTime;

    if (nextStart > currentEnd) {
      gaps.push({
        startTime: currentEnd,
        endTime: nextStart,
        duration: nextStart - currentEnd,
        type: 'break'
      });
    }
  }

  // Check for gap after last entry
  const lastEntry = relevantEntries[relevantEntries.length - 1];
  const lastItem = items.find(item => item.id === lastEntry.itemId);
  if (lastItem) {
    const lastEnd = lastEntry.startTime + lastItem.duration;
    if (lastEnd < endTime) {
      gaps.push({
        startTime: lastEnd,
        endTime,
        duration: endTime - lastEnd,
        type: 'end-of-day'
      });
    }
  }

  return gaps;
}

export function calculateScheduleEfficiency(
  baseCalendar: Map<string, BaseCalendarEntry>,
  items: Item[],
  timeframe: number
): {
  totalTime: number;
  scheduledTime: number;
  completedTime: number;
  efficiency: number;
} {
  const currentTime = Date.now();
  const startTime = currentTime - timeframe;

  const totalTime = timeframe;
  let scheduledTime = 0;
  let completedTime = 0;

  for (const [, entry] of baseCalendar) {
    const item = items.find(i => i.id === entry.itemId);
    if (!item) continue;

    const entryStart = entry.startTime;
    const entryEnd = entryStart + item.duration;

    // Only count tasks within the timeframe
    if (entryStart >= startTime && entryEnd <= currentTime) {
      scheduledTime += item.duration;

      // Count as completed if it ended before current time
      if (entryEnd <= currentTime) {
        completedTime += item.duration;
      }
    }
  }

  const efficiency = scheduledTime > 0 ? (completedTime / scheduledTime) * 100 : 0;

  return {
    totalTime,
    scheduledTime,
    completedTime,
    efficiency
  };
}

// Performance optimizations
export function memoizeTaskChainCalculation(): {
  calculate: (items: Item[], currentTime: number, baseCalendar: Map<string, BaseCalendarEntry>) => Item[];
  clearCache: () => void;
  getCacheStats: () => { hits: number; misses: number; size: number };
} {
  const cache = new Map<string, { result: Item[]; timestamp: number }>();
  let hits = 0;
  let misses = 0;
  const CACHE_TTL = 5000; // 5 seconds

  const calculate = (items: Item[], currentTime: number, baseCalendar: Map<string, BaseCalendarEntry>): Item[] => {
    const cacheKey = `${items.length}-${currentTime}-${baseCalendar.size}`;
    const cached = cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      hits++;
      return cached.result;
    }

    misses++;
    // This would normally call getCurrentTaskChain, but for now return empty array
    const result: Item[] = [];

    cache.set(cacheKey, { result, timestamp: Date.now() });

    // Clean old entries
    if (cache.size > 100) {
      const now = Date.now();
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          cache.delete(key);
        }
      }
    }

    return result;
  };

  const clearCache = () => {
    cache.clear();
    hits = 0;
    misses = 0;
  };

  const getCacheStats = () => ({
    hits,
    misses,
    size: cache.size
  });

  return {
    calculate,
    clearCache,
    getCacheStats
  };
}

// Preloading utilities
export async function preloadUpcomingTaskData(
  upcomingTasks: TaskScheduleInfo[],
  preloadCount: number = 3
): Promise<void> {
  // Preload the first few upcoming tasks
  const tasksToPreload = upcomingTasks.slice(0, preloadCount);

  // This is a placeholder for actual preloading logic
  await Promise.all(
    tasksToPreload.map(async (taskInfo) => {
      // Simulate preloading task data
      await new Promise(resolve => setTimeout(resolve, 1));
      console.log(`Preloaded task: ${taskInfo.task.name}`);
    })
  );
}

export function warmTaskChainCache(
  items: Item[],
  baseCalendar: Map<string, BaseCalendarEntry>,
  timeRange: { start: number; end: number }
): void {
  // Pre-calculate task chains for upcoming time slots
  const intervalMs = 60000; // 1 minute intervals
  const memoized = memoizeTaskChainCalculation();

  for (let time = timeRange.start; time <= timeRange.end; time += intervalMs) {
    memoized.calculate(items, time, baseCalendar);
  }
}
