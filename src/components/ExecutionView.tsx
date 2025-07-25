import React, { useMemo, useCallback } from "react";
import { Box, Typography, Fade } from "@mui/material";
import { styled } from "@mui/material/styles";
import { PrimaryItemDisplayRouter } from "./execution";
import { useAppState } from "../reducerContexts/App";
import { useCurrentTime } from "../hooks/useCurrentTime";
import { getCurrentTaskChain } from "../functions/utils/item/index";

// Styled components for enhanced visuals
const ExecutionContainer = styled(Box)(() => ({
  width: '100%',
  transition: 'all 0.3s ease-in-out',
}));

const IdleStateContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(3),
  textAlign: 'center',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.background.default,
  boxShadow: theme.shadows[1],
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[2],
  },
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

interface ExecutionViewProps {
  readonly showHeader?: boolean;
}

/**
 * Calculate base start time for the root item in the task chain
 * Uses base calendar entries if available, otherwise falls back to current time
 * Memoized for performance optimization
 */
const calculateBaseStartTime = (
  taskChain: unknown[],
  baseCalendar?: Map<string, { id: string; itemId: string; startTime: number }>
): number => {
  if (taskChain.length === 0) return Date.now();

  const rootItem = taskChain[0] as { id: string };
  if (baseCalendar) {
    for (const [, entry] of baseCalendar) {
      if (entry.itemId === rootItem.id) {
        return entry.startTime;
      }
    }
  }

  // Fallback to current time if no calendar entry found
  return Date.now();
};

// Memoized component for better performance
const ExecutionView = React.memo<ExecutionViewProps>(({
  showHeader = true,
}) => {
  const { items, baseCalendar } = useAppState();

  // Optimized current time hook - reduce frequency for less critical updates
  const currentTime = useCurrentTime(500);

  // Memoized task chain calculation with comprehensive error handling
  const taskChain = useMemo(() => {
    try {
      return getCurrentTaskChain(items, currentTime, baseCalendar);
    } catch (error) {
      console.error('Error getting current task chain:', error);
      return [];
    }
  }, [items, currentTime, baseCalendar]);

  // Memoized base start time calculation
  const baseStartTime = useMemo(() => {
    try {
      return calculateBaseStartTime(taskChain, baseCalendar);
    } catch (error) {
      console.error('Error calculating base start time:', error);
      return Date.now();
    }
  }, [taskChain, baseCalendar]);

  // Memoized render functions for better performance
  const renderIdleState = useCallback(() => (
    <Fade in timeout={500}>
      <IdleStateContainer>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            fontWeight: 'bold',
            mb: 1,
            background: 'linear-gradient(45deg, #666, #999)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          🎯 No Active Task
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            opacity: 0.8,
            fontStyle: 'italic',
          }}
        >
          No tasks are currently scheduled for execution
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            mt: 2,
            display: 'block',
            opacity: 0.6,
          }}
        >
          Ready to begin when a task becomes active
        </Typography>
      </IdleStateContainer>
    </Fade>
  ), []);

  const renderHeader = useCallback(() => (
    showHeader && (
      <Fade in timeout={300}>
        <HeaderContainer>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ⚡ Current Execution
          </Typography>
          <Box
            sx={{
              width: 4,
              height: 32,
              background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
              borderRadius: 2,
              animation: 'pulse 2s infinite',
            }}
          />
        </HeaderContainer>
      </Fade>
    )
  ), [showHeader]);

  const renderActiveExecution = useCallback(() => (
    <Fade in timeout={500}>
      <Box>
        <PrimaryItemDisplayRouter
          item={taskChain[0]}
          taskChain={taskChain}
          currentTime={currentTime}
          startTime={baseStartTime}
          isDeepest={taskChain.length === 1}
          depth={0}
        />
      </Box>
    </Fade>
  ), [taskChain, currentTime, baseStartTime]);

  // Early return for idle state - no need to calculate anything else
  if (taskChain.length === 0) {
    return (
      <ExecutionContainer>
        {renderHeader()}
        {renderIdleState()}

        {/* Add pulse animation for the header accent */}
        <style>
          {`
            @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.6; }
              100% { opacity: 1; }
            }
          `}
        </style>
      </ExecutionContainer>
    );
  }

  return (
    <ExecutionContainer>
      {renderHeader()}
      {renderActiveExecution()}

      {/* Global animation styles */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.6; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </ExecutionContainer>
  );
});

// Set display name for better debugging
ExecutionView.displayName = 'ExecutionView';

export default ExecutionView;
