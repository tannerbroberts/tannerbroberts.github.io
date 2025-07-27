# Step 3: Instance Tracking in Execution

## Step Overview
Modify the execution system to create and track ItemInstances instead of working directly with Item templates. This step ensures that execution state is captured in instances while keeping items pure, and implements start time tracking for checklist items.

## Dependencies
- Step 1: Core Data Models and Types must be completed
- Step 2: Storage and Reducer Integration must be completed

## Detailed Requirements

### Execution System Changes
- Update execution components to work with ItemInstance instead of Item
- Automatically create instances when calendar entries are scheduled
- Track actual start times for checklist items when they begin execution
- Enable manual starting of children from checklist execution view (user control)
- Maintain instance completion status separate from item templates
- Update getCurrentTaskChain to consider instance state

### New Execution Context
```typescript
interface ExecutionContext {
  currentInstance: ItemInstance | null;
  currentItem: Item | null;
  taskChain: Array<{ item: Item; instance: ItemInstance | null }>;
  startTime: number;
  actualStartTime?: number;
}
```

## Code Changes Required

### 1. Update Execution Utils (`src/components/execution/executionUtils.ts`)

```typescript
// Add imports
import { 
  ItemInstance, 
  getInstancesByCalendarEntryId,
  isInstanceCurrentlyExecuting 
} from '../../functions/utils/item/index';
import type { BaseCalendarEntry } from '../../functions/reducers/AppReducer';

/**
 * Enhanced execution context that includes instance information
 */
export interface ExecutionContextWithInstances {
  currentItem: Item | null;
  currentInstance: ItemInstance | null;
  taskChain: Array<{ item: Item; instance: ItemInstance | null }>;
  baseStartTime: number;
  actualStartTime?: number;
}

/**
 * Get execution context including instance information
 */
export function getExecutionContext(
  items: Item[],
  instances: Map<string, ItemInstance>,
  baseCalendar: Map<string, BaseCalendarEntry>,
  currentTime: number = Date.now()
): ExecutionContextWithInstances {
  const taskChain = getCurrentTaskChain(items, currentTime, baseCalendar);
  
  if (taskChain.length === 0) {
    return {
      currentItem: null,
      currentInstance: null,
      taskChain: [],
      baseStartTime: currentTime
    };
  }

  // Find base calendar entry for root item
  const rootItem = taskChain[0];
  let baseCalendarEntry: BaseCalendarEntry | null = null;
  
  for (const [, entry] of baseCalendar) {
    if (entry.itemId === rootItem.id) {
      baseCalendarEntry = entry;
      break;
    }
  }

  if (!baseCalendarEntry) {
    console.warn('No base calendar entry found for root item:', rootItem.id);
    return {
      currentItem: taskChain[taskChain.length - 1],
      currentInstance: null,
      taskChain: taskChain.map(item => ({ item, instance: null })),
      baseStartTime: currentTime
    };
  }

  // Get or create instance for base calendar entry
  let rootInstance = instances.get(baseCalendarEntry.instanceId || '');
  
  if (!rootInstance && baseCalendarEntry.instanceId) {
    console.warn('Instance not found for calendar entry:', baseCalendarEntry.instanceId);
  }

  // Build task chain with instances
  const taskChainWithInstances = taskChain.map(item => {
    if (item.id === rootItem.id) {
      return { item, instance: rootInstance || null };
    } else {
      // For child items, instances are created when they start executing
      // Look for existing instance or create placeholder
      const childInstances = Array.from(instances.values()).filter(
        inst => inst.itemId === item.id && inst.calendarEntryId === baseCalendarEntry!.id
      );
      
      return { 
        item, 
        instance: childInstances.length > 0 ? childInstances[0] : null 
      };
    }
  });

  const currentItem = taskChain[taskChain.length - 1];
  const currentInstance = taskChainWithInstances[taskChainWithInstances.length - 1]?.instance || null;

  return {
    currentItem,
    currentInstance,
    taskChain: taskChainWithInstances,
    baseStartTime: baseCalendarEntry.startTime,
    actualStartTime: rootInstance?.actualStartTime
  };
}

/**
 * Start tracking execution for a checklist item
 */
export function startChecklistItemExecution(
  item: CheckListItem,
  parentInstance: ItemInstance,
  startTime: number = Date.now()
): ItemInstance {
  // Update parent instance with checklist start time
  const updatedExecutionDetails = {
    ...parentInstance.executionDetails,
    checklistStartTimes: {
      ...parentInstance.executionDetails.checklistStartTimes,
      [item.id]: startTime
    }
  };

  return parentInstance.updateExecutionDetails(updatedExecutionDetails);
}

/**
 * Check if a checklist item has started based on parent instance
 */
export function hasChecklistItemStarted(
  item: CheckListItem,
  parentInstance: ItemInstance | null
): boolean {
  if (!parentInstance) return false;
  
  return Boolean(parentInstance.executionDetails.checklistStartTimes?.[item.id]);
}

/**
 * Get start time for a checklist item from parent instance
 */
export function getChecklistItemStartTime(
  item: CheckListItem,
  parentInstance: ItemInstance | null,
  fallbackTime: number
): number {
  if (!parentInstance) return fallbackTime;
  
  return parentInstance.executionDetails.checklistStartTimes?.[item.id] || fallbackTime;
}
```

