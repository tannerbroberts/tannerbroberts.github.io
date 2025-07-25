# Prompt 4: Update ExecutionView to Use New Primary Display System

## Objective
Replace the current accordion-based display in ExecutionView with the new primary display system, ensuring proper integration and maintaining all existing functionality while providing the improved execution-focused interface.

## Requirements

### 1. Update `ExecutionView` Component
**File**: `src/components/ExecutionView.tsx`

**Changes needed**:
- Remove dependency on `TaskChainAccordion`
- Import and use `PrimaryItemDisplayRouter`
- Calculate proper start times for root items
- Handle base calendar integration
- Maintain error handling and edge cases

### 2. Enhanced Error Handling
Add better error handling for:
- Invalid task chains
- Missing base calendar entries
- Corrupted item data
- Time calculation errors

### 3. Performance Optimization
- Memoize expensive calculations
- Optimize re-render frequency
- Cache base start time calculations
- Minimize prop drilling

## Technical Requirements

### New ExecutionView Structure
```typescript
export default function ExecutionView({
  showHeader = true,
}: ExecutionViewProps) {
  const { items, baseCalendar } = useAppState();
  const currentTime = useCurrentTime(500);

  // Get task chain with proper error handling
  const taskChain = useMemo(() => {
    // existing logic with better error handling
  }, [items, currentTime, baseCalendar]);

  // Calculate base start time for root item
  const baseStartTime = useMemo(() => {
    // Logic to get start time from base calendar
  }, [taskChain, baseCalendar]);

  // Render logic
  if (taskChain.length === 0) {
    // existing idle state
  }

  return (
    <Box sx={{ width: '100%' }}>
      {showHeader && (
        // existing header
      )}
      
      <PrimaryItemDisplayRouter
        item={taskChain[0]}
        taskChain={taskChain}
        currentTime={currentTime}
        startTime={baseStartTime}
        isDeepest={taskChain.length === 1}
        depth={0}
      />
    </Box>
  );
}
```

### Base Start Time Calculation
```typescript
const calculateBaseStartTime = (
  taskChain: Item[],
  baseCalendar?: Map<string, BaseCalendarEntry>
): number => {
  if (taskChain.length === 0) return Date.now();
  
  const rootItem = taskChain[0];
  if (baseCalendar) {
    for (const [, entry] of baseCalendar) {
      if (entry.itemId === rootItem.id) {
        return entry.startTime;
      }
    }
  }
  
  // Fallback to current time if no calendar entry
  return Date.now();
};
```

### Error Boundary Integration
Consider adding error boundary for robustness:
```typescript
const ExecutionViewErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  // Error boundary implementation
};
```

## Acceptance Criteria

### Functional Requirements
- [ ] ExecutionView renders without errors
- [ ] Task chains display correctly using new primary displays
- [ ] Base calendar integration works properly
- [ ] Time calculations are accurate
- [ ] All item types render correctly (Basic, SubCalendar, CheckList)

### Visual Requirements
- [ ] New display is more execution-focused than old accordion
- [ ] Status bars appear for SubCalendarItems
- [ ] CheckList items show properly
- [ ] Visual hierarchy is clear and intuitive
- [ ] Spacing and layout are professional

### Performance Requirements
- [ ] No performance regression from old accordion system
- [ ] Real-time updates work smoothly
- [ ] Memory usage is reasonable
- [ ] Re-renders are optimized

### Compatibility Requirements
- [ ] All existing ExecutionView props work
- [ ] Integration with other components unchanged
- [ ] Error states still function properly
- [ ] Edge cases are handled gracefully

### Code Quality
- [ ] Clean, maintainable code
- [ ] Proper TypeScript typing
- [ ] Good separation of concerns
- [ ] Consistent with codebase patterns

## Testing Requirements

### Unit Testing
Test the following scenarios:
- Empty task chain (idle state)
- Single BasicItem
- SubCalendarItem with children
- CheckListItem with checklist
- Deeply nested task chain
- Missing base calendar entries
- Invalid item references

### Integration Testing
- Full execution flow from start to finish
- Task chain transitions
- Real-time updates
- Error recovery
- Performance under load

### Edge Case Testing
- Zero duration items
- Items with no base calendar entry
- Circular references in data
- Very deep nesting (10+ levels)
- Rapid time changes

## Migration Considerations

### Backwards Compatibility
- Ensure existing ExecutionView usage still works
- Maintain all public interfaces
- Preserve error handling behavior
- Keep performance characteristics

### Gradual Migration
If needed, consider:
- Feature flag to toggle between old/new display
- Side-by-side comparison mode
- Gradual rollout capability

## Implementation Steps

1. **Setup**: Create new imports and basic structure
2. **Core Logic**: Implement base start time calculation
3. **Integration**: Replace TaskChainAccordion with PrimaryItemDisplayRouter
4. **Error Handling**: Add enhanced error boundaries and validation
5. **Testing**: Comprehensive testing of all scenarios
6. **Polish**: Final styling and performance optimization

## Dependencies to Add/Remove

### Add
```typescript
import PrimaryItemDisplayRouter from "./execution/PrimaryItemDisplayRouter";
```

### Remove
```typescript
import TaskChainAccordion from "./TaskChainAccordion"; // Remove this
```

### Keep Existing
```typescript
import { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { useAppState } from "../reducerContexts/App";
import { useCurrentTime } from "../hooks/useCurrentTime";
import { getCurrentTaskChain } from "../functions/utils/item/index";
```

## Success Metrics

### User Experience
- Faster comprehension of current execution state
- Clearer visual hierarchy
- More intuitive interaction model
- Better real-time feedback

### Technical Metrics
- Render time improvement
- Memory usage optimization
- Error rate reduction
- Code maintainability increase

## Rollback Plan
- Keep TaskChainAccordion component intact
- Use feature flag or environment variable
- Quick rollback mechanism if issues arise
- Comprehensive monitoring during rollout
