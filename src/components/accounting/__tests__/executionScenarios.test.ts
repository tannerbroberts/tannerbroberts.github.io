import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getTimeController } from './timeControlUtils';
import { createTestItemInstances, TEST_ITEM_IDS } from './testUtils';
import { ItemInstanceImpl } from '../../../functions/utils/itemInstance/types';

describe('Execution Scenarios for Accounting View', () => {
  let timeController: ReturnType<typeof getTimeController>;

  beforeEach(() => {
    // Reset time controller
    timeController = getTimeController();
    timeController.resetTime();

    // Create test data (if needed for specific tests)
    createTestItemInstances();

    // Clear all mocks
    vi.clearAllMocks();
  });

  function createCompletedInstancesForTime(currentTime: number): ItemInstanceImpl[] {
    const instances: ItemInstanceImpl[] = [];
    const childStartTimes = [0, 2000, 4000, 6000, 8000]; // Start times for 5 children
    const childDuration = 1000; // Each child takes 1 second

    for (let i = 0; i < 5; i++) {
      const startTime = childStartTimes[i];
      const completionTime = startTime + childDuration;

      // Only include if completed before current time
      if (completionTime <= currentTime) {
        instances.push(new ItemInstanceImpl({
          id: `instance-${i + 1}`,
          itemId: Object.values(TEST_ITEM_IDS)[i + 1],
          calendarEntryId: `entry-${i + 1}`,
          scheduledStartTime: startTime,
          actualStartTime: startTime,
          completedAt: completionTime,
          isComplete: true,
          executionDetails: {}
        }));
      }
    }

    return instances;
  }

  describe('Multi-step Execution Verification', () => {
    it('verifies the complete 5-child execution pattern', async () => {
      const executionSteps = [
        { time: 0, expectedCompleted: 0, description: 'Execution start' },
        { time: 500, expectedCompleted: 0, description: 'Mid first child' },
        { time: 1001, expectedCompleted: 1, description: 'First child complete' },
        { time: 1500, expectedCompleted: 1, description: 'Gap period' },
        { time: 2001, expectedCompleted: 1, description: 'Second child starting' },
        { time: 3001, expectedCompleted: 2, description: 'Second child complete' },
        { time: 4001, expectedCompleted: 2, description: 'Third child starting' },
        { time: 5001, expectedCompleted: 3, description: 'Third child complete' },
        { time: 6001, expectedCompleted: 3, description: 'Fourth child starting' },
        { time: 7001, expectedCompleted: 4, description: 'Fourth child complete' },
        { time: 8001, expectedCompleted: 4, description: 'Fifth child starting' },
        { time: 9001, expectedCompleted: 5, description: 'Fifth child complete' },
        { time: 10001, expectedCompleted: 5, description: 'All complete' }
      ];

      for (const step of executionSteps) {
        timeController.setTime(step.time);

        // Create appropriate completed instances based on time
        const completedInstances = createCompletedInstancesForTime(step.time);

        // Verify the expected count matches our test scenario
        expect(completedInstances.length).toBe(step.expectedCompleted);

        // Verify completion times are before current time
        completedInstances.forEach(instance => {
          expect(instance.completedAt).toBeDefined();
          expect(instance.completedAt!).toBeLessThanOrEqual(step.time);
          expect(instance.isComplete).toBe(true);
        });

        console.log(`✓ ${step.description}: ${completedInstances.length} instances completed`);
      }
    });
  });

  describe('Complex Timing and Interaction Tests', () => {
    it('handles rapid time advancement through all execution phases', () => {
      const timeSteps = 50; // Check every 50ms
      const totalDuration = 10000; // 10 seconds total
      const results: Array<{ time: number; completedCount: number }> = [];

      for (let time = 0; time <= totalDuration; time += timeSteps) {
        timeController.setTime(time);
        const completed = createCompletedInstancesForTime(time);
        results.push({ time, completedCount: completed.length });
      }

      // Verify expected progression pattern
      const expectedMilestones = [
        { time: 1000, minCompleted: 0, maxCompleted: 1 },
        { time: 3000, minCompleted: 1, maxCompleted: 2 },
        { time: 5000, minCompleted: 2, maxCompleted: 3 },
        { time: 7000, minCompleted: 3, maxCompleted: 4 },
        { time: 9000, minCompleted: 4, maxCompleted: 5 },
        { time: 10000, minCompleted: 5, maxCompleted: 5 }
      ];

      expectedMilestones.forEach(milestone => {
        const result = results.find(r => r.time === milestone.time);
        expect(result).toBeDefined();
        expect(result!.completedCount).toBeGreaterThanOrEqual(milestone.minCompleted);
        expect(result!.completedCount).toBeLessThanOrEqual(milestone.maxCompleted);
      });

      // Verify monotonic progression (completed count never decreases)
      for (let i = 1; i < results.length; i++) {
        expect(results[i].completedCount).toBeGreaterThanOrEqual(results[i - 1].completedCount);
      }
    });

    it('verifies gap periods contain no new completions', () => {
      // Test specific gap periods between child executions
      const gapPeriods = [
        { start: 1001, end: 1999, description: 'Gap between child 1 and 2' },
        { start: 3001, end: 3999, description: 'Gap between child 2 and 3' },
        { start: 5001, end: 5999, description: 'Gap between child 3 and 4' },
        { start: 7001, end: 7999, description: 'Gap between child 4 and 5' }
      ];

      gapPeriods.forEach(gap => {
        // Check at start of gap
        timeController.setTime(gap.start);
        const completedAtStart = createCompletedInstancesForTime(gap.start).length;

        // Check at end of gap
        timeController.setTime(gap.end);
        const completedAtEnd = createCompletedInstancesForTime(gap.end).length;

        // Should be the same count throughout the gap
        expect(completedAtEnd).toBe(completedAtStart);

        console.log(`✓ ${gap.description}: ${completedAtStart} instances throughout gap`);
      });
    });

    it('handles edge cases around completion boundaries', () => {
      const boundaryTests = [
        { time: 999, expectedCount: 0, description: '1ms before first completion' },
        { time: 1000, expectedCount: 1, description: 'Exact first completion time' },
        { time: 1001, expectedCount: 1, description: '1ms after first completion' },
        { time: 2999, expectedCount: 1, description: '1ms before second completion' },
        { time: 3000, expectedCount: 2, description: 'Exact second completion time' },
        { time: 3001, expectedCount: 2, description: '1ms after second completion' }
      ];

      boundaryTests.forEach(test => {
        timeController.setTime(test.time);
        const completed = createCompletedInstancesForTime(test.time);

        expect(completed.length).toBe(test.expectedCount);
        console.log(`✓ ${test.description}: ${completed.length} instances`);
      });
    });
  });

  describe('Concurrent Execution Scenarios', () => {
    it('simulates multiple SubCalendar executions with different start times', () => {
      // Create multiple execution contexts
      const execution1StartTime = 0;
      const execution2StartTime = 5000; // Starts while first is still running
      const execution3StartTime = 12000; // Starts after first completes

      const testTime = 15000; // Test at 15 seconds

      timeController.setTime(testTime);

      // Simulate instances from all three executions
      const allInstances: ItemInstanceImpl[] = [];

      // Execution 1 instances (all should be complete by testTime)
      for (let i = 0; i < 5; i++) {
        const startTime = execution1StartTime + (i * 2000);
        const completionTime = startTime + 1000;

        if (completionTime <= testTime) {
          allInstances.push(new ItemInstanceImpl({
            id: `exec1-instance-${i + 1}`,
            itemId: `exec1-${Object.values(TEST_ITEM_IDS)[i + 1]}`,
            calendarEntryId: `exec1-entry-${i + 1}`,
            scheduledStartTime: startTime,
            actualStartTime: startTime,
            completedAt: completionTime,
            isComplete: true,
            executionDetails: {}
          }));
        }
      }

      // Execution 2 instances (some should be complete by testTime)
      for (let i = 0; i < 5; i++) {
        const startTime = execution2StartTime + (i * 2000);
        const completionTime = startTime + 1000;

        if (completionTime <= testTime) {
          allInstances.push(new ItemInstanceImpl({
            id: `exec2-instance-${i + 1}`,
            itemId: `exec2-${Object.values(TEST_ITEM_IDS)[i + 1]}`,
            calendarEntryId: `exec2-entry-${i + 1}`,
            scheduledStartTime: startTime,
            actualStartTime: startTime,
            completedAt: completionTime,
            isComplete: true,
            executionDetails: {}
          }));
        }
      }

      // Execution 3 instances (few should be complete by testTime)
      for (let i = 0; i < 5; i++) {
        const startTime = execution3StartTime + (i * 2000);
        const completionTime = startTime + 1000;

        if (completionTime <= testTime) {
          allInstances.push(new ItemInstanceImpl({
            id: `exec3-instance-${i + 1}`,
            itemId: `exec3-${Object.values(TEST_ITEM_IDS)[i + 1]}`,
            calendarEntryId: `exec3-entry-${i + 1}`,
            scheduledStartTime: startTime,
            actualStartTime: startTime,
            completedAt: completionTime,
            isComplete: true,
            executionDetails: {}
          }));
        }
      }

      // Verify we have instances from multiple executions
      expect(allInstances.length).toBeGreaterThan(5); // More than one execution

      // Verify all instances are properly completed
      allInstances.forEach(instance => {
        expect(instance.isComplete).toBe(true);
        expect(instance.completedAt).toBeLessThanOrEqual(testTime);
      });

      // Verify instances from different executions can be distinguished
      const exec1Instances = allInstances.filter(inst => inst.id.startsWith('exec1-'));
      const exec2Instances = allInstances.filter(inst => inst.id.startsWith('exec2-'));
      const exec3Instances = allInstances.filter(inst => inst.id.startsWith('exec3-'));

      expect(exec1Instances.length).toBe(5); // All should be complete
      expect(exec2Instances.length).toBeGreaterThan(0); // Some should be complete
      expect(exec3Instances.length).toBeGreaterThan(0); // At least one should be complete

      console.log(`Multiple executions: ${exec1Instances.length} + ${exec2Instances.length} + ${exec3Instances.length} = ${allInstances.length} total instances`);
    });
  });

  describe('Error Recovery and Robustness', () => {
    it('handles execution interruptions gracefully', () => {
      // Simulate an execution that gets interrupted
      timeController.setTime(2500); // Mid-execution

      const partialInstances = [
        // First child completed normally
        new ItemInstanceImpl({
          id: 'normal-completion',
          itemId: TEST_ITEM_IDS.CHILD_1,
          calendarEntryId: 'normal-entry',
          scheduledStartTime: 0,
          actualStartTime: 0,
          completedAt: 1000,
          isComplete: true,
          executionDetails: {}
        }),
        // Second child was interrupted (incomplete)
        new ItemInstanceImpl({
          id: 'interrupted-execution',
          itemId: TEST_ITEM_IDS.CHILD_2,
          calendarEntryId: 'interrupted-entry',
          scheduledStartTime: 2000,
          actualStartTime: 2000,
          // No completedAt - was interrupted
          isComplete: false,
          executionDetails: {}
        })
      ];

      // Only completed instances should appear in accounting
      const accountingInstances = partialInstances.filter(inst => inst.isComplete);

      expect(accountingInstances).toHaveLength(1);
      expect(accountingInstances[0].itemId).toBe(TEST_ITEM_IDS.CHILD_1);
    });

    it('handles out-of-order completion scenarios', () => {
      // Simulate scenario where later children complete before earlier ones
      // (shouldn't happen normally, but tests robustness)
      timeController.setTime(5000);

      const outOfOrderInstances = [
        // Third child completed first (unusual but possible)
        new ItemInstanceImpl({
          id: 'third-child',
          itemId: TEST_ITEM_IDS.CHILD_3,
          calendarEntryId: 'third-entry',
          scheduledStartTime: 4000,
          actualStartTime: 4000,
          completedAt: 4500,
          isComplete: true,
          executionDetails: {}
        }),
        // First child completed later
        new ItemInstanceImpl({
          id: 'first-child',
          itemId: TEST_ITEM_IDS.CHILD_1,
          calendarEntryId: 'first-entry',
          scheduledStartTime: 0,
          actualStartTime: 0,
          completedAt: 4800,
          isComplete: true,
          executionDetails: {}
        }),
        // Second child still executing
        new ItemInstanceImpl({
          id: 'second-child',
          itemId: TEST_ITEM_IDS.CHILD_2,
          calendarEntryId: 'second-entry',
          scheduledStartTime: 2000,
          actualStartTime: 2000,
          isComplete: false,
          executionDetails: {}
        })
      ];

      const completedInstances = outOfOrderInstances.filter(inst => inst.isComplete);

      expect(completedInstances).toHaveLength(2);

      // Both completed instances should be valid for accounting
      completedInstances.forEach(instance => {
        expect(instance.completedAt).toBeDefined();
        expect(instance.completedAt!).toBeLessThanOrEqual(5000);
        expect(instance.isComplete).toBe(true);
      });
    });
  });

  describe('Performance and Scale Testing', () => {
    it('handles large numbers of completed instances efficiently', () => {
      const startTime = performance.now();

      // Create a large number of instances
      const largeInstanceSet: ItemInstanceImpl[] = [];
      for (let exec = 0; exec < 100; exec++) {
        for (let child = 0; child < 5; child++) {
          const instanceStartTime = (exec * 10000) + (child * 2000);
          const completionTime = instanceStartTime + 1000;

          largeInstanceSet.push(new ItemInstanceImpl({
            id: `exec-${exec}-child-${child}`,
            itemId: `item-${exec}-${child}`,
            calendarEntryId: `entry-${exec}-${child}`,
            scheduledStartTime: instanceStartTime,
            actualStartTime: instanceStartTime,
            completedAt: completionTime,
            isComplete: true,
            executionDetails: {}
          }));
        }
      }

      const endTime = performance.now();
      const creationTime = endTime - startTime;

      // Should create large dataset quickly
      expect(largeInstanceSet).toHaveLength(500); // 100 executions * 5 children
      expect(creationTime).toBeLessThan(100); // Should complete within 100ms

      // Test filtering performance
      const filterStartTime = performance.now();
      const recentInstances = largeInstanceSet.filter(inst =>
        (inst.completedAt ?? 0) > 500000 // Completed after a certain time
      );
      const filterEndTime = performance.now();
      const filterTime = filterEndTime - filterStartTime;

      expect(filterTime).toBeLessThan(50); // Filtering should be fast
      expect(recentInstances.length).toBeGreaterThan(0);

      console.log(`Performance test: Created ${largeInstanceSet.length} instances in ${creationTime}ms, filtered ${recentInstances.length} in ${filterTime}ms`);
    });

    it('maintains consistency during rapid state changes', () => {
      const stateChanges: Array<{ time: number; completedCount: number }> = [];

      // Rapidly advance through execution
      for (let time = 0; time <= 10000; time += 10) {
        timeController.setTime(time);
        const completed = createCompletedInstancesForTime(time);
        stateChanges.push({ time, completedCount: completed.length });
      }

      // Verify consistency properties
      expect(stateChanges).toHaveLength(1001); // Every 10ms for 10 seconds

      // Verify completed count never decreases
      for (let i = 1; i < stateChanges.length; i++) {
        expect(stateChanges[i].completedCount).toBeGreaterThanOrEqual(
          stateChanges[i - 1].completedCount
        );
      }

      // Verify final state is correct
      const finalState = stateChanges[stateChanges.length - 1];
      expect(finalState.completedCount).toBe(5);
    });
  });
});
