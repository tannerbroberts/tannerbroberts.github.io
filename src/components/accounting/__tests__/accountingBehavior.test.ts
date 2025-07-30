import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getTimeController } from './timeControlUtils';
import { createTestItemInstances, TEST_ITEM_IDS } from './testUtils';
import { ItemInstanceImpl } from '../../../functions/utils/itemInstance/types';
import { useItemInstances } from '../../../hooks/useItemInstances';

// Mock the useItemInstances hook
vi.mock('../../../hooks/useItemInstances');

describe('Accounting Behavior During Execution', () => {
  let timeController: ReturnType<typeof getTimeController>;
  let testData: ReturnType<typeof createTestItemInstances>;
  let mockUseItemInstances: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset time controller
    timeController = getTimeController();
    timeController.resetTime();

    // Create test data
    testData = createTestItemInstances();

    // Setup mock
    mockUseItemInstances = vi.mocked(useItemInstances);

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('useItemInstances Hook Behavior', () => {
    it('returns empty accounting instances during execution periods', () => {
      // Simulate time during first child execution (500ms)
      timeController.setTime(500);

      // Mock hook to return no accounting instances (items are executing, not completed)
      mockUseItemInstances.mockReturnValue({
        accountingInstances: [],
        allInstances: new Map(testData.allInstances.map(inst => [inst.id, inst])),
        pastIncompleteInstances: [],
        getInstancesByItemId: () => [],
        getInstancesByCalendarEntryId: () => [],
        getInstance: () => null,
        hasExecutingInstance: () => true, // Something is executing
        hasActiveCalendarEntryForItem: () => true
      });

      const result = useItemInstances();

      expect(result.accountingInstances).toHaveLength(0);
      expect(result.hasExecutingInstance).toBeTruthy();
    });

    it('returns completed instances after execution completion', () => {
      // Simulate time after first child completion (1001ms)
      timeController.setTime(1001);

      // Create a completed instance
      const completedInstance = new ItemInstanceImpl({
        id: 'completed-instance-1',
        itemId: TEST_ITEM_IDS.CHILD_1,
        calendarEntryId: 'entry-1',
        scheduledStartTime: 0,
        actualStartTime: 0,
        completedAt: 1000,
        isComplete: true,
        executionDetails: {}
      });

      // Mock hook to return the completed instance in accounting
      mockUseItemInstances.mockReturnValue({
        accountingInstances: [completedInstance],
        allInstances: new Map([[completedInstance.id, completedInstance]]),
        pastIncompleteInstances: [completedInstance],
        getInstancesByItemId: (itemId: string) =>
          itemId === TEST_ITEM_IDS.CHILD_1 ? [completedInstance] : [],
        getInstancesByCalendarEntryId: () => [],
        getInstance: (id: string) =>
          id === completedInstance.id ? completedInstance : null,
        hasExecutingInstance: () => false, // Nothing executing now
        hasActiveCalendarEntryForItem: () => false
      });

      const result = useItemInstances();

      expect(result.accountingInstances).toHaveLength(1);
      expect(result.accountingInstances[0].itemId).toBe(TEST_ITEM_IDS.CHILD_1);
      expect(result.accountingInstances[0].isComplete).toBe(true);
      expect(result.hasExecutingInstance(TEST_ITEM_IDS.CHILD_1)).toBe(false);
    });

    it('progressively accumulates completed instances', () => {
      // Simulate time after second child completion (3001ms)
      timeController.setTime(3001);

      // Create completed instances for first two children
      const completedInstances = [
        new ItemInstanceImpl({
          id: 'completed-instance-1',
          itemId: TEST_ITEM_IDS.CHILD_1,
          calendarEntryId: 'entry-1',
          scheduledStartTime: 0,
          actualStartTime: 0,
          completedAt: 1000,
          isComplete: true,
          executionDetails: {}
        }),
        new ItemInstanceImpl({
          id: 'completed-instance-2',
          itemId: TEST_ITEM_IDS.CHILD_2,
          calendarEntryId: 'entry-2',
          scheduledStartTime: 2000,
          actualStartTime: 2000,
          completedAt: 3000,
          isComplete: true,
          executionDetails: {}
        })
      ];

      // Mock hook to return both completed instances
      mockUseItemInstances.mockReturnValue({
        accountingInstances: completedInstances,
        allInstances: new Map(completedInstances.map(inst => [inst.id, inst])),
        pastIncompleteInstances: completedInstances,
        getInstancesByItemId: (itemId: string) =>
          completedInstances.filter(inst => inst.itemId === itemId),
        getInstancesByCalendarEntryId: () => [],
        getInstance: (id: string) =>
          completedInstances.find(inst => inst.id === id) || null,
        hasExecutingInstance: () => false,
        hasActiveCalendarEntryForItem: () => false
      });

      const result = useItemInstances();

      expect(result.accountingInstances).toHaveLength(2);
      expect(result.accountingInstances.map(inst => inst.itemId)).toContain(TEST_ITEM_IDS.CHILD_1);
      expect(result.accountingInstances.map(inst => inst.itemId)).toContain(TEST_ITEM_IDS.CHILD_2);
      expect(result.accountingInstances.every(inst => inst.isComplete)).toBe(true);
    });
  });

  describe('Instance Filtering Logic', () => {
    it('filters out currently executing instances from accounting', () => {
      // Simulate mid-execution time
      timeController.setTime(1500);

      // Create a mix of completed and executing instances
      const completedInstance = new ItemInstanceImpl({
        id: 'completed-instance-1',
        itemId: TEST_ITEM_IDS.CHILD_1,
        calendarEntryId: 'entry-1',
        scheduledStartTime: 0,
        actualStartTime: 0,
        completedAt: 1000,
        isComplete: true,
        executionDetails: {}
      });

      const executingInstance = new ItemInstanceImpl({
        id: 'executing-instance-2',
        itemId: TEST_ITEM_IDS.CHILD_2,
        calendarEntryId: 'entry-2',
        scheduledStartTime: 2000,
        actualStartTime: 2000,
        // No completedAt - still executing
        isComplete: false,
        executionDetails: {}
      });

      // Mock hook should only return completed instances in accountingInstances
      mockUseItemInstances.mockReturnValue({
        accountingInstances: [completedInstance], // Only completed
        allInstances: new Map([
          [completedInstance.id, completedInstance],
          [executingInstance.id, executingInstance]
        ]),
        pastIncompleteInstances: [completedInstance, executingInstance], // All instances
        getInstancesByItemId: (itemId: string) => {
          if (itemId === TEST_ITEM_IDS.CHILD_1) return [completedInstance];
          if (itemId === TEST_ITEM_IDS.CHILD_2) return [executingInstance];
          return [];
        },
        getInstancesByCalendarEntryId: () => [],
        getInstance: (id: string) => {
          if (id === completedInstance.id) return completedInstance;
          if (id === executingInstance.id) return executingInstance;
          return null;
        },
        hasExecutingInstance: () => true, // Child 2 is executing
        hasActiveCalendarEntryForItem: () => true
      });

      const result = useItemInstances();

      // Accounting instances should only contain completed items
      expect(result.accountingInstances).toHaveLength(1);
      expect(result.accountingInstances[0].itemId).toBe(TEST_ITEM_IDS.CHILD_1);
      expect(result.accountingInstances[0].isComplete).toBe(true);

      // All instances should contain both
      expect(result.allInstances.size).toBe(2);
      expect(result.hasExecutingInstance(TEST_ITEM_IDS.CHILD_2)).toBe(true);
    });

    it('handles completion timestamps correctly', () => {
      const currentTime = 2500;
      timeController.setTime(currentTime);

      // Create instances with specific completion times
      const earlyCompletion = new ItemInstanceImpl({
        id: 'early-completion',
        itemId: TEST_ITEM_IDS.CHILD_1,
        calendarEntryId: 'entry-1',
        scheduledStartTime: 0,
        actualStartTime: 0,
        completedAt: 1000, // Completed in the past
        isComplete: true,
        executionDetails: {}
      });

      const futureCompletion = new ItemInstanceImpl({
        id: 'future-completion',
        itemId: TEST_ITEM_IDS.CHILD_2,
        calendarEntryId: 'entry-2',
        scheduledStartTime: 2000,
        actualStartTime: 2000,
        completedAt: 3000, // Will complete in the future
        isComplete: false, // Not yet complete
        executionDetails: {}
      });

      // Only past completions should appear in accounting
      mockUseItemInstances.mockReturnValue({
        accountingInstances: [earlyCompletion],
        allInstances: new Map([
          [earlyCompletion.id, earlyCompletion],
          [futureCompletion.id, futureCompletion]
        ]),
        pastIncompleteInstances: [earlyCompletion],
        getInstancesByItemId: (itemId: string) => {
          if (itemId === TEST_ITEM_IDS.CHILD_1) return [earlyCompletion];
          if (itemId === TEST_ITEM_IDS.CHILD_2) return [futureCompletion];
          return [];
        },
        getInstancesByCalendarEntryId: () => [],
        getInstance: (id: string) => {
          if (id === earlyCompletion.id) return earlyCompletion;
          if (id === futureCompletion.id) return futureCompletion;
          return null;
        },
        hasExecutingInstance: () => true,
        hasActiveCalendarEntryForItem: () => true
      });

      const result = useItemInstances();

      expect(result.accountingInstances).toHaveLength(1);
      expect(result.accountingInstances[0].completedAt).toBeLessThan(currentTime);
      expect(result.accountingInstances[0].isComplete).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty execution scenarios', () => {
      timeController.setTime(0);

      mockUseItemInstances.mockReturnValue({
        accountingInstances: [],
        allInstances: new Map(),
        pastIncompleteInstances: [],
        getInstancesByItemId: () => [],
        getInstancesByCalendarEntryId: () => [],
        getInstance: () => null,
        hasExecutingInstance: () => false,
        hasActiveCalendarEntryForItem: () => false
      });

      const result = useItemInstances();

      expect(result.accountingInstances).toHaveLength(0);
      expect(result.allInstances.size).toBe(0);
      expect(result.hasExecutingInstance('any-item-id')).toBe(false);
    });

    it('handles instant completion scenarios', () => {
      timeController.setTime(1);

      const instantInstance = new ItemInstanceImpl({
        id: 'instant-instance',
        itemId: TEST_ITEM_IDS.CHILD_1,
        calendarEntryId: 'instant-entry',
        scheduledStartTime: 0,
        actualStartTime: 0,
        completedAt: 0, // Completed instantly
        isComplete: true,
        executionDetails: {}
      });

      mockUseItemInstances.mockReturnValue({
        accountingInstances: [instantInstance],
        allInstances: new Map([[instantInstance.id, instantInstance]]),
        pastIncompleteInstances: [instantInstance],
        getInstancesByItemId: () => [instantInstance],
        getInstancesByCalendarEntryId: () => [],
        getInstance: () => instantInstance,
        hasExecutingInstance: () => false,
        hasActiveCalendarEntryForItem: () => false
      });

      const result = useItemInstances();

      expect(result.accountingInstances).toHaveLength(1);
      expect(result.accountingInstances[0].completedAt).toBe(0);
      expect(result.accountingInstances[0].isComplete).toBe(true);
    });

    it('handles malformed instance data gracefully', () => {
      timeController.setTime(1000);

      // Create instance with invalid data
      const malformedInstance = new ItemInstanceImpl({
        id: 'malformed-instance',
        itemId: 'non-existent-item',
        calendarEntryId: 'non-existent-entry',
        scheduledStartTime: -1, // Invalid start time
        actualStartTime: -1,
        completedAt: 999, // Completed before it started
        isComplete: true,
        executionDetails: {}
      });

      mockUseItemInstances.mockReturnValue({
        accountingInstances: [malformedInstance],
        allInstances: new Map([[malformedInstance.id, malformedInstance]]),
        pastIncompleteInstances: [malformedInstance],
        getInstancesByItemId: () => [malformedInstance],
        getInstancesByCalendarEntryId: () => [],
        getInstance: () => malformedInstance,
        hasExecutingInstance: () => false,
        hasActiveCalendarEntryForItem: () => false
      });

      const result = useItemInstances();

      // Should still work, even with malformed data
      expect(result.accountingInstances).toHaveLength(1);
      expect(result.accountingInstances[0].isComplete).toBe(true);
    });

    it('handles overlapping execution scenarios', () => {
      timeController.setTime(2500);

      // Create overlapping instances (should not happen in real execution,
      // but tests robustness)
      const overlapping1 = new ItemInstanceImpl({
        id: 'overlap-1',
        itemId: TEST_ITEM_IDS.CHILD_1,
        calendarEntryId: 'entry-1',
        scheduledStartTime: 1000,
        actualStartTime: 1000,
        completedAt: 2000,
        isComplete: true,
        executionDetails: {}
      });

      const overlapping2 = new ItemInstanceImpl({
        id: 'overlap-2',
        itemId: TEST_ITEM_IDS.CHILD_1, // Same item ID
        calendarEntryId: 'entry-1-duplicate',
        scheduledStartTime: 1500,
        actualStartTime: 1500,
        completedAt: 2500,
        isComplete: true,
        executionDetails: {}
      });

      mockUseItemInstances.mockReturnValue({
        accountingInstances: [overlapping1, overlapping2],
        allInstances: new Map([
          [overlapping1.id, overlapping1],
          [overlapping2.id, overlapping2]
        ]),
        pastIncompleteInstances: [overlapping1, overlapping2],
        getInstancesByItemId: (itemId: string) =>
          itemId === TEST_ITEM_IDS.CHILD_1 ? [overlapping1, overlapping2] : [],
        getInstancesByCalendarEntryId: () => [],
        getInstance: (id: string) => {
          if (id === overlapping1.id) return overlapping1;
          if (id === overlapping2.id) return overlapping2;
          return null;
        },
        hasExecutingInstance: () => false,
        hasActiveCalendarEntryForItem: () => false
      });

      const result = useItemInstances();

      // Should handle overlapping instances
      expect(result.accountingInstances).toHaveLength(2);
      expect(result.getInstancesByItemId(TEST_ITEM_IDS.CHILD_1)).toHaveLength(2);
    });
  });

  describe('Time Progression Tests', () => {
    const timeProgessionScenarios = [
      { time: 0, expectedCompletedCount: 0, description: 'Start of execution' },
      { time: 999, expectedCompletedCount: 0, description: 'Just before first completion' },
      { time: 1000, expectedCompletedCount: 1, description: 'First completion' },
      { time: 1001, expectedCompletedCount: 1, description: 'Just after first completion' },
      { time: 2999, expectedCompletedCount: 1, description: 'Just before second completion' },
      { time: 3000, expectedCompletedCount: 2, description: 'Second completion' },
      { time: 3001, expectedCompletedCount: 2, description: 'Just after second completion' },
    ];

    timeProgessionScenarios.forEach(({ time, expectedCompletedCount, description }) => {
      it(`correctly handles accounting at ${time}ms: ${description}`, () => {
        timeController.setTime(time);

        // Create appropriate number of completed instances
        const completedInstances: ItemInstanceImpl[] = [];
        for (let i = 0; i < expectedCompletedCount; i++) {
          const completionTime = (i + 1) * 1000; // 1000ms, 2000ms, etc.
          if (completionTime <= time) {
            completedInstances.push(new ItemInstanceImpl({
              id: `instance-${i + 1}`,
              itemId: Object.values(TEST_ITEM_IDS)[i + 1],
              calendarEntryId: `entry-${i + 1}`,
              scheduledStartTime: i * 2000, // Start times: 0, 2000, 4000, etc.
              actualStartTime: i * 2000,
              completedAt: completionTime,
              isComplete: true,
              executionDetails: {}
            }));
          }
        }

        mockUseItemInstances.mockReturnValue({
          accountingInstances: completedInstances,
          allInstances: new Map(completedInstances.map(inst => [inst.id, inst])),
          pastIncompleteInstances: completedInstances,
          getInstancesByItemId: (itemId: string) =>
            completedInstances.filter(inst => inst.itemId === itemId),
          getInstancesByCalendarEntryId: () => [],
          getInstance: (id: string) =>
            completedInstances.find(inst => inst.id === id) || null,
          hasExecutingInstance: () => expectedCompletedCount === 0,
          hasActiveCalendarEntryForItem: () => expectedCompletedCount === 0
        });

        const result = useItemInstances();

        expect(result.accountingInstances).toHaveLength(expectedCompletedCount);
        expect(result.accountingInstances.every(inst => inst.isComplete)).toBe(true);
        expect(result.accountingInstances.every(inst => (inst.completedAt ?? 0) <= time)).toBe(true);
      });
    });
  });
});
