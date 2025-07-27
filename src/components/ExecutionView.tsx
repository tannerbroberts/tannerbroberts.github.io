import React, { useMemo, useEffect } from "react";
import { Box, Typography, Fade, Chip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Schedule } from "@mui/icons-material";
import { PrimaryItemDisplayRouter } from "./execution";
import { useAppState, useAppDispatch } from "../reducerContexts/App";
import { useCurrentTime } from "../hooks/useCurrentTime";
import { useItemInstances } from "../hooks/useItemInstances";
import { getExecutionContext, ExecutionContextWithInstances } from "./execution/executionUtils";

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

// Memoized component for better performance
const ExecutionView = React.memo<ExecutionViewProps>(({
  showHeader = true,
}) => {
  const { items, baseCalendar } = useAppState();
  const { allInstances } = useItemInstances();
  const dispatch = useAppDispatch();

  // Optimized current time hook - reduce frequency for less critical updates
  const currentTime = useCurrentTime(500);

  // Enhanced execution context with instances
  const executionContext = useMemo((): ExecutionContextWithInstances => {
    try {
      return getExecutionContext(items, allInstances, baseCalendar, currentTime);
    } catch (error) {
      console.error('Error getting execution context:', error);
      return {
        currentItem: null,
        currentInstance: null,
        taskChain: [],
        baseStartTime: Date.now()
      };
    }
  }, [items, allInstances, baseCalendar, currentTime]);

  // Auto-start instance tracking when execution begins
  useEffect(() => {
    const { currentInstance, baseStartTime } = executionContext;
    
    if (currentInstance && !currentInstance.actualStartTime && currentTime >= baseStartTime) {
      // Mark instance as started
      dispatch({
        type: 'MARK_INSTANCE_STARTED',
        payload: { instanceId: currentInstance.id, startTime: currentTime }
      });
    }
  }, [executionContext, currentTime, dispatch]);

  // Calculate start time (use actual start time if available)
  const startTime = useMemo(() => {
    const { actualStartTime, baseStartTime } = executionContext;
    return actualStartTime || baseStartTime;
  }, [executionContext]);

  // Extract task chain items for display components
  const taskChain = useMemo(() => {
    return executionContext.taskChain.map(({ item }) => item);
  }, [executionContext]);

  // Render idle state if no current task
  if (!executionContext.currentItem || taskChain.length === 0) {
    return (
      <Fade in timeout={500}>
        <IdleStateContainer>
          <Box textAlign="center" py={8}>
            <Schedule sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h4" color="text.secondary" gutterBottom>
              No Active Tasks
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Schedule an item to begin execution
            </Typography>
          </Box>
        </IdleStateContainer>
      </Fade>
    );
  }

  return (
    <ExecutionContainer>
      {showHeader && (
        <HeaderContainer>
          <Typography variant="h4" component="h1">
            Current Task
          </Typography>
          {executionContext.currentInstance && (
            <Chip 
              label={executionContext.currentInstance.isComplete ? "Completed" : "In Progress"}
              color={executionContext.currentInstance.isComplete ? "success" : "primary"}
              variant="outlined"
            />
          )}
        </HeaderContainer>
      )}

      <Fade in timeout={300}>
        <Box>
          <PrimaryItemDisplayRouter
            item={taskChain[0]}
            taskChain={taskChain}
            currentTime={currentTime}
            startTime={startTime}
            isDeepest={taskChain.length === 1}
            depth={0}
            executionContext={executionContext}
          />
        </Box>
      </Fade>
    </ExecutionContainer>
  );
});

// Set display name for better debugging
ExecutionView.displayName = 'ExecutionView';

export default ExecutionView;
