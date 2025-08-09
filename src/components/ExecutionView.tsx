import React, { useMemo, useEffect, useState } from "react";
import { Box, Typography, Fade, Chip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Schedule } from "@mui/icons-material";
import { PrimaryItemDisplayRouter } from "./execution";
import { useAppState, useAppDispatch } from "../reducerContexts";
import { useCurrentTime } from "../hooks/useCurrentTime";
import { useItemInstances } from "../hooks/useItemInstances";
import { getExecutionContext, ExecutionContextWithInstances } from "./execution/executionUtils";
import { ConflictPrioritizationDialog, ConflictItem } from './dialogs/ConflictPrioritizationDialog';
import { conflictGroups, upsertItem } from '../api/client';

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

  // Conflict dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogItems, setDialogItems] = useState<ConflictItem[]>([])
  const [decisionCooldownUntil, setDecisionCooldownUntil] = useState<number>(0)

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

  // Conflict detection – show dialog if >=2 active overlaps
  useEffect(() => {
    let mounted = true
    const checkConflicts = async () => {
      try {
        const now = Date.now()
        const start = now - 60 * 60 * 1000
        const end = now + 60 * 60 * 1000
        const r: { groups?: ConflictItem[][] } = await conflictGroups(start, end)
        const groups = r.groups ?? []
        const isActive = (it: ConflictItem) => it.start <= now && now < it.end
        const active = groups.find(g => g.filter(isActive).length >= 2)
        if (!mounted) return
        // respect a short cooldown to avoid popping immediately after a decision
        const allowOpen = now >= decisionCooldownUntil
        setDialogOpen(Boolean(active) && allowOpen)
        setDialogItems(active ?? [])
      } catch (e) {
        console.warn('[conflicts] fetch failed', e)
      }
    }
    checkConflicts()
    const id = setInterval(checkConflicts, 15000)
    return () => { mounted = false; clearInterval(id) }
  }, [decisionCooldownUntil])

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
      <ConflictPrioritizationDialog
        open={dialogOpen}
        items={dialogItems}
        onChoose={async (id) => {
          const chosen = dialogItems.find(it => it.id === id)
          if (!chosen) { setDialogOpen(false); return }
          // Boost chosen priority above others
          const maxPriority = Math.max(0, ...dialogItems.map(i => i.priority ?? 0))
          const nextPriority = Math.max(maxPriority + 1, (chosen.priority ?? 0) + 1)
          try {
            await upsertItem({ id: chosen.id, type: 'basic', start: chosen.start, end: chosen.end, templateHash: chosen.templateHash, priority: nextPriority, parentId: null })
            window.dispatchEvent(new CustomEvent('app:notify', { detail: { id: `decide-${id}-${Date.now()}`, type: 'success', title: 'Prioritized', message: 'Well do this one now.' } }))
          } catch (e) {
            console.error('prioritize failed', e)
            window.dispatchEvent(new CustomEvent('app:notify', { detail: { id: `decide-${id}-${Date.now()}`, type: 'error', title: 'Failed', message: 'Could not set priority.' } }))
          } finally {
            setDialogOpen(false)
            setDecisionCooldownUntil(Date.now() + 10_000)
          }
        }}
        onSnooze={async (min) => {
          const ms = min * 60_000
          if (!dialogItems.length) { setDialogOpen(false); return }
          // Keep the first (already sorted by server: priority desc then start asc)
          const others = dialogItems.slice(1)
          try {
            await Promise.all(others.map(it => {
              const start = it.start + ms
              const end = it.end + ms
              return upsertItem({ id: it.id, type: 'basic', start, end, templateHash: it.templateHash, priority: it.priority ?? 0, parentId: null })
            }))
            window.dispatchEvent(new CustomEvent('app:notify', { detail: { id: `snooze-${Date.now()}`, type: 'success', title: 'Snoozed', message: `Snoozed ${others.length} item(s) ${min}m.` } }))
          } catch (e) {
            console.error('snooze failed', e)
            window.dispatchEvent(new CustomEvent('app:notify', { detail: { id: `snooze-${Date.now()}`, type: 'error', title: 'Failed', message: 'Could not snooze others.' } }))
          } finally {
            setDialogOpen(false)
            setDecisionCooldownUntil(Date.now() + 10_000)
          }
        }}
        onClose={() => setDialogOpen(false)}
      />
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
          {taskChain.length > 1 && (
            <Chip
              label={`Up next: ${taskChain[1].name}`}
              color="default"
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
