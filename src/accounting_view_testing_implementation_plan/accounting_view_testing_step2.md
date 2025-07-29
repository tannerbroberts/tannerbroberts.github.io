# Step 2: Time Control Testing Framework

## Step Title & Dependencies
**Title**: Implement time mocking and progression control for tests  
**Dependencies**: Step 1 (Test Item Creation) should be completed first

## Detailed Requirements

### Time Control System
Create a robust time control system for tests that allows:
1. **Fixed Time Points**: Set specific timestamps for testing
2. **Time Progression**: Advance time in controlled increments
3. **Hook Mocking**: Mock `useCurrentTime` and other time-dependent hooks
4. **State Synchronization**: Ensure all components use mocked time consistently

### Controlled Execution Simulation
Implement functions to:
- Simulate SubCalendar execution from start to finish
- Control when children start and complete during execution
- Trigger accounting view updates at precise time intervals
- Validate item completion states at each time step

### Integration with Existing Systems
Ensure time control works with:
- Existing execution utilities (`getChildExecutionStatus`, etc.)
- Item instance management systems
- Accounting view data flow
- React component re-rendering

## Code Changes Required

### New Files to Create

#### `src/components/accounting/__tests__/timeControlUtils.ts`
- Export `MockTimeController` class for centralized time management
- Export `mockUseCurrentTime()` function for Vitest mocking
- Export `simulateExecution()` function for step-by-step execution
- Export `advanceTimeAndWait()` for async time progression

#### `src/components/accounting/__tests__/executionSimulator.ts`
- Export `ExecutionSimulator` class for managing test execution
- Export `SimulationStep` interface for defining execution steps
- Export helper functions for common execution scenarios

### Implementation Details

#### Time Control Architecture
```typescript
// Example structure (not actual code):
class MockTimeController {
  private currentTime: number;
  
  setTime(timestamp: number): void;
  advanceTime(milliseconds: number): void;
  getCurrentTime(): number;
  resetTime(): void;
}
```

#### Execution Simulation Logic
- Define precise time steps for SubCalendar execution
- Track item completion states during simulation
- Provide hooks for asserting state at each step
- Handle async operations and React re-renders

#### Mock Integration Strategy
- Use Vitest's `vi.mock()` for hooking time functions
- Provide clean setup and teardown for each test
- Ensure mocks don't interfere with other tests
- Support both unit and integration test scenarios

### Files to Modify

#### `src/components/accounting/__tests__/setupTests.ts`
- Add time control setup and teardown utilities
- Configure mock environment for accounting tests
- Ensure proper cleanup between test runs

## Testing Requirements

### Time Control Unit Tests
- Verify time controller sets and advances time correctly
- Confirm hook mocking works with React components
- Test execution simulator produces expected state changes
- Validate cleanup and reset functionality

### Integration Tests with Existing Systems
- Test time control with actual accounting view components
- Verify execution utilities work with mocked time
- Confirm item instance updates trigger properly
- Test React component re-rendering with time changes

### Performance Tests
- Ensure time control doesn't introduce significant test delays
- Verify mock cleanup doesn't leak between tests
- Test large time jumps and rapid progression scenarios

### Test Files to Create
- `src/components/accounting/__tests__/timeControlUtils.test.ts`
- `src/components/accounting/__tests__/executionSimulator.test.ts`

## Acceptance Criteria

### Time Control Functionality
- [ ] Can set specific timestamps for testing scenarios
- [ ] Time advances in controlled, predictable increments
- [ ] All time-dependent hooks use mocked time consistently
- [ ] Time resets cleanly between test runs
- [ ] Supports both synchronous and asynchronous time progression

### Execution Simulation Capabilities
- [ ] Can simulate complete SubCalendar execution from start to finish
- [ ] Child item completion states update at correct time intervals
- [ ] Accounting view receives proper state updates during simulation
- [ ] Supports pausing and resuming execution at specific points
- [ ] Provides clear debugging information for failed simulations

### Integration Requirements
- [ ] Works seamlessly with existing useCurrentTime hook
- [ ] Compatible with existing execution utilities
- [ ] Doesn't interfere with production time handling
- [ ] Supports testing both individual components and full execution flow
- [ ] Clean separation between test and production time systems

### Mock Quality Standards
- [ ] Mocks are isolated and don't affect other tests
- [ ] Setup and teardown are reliable and complete
- [ ] Error handling for invalid time operations
- [ ] Performance impact is minimal
- [ ] Mock behavior matches production time behavior

## Rollback Plan

### If Time Control Issues Arise
1. **React Hook Conflicts**: Fall back to manual time prop injection
2. **Performance Problems**: Simplify time advancement to larger increments
3. **State Synchronization Issues**: Use explicit render triggers instead of automatic updates
4. **Mock Interference**: Isolate time control to specific test files only

### Mock Recovery Strategy
1. **Hook Restoration**: Ensure all mocked hooks are properly restored
2. **Component State Reset**: Clear any time-dependent component state
3. **Cache Clearing**: Reset any cached time values in application state
4. **Verification**: Run production code to ensure time handling is restored

### Debugging Support
- Provide detailed logging for time advancement steps
- Include state snapshots at each simulation point
- Add validation checks for expected vs actual time progression
- Create helper functions for common debugging scenarios

### Clean Rollback Steps
1. Remove all time control utility files
2. Restore original hook implementations
3. Clear any test-specific time configurations
4. Verify existing tests pass with real time
5. Check that production time handling works normally