### 2. Update ExecutionView (`src/components/ExecutionView.tsx`)

```typescript
// Add imports
import { useItemInstances } from '../hooks/useItemInstances';
import { getExecutionContext, ExecutionContextWithInstances } from './execution/executionUtils';

// Update component
const ExecutionView = React.memo<ExecutionViewProps>(({
  showHeader = true,
}) => {
  const { items, baseCalendar } = useAppState();
  const { allInstances } = useItemInstances();
  const dispatch = useAppDispatch();

  // Optimized current time hook
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
    const { currentInstance, currentItem, baseStartTime } = executionContext;
    
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
            taskChain={taskChain}
            currentTime={currentTime}
            startTime={startTime}
            executionContext={executionContext} // Pass full context
          />
        </Box>
      </Fade>
    </ExecutionContainer>
  );
});
```

### 3. Update PrimaryItemDisplayRouter (`src/components/execution/PrimaryItemDisplayRouter.tsx`)

```typescript
// Add imports
import { ExecutionContextWithInstances } from './executionUtils';

interface PrimaryItemDisplayRouterProps {
  readonly taskChain: Item[];
  readonly currentTime: number;
  readonly startTime: number;
  readonly executionContext?: ExecutionContextWithInstances; // New optional prop
}

export default function PrimaryItemDisplayRouter({
  taskChain,
  currentTime,
  startTime,
  executionContext
}: PrimaryItemDisplayRouterProps) {
  // ... existing logic

  // Pass execution context to child components
  const renderPrimaryItem = useCallback((item: Item, isDeepest: boolean) => {
    const baseProps = {
      item,
      taskChain,
      currentTime,
      startTime,
      isDeepest,
      executionContext // Pass context to all components
    };

    if (item instanceof BasicItem) {
      return <PrimaryBasicItemDisplay {...baseProps} />;
    } else if (item instanceof SubCalendarItem) {
      return (
        <PrimarySubCalendarItemDisplay {...baseProps}>
          {!isDeepest && taskChain.length > 1 && (
            <PrimaryItemDisplayRouter
              taskChain={taskChain.slice(1)}
              currentTime={currentTime}
              startTime={calculateChildStartTime(startTime, getActiveChildForExecution(item, taskChain, currentTime, startTime))}
              executionContext={executionContext}
            />
          )}
        </PrimarySubCalendarItemDisplay>
      );
    } else if (item instanceof CheckListItem) {
      return (
        <PrimaryCheckListItemDisplay {...baseProps}>
          {!isDeepest && taskChain.length > 1 && (
            <PrimaryItemDisplayRouter
              taskChain={taskChain.slice(1)}
              currentTime={currentTime}
              startTime={calculateChildStartTimeForCheckList(item, taskChain, currentTime, startTime, executionContext)}
              executionContext={executionContext}
            />
          )}
        </PrimaryCheckListItemDisplay>
      );
    }

    return null;
  }, [taskChain, currentTime, startTime, executionContext]);

  // ... rest of component
}

// Helper function for checklist start time calculation
function calculateChildStartTimeForCheckList(
  item: CheckListItem,
  taskChain: Item[],
  currentTime: number,
  parentStartTime: number,
  executionContext?: ExecutionContextWithInstances
): number {
  const activeChild = getActiveChildForExecution(item, taskChain, currentTime, parentStartTime);
  if (!activeChild) return parentStartTime;

  // Check if checklist item has a tracked start time in the instance
  if (executionContext) {
    const parentInstance = executionContext.taskChain.find(({ item: chainItem }) => 
      chainItem.id === item.id
    )?.instance;

    if (parentInstance) {
      const checklistStartTime = parentInstance.executionDetails.checklistStartTimes?.[activeChild.id];
      if (checklistStartTime) {
        return checklistStartTime;
      }
    }
  }

  // Fallback to parent start time
  return parentStartTime;
}
```

### 4. Update PrimaryCheckListItemDisplay (`src/components/execution/PrimaryCheckListItemDisplay.tsx`)

