# Step 3: Execution View Enhancement

## Step Title & Dependencies
**Title**: Enhanced SubCalendar Child Detection and Countdown Display  
**Dependencies**: Step 2 (Time Frame Realism) complete

## Detailed Requirements

### Current Execution View Limitations
1. **Active Child Detection**: Current logic may not properly handle edge cases
2. **Countdown Display**: No visual countdown for upcoming children when none are active
3. **Transition Timing**: Unclear display during transitions between children
4. **Status Clarity**: Insufficient visual distinction between active, upcoming, and completed children

### Enhanced Active Child Logic

#### Current Child States
- **Pre-Start**: Child hasn't started yet (current time < child start time)
- **Active**: Child is currently executing (within child's duration window)
- **Post-Complete**: Child has finished executing (past child's end time)
- **Gap Period**: No child is active, but more children are scheduled

#### New Detection Algorithm
1. **Precise Timing**: Use exact elapsed time calculations
2. **Gap Detection**: Identify periods where no child should be active
3. **Next Child Prediction**: Calculate when the next child will start
4. **Overlap Handling**: Handle cases where child durations overlap slightly

### Countdown Implementation

#### Next Child Information
- **Next Child Item**: The next scheduled child item
- **Time Until Start**: Precise countdown to when next child begins
- **Preparation Context**: What the user should be doing during the gap

#### Visual Countdown Display
- **Time Format**: "Next task in 2m 30s" format
- **Task Preview**: Show name of upcoming task
- **Progress Context**: Show where we are in the overall sequence

#### Gap Period Messaging
- **Current Activity**: "Monitoring bacon cooking" or "Preparing for next task"
- **Upcoming Preview**: "Next: Heat pancake pan in 1m 45s"
- **Context Information**: Brief description of what's happening during the gap

### Enhanced Status Bar Features

#### Active Child Display
- **Current Task Indicator**: Clear visual indicator for active child
- **Progress Visualization**: Progress bar for current child task
- **Time Remaining**: Countdown for current child completion

#### Upcoming Child Display
- **Next Task Preview**: Show upcoming child information
- **Countdown Timer**: Time until next child starts
- **Preparation Hints**: Brief context about what to prepare

## Code Changes Required

### File: `src/components/execution/executionUtils.ts`

#### Enhanced `getActiveChildForExecution` Function
```typescript
// Add return type for better type safety
interface ChildExecutionStatus {
  activeChild: Item | null;
  nextChild: {
    item: Item;
    timeUntilStart: number;
    startTime: number;
  } | null;
  gapPeriod: boolean;
  currentPhase: 'pre-start' | 'active' | 'gap' | 'complete';
}

// Enhanced function signature
export function getActiveChildForExecution(
  parentItem: SubCalendarItem | CheckListItem,
  items: Item[],
  currentTime: number,
  parentStartTime: number
): ChildExecutionStatus;
```

#### New Helper Functions
```typescript
// Calculate next child information
function getNextChildInfo(
  parentItem: SubCalendarItem,
  items: Item[],
  currentTime: number,
  parentStartTime: number
): { item: Item; timeUntilStart: number; startTime: number } | null;

// Determine if we're in a gap period
function isInGapPeriod(
  parentItem: SubCalendarItem,
  items: Item[],
  currentTime: number,
  parentStartTime: number
): boolean;

// Get context message for gap periods
function getGapPeriodContext(
  currentChild: Child | null,
  nextChild: Child | null,
  items: Item[]
): string;
```

### File: `src/components/execution/PrimarySubCalendarItemDisplay.tsx`

#### Enhanced Child Status Display
```typescript
// Add state for tracking child execution status
const childExecutionStatus = useMemo(() => {
  return getActiveChildForExecution(item, items, currentTime, startTime);
}, [item, items, currentTime, startTime]);

// Enhanced active child detection
const { activeChild, nextChild, gapPeriod, currentPhase } = childExecutionStatus;
```

#### New Countdown Display Component
```typescript
// Add countdown display for upcoming children
{nextChild && !activeChild && (
  <CountdownDisplay
    nextChild={nextChild}
    gapPeriod={gapPeriod}
    currentPhase={currentPhase}
  />
)}
```

### File: `src/components/execution/SubCalendarStatusBar.tsx`

#### Enhanced Status Information
```typescript
// Add child execution status to props
interface SubCalendarStatusBarProps {
  // ... existing props
  childExecutionStatus?: ChildExecutionStatus;
}

// Enhanced child status display logic
const displayChildStatus = useMemo(() => {
  if (childExecutionStatus?.activeChild) {
    return {
      type: 'active',
      child: childExecutionStatus.activeChild,
      message: `Executing: ${childExecutionStatus.activeChild.name}`
    };
  } else if (childExecutionStatus?.nextChild) {
    return {
      type: 'countdown',
      child: childExecutionStatus.nextChild.item,
      timeUntilStart: childExecutionStatus.nextChild.timeUntilStart,
      message: `Next: ${childExecutionStatus.nextChild.item.name}`
    };
  } else {
    return {
      type: 'none',
      message: 'No active or upcoming tasks'
    };
  }
}, [childExecutionStatus]);
```

#### New Countdown Display Logic
```typescript
// Add countdown formatting function
const formatCountdownTime = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / (60 * 1000));
  const seconds = Math.floor((milliseconds % (60 * 1000)) / 1000);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};
```

### New File: `src/components/execution/CountdownDisplay.tsx`

#### Dedicated Countdown Component
```typescript
// Create new component for countdown display
interface CountdownDisplayProps {
  nextChild: {
    item: Item;
    timeUntilStart: number;
    startTime: number;
  };
  gapPeriod: boolean;
  currentPhase: string;
}

// Component implementation with visual countdown
export default function CountdownDisplay({
  nextChild,
  gapPeriod,
  currentPhase
}: CountdownDisplayProps);
```

## Testing Requirements

### Unit Tests

#### Enhanced Active Child Detection
1. **Pre-Start State**: Test child detection before any children start
2. **Active State**: Test detection during child execution
3. **Gap State**: Test detection during gaps between children
4. **Post-Complete State**: Test detection after all children complete
5. **Edge Cases**: Test timing edge cases and overlaps

#### Countdown Calculation
1. **Time Accuracy**: Test countdown calculations are mathematically correct
2. **Next Child Detection**: Test correct identification of next child
3. **Gap Period Detection**: Test accurate gap period identification
4. **Transition Handling**: Test smooth transitions between states

### Integration Tests
1. **Status Bar Integration**: Test status bar displays correct information
2. **Display Component Integration**: Test primary display shows correct child status
3. **Real-time Updates**: Test that displays update correctly as time progresses
4. **Multiple Children**: Test behavior with complex subcalendar sequences

### Manual Testing Steps
1. **Start Breakfast Lesson**: Begin execution and verify initial state
2. **Monitor Transitions**: Watch transitions between children
3. **Verify Countdowns**: Confirm countdown timers are accurate
4. **Check Gap Periods**: Verify display during gaps between children
5. **Test Edge Cases**: Test behavior at exact transition times

## Acceptance Criteria

### Active Child Detection
- [x] Correctly identifies when a child is actively executing
- [x] Correctly identifies when no child is currently active
- [x] Correctly identifies the next child to execute
- [x] Handles edge cases at exact transition times
- [x] Works correctly with overlapping child durations

### Countdown Display
- [x] Shows accurate countdown to next child start
- [x] Displays next child name and context
- [x] Updates in real-time as countdown progresses
- [x] Handles countdown completion gracefully
- [x] Shows appropriate messaging during gap periods

### Visual Clarity
- [x] Clear distinction between active and upcoming children
- [x] Easy to understand countdown format
- [x] Appropriate context information during gaps
- [x] Consistent visual design with existing components
- [x] No visual glitches during state transitions

### Performance
- [x] Real-time updates don't cause performance issues
- [x] Countdown calculations are efficient
- [x] Component re-renders are optimized
- [x] Memory usage remains stable during long executions
- [x] No excessive API calls or calculations

### User Experience
- [x] Always clear what's happening right now
- [x] Always clear what's happening next
- [x] Appropriate preparation time for upcoming tasks
- [x] Helpful context during waiting periods
- [x] Smooth, predictable transitions between states

## Rollback Plan

### Component-Level Rollback
1. **Revert executionUtils**: Return to original active child detection logic
2. **Revert Status Bar**: Remove countdown display enhancements
3. **Remove CountdownDisplay**: Delete new countdown component if needed

### Feature-Level Rollback
- **Disable Countdown**: Can disable countdown display while keeping improved detection
- **Simplify Status**: Can simplify status display while keeping enhanced logic
- **Progressive Rollback**: Can remove enhancements incrementally

### Data Safety
- **No Data Changes**: This step only affects display logic, no data structure changes
- **State Preservation**: All existing execution state remains intact
- **Backward Compatibility**: All existing functionality continues to work

### Testing After Rollback
- **Basic Execution**: Verify basic execution view still works
- **Child Detection**: Verify original child detection logic works
- **Status Display**: Verify original status display works correctly
