# Prompt 2: Create Status Bar Component for SubCalendarItems

## Objective
Create a status bar component that displays across the top of SubCalendarItem displays, showing timing and progress information for scheduled containers.

## Requirements

### 1. Create `SubCalendarStatusBar` Component
**File**: `src/components/execution/SubCalendarStatusBar.tsx`

**Props**:
```typescript
interface SubCalendarStatusBarProps {
  readonly item: SubCalendarItem;
  readonly taskChain: Item[];
  readonly currentTime: number;
  readonly startTime: number;
}
```

**Display Elements**:
- Full-width bar at top of container
- Progress indicator showing overall SubCalendar completion
- Time information (elapsed/remaining)
- Visual indicator of current child activity
- Clean, prominent design that doesn't interfere with content

### 2. Update `PrimarySubCalendarItemDisplay`
**File**: `src/components/execution/PrimarySubCalendarItemDisplay.tsx`

- Integrate the new status bar at the top
- Ensure proper spacing and layout
- Make status bar visually prominent but not overwhelming

## Technical Requirements

### Status Bar Features

#### Progress Calculation
- Calculate overall progress based on scheduled children
- Show progress as both percentage and visual bar
- Handle edge cases (no children, zero duration, etc.)

#### Time Display
- Show elapsed time since SubCalendar started
- Show remaining time until SubCalendar completion
- Format times in human-readable format (hours, minutes, seconds)

#### Current Child Indicator
- Highlight which child is currently active
- Show name of active child if available
- Visual indicator of child transition points

#### Visual Design
- Use a horizontal progress bar as background
- Overlay time and child information
- Use color coding for different states:
  - Green: completed sections
  - Blue: current active section  
  - Gray: upcoming sections
- Height should be ~40-60px to be prominent but not overwhelming

### Implementation Details

#### Progress Logic
```typescript
// Calculate progress based on child completion
const calculateSubCalendarProgress = (
  item: SubCalendarItem, 
  currentTime: number, 
  startTime: number
) => {
  // Logic to determine which children are complete/active/upcoming
  // Return percentage complete and current child info
}
```

#### Time Formatting
- Use existing `formatTime` utility or create new one
- Format as "2h 15m 30s" style
- Handle edge cases like negative times

#### Child Activity Detection
- Use existing logic from `getCurrentTaskChain`
- Determine which child should be active based on timing
- Handle overlapping or gap scenarios

## Acceptance Criteria

### Functional Requirements
- [ ] Status bar displays correct progress percentage
- [ ] Time calculations are accurate (elapsed/remaining)
- [ ] Current child detection works correctly
- [ ] Bar updates in real-time as time progresses
- [ ] Handles edge cases without crashing

### Visual Requirements  
- [ ] Status bar is prominent and easy to read
- [ ] Progress visualization is clear and intuitive
- [ ] Time formatting is consistent and readable
- [ ] Color coding provides meaningful information
- [ ] Bar integrates well with SubCalendar display

### Code Quality
- [ ] Progress calculations are optimized (memoized)
- [ ] Component handles prop changes gracefully
- [ ] TypeScript types are accurate
- [ ] Code follows existing patterns
- [ ] Error handling for invalid data

### Integration
- [ ] Status bar renders correctly in PrimarySubCalendarItemDisplay
- [ ] No layout issues or visual conflicts
- [ ] Component can be easily reused
- [ ] Proper spacing and positioning

## Implementation Notes

1. Create the status bar as a separate, reusable component
2. Focus on accurate timing and progress calculations
3. Make the visual design clean and professional
4. Ensure real-time updates work smoothly
5. Test with various SubCalendar configurations

## Styling Guidelines

```typescript
// Example styling approach
const statusBarStyles = {
  container: {
    width: '100%',
    height: '50px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    position: 'relative',
    marginBottom: '16px',
    overflow: 'hidden'
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#1976d2',
    transition: 'width 0.3s ease'
  },
  textOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 2,
    color: '#333',
    fontWeight: 'bold'
  }
}
```

## Dependencies to Import
```typescript
import { useMemo } from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { SubCalendarItem, Item } from "../../functions/utils/item/index";
import { getTaskProgress, getTaskStartTime } from "../../functions/utils/item/utils";
import { formatTime } from "../../functions/utils/formatTime";
```
