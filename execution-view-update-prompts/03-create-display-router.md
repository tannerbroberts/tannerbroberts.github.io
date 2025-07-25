# Prompt 3: Create Primary Display Router Component

## Objective
Create a router component that determines which primary display component to render based on item type, and handles the recursive rendering of child items within parent containers.

## Requirements

### 1. Create `PrimaryItemDisplayRouter` Component
**File**: `src/components/execution/PrimaryItemDisplayRouter.tsx`

**Props**:
```typescript
interface PrimaryItemDisplayRouterProps {
  readonly item: Item;
  readonly taskChain: Item[];
  readonly currentTime: number;
  readonly startTime: number;
  readonly isDeepest?: boolean;
  readonly depth?: number; // For preventing infinite recursion
}
```

**Functionality**:
- Determine item type and render appropriate primary display component
- Handle recursive rendering for containers (SubCalendar and CheckList)
- Calculate child start times correctly
- Prevent infinite recursion with depth limiting
- Pass through all necessary props

### 2. Update Container Components for Recursion
**Files to modify**:
- `src/components/execution/PrimarySubCalendarItemDisplay.tsx`
- `src/components/execution/PrimaryCheckListItemDisplay.tsx`

**Changes needed**:
- Add child rendering area in containers
- Use PrimaryItemDisplayRouter for child items
- Handle child start time calculations
- Proper spacing and nesting visualization

### 3. Create Helper Functions
**File**: `src/components/execution/executionUtils.ts`

**Functions needed**:
```typescript
// Calculate start time for a child item
export function calculateChildStartTime(
  parentStartTime: number,
  childReference: Child | CheckListChild,
  taskChain: Item[]
): number;

// Get the active child item for current time
export function getActiveChildForExecution(
  parentItem: SubCalendarItem | CheckListItem,
  items: Item[],
  currentTime: number,
  parentStartTime: number
): Item | null;

// Determine if item should show as actively executing
export function isItemCurrentlyExecuting(
  item: Item,
  taskChain: Item[],
  currentTime: number
): boolean;
```

## Technical Requirements

### Router Logic

#### Type Detection
```typescript
const renderPrimaryDisplay = (item: Item, props: CommonProps) => {
  if (item instanceof BasicItem) {
    return <PrimaryBasicItemDisplay item={item} {...props} />;
  } else if (item instanceof SubCalendarItem) {
    return <PrimarySubCalendarItemDisplay item={item} {...props}>
      {renderChildren(item, props)}
    </PrimarySubCalendarItemDisplay>;
  } else if (item instanceof CheckListItem) {
    return <PrimaryCheckListItemDisplay item={item} {...props}>
      {renderChildren(item, props)}
    </PrimaryCheckListItemDisplay>;
  }
  return null;
};
```

#### Recursive Child Rendering
- For SubCalendarItem: render active child based on timing
- For CheckListItem: render next incomplete child or current active
- Handle nested containers properly
- Limit recursion depth to prevent infinite loops

#### Start Time Calculations
- BasicItem: uses provided startTime
- SubCalendarItem child: parentStartTime + child.start
- CheckListItem child: uses parent startTime (no offset)

### Container Updates

#### SubCalendarItem Container
- Show status bar at top
- Render active child below status bar
- Highlight child transition points
- Handle spacing and visual hierarchy

#### CheckListItem Container  
- Show collapsible checklist
- Render active child prominently
- Show completion status
- Allow expansion/collapse of checklist

### Visual Hierarchy
- Use indentation or borders to show nesting
- Different background colors for different levels
- Clear separation between parent and child content
- Maintain readable typography hierarchy

## Acceptance Criteria

### Functional Requirements
- [ ] Router correctly identifies item types
- [ ] Recursive rendering works for nested containers
- [ ] Child start times are calculated correctly
- [ ] Active child detection works properly
- [ ] Recursion depth is limited appropriately (max 10 levels)

### Visual Requirements
- [ ] Clear visual hierarchy between parent and child
- [ ] Nesting is visually obvious but not overwhelming
- [ ] Components maintain good spacing and readability
- [ ] Status bars and progress indicators are prominent
- [ ] Child transitions are smooth and clear

### Code Quality
- [ ] Router logic is clean and maintainable
- [ ] Helper functions are well-tested
- [ ] TypeScript types are accurate
- [ ] Error handling for edge cases
- [ ] Performance is acceptable (memoization used)

### Integration Testing
- [ ] Works with BasicItem (no children)
- [ ] Works with SubCalendarItem (with scheduled children)
- [ ] Works with CheckListItem (with checklist children)
- [ ] Handles deeply nested scenarios
- [ ] Handles mixed item types in chain

## Implementation Notes

1. Start with the router component and basic routing logic
2. Add helper functions for calculations
3. Update container components to use router for children
4. Test with simple scenarios first
5. Add visual hierarchy and polish

## Example Usage
```typescript
// In ExecutionView component
<PrimaryItemDisplayRouter
  item={taskChain[0]} // Root item
  taskChain={taskChain}
  currentTime={currentTime}
  startTime={baseStartTime}
  isDeepest={taskChain.length === 1}
  depth={0}
/>
```

## Edge Cases to Handle
- Items with no children
- Items with invalid child references
- Circular references in task chain
- Items with zero duration
- Time synchronization issues
- Missing items in item array

## Dependencies to Import
```typescript
import { useMemo, useCallback } from "react";
import { Box } from "@mui/material";
import { 
  BasicItem, 
  SubCalendarItem, 
  CheckListItem, 
  Item,
  Child,
  CheckListChild 
} from "../../functions/utils/item/index";
import { getItemById } from "../../functions/utils/item/utils";
import PrimaryBasicItemDisplay from "./PrimaryBasicItemDisplay";
import PrimarySubCalendarItemDisplay from "./PrimarySubCalendarItemDisplay";
import PrimaryCheckListItemDisplay from "./PrimaryCheckListItemDisplay";
```
