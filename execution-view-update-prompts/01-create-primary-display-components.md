# Prompt 1: Create Primary Item Display Components

## Objective
Create three specialized primary display components that will replace the current accordion-based display in the execution view. These components should provide focused, execution-oriented views for each item type.

## Requirements

### 1. Create `PrimaryBasicItemDisplay` Component
**File**: `src/components/execution/PrimaryBasicItemDisplay.tsx`

**Props**:
```typescript
interface PrimaryBasicItemDisplayProps {
  readonly item: BasicItem;
  readonly taskChain: Item[];
  readonly currentTime: number;
  readonly startTime: number;
  readonly isDeepest?: boolean;
}
```

**Display Elements**:
- Item name as header
- Duration and remaining time
- Progress bar showing completion percentage
- Priority indicator if priority > 0
- Clean, execution-focused layout

### 2. Create `PrimarySubCalendarItemDisplay` Component  
**File**: `src/components/execution/PrimarySubCalendarItemDisplay.tsx`

**Props**:
```typescript
interface PrimarySubCalendarItemDisplayProps {
  readonly item: SubCalendarItem;
  readonly taskChain: Item[];
  readonly currentTime: number;
  readonly startTime: number;
  readonly isDeepest?: boolean;
  readonly children?: React.ReactNode; // For recursive rendering
}
```

**Display Elements**:
- Item name as header
- Status bar across the top (to be implemented in next prompt)
- Placeholder for child content area
- Duration and progress information
- Container styling that allows child components

### 3. Create `PrimaryCheckListItemDisplay` Component
**File**: `src/components/execution/PrimaryCheckListItemDisplay.tsx`

**Props**:
```typescript
interface PrimaryCheckListItemDisplayProps {
  readonly item: CheckListItem;
  readonly taskChain: Item[];
  readonly currentTime: number;
  readonly startTime: number;
  readonly isDeepest?: boolean;
  readonly children?: React.ReactNode; // For recursive rendering
}
```

**Display Elements**:
- Item name as header
- Collapsible checklist showing child items
- Progress based on completed checklist items
- Each checklist item shows name and completion status
- Expandable/collapsible design
- Container for child content if needed

## Technical Requirements

### Dependencies
- Use Material-UI components
- Import necessary utilities from `../functions/utils/item/`
- Use existing hooks like `useCurrentTime`, `useAppState`
- Import progress calculation functions from utils

### Styling Guidelines
- Use clean, execution-focused design
- Consistent spacing and typography
- Progress indicators should be prominent
- Use semantic colors (green for complete, blue for in-progress, etc.)
- Ensure responsive design

### State Management
- Components should be read-only (no item modification)
- Calculate progress and timing using existing utility functions
- Use memoization for expensive calculations

## File Structure
Create a new directory: `src/components/execution/`

## Acceptance Criteria

### Functional Requirements
- [ ] All three components render without errors
- [ ] Components correctly display item information
- [ ] Progress calculations work correctly
- [ ] CheckList component expands/collapses properly
- [ ] Components handle edge cases (no duration, no children, etc.)

### Code Quality
- [ ] TypeScript interfaces are properly defined
- [ ] Components use proper React patterns (memoization, etc.)
- [ ] Error handling for invalid props
- [ ] Consistent code style with existing codebase
- [ ] Proper imports and exports

### Visual Design
- [ ] Clean, execution-focused layout
- [ ] Consistent spacing and typography
- [ ] Progress indicators are clear and accurate
- [ ] Components look professional and polished
- [ ] Responsive design works on different screen sizes

### Testing
- [ ] Components can be imported without errors
- [ ] Basic rendering works with valid props
- [ ] Edge cases don't crash the components
- [ ] Progress calculations return expected values

## Implementation Notes

1. Start with the basic structure for all three components
2. Use existing utility functions for progress calculation
3. Don't implement status bars yet (that's the next prompt)
4. Focus on core display functionality
5. Ensure components are ready for recursive child rendering

## Dependencies to Import
```typescript
import { useMemo } from "react";
import { Box, Typography, LinearProgress, Collapse, IconButton } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { BasicItem, SubCalendarItem, CheckListItem, Item } from "../../functions/utils/item/index";
import { getTaskProgress, getTaskStartTime } from "../../functions/utils/item/utils";
import { useAppState } from "../../reducerContexts/App";
```
