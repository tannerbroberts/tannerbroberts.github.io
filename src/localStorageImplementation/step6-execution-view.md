# Step 6: Automatic Execution View Loading

## Context
You have completed Steps 1-5 and now have a complete storage system with debug tools. This step enhances the ExecutionView to automatically show the current active task immediately when the page loads, using the restored data from localStorage.

## Current State Analysis
The existing `ExecutionView.tsx`:
- Uses `getCurrentTaskChain()` to determine active tasks
- Takes `items` and `baseCalendar` from context
- Calculates task chains based on current time
- Shows idle state when no active tasks

The execution flow:
1. `getCurrentTaskChain(items, currentTime, baseCalendar)` finds active tasks
2. `PrimaryItemDisplayRouter` renders the appropriate display component
3. Components like `PrimarySubCalendarItemDisplay` show task progress

## Task
Enhance the ExecutionView and related components to:
1. Automatically display the current active task on page load
2. Handle edge cases gracefully (no data, no active tasks, etc.)
3. Provide smooth loading states during data restoration
4. Optimize performance for large datasets
5. Show appropriate fallback states

## Files to Create

### 1. `src/localStorageImplementation/components/EnhancedExecutionView.tsx`

Enhanced version of ExecutionView with automatic loading:
```typescript
import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { Box, Typography, Fade, Skeleton, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Schedule, Warning } from '@mui/icons-material';
import { PrimaryItemDisplayRouter } from '../../components/execution';
import { useAppState } from '../StorageAwareAppProvider';
import { useStorageStatus } from '../hooks/useStorageStatus';
import { useActiveTask } from '../hooks/useActiveTask';
import { useCurrentTime } from '../../hooks/useCurrentTime';

interface EnhancedExecutionViewProps {
  readonly showHeader?: boolean;
  readonly autoRefreshInterval?: number; // ms between task chain recalculations
  readonly performanceMode?: 'realtime' | 'optimized' | 'minimal';
}

export function EnhancedExecutionView({
  showHeader = true,
  autoRefreshInterval = 1000,
  performanceMode = 'optimized'
}: EnhancedExecutionViewProps): JSX.Element {
  const { items, baseCalendar } = useAppState();
  const storageStatus = useStorageStatus();
  const currentTime = useCurrentTime(autoRefreshInterval);
  
  // Custom hook to manage active task calculation
  const {
    taskChain,
    currentTask,
    isLoading: taskLoading,
    error: taskError,
    lastUpdated,
    taskStartTime
  } = useActiveTask({
    items,
    baseCalendar,
    currentTime,
    refreshInterval: autoRefreshInterval,
    performanceMode
  });

  // Loading state while storage is being restored
  if (storageStatus.isLoading) {
    return <ExecutionLoadingState message="Restoring your schedule..." />;
  }

  // Error state if storage failed
  if (storageStatus.error && !storageStatus.hasLoaded) {
    return (
      <ExecutionErrorState 
        error={storageStatus.error}
        canRetry={true}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Task calculation error
  if (taskError) {
    return (
      <ExecutionErrorState 
        error={`Failed to determine current task: ${taskError}`}
        canRetry={false}
      />
    );
  }

  // Loading state while calculating task chain
  if (taskLoading) {
    return <TaskCalculationLoadingState />;
  }

  // No data state (first time user)
  if (items.length === 0 && baseCalendar.size === 0) {
    return <NoDataState />;
  }

  // No active task state
  if (!currentTask || taskChain.length === 0) {
    return (
      <NoActiveTaskState 
        upcomingTasks={getUpcomingTasks(items, baseCalendar, currentTime)}
        lastActiveTask={getLastActiveTask(items, baseCalendar, currentTime)}
      />
    );
  }

  // Active task display
  return (
    <ExecutionContainer>
      {showHeader && (
        <ExecutionHeader 
          currentTask={currentTask}
          lastUpdated={lastUpdated}
          dataSource={storageStatus.dataSource}
        />
      )}
      
      <Fade in timeout={300}>
        <Box>
          <PrimaryItemDisplayRouter
            taskChain={taskChain}
            currentTime={currentTime}
            startTime={taskStartTime}
          />
        </Box>
      </Fade>

      {/* Performance monitoring in dev mode */}
      {process.env.NODE_ENV === 'development' && (
        <PerformanceIndicator 
          taskChainCalculationTime={lastUpdated}
          itemCount={items.length}
          calendarEntryCount={baseCalendar.size}
        />
      )}
    </ExecutionContainer>
  );
}

// Sub-components
function ExecutionLoadingState({ message }: { message: string }): JSX.Element
function ExecutionErrorState({ error, canRetry, onRetry }: { error: string; canRetry: boolean; onRetry?: () => void }): JSX.Element
function TaskCalculationLoadingState(): JSX.Element
function NoDataState(): JSX.Element
function NoActiveTaskState({ upcomingTasks, lastActiveTask }: { upcomingTasks: Task[]; lastActiveTask: Task | null }): JSX.Element
function ExecutionHeader({ currentTask, lastUpdated, dataSource }: { currentTask: Item; lastUpdated: number; dataSource: string }): JSX.Element
function PerformanceIndicator({ taskChainCalculationTime, itemCount, calendarEntryCount }: { taskChainCalculationTime: number; itemCount: number; calendarEntryCount: number }): JSX.Element

// Styled components
const ExecutionContainer = styled(Box)(() => ({
  width: '100%',
  transition: 'all 0.3s ease-in-out',
  position: 'relative'
}));
```

