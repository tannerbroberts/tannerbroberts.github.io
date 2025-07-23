import { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import TaskChainAccordion from "./TaskChainAccordion";
import { useAppState } from "../reducerContexts/App";
import { useCurrentTime } from "../hooks/useCurrentTime";
import { getCurrentTaskChain } from "../functions/utils/item/index";

interface ExecutionViewProps {
  readonly showHeader?: boolean;
}

export default function ExecutionView({
  showHeader = true,
}: ExecutionViewProps) {
  const { items, baseCalendar } = useAppState();
  const currentTime = useCurrentTime(100); // Update every 100ms for smooth animation

  // Get the current task chain
  const taskChain = useMemo(() => {
    return getCurrentTaskChain(items, currentTime, baseCalendar);
  }, [items, currentTime, baseCalendar]);

  // If no current task chain, show idle state
  if (taskChain.length === 0) {
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
    <Box sx={{ width: '100%' }}>
      {showHeader && (
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Current Execution
        </Typography>
      )}

      <TaskChainAccordion
        taskChain={taskChain}
        showMoveDeleteButtons={false}
      />
    </Box>
  );
}
