# Manual Test Procedures for Multi-Child SubCalendar Execution

## Overview
This document provides step-by-step manual testing procedures to verify that multi-child SubCalendar execution works correctly in the UI. These tests complement the automated test suite and ensure the visual behavior matches expectations.

## Test Data Setup
Before starting manual tests, create SubCalendar items with the following configurations:

### Test Case 1: Basic Multi-Child Scenario
- **Parent**: SubCalendar "Project Work" (duration: 3000ms = 3 seconds)
- **Child 1**: BasicItem "Setup" (duration: 1000ms, start: 0ms)
- **Child 2**: BasicItem "Main Work" (duration: 1500ms, start: 1000ms)
- **Child 3**: BasicItem "Cleanup" (duration: 500ms, start: 2500ms)

### Test Case 2: Multi-Child with Gaps
- **Parent**: SubCalendar "Meeting Session" (duration: 4000ms = 4 seconds)
- **Child 1**: BasicItem "Introduction" (duration: 800ms, start: 0ms)
- **Child 2**: BasicItem "Discussion" (duration: 1200ms, start: 1500ms) *[700ms gap]*
- **Child 3**: BasicItem "Wrap-up" (duration: 600ms, start: 3200ms) *[500ms gap]*

### Test Case 3: Rapid Transitions
- **Parent**: SubCalendar "Quick Tasks" (duration: 2000ms = 2 seconds)
- **Child 1**: BasicItem "Task A" (duration: 400ms, start: 0ms)
- **Child 2**: BasicItem "Task B" (duration: 300ms, start: 400ms)
- **Child 3**: BasicItem "Task C" (duration: 500ms, start: 700ms)
- **Child 4**: BasicItem "Task D" (duration: 800ms, start: 1200ms)

## Manual Test Procedures

### Test 1: Visual Child Transition Verification
**Objective**: Verify that child tasks render and transition correctly in the ExecutionView

**Steps**:
1. Start execution of Test Case 1 ("Project Work")
2. Observe the ExecutionView display for the first 3 seconds
3. Verify the following timeline:
   - **0-1s**: "Setup" child should be displayed
   - **1-2.5s**: "Main Work" child should be displayed  
   - **2.5-3s**: "Cleanup" child should be displayed
4. **Expected Result**: Each child appears at the correct time with smooth transitions
5. **Pass Criteria**: No visual glitches, correct child names displayed, proper timing

### Test 2: Gap Period Handling
**Objective**: Verify that gap periods between children are handled correctly

**Steps**:
1. Start execution of Test Case 2 ("Meeting Session")
2. Monitor the display during gap periods:
   - **0.8-1.5s**: Gap between Introduction and Discussion
   - **2.7-3.2s**: Gap between Discussion and Wrap-up
3. **Expected Result**: During gaps, the parent SubCalendar should be displayed (not a child)
4. **Pass Criteria**: No child content shown during gaps, parent information visible

### Test 3: Timing Accuracy Verification
**Objective**: Ensure child transitions happen at precise times

**Steps**:
1. Start execution of Test Case 3 ("Quick Tasks") 
2. Use a stopwatch or timer to verify transition timing:
   - **0ms**: Task A starts
   - **400ms**: Task B starts (exactly)
   - **700ms**: Task C starts (exactly)
   - **1200ms**: Task D starts (exactly)
   - **2000ms**: Execution completes
3. **Expected Result**: Transitions occur within ±50ms of expected times
4. **Pass Criteria**: Visual transitions align with expected timing

### Test 4: UI Responsiveness During Transitions
**Objective**: Verify the UI remains responsive during child transitions

**Steps**:
1. Start execution of Test Case 3 ("Quick Tasks") with rapid transitions
2. During execution, attempt to:
   - Hover over UI elements
   - Click buttons or controls (if available)
   - Interact with other parts of the interface
3. **Expected Result**: UI remains responsive, no lag or freezing
4. **Pass Criteria**: All interactions work smoothly during child transitions

### Test 5: Error Handling and Edge Cases
**Objective**: Test graceful handling of problematic scenarios

**Steps**:
1. Create a SubCalendar with:
   - A child that has zero duration
   - A child that extends beyond parent duration
   - Missing child items (broken references)
2. Start execution and observe behavior
3. **Expected Result**: No crashes, graceful degradation
4. **Pass Criteria**: System continues functioning, displays appropriate fallbacks

### Test 6: Performance with Many Children
**Objective**: Verify performance with complex multi-child scenarios

**Steps**:
1. Create a SubCalendar with 10+ children (short durations, rapid transitions)
2. Start execution and monitor:
   - Visual smoothness of transitions
   - Browser performance (CPU usage)
   - Memory usage over time
3. **Expected Result**: Smooth performance, no memory leaks
4. **Pass Criteria**: No noticeable lag, stable memory usage

## Expected Visual Behavior

### During Child Execution
- **Child Name**: Should display the active child's name prominently
- **Progress Indicators**: Should reflect child progress, not parent progress
- **Task Information**: Should show child-specific details
- **Breadcrumbs**: Should indicate parent > child hierarchy

### During Gap Periods
- **Parent Display**: Should show parent SubCalendar information
- **Gap Indication**: May show countdown to next child (implementation-dependent)
- **Progress**: Should reflect overall parent progress

### Transition Moments
- **Smooth Changes**: Content should change smoothly without flashing
- **No Glitches**: No brief display of incorrect content
- **Consistent Timing**: Transitions should feel natural and well-timed

## Troubleshooting Common Issues

### Child Not Displaying
1. Check child start times don't exceed parent duration
2. Verify child items exist in the items array
3. Confirm child IDs match between Child and BasicItem objects

### Incorrect Timing
1. Verify parent start time is calculated correctly
2. Check for timezone or time zone issues
3. Ensure duration calculations include proper units (milliseconds)

### UI Lag During Transitions
1. Check for excessive re-rendering in React components
2. Monitor JavaScript console for errors
3. Verify efficient update mechanisms are in place

### Memory Leaks
1. Check for proper cleanup of timers and intervals
2. Verify React components are unmounting correctly
3. Monitor for accumulating event listeners

## Success Criteria Summary

All manual tests pass when:
- ✅ Children render in correct chronological order
- ✅ Timing is accurate within ±50ms tolerance
- ✅ Gap periods display parent information correctly
- ✅ UI remains responsive during all transitions
- ✅ No visual glitches or content flashing
- ✅ Performance remains stable with complex scenarios
- ✅ Error handling gracefully manages edge cases
- ✅ Memory usage remains stable during extended execution

## Test Documentation
Record the following for each test session:
- Date and time of testing
- Browser and version used
- Test case results (pass/fail with notes)
- Any issues discovered
- Performance observations
- Recommendations for improvements