### 2. `src/localStorageImplementation/hooks/useActiveTask.ts`

Hook for managing active task calculation with performance optimizations:
```typescript
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Item, BaseCalendarEntry, getCurrentTaskChain, getTaskStartTime } from '../../functions/utils/item/index';

interface UseActiveTaskOptions {
  items: Item[];
  baseCalendar: Map<string, BaseCalendarEntry>;
  currentTime: number;
  refreshInterval?: number;
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
  refreshInterval = 1000,
  performanceMode = 'optimized',
  onTaskChange,
  onError
}: UseActiveTaskOptions): UseActiveTaskResult {
  const [taskChain, setTaskChain] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  
  const previousTaskRef = useRef<Item | null>(null);
  const calculationTimeoutRef = useRef<number>();

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

    const delay = performanceMode === 'realtime' ? 0 : 
                  performanceMode === 'optimized' ? 100 : 
                  500; // minimal mode

    calculationTimeoutRef.current = window.setTimeout(calculateTaskChain, delay);

    return () => {
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current);
      }
    };
  }, [calculateTaskChain]);

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
export function useUpcomingTasks(items: Item[], baseCalendar: Map<string, BaseCalendarEntry>, currentTime: number, limit: number = 5): Item[]

// Utility hook for task change notifications
export function useTaskChangeNotifications(): {
  notifyTaskChange: (newTask: Item | null, previousTask: Item | null) => void;
  clearNotifications: () => void;
}
```

### 3. `src/localStorageImplementation/utils/executionUtils.ts`

