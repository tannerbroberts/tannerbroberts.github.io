import { useMemo } from 'react';
import { Box, Fade } from '@mui/material';
import { styled } from '@mui/material/styles';
import { PrimaryItemDisplayRouter } from '../../components/execution';
import { useAppState } from '../contexts';
import { useStorageStatus } from '../hooks/useStorageStatus';
import { useActiveTask } from '../hooks/useActiveTask';
import { useCurrentTime } from '../../hooks/useCurrentTime';
import {
  ExecutionLoadingState,
  ExecutionErrorState,
  TaskCalculationLoadingState,
  NoDataState,
  NoActiveTaskState,
  ExecutionHeader,
  PerformanceIndicator
} from './ExecutionStates';
import { getUpcomingTasks, getLastActiveTask } from '../utils/executionUtils';

interface EnhancedExecutionViewProps {
  readonly showHeader?: boolean;
  readonly autoRefreshInterval?: number; // ms between task chain recalculations
  readonly performanceMode?: 'realtime' | 'optimized' | 'minimal';
}

export function EnhancedExecutionView({
  showHeader = true,
  autoRefreshInterval = 1000,
  performanceMode = 'optimized'
}: EnhancedExecutionViewProps): React.JSX.Element {
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
    // refreshInterval: autoRefreshInterval, // Currently unused
    performanceMode
  });

  // Memoize upcoming and last active tasks
  const upcomingTasks = useMemo(() =>
    getUpcomingTasks(items, baseCalendar, currentTime),
    [items, baseCalendar, currentTime]
  );

  const lastActiveTask = useMemo(() =>
    getLastActiveTask(items, baseCalendar, currentTime),
    [items, baseCalendar, currentTime]
  );

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
        upcomingTasks={upcomingTasks}
        lastActiveTask={lastActiveTask}
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
            item={currentTask}
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

// Styled components
const ExecutionContainer = styled(Box)(() => ({
  width: '100%',
  transition: 'all 0.3s ease-in-out',
  position: 'relative'
}));
