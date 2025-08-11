import React, { useMemo, useEffect, useState } from "react";
import { Box, Typography, Fade, Chip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Schedule } from "@mui/icons-material";
import { PrimaryItemDisplayRouter } from "./execution";
import ContextStack from "./execution/ContextStack";
import { useAppState, useAppDispatch } from "../reducerContexts";
import { useCurrentTime } from "../hooks/useCurrentTime";
import { useItemInstances } from "../hooks/useItemInstances";
import { getExecutionContext, ExecutionContextWithInstances, getChildExecutionStatus, getHierarchyStatus } from "./execution/executionUtils";
import { SubCalendarItem, CheckListItem, Item, ItemInstance } from "../functions/utils/item/index";
import type { BaseCalendarEntry } from "../functions/reducers/AppReducer";
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
  const currentTime = useCurrentTime(20);

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
    // Mark the ROOT instance started when execution begins, even if there is no child instance yet
    const chainItems = executionContext.taskChain.map(({ item }) => item);
    if (chainItems.length === 0) return;

    const root: Item = chainItems[0];
    const baseStartTime = executionContext.baseStartTime;

    if (currentTime < baseStartTime) return; // not started yet

    // Find the active or nearest base calendar entry for the root item
    const matchingEntries: { id: string; entry: BaseCalendarEntry }[] = [];
    for (const [id, entry] of baseCalendar) {
      if (entry.itemId === root.id) matchingEntries.push({ id, entry });
    }
    if (matchingEntries.length === 0) return;

    const active = matchingEntries.find(m => currentTime >= m.entry.startTime && currentTime < m.entry.startTime + (root.duration || 0));
    let chosen = active;
    if (!chosen) {
      const sorted = matchingEntries.slice().sort((a, b) => Math.abs(currentTime - a.entry.startTime) - Math.abs(currentTime - b.entry.startTime));
      chosen = sorted[0];
    }
    const instanceId = chosen.entry.instanceId;
    if (!instanceId) return;

    const instance: ItemInstance | undefined = (allInstances as Map<string, ItemInstance>).get(instanceId);
    if (instance && !instance.actualStartTime) {
      dispatch({ type: 'MARK_INSTANCE_STARTED', payload: { instanceId, startTime: currentTime } });
    }
  }, [executionContext, currentTime, dispatch, baseCalendar, allInstances]);

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

  // Compute "Up next" based on the root container's next child (more accurate than taskChain[1])
  const nextChipText = useMemo(() => {
    if (taskChain.length === 0) return null;
    const root = taskChain[0];
    if (!(root instanceof SubCalendarItem || root instanceof CheckListItem)) return null;
    const status = getChildExecutionStatus(root, items, currentTime, startTime);
    return status.nextChild ? `Up next: ${status.nextChild.item.name}` : null;
  }, [taskChain, items, currentTime, startTime]);

  const hierarchyChip = useMemo(() => {
    if (taskChain.length === 0) return null;
    const root = taskChain[0];
    if (!(root instanceof SubCalendarItem || root instanceof CheckListItem)) return null;
    const h = getHierarchyStatus(root, items, currentTime, startTime);
    const count = `${h.completedChildren}/${h.totalChildren}`;
    if (!h.hasActiveBasicDescendant && h.nextBasicDescendant) {
      return `Children: ${count} • Next basic: ${h.nextBasicDescendant.item.name}`;
    }
    return `Children: ${count}`;
  }, [taskChain, items, currentTime, startTime]);

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
          {nextChipText && (
            <Chip
              label={nextChipText}
              color="default"
              variant="outlined"
            />
          )}
          {hierarchyChip && (
            <Chip
              label={hierarchyChip}
              color="default"
              variant="outlined"
            />
          )}
        </HeaderContainer>
      )}

      <Fade in timeout={300}>
        <Box>
          <ContextStack taskChain={taskChain} currentTime={currentTime} rootStartTime={startTime} />
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