Utility functions for execution view enhancements:
```typescript
import { Item, BaseCalendarEntry, getActiveBaseCalendarEntries, getSortedBaseCalendarEntries } from '../../functions/utils/item/index';

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
): ExecutionContext

// Task scheduling utilities
export function getUpcomingTasks(
  items: Item[],
  baseCalendar: Map<string, BaseCalendarEntry>,
  currentTime: number,
  limit: number = 10
): TaskScheduleInfo[]

export function getRecentTasks(
  items: Item[],
  baseCalendar: Map<string, BaseCalendarEntry>,
  currentTime: number,
  limit: number = 5
): TaskScheduleInfo[]

export function getLastActiveTask(
  items: Item[],
  baseCalendar: Map<string, BaseCalendarEntry>,
  currentTime: number
): Item | null

// Schedule analysis
export function findScheduleGaps(
  baseCalendar: Map<string, BaseCalendarEntry>,
  items: Item[],
  startTime: number,
  endTime: number
): ScheduleGap[]

export function calculateScheduleEfficiency(
  baseCalendar: Map<string, BaseCalendarEntry>,
  items: Item[],
  timeframe: number
): {
  totalTime: number;
  scheduledTime: number;
  completedTime: number;
  efficiency: number;
}

// Performance optimizations
export function memoizeTaskChainCalculation(): {
  calculate: (items: Item[], currentTime: number, baseCalendar: Map<string, BaseCalendarEntry>) => Item[];
  clearCache: () => void;
  getCacheStats: () => { hits: number; misses: number; size: number };
}

// Preloading utilities
export function preloadUpcomingTaskData(
  upcomingTasks: TaskScheduleInfo[],
  preloadCount: number = 3
): Promise<void>

export function warmTaskChainCache(
  items: Item[],
  baseCalendar: Map<string, BaseCalendarEntry>,
  timeRange: { start: number; end: number }
): void
```

### 4. `src/localStorageImplementation/components/ExecutionStates.tsx`

