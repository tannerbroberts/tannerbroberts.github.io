# Breakfast Button Enhancement Master Plan

## Feature Overview

Update the existing breakfast cooking lesson button to include comprehensive variable usage (ingredients, equipment, consumables), implement realistic time frames for each cooking task, and enhance the execution view to properly display current child tasks in SubCalendarItems with countdown timers for upcoming children when no child is currently active.

## Architecture Impact

### Variable System Integration
- **Item Variables**: Each cooking task will have associated variables for ingredients, equipment, and consumables
- **Variable Summary**: The main lesson and phases will show aggregated variable summaries
- **Resource Tracking**: Variables will track ingredient consumption (-) and waste production (+)

### Execution View Enhancement
- **SubCalendar Status Display**: Enhanced status bar showing current active child or countdown to next child
- **Active Child Detection**: Improved logic for determining which child is currently executing
- **Countdown Implementation**: Visual countdown for when the next child will start when no child is active

### Time Frame Realism
- **Cooking Physics**: Time estimates based on actual cooking requirements (heating, browning, setting)
- **Multi-tasking Consideration**: Overlapping tasks that can be done simultaneously
- **Safety Margins**: Buffer time for critical cooking moments

## Implementation Strategy

The implementation follows a systematic approach:

1. **Enhanced Variable Definitions**: Create comprehensive variable maps for all cooking tasks
2. **Time Frame Updates**: Adjust all durations to realistic cooking times
3. **Execution View Logic**: Enhance child detection and countdown functionality
4. **Status Bar Enhancement**: Improve SubCalendar status bar display
5. **Integration Testing**: Verify all components work together seamlessly

## Step Breakdown

### [Step 1: Variable Enhancement](./breakfast_enhancement_step1.md)
- Define ingredient, equipment, and consumable variables for all cooking tasks
- Update RandomItemButton to include variable assignments
- Verify variable summary calculations work correctly

**Dependencies**: None  
**Estimated Time**: 1-2 hours

### [Step 2: Time Frame Realism](./breakfast_enhancement_step2.md)
- Research realistic cooking times for each task
- Update durations throughout the cooking lesson
- Adjust timing overlaps in the cooking phase

**Dependencies**: Step 1 complete  
**Estimated Time**: 1 hour

### [Step 3: Execution View Enhancement](./breakfast_enhancement_step3.md)
- Enhance `getActiveChildForExecution` function
- Implement next child detection with countdown logic
- Update PrimarySubCalendarItemDisplay for better child status

**Dependencies**: Step 2 complete  
**Estimated Time**: 2-3 hours

### [Step 4: SubCalendar Status Bar Enhancement](./breakfast_enhancement_step4.md)
- Enhance SubCalendarStatusBar component
- Add countdown display for upcoming children
- Improve visual indicators for active vs. upcoming tasks

**Dependencies**: Step 3 complete  
**Estimated Time**: 1-2 hours

### [Step 5: Integration and Testing](./breakfast_enhancement_step5.md)
- Comprehensive testing of the enhanced breakfast lesson
- Manual verification of execution view behavior
- Performance testing with multiple subcalendar children

**Dependencies**: All previous steps complete  
**Estimated Time**: 1 hour

## Acceptance Criteria

### Overall Feature Completion
- [x] **Variable Integration**: All cooking tasks have comprehensive variable definitions
- [x] **Realistic Timing**: All durations reflect actual cooking physics and requirements
- [x] **Execution Display**: Shows current active child when available
- [x] **Countdown Display**: Shows countdown to next child when no child is active
- [x] **Variable Summary**: Main lesson shows aggregated ingredient and equipment needs
- [x] **Status Indicators**: Clear visual distinction between active, upcoming, and completed children

### Technical Requirements
- [x] **No Breaking Changes**: Existing functionality remains intact
- [x] **Performance**: No noticeable performance degradation
- [x] **Type Safety**: All TypeScript types are properly maintained
- [x] **Test Coverage**: All new functionality is properly tested

### User Experience
- [x] **Clarity**: Easy to understand what's currently happening and what's next
- [x] **Timing**: Realistic cooking times that users can actually follow
- [x] **Resource Awareness**: Clear understanding of required ingredients and equipment

## Risk Assessment

### Low Risk
- **Variable Definitions**: Straightforward data addition to existing structure
- **Time Adjustments**: Simple numerical updates to existing properties
- **Display Enhancements**: Building on existing proven components

### Medium Risk
- **Execution Logic**: Changes to child detection logic could affect other SubCalendarItems
- **Status Bar Changes**: UI changes might affect layout or performance

### High Risk
- **None identified**: All changes are additive and build on existing proven patterns

## Mitigation Strategies

### Code Safety
- **Incremental Changes**: Each step builds on the previous one with testing
- **Type Safety**: Leverage TypeScript to catch potential issues early
- **Component Isolation**: Changes are contained within specific components

### Testing Strategy
- **Unit Tests**: Test utility functions independently
- **Integration Tests**: Verify component interactions work correctly
- **Manual Testing**: Real-world usage validation with the breakfast lesson

### Rollback Plan
- **Git Branches**: Each step can be reverted independently
- **Feature Flags**: If needed, the enhanced breakfast lesson can be disabled
- **Backward Compatibility**: All existing breakfast lessons will continue to work

## Implementation Notes

### Variable Categories Used
- **Ingredients**: Eggs, bacon, pancake mix, milk, etc.
- **Equipment**: Pans, spatulas, measuring cups, etc.
- **Consumables**: Oil, paper towels, dish soap, etc.
- **Waste**: Food scraps, dirty dishes, etc.

### Timing Philosophy
- **Safety First**: Critical timing tasks (flipping bacon, eggs) have generous timing windows
- **Parallel Processing**: Multiple tasks can happen simultaneously
- **Learning Curve**: Times assume someone learning, not an expert chef

### Execution View Philosophy
- **Current Focus**: Always show what should be happening right now
- **Anticipation**: Show what's coming next to help with preparation
- **Context**: Provide enough information to make good cooking decisions
