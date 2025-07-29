# Accounting View Testing and Enhancement Master Plan

## Feature Overview

This feature enhances the accounting view with comprehensive testing capabilities and user interface improvements. The implementation includes:

1. **Test Framework for Accounting View**: Create comprehensive tests that simulate SubCalendar item execution with controlled time progression
2. **Enhanced Accounting View UI**: Add expandable/collapsible design with badge indicators for time and variables
3. **User Settings for Badge Notifications**: Allow users to configure thresholds for badge notifications
4. **Time Control Testing**: Tests will create a 10-second SubCalendar with 5 BasicItem children (1 second each, 2 seconds apart) and verify proper accounting view behavior

## Architecture Impact

### Existing Systems Integration
- **Item System**: Leverages existing SubCalendarItem and BasicItem structures
- **Execution System**: Uses existing execution utilities and time calculation functions  
- **Accounting View**: Enhances current AccountingView component with new features
- **Test Framework**: Integrates with existing Vitest testing infrastructure
- **Local Storage**: Extends user preferences system for badge settings

### New Components Required
- Badge configuration dialog/settings panel
- Enhanced accounting view header with badges
- Test utilities for time-controlled execution simulation

## Implementation Strategy

### Phase 1: Test Infrastructure (Steps 1-3)
Build the testing framework with controlled time simulation and SubCalendar execution tests.

### Phase 2: UI Enhancements (Steps 4-6) 
Implement expandable accounting view with time and variable badges.

### Phase 3: User Settings (Steps 7-8)
Add user preference system for badge notification thresholds.

## Step Breakdown

1. **[Test Item Creation](./accounting_view_testing_step1.md)**: Create test data structures for SubCalendar with BasicItem children
2. **[Time Control Testing Framework](./accounting_view_testing_step2.md)**: Implement time mocking and progression control for tests  
3. **[Accounting View Test Suite](./accounting_view_testing_step3.md)**: Write comprehensive tests verifying accounting view behavior during execution
4. **[Expandable Accounting View Header](./accounting_view_testing_step4.md)**: Add collapsible header with expand/collapse functionality
5. **[Badge Implementation](./accounting_view_testing_step5.md)**: Implement clock and star badges for time and variables
6. **[Badge Logic and Calculation](./accounting_view_testing_step6.md)**: Calculate and display badge values based on accounting instances
7. **[User Settings Storage](./accounting_view_testing_step7.md)**: Extend local storage for badge threshold preferences  
8. **[Settings UI Integration](./accounting_view_testing_step8.md)**: Add settings panel for configuring badge thresholds

## Acceptance Criteria

### Testing Requirements
- [ ] Tests successfully create 10-second SubCalendar with 5 child BasicItems
- [ ] Time control allows precise simulation of execution timing
- [ ] Tests verify accounting view shows nothing during first second
- [ ] Tests verify first child appears in accounting view after 1 second completion
- [ ] Tests verify subsequent children appear at correct intervals
- [ ] All tests run with `npm run test:ai` command

### UI Enhancement Requirements  
- [ ] Accounting view is collapsible (closed by default)
- [ ] Clock badge displays total BasicItem time in accounting view
- [ ] Star badge displays count of distinct variables requiring accounting
- [ ] Badge values update dynamically as accounting instances change
- [ ] Visual design follows Material-UI standards

### Settings Requirements
- [ ] Users can configure variable quantity thresholds for badge notifications
- [ ] Users can configure time thresholds for badge notifications  
- [ ] Settings persist across browser sessions
- [ ] Settings integrate with existing preference system

### Integration Requirements
- [ ] No breaking changes to existing accounting view functionality
- [ ] Performance remains acceptable with large numbers of instances
- [ ] Features work correctly in both standalone and execution view modes

## Risk Assessment

### Potential Issues
1. **Time Mocking Complexity**: Controlling time in tests may conflict with existing time utilities
2. **Performance Impact**: Badge calculations could slow down with many instances
3. **State Management**: Settings storage must not conflict with existing local storage
4. **UI Responsiveness**: Badges must update efficiently during real-time execution

### Mitigation Strategies
1. **Isolated Time Control**: Use dependency injection for time functions in tests
2. **Memoization**: Cache badge calculations and only recalculate when dependencies change
3. **Namespaced Storage**: Use dedicated storage keys for badge settings
4. **Optimized Updates**: Debounce badge updates during rapid state changes

## Quality Standards

- All code follows existing TypeScript patterns and Material-UI design system
- Test coverage includes edge cases (empty accounting view, large datasets)
- Error handling for malformed settings or test data  
- Accessibility compliance for new UI elements
- Performance testing with realistic data volumes

## Dependencies

**Step Dependencies:**
- Steps 1-3 can run in parallel
- Step 4 must complete before Step 5
- Steps 5-6 can run in parallel after Step 4
- Step 7 must complete before Step 8
- Step 8 depends on Steps 5-6 completion

**External Dependencies:**
- Existing test infrastructure (Vitest, React Testing Library)
- Material-UI components and theming
- Local storage persistence system
- Item system and execution utilities

## Success Metrics

1. **Test Reliability**: All accounting view tests pass consistently with controlled timing
2. **User Experience**: Badge indicators provide immediate insight into accounting workload
3. **Customization**: Users successfully configure badge thresholds to match their workflow
4. **Performance**: Badge calculations complete within 100ms for typical datasets
5. **Integration**: Features integrate seamlessly without disrupting existing functionality