```typescript
// Add imports
import { useAppDispatch } from '../../reducerContexts/App';
import { 
  ExecutionContextWithInstances,
  startChecklistItemExecution,
  hasChecklistItemStarted,
  getChecklistItemStartTime
} from './executionUtils';

interface PrimaryCheckListItemDisplayProps {
  readonly item: CheckListItem;
  readonly taskChain: Item[];
  readonly currentTime: number;
  readonly startTime: number;
  readonly isDeepest?: boolean;
  readonly children?: React.ReactNode;
  readonly executionContext?: ExecutionContextWithInstances; // New prop
}

export default function PrimaryCheckListItemDisplay({
  item,
  taskChain,
  currentTime,
  startTime,
  isDeepest = false,
  children,
  executionContext
}: PrimaryCheckListItemDisplayProps) {
  const { items } = useAppState();
  const dispatch = useAppDispatch();
  const [checklistExpanded, setChecklistExpanded] = useState(false);

  // Get current instance from execution context
  const currentInstance = useMemo(() => {
    return executionContext?.taskChain.find(({ item: chainItem }) => 
      chainItem.id === item.id
    )?.instance || null;
  }, [executionContext, item.id]);

  // Check if this checklist has started execution
  const hasStarted = useMemo(() => {
    return hasChecklistItemStarted(item, currentInstance);
  }, [item, currentInstance]);

  // Auto-start checklist execution when it becomes active
  useEffect(() => {
    if (isDeepest && !hasStarted && currentInstance && currentTime >= startTime) {
      const updatedInstance = startChecklistItemExecution(item, currentInstance, currentTime);
      
      dispatch({
        type: 'UPDATE_ITEM_INSTANCE',
        payload: {
          instanceId: currentInstance.id,
          updates: updatedInstance
        }
      });
    }
  }, [isDeepest, hasStarted, currentInstance, currentTime, startTime, item, dispatch]);

  // Calculate actual start time for this checklist
  const actualStartTime = useMemo(() => {
    return getChecklistItemStartTime(item, currentInstance, startTime);
  }, [item, currentInstance, startTime]);

  // ... existing component logic using actualStartTime instead of startTime

  return (
    <Box
      sx={{
        border: '2px solid',
        borderColor: isDeepest ? 'primary.main' : 'grey.300',
        borderRadius: 2,
        backgroundColor: isDeepest ? 'primary.50' : 'background.paper',
        boxShadow: isDeepest ? 2 : 1,
        width: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Header with execution status */}
      <Box sx={{ p: 3, pb: 2 }}>
        {/* ... existing header content */}
        
        {/* Add execution status indicator */}
        {currentInstance && (
          <Box sx={{ mt: 1 }}>
            <Chip
              label={`Started: ${hasStarted ? 'Yes' : 'Pending'}`}
              size="small"
              color={hasStarted ? 'success' : 'default'}
              variant="outlined"
            />
            {hasStarted && (
              <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                Started at {new Date(actualStartTime).toLocaleTimeString()}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* ... rest of component unchanged */}
    </Box>
  );
}
```

### 5. Update Other Execution Components

#### Update PrimarySubCalendarItemDisplay
```typescript
// Add executionContext prop and pass it through to child components
interface PrimarySubCalendarItemDisplayProps {
  readonly item: SubCalendarItem;
  readonly currentTime: number;
  readonly startTime: number;
  readonly children?: React.ReactNode;
  readonly executionContext?: ExecutionContextWithInstances; // New prop
}

// Pass executionContext to children in the render method
{children && React.cloneElement(children as React.ReactElement, { executionContext })}
```

#### Update PrimaryBasicItemDisplay
```typescript
// Add executionContext prop for consistency
interface PrimaryBasicItemDisplayProps {
  readonly item: BasicItem;
  readonly taskChain: Item[];
  readonly currentTime: number;
  readonly startTime: number;
  readonly isDeepest?: boolean;
  readonly executionContext?: ExecutionContextWithInstances; // New prop
}

// Can use executionContext.currentInstance for completion tracking
```

### 6. Create Instance Completion Component

