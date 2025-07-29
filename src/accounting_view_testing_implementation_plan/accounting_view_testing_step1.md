# Step 1: Test Item Creation

## Step Title & Dependencies
**Title**: Create test data structures for SubCalendar with BasicItem children  
**Dependencies**: None (can start immediately)

## Detailed Requirements

### SubCalendar Test Item Structure
Create a 10-second SubCalendarItem containing 5 BasicItem children with the following specifications:
- **Parent Duration**: 10,000 milliseconds (10 seconds)
- **Child Pattern**: 1 second execution, 1 second rest, repeated 5 times
- **Child Timing**:
  - Child 1: starts at 0ms, duration 1000ms (0-1s)
  - Child 2: starts at 2000ms, duration 1000ms (2-3s)  
  - Child 3: starts at 4000ms, duration 1000ms (4-5s)
  - Child 4: starts at 6000ms, duration 1000ms (6-7s)
  - Child 5: starts at 8000ms, duration 1000ms (8-9s)

### Test Utility Functions
Create helper functions to:
1. Generate the test SubCalendar with predictable IDs
2. Create ItemInstances for the SubCalendar and children
3. Set up base calendar entries for scheduling
4. Provide clean test data reset functionality

### File Structure
- Create test utilities in `src/components/accounting/__tests__/testUtils.ts`
- Create shared test data factories
- Ensure consistent test item IDs for repeatability

## Code Changes Required

### New Files to Create

#### `src/components/accounting/__tests__/testUtils.ts`
- Export `createTestSubCalendarWithChildren()` function
- Export `createTestItemInstances()` function  
- Export `createTestBaseCalendarEntries()` function
- Export `TEST_ITEM_IDS` constant object
- Export `TIMING_CONSTANTS` for test timing values

#### `src/components/accounting/__tests__/accountingTestData.ts`
- Define test item structures
- Define test scheduling configurations
- Export factory functions for consistent test data

### Implementation Details

#### Test Item Creation Logic
```typescript
// Example structure (not actual code):
const parentItem = new SubCalendarItem({
  id: 'test-subcalendar-parent',
  name: 'Test SubCalendar',
  duration: 10000,
  children: [
    new Child({ id: 'test-child-1', start: 0 }),
    new Child({ id: 'test-child-2', start: 2000 }),
    new Child({ id: 'test-child-3', start: 4000 }),
    new Child({ id: 'test-child-4', start: 6000 }),
    new Child({ id: 'test-child-5', start: 8000 })
  ]
});
```

#### ItemInstance Creation
- Create instances with proper scheduling times
- Set up parent-child relationships in instances
- Ensure instances are initially incomplete
- Provide methods to mark instances complete at specific times

## Testing Requirements

### Unit Tests for Test Utilities
- Verify SubCalendar structure is created correctly
- Confirm child timing follows the 1s on, 1s off pattern
- Validate ItemInstance creation with proper relationships
- Test clean-up and reset functionality

### Integration Validation
- Ensure test items work with existing item system utilities
- Verify test instances integrate with useItemInstances hook
- Confirm test data works with accounting view components

### Test Files to Create
- `src/components/accounting/__tests__/testUtils.test.ts`
- Include edge cases and validation tests

## Acceptance Criteria

### Functional Requirements
- [ ] Test SubCalendar creates with exactly 10 second duration
- [ ] Five BasicItem children created with 1 second duration each
- [ ] Child start times follow pattern: 0ms, 2000ms, 4000ms, 6000ms, 8000ms
- [ ] All test items have predictable, consistent IDs
- [ ] ItemInstances created with proper parent-child relationships
- [ ] Test data provides complete reset/cleanup functionality

### Code Quality Requirements
- [ ] All functions have TypeScript type annotations
- [ ] Test utilities follow existing code patterns
- [ ] Helper functions are well-documented with JSDoc comments
- [ ] Error handling for invalid test data configurations
- [ ] Consistent naming conventions with existing codebase

### Integration Requirements
- [ ] Test items work with existing item system utilities (getItemById, etc.)
- [ ] Test instances work with useItemInstances hook
- [ ] Test data integrates with existing reducer actions
- [ ] No conflicts with production item IDs or data

## Rollback Plan

### If Issues Arise
1. **Conflicts with Existing Tests**: Isolate test utilities in separate namespace
2. **Item System Integration Problems**: Create simplified test items that only include required properties
3. **Performance Issues**: Optimize test data creation to use lazy initialization
4. **Type System Issues**: Add proper type guards and validation functions

### Clean Rollback Steps
1. Remove test utility files
2. Clear any test constants that might conflict
3. Ensure no test data persists in local storage
4. Verify existing tests still pass without new utilities

### Validation After Rollback
- Run existing test suite to ensure no regressions
- Verify accounting view still functions normally
- Check that no test artifacts remain in application state