Components for various execution states:
```typescript
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Skeleton
} from '@mui/material';
import {
  Schedule,
  Warning,
  Add,
  Refresh,
  PlayArrow,
  AccessTime
} from '@mui/icons-material';

// Loading state while storage is being restored
export function ExecutionLoadingState({ 
  message = "Loading your schedule...",
  showProgress = true 
}: { 
  message?: string; 
  showProgress?: boolean; 
}): JSX.Element {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
      textAlign="center"
      p={3}
    >
      {showProgress && <CircularProgress size={60} sx={{ mb: 3 }} />}
      <Typography variant="h5" gutterBottom>
        {message}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Restoring your items and calendar from storage...
      </Typography>
    </Box>
  );
}

// Loading state during task chain calculation
export function TaskCalculationLoadingState(): JSX.Element {
  return (
    <Box p={3}>
      <Skeleton variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 2 }} />
      <Skeleton variant="text" height={60} sx={{ mb: 1 }} />
      <Skeleton variant="text" height={40} width="60%" />
    </Box>
  );
}

// Error state for execution failures
export function ExecutionErrorState({
  error,
  canRetry = false,
  onRetry
}: {
  error: string;
  canRetry?: boolean;
  onRetry?: () => void;
}): JSX.Element {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
      textAlign="center"
      p={3}
    >
      <Warning color="error" sx={{ fontSize: 60, mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        Unable to Load Schedule
      </Typography>
      <Alert severity="error" sx={{ mb: 3, maxWidth: 600 }}>
        {error}
      </Alert>
      {canRetry && (
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </Box>
  );
}

// State when no data exists (first time user)
export function NoDataState(): JSX.Element {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
      textAlign="center"
      p={3}
    >
      <Schedule sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
      <Typography variant="h4" gutterBottom>
        Welcome to About Time
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600 }}>
        You don't have any items or scheduled tasks yet. Start by creating your first task 
        or importing data from a backup.
      </Typography>
      <Box display="flex" gap={2}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {/* Open new item dialog */}}
        >
          Create First Task
        </Button>
        <Button
          variant="outlined"
          onClick={() => {/* Open import dialog */}}
        >
          Import Data
        </Button>
      </Box>
    </Box>
  );
}

// State when no active task but data exists
export function NoActiveTaskState({
  upcomingTasks,
  lastActiveTask
}: {
  upcomingTasks: TaskScheduleInfo[];
  lastActiveTask: Item | null;
}): JSX.Element {
  return (
    <Box p={3}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <AccessTime color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5">
                No Active Task
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {upcomingTasks.length > 0 
                  ? "You have upcoming tasks scheduled"
                  : "No tasks currently scheduled"
                }
              </Typography>
            </Box>
          </Box>

          {/* Last active task */}
          {lastActiveTask && (
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Recently Completed
              </Typography>
              <Chip 
                label={lastActiveTask.name}
                color="success"
                variant="outlined"
              />
            </Box>
          )}

          {/* Upcoming tasks */}
          {upcomingTasks.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Upcoming Tasks
              </Typography>
              <List>
                {upcomingTasks.slice(0, 5).map((taskInfo, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={taskInfo.task.name}
                      secondary={`Starts ${formatTimeUntil(taskInfo.startTime)}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {upcomingTasks.length === 0 && (
            <Alert severity="info">
              No upcoming tasks scheduled. Consider adding some tasks to your calendar.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

// Utility function
function formatTimeUntil(futureTime: number): string {
  const now = Date.now();
  const diff = futureTime - now;
  
  if (diff < 0) return "Now";
  if (diff < 60000) return "in less than a minute";
  if (diff < 3600000) return `in ${Math.floor(diff / 60000)} minutes`;
  if (diff < 86400000) return `in ${Math.floor(diff / 3600000)} hours`;
  
  return `on ${new Date(futureTime).toLocaleDateString()}`;
}
```

### 5. `src/localStorageImplementation/__tests__/EnhancedExecutionView.test.tsx`

Comprehensive test suite:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { EnhancedExecutionView } from '../components/EnhancedExecutionView';
import { StorageAwareAppProvider } from '../StorageAwareAppProvider';
import { generateSampleData } from '../sampleData';

describe('Enhanced Execution View', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state while storage is loading', () => {
    // Test loading state
  });

  it('should display active task when available', async () => {
    // Test active task display
  });

  it('should show no data state for new users', () => {
    // Test empty state
  });

  it('should handle storage errors gracefully', () => {
    // Test error handling
  });

  it('should update when task changes', async () => {
    // Test task transitions
  });

  it('should optimize performance for large datasets', async () => {
    // Test performance with large data
  });
});
```

## Implementation Requirements

### 1. Automatic Loading
- Immediately calculate and display current task on mount
- Handle concurrent loading of storage data and task calculation
- Provide smooth transitions between loading and loaded states
- Cache calculations to prevent unnecessary recalculation

### 2. Performance Optimization
- Debounce task chain recalculation
- Use `requestIdleCallback` for non-urgent calculations
- Memoize expensive computations
- Optimize for large datasets (> 1000 items)

### 3. Error Handling
- Gracefully handle storage failures
- Recover from task calculation errors
- Provide meaningful error messages
- Allow retry mechanisms where appropriate

### 4. Loading States
- Show loading indicators during data restoration
- Skeleton loading for task calculation
- Progressive loading for complex hierarchies
- Smooth transitions between states

### 5. Fallback States
- No data state for first-time users
- No active task state with upcoming tasks
- Error state with recovery options
- Offline/storage unavailable state

## Acceptance Criteria
- [ ] Automatically displays current active task on page load
- [ ] Shows appropriate loading states during data restoration
- [ ] Handles all edge cases gracefully (no data, errors, etc.)
- [ ] Performance impact < 5ms for typical datasets
- [ ] Smooth transitions between different states
- [ ] Works correctly with large datasets (> 1000 items)
- [ ] Error recovery mechanisms function properly
- [ ] Visual design is consistent with existing app
- [ ] Accessibility requirements are met
- [ ] Test coverage > 90%

## Performance Targets
- Initial task display: < 2 seconds after page load
- Task chain recalculation: < 50ms for typical datasets
- Memory usage: < 100MB during operation
- Smooth animations at 60fps

## Integration Example
After implementation, users will experience:

1. **Page Load**: Immediate loading indicator
2. **Data Restoration**: "Loading your schedule..." message
3. **Task Calculation**: Brief skeleton loading
4. **Active Task Display**: Smooth fade-in of current task
5. **Real-time Updates**: Automatic updates as time progresses

## Notes
- This step makes the app truly "ready to use" immediately after loading
- Focus on user experience and perceived performance
- Consider preloading upcoming tasks for smoother transitions
- Plan for smooth task transitions when tasks change
- Ensure the loading experience feels fast and responsive
