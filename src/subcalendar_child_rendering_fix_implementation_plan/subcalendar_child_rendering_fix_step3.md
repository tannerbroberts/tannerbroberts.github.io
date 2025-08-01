# Step 3: Update Child Execution Status Calculation

## Step Title & Dependencies
**Update getChildExecutionStatus function to properly handle multi-child execution flow**
- **Dependencies**: Step 2 must be completed (getActiveChildForExecution fixed)
- **Estimated Time**: 50 minutes

## Readiness Validation Step
Before implementing this step, verify:
1. Step 2 is complete and getActiveChildForExecution now works correctly
2. Child transitions are working in basic scenarios
3. Current execution status calculation aligns with fixed child selection
4. Understanding of how execution status affects UI display

## Detailed Acceptance Criteria

### ❌ Emoji Status: Not Started

### Code Changes Required
#### Files to Modify
1. **`/Users/tannerbrobers/dev/ATP/src/components/execution/executionUtils.ts`**
   - Update `getSubCalendarExecutionStatus` function
   - Ensure proper next child prediction during transitions
   - Fix countdown timers for upcoming children
   - Handle gap periods correctly in status calculation
   - Synchronize status calculation with fixed child selection logic
   - Ensure proper phase detection (pre-start, active, gap, complete)

#### Expected Logic Updates
- **Active Child Alignment**: Ensure execution status matches the active child from getActiveChildForExecution
- **Next Child Prediction**: Correctly identify and calculate timing for the next child in sequence
- **Phase Calculation**: Properly determine current execution phase based on child timing
- **Countdown Accuracy**: Ensure time-until-start calculations are accurate for upcoming children
- **Gap Period Detection**: Correctly identify when execution is in a gap between children

#### Specific Areas to Update
- Synchronize child iteration logic with the fixed getActiveChildForExecution function
- Update `getNextChildInfo` function to work with sequential children
- Fix phase detection logic to handle multi-child scenarios
- Ensure countdown calculations work for all children in sequence
- Handle edge cases where children have different durations

### Testing Requirements
#### Unit Tests
- Test execution status during each child in a multi-child sequence
- Verify correct next child prediction throughout execution
- Test countdown timers for accuracy during child transitions
- Test gap period detection and status reporting
- Verify phase transitions (active → gap → active → complete)
- Test edge cases: single child, no children, overlapping children

#### Integration Tests
- Test with SubCalendarStatusBar to ensure UI reflects correct status
- Verify countdown timers display correctly in the UI
- Test execution guidance messages during child transitions
- Ensure proper integration with PrimarySubCalendarItemDisplay
- Test with UnifiedDropdownContent to ensure status information is correct

### Manual Testing Steps
1. Start execution of SubCalendar with multiple children
2. Verify execution status shows correct active child throughout
3. Check countdown timers are accurate for upcoming children
4. Verify gap periods show appropriate status and guidance
5. Test that next child information is always correct
6. Confirm phase transitions happen at the right times

### Documentation Updates
- Document the enhanced execution status calculation logic
- Update JSDoc comments for affected status functions
- Document how execution status integrates with child selection
- Add comments explaining phase detection logic
- Document countdown calculation methodology

## Final Step Instructions
The individual executing this plan should:
1. Update execution status functions to align with fixed child selection
2. Ensure status information is accurate throughout multi-child execution
3. Test countdown timers and next child predictions thoroughly
4. Verify no regression in single-child or no-child scenarios
5. Leave feedback on the accuracy of status information and any UI integration issues discovered
