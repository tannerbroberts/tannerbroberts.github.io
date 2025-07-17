import { useState, useMemo, useCallback } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
  LinearProgress
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import PieChartCountdown from "./PieChartCountdown";
import TaskBreadcrumbs from "./TaskBreadcrumbs";
import { useAppState } from "../reducerContexts/App";
import { useCurrentTime } from "../hooks/useCurrentTime";
import { getCurrentTaskChain, getTaskProgress, getTaskStartTime, getDeepestItem } from "../functions/utils/item";

interface ExecutionViewProps {
  readonly showHeader?: boolean;
  readonly showSubtaskInfo?: boolean;
}

export default function ExecutionView({
  showHeader = true,
  showSubtaskInfo = true,
}: ExecutionViewProps) {
  const { items, baseCalendar } = useAppState();
  const currentTime = useCurrentTime(100); // Update every 100ms for smooth animation
  const [expanded, setExpanded] = useState(true);

  // Get the current task chain
  const taskChain = useMemo(() => {
    return getCurrentTaskChain(items, currentTime, baseCalendar);
  }, [items, currentTime, baseCalendar]);

  // Get the deepest (currently executing) task
  const currentTask = useMemo(() => {
    return getDeepestItem(taskChain);
  }, [taskChain]);

  // Calculate progress for the current task
  const taskProgress = useMemo(() => {
    if (!currentTask) return 0;
    const startTime = getTaskStartTime(taskChain, currentTask, baseCalendar);
    return getTaskProgress(currentTask, currentTime, startTime);
  }, [currentTask, currentTime, taskChain, baseCalendar]);

  // Calculate remaining time
  const remainingTime = useMemo(() => {
    if (!currentTask) return 0;
    const startTime = getTaskStartTime(taskChain, currentTask, baseCalendar);
    const elapsed = currentTime - startTime;
    return Math.max(0, currentTask.duration - elapsed);
  }, [currentTask, currentTime, taskChain, baseCalendar]);

  // Calculate total chain duration
  const totalChainDuration = useMemo(() => {
    return taskChain.reduce((total, task) => total + task.duration, 0);
  }, [taskChain]);

  // Calculate chain progress
  const chainProgress = useMemo(() => {
    if (taskChain.length === 0) return 0;
    let totalElapsed = 0;
    for (const task of taskChain) {
      const startTime = getTaskStartTime(taskChain, task, baseCalendar);
      const elapsed = Math.max(0, currentTime - startTime);
      totalElapsed += Math.min(elapsed, task.duration);
    }
    return totalChainDuration > 0 ? (totalElapsed / totalChainDuration) * 100 : 0;
  }, [taskChain, currentTime, baseCalendar, totalChainDuration]);

  // Format time helper
  const formatTime = useCallback((milliseconds: number) => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }, []);

  const handleAccordionToggle = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded]);

  const handleTaskClick = useCallback((itemId: string) => {
    // This could be used to navigate to a specific task or open task details
    console.log('Navigate to task:', itemId);
  }, []);

  // Dynamic color based on progress
  const progressColor = useMemo(() => {
    if (taskProgress > 90) return '#4caf50'; // Green for nearly complete
    if (taskProgress > 50) return '#ff9800'; // Orange for half complete
    return '#2196f3'; // Blue for just started
  }, [taskProgress]);

  // If no current task, show idle state
  if (!currentTask) {
    return (
      <Box sx={{
        width: '100%',
        p: 2,
        textAlign: 'center',
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        backgroundColor: '#f5f5f5'
      }}>
        <Typography variant="h6" color="text.secondary">
          No Active Task
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No tasks are currently scheduled for execution
        </Typography>
      </Box>
    );
  }

  return (
    <Accordion expanded={expanded} onChange={handleAccordionToggle} sx={{ width: '100%' }}>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e0e0e0',
          '&:hover': { backgroundColor: '#e8f4f8' }
        }}
      >
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          width: '100%',
          pr: 2
        }}>
          <PieChartCountdown
            progress={taskProgress}
            size={48}
            showPercentage={false}
            completedColor={progressColor}
          />

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {currentTask.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatTime(remainingTime)} remaining
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              label={`${taskProgress.toFixed(1)}%`}
              size="small"
              color="primary"
            />
            {taskChain.length > 1 && (
              <Chip
                label={`${taskChain.length - 1} parent${taskChain.length > 2 ? 's' : ''}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Task Breadcrumbs */}
          {showHeader && taskChain.length > 1 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Task Hierarchy:
              </Typography>
              <TaskBreadcrumbs
                chain={taskChain}
                currentItemId={currentTask.id}
                onItemClick={handleTaskClick}
              />
            </Box>
          )}

          {/* Current Task Details */}
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Current Task Details:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Duration: {formatTime(currentTask.duration)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Progress: {taskProgress.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Remaining: {formatTime(remainingTime)}
              </Typography>
              {taskChain.length > 1 && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Chain Progress: {chainProgress.toFixed(1)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={chainProgress}
                    sx={{ height: 6, borderRadius: 1 }}
                  />
                </Box>
              )}
            </Box>

            {/* Subtasks Info */}
            {showSubtaskInfo && currentTask.children.length > 0 && (
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Subtasks:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentTask.children.length} subtask{currentTask.children.length > 1 ? 's' : ''}
                </Typography>
                {currentTask.children.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Next: {currentTask.children[0].id.substring(0, 8)}...
                  </Typography>
                )}
                {currentTask.children.length > 1 && (
                  <Typography variant="body2" color="text.secondary">
                    Queue: {currentTask.children.length - 1} more
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