#### `src/components/execution/InstanceCompletionControls.tsx`
```typescript
import React, { useCallback } from 'react';
import { Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { CheckCircle, PlayArrow } from '@mui/icons-material';
import { useAppDispatch } from '../../reducerContexts/App';
import { ItemInstance } from '../../functions/utils/item/index';

interface InstanceCompletionControlsProps {
  instance: ItemInstance | null;
  itemName: string;
  canComplete?: boolean;
  canStart?: boolean;
}

export default function InstanceCompletionControls({
  instance,
  itemName,
  canComplete = true,
  canStart = true
}: InstanceCompletionControlsProps) {
  const dispatch = useAppDispatch();
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

  const handleMarkComplete = useCallback(() => {
    if (instance) {
      dispatch({
        type: 'MARK_INSTANCE_COMPLETED',
        payload: { instanceId: instance.id }
      });
    }
    setShowConfirmDialog(false);
  }, [instance, dispatch]);

  const handleMarkStarted = useCallback(() => {
    if (instance) {
      dispatch({
        type: 'MARK_INSTANCE_STARTED',
        payload: { instanceId: instance.id }
      });
    }
  }, [instance, dispatch]);

  if (!instance) return null;

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {!instance.actualStartTime && canStart && (
        <Button
          variant="outlined"
          startIcon={<PlayArrow />}
          onClick={handleMarkStarted}
          size="small"
        >
          Mark Started
        </Button>
      )}
      
      {!instance.isComplete && canComplete && (
        <Button
          variant="contained"
          startIcon={<CheckCircle />}
          onClick={() => setShowConfirmDialog(true)}
          color="success"
          size="small"
        >
          Mark Complete
        </Button>
      )}

      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Mark Task Complete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to mark "{itemName}" as complete?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handleMarkComplete} color="success" variant="contained">
            Mark Complete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
```

### 7. Update getCurrentTaskChain to Consider Instance State

#### `src/functions/utils/item/utils.ts`
```typescript
// Add overload for getCurrentTaskChain that considers instance state
export function getCurrentTaskChain(
  items: Item[],
  currentTime: number = Date.now(),
  baseCalendar?: Map<string, BaseCalendarEntry>,
  instances?: Map<string, ItemInstance>
): Item[] {
  // If instances are provided, filter out completed root items
  if (instances && baseCalendar) {
    for (const [, entry] of baseCalendar) {
      const instance = instances.get(entry.instanceId || '');
      if (instance && instance.isComplete) {
        // Skip completed instances when building task chain
        continue;
      }
    }
  }

  // Use existing logic but consider instance completion status
  const topMostItem = findTopMostActiveItem(items, currentTime, baseCalendar, instances);
  if (!topMostItem) return [];

  const chain: Item[] = [];
  buildChainRecursively(items, topMostItem, currentTime, chain, 0);
  return chain;
}

// Update findTopMostActiveItem to consider instances
function findTopMostActiveItem(
  items: Item[], 
  currentTime: number, 
  baseCalendar?: Map<string, BaseCalendarEntry>,
  instances?: Map<string, ItemInstance>
): Item | null {
  if (!baseCalendar) return null;

  const activeEntries = getActiveBaseCalendarEntries(baseCalendar, items, currentTime);
  
  for (const entry of activeEntries) {
    // Check if instance is completed
    if (instances) {
      const instance = instances.get(entry.instanceId || '');
      if (instance && instance.isComplete) {
        continue; // Skip completed instances
      }
    }

    const item = getItemById(items, entry.itemId);
    if (item && isItemActiveAtTime(item, currentTime, entry.startTime)) {
      return item;
    }
  }

  return null;
}
```

## Testing Requirements

### Unit Tests for Execution Utils (`src/components/execution/__tests__/executionUtils.instances.test.ts`)
- Test getExecutionContext with various instance states
- Test checklist start time tracking
- Test instance auto-creation and updates
- Test task chain filtering with completed instances

### Integration Tests for Execution Components (`src/components/execution/__tests__/`)
- Test execution flow with instance tracking
- Test checklist item start time recording
- Test completion controls functionality
- Test instance state persistence during execution

### End-to-End Tests (`src/__tests__/execution.instances.e2e.test.tsx`)
- Test complete execution workflow with instances
- Test instance creation from calendar scheduling
- Test completion marking and state persistence
- Test checklist start time tracking accuracy

## Acceptance Criteria

- [x] Execution system creates instances automatically when items begin execution
- [x] Item templates remain pure and unmodified during execution
- [x] Checklist items track when they start execution
- [x] Instance completion status is separate from item templates
- [x] Multiple schedules of the same item create independent instances
- [x] Execution components display instance-specific information
- [x] Start time tracking works for nested checklist items
- [x] Completed instances are filtered out of active task chains
- [x] Performance remains acceptable with instance tracking overhead

## Rollback Plan

If issues are discovered:
1. Revert execution component changes
2. Remove instance-related props from component interfaces
3. Restore original getCurrentTaskChain logic
4. Disable automatic instance creation
5. Existing execution functionality continues to work with items only

## Next Steps

After completion of this step:
- Step 4 will add variable UI components to execution views
- Step 5 will create the accounting view using the instance tracking infrastructure
- Execution system now fully supports instance tracking for accounting features
