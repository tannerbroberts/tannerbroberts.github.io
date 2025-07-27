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
  AccessTime
} from '@mui/icons-material';
import { Item } from '../../functions/utils/item/index';
import { TaskScheduleInfo } from '../utils/executionUtils';

// Loading state while storage is being restored
export function ExecutionLoadingState({
  message = "Loading your schedule...",
  showProgress = true
}: {
  readonly message?: string;
  readonly showProgress?: boolean;
}): React.JSX.Element {
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
export function TaskCalculationLoadingState(): React.JSX.Element {
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
  readonly error: string;
  readonly canRetry?: boolean;
  readonly onRetry?: () => void;
}): React.JSX.Element {
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
export function NoDataState(): React.JSX.Element {
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
          onClick={() => {/* Open new item dialog */ }}
        >
          Create First Task
        </Button>
        <Button
          variant="outlined"
          onClick={() => {/* Open import dialog */ }}
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
  readonly upcomingTasks: TaskScheduleInfo[];
  readonly lastActiveTask: Item | null;
}): React.JSX.Element {
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
                {upcomingTasks.slice(0, 5).map((taskInfo) => (
                  <ListItem key={taskInfo.task.id}>
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

// Header component for execution view
export function ExecutionHeader({
  currentTask,
  lastUpdated,
  dataSource
}: {
  readonly currentTask: Item;
  readonly lastUpdated: number;
  readonly dataSource: string;
}): React.JSX.Element {
  return (
    <Box mb={2} p={2} bgcolor="background.paper" borderRadius={1}>
      <Typography variant="h6" gutterBottom>
        Current Task: {currentTask.name}
      </Typography>
      <Box display="flex" gap={2} alignItems="center">
        <Chip
          label={`Data: ${dataSource}`}
          size="small"
          variant="outlined"
        />
        <Chip
          label={`Calc: ${lastUpdated.toFixed(1)}ms`}
          size="small"
          variant="outlined"
        />
      </Box>
    </Box>
  );
}

// Performance indicator for development
export function PerformanceIndicator({
  taskChainCalculationTime,
  itemCount,
  calendarEntryCount
}: {
  readonly taskChainCalculationTime: number;
  readonly itemCount: number;
  readonly calendarEntryCount: number;
}): React.JSX.Element {
  const isSlowCalculation = taskChainCalculationTime > 50;

  return (
    <Box
      position="absolute"
      bottom={8}
      right={8}
      bgcolor={isSlowCalculation ? 'warning.light' : 'info.light'}
      p={1}
      borderRadius={1}
      fontSize="0.75rem"
      sx={{ opacity: 0.7 }}
    >
      <Typography variant="caption" display="block">
        Calc: {taskChainCalculationTime.toFixed(1)}ms
      </Typography>
      <Typography variant="caption" display="block">
        Items: {itemCount} | Calendar: {calendarEntryCount}
      </Typography>
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
