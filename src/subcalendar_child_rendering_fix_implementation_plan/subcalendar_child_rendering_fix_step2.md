# Step 2: Fix getActiveChildForExecution Function

## Step Title & Dependencies
**Fix the getActiveChildForExecution function to properly handle sequential child execution**
- **Dependencies**: Step 1 must be completed (analysis of current logic documented)
- **Estimated Time**: 60 minutes

## Readiness Validation Step
Before implementing this step, verify:
1. Step 1 analysis is complete and root cause is identified
2. Current test suite passes
3. Have clear understanding of expected child transition behavior
4. Analysis has confirmed this is where the fix needs to be applied

## Detailed Acceptance Criteria

### ✅ Emoji Status: Completed

### Code Changes Required
#### Files to Modify
1. **`/Users/tannerbrobers/dev/ATP/src/components/execution/executionUtils.ts`**
   - Fix the `getActiveSubCalendarChild` function logic
   - Ensure proper time-based calculation for active children
   - Handle edge cases like gaps between children
   - Fix any off-by-one errors in time calculations
   - Ensure children are returned in correct sequence during execution
   - Add proper boundary checking for child execution windows
   - Handle the case where no child is currently active (gap periods)

#### Expected Logic Fixes
- **Time Window Calculation**: Ensure each child's execution window is calculated correctly
- **Sequential Transitions**: When one child ends, properly transition to the next child
- **Gap Period Handling**: Correctly handle periods between children where no child is active
- **Boundary Conditions**: Handle start and end of parent execution properly
- **Multiple Child Support**: Ensure the function works with 2+ children, not just the first child

#### Specific Code Areas to Fix
- Time comparison logic in the child iteration loop
- Proper calculation of `elapsedTime` relative to parent start
- Correct comparison against child start times and durations
- Proper handling of child end times and transitions
- Edge case handling for empty children arrays

### Testing Requirements
#### Unit Tests
- Test with SubCalendar containing 2 children with no gaps
- Test with SubCalendar containing 3+ children with gaps between them
- Test with overlapping child times (should handle gracefully)
- Test with child at time 0 (immediate start)
- Test with delayed first child (gap at beginning)
- Test during transition periods between children
- Test edge cases: before first child, after last child, during gaps

#### Integration Tests
- Test full execution flow with multiple children
- Verify correct child transitions in real-time scenarios
- Test with PrimaryItemDisplayRouter to ensure rendering works
- Verify no regression in single-child scenarios

### Manual Testing Steps
1. Create SubCalendar with multiple children at different start times
2. Start execution and verify first child renders correctly
3. Wait for first child to complete and verify transition to second child
4. Continue through all children to verify sequential execution
5. Test with children that have gaps between them
6. Verify gap periods show correct status (no active child)

### Documentation Updates
- Document the fix applied to the child selection logic
- Update JSDoc comments for affected functions
- Document the expected behavior for multi-child scenarios
- Add comments explaining time calculation logic
- Document edge case handling

## Final Step Instructions
The individual executing this plan should:
1. Apply the specific fixes to the `getActiveSubCalendarChild` function
2. Ensure all time calculations are correct and handle edge cases
3. Run comprehensive tests to verify the fix works
4. Confirm no regression in existing functionality
5. Leave feedback on the effectiveness of this step and any additional issues discovered
