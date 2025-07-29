import { describe, it, expect, beforeEach } from 'vitest';
import {
  createTestSubCalendarWithChildren,
  createTestChildItems,
  createCompleteTestItemSet,
  createTestItemInstances,
  createTestBaseCalendarEntries,
  markInstanceComplete,
  createTestItemLookupMap,
  validateTestItemStructure,
  TEST_ITEM_IDS,
  TIMING_CONSTANTS
} from './testUtils';
import { AccountingTestDataFactory, TEST_SCENARIOS, TEST_ASSERTIONS } from './accountingTestData';
import { BasicItem, SubCalendarItem } from '../../../functions/utils/item/index';

describe('Test Utilities', () => {
  describe('createTestSubCalendarWithChildren', () => {
    it('should create a SubCalendar with correct duration', () => {
      const parent = createTestSubCalendarWithChildren();

      expect(parent.duration).toBe(TIMING_CONSTANTS.PARENT_DURATION);
      expect(parent.id).toBe(TEST_ITEM_IDS.PARENT_SUBCALENDAR);
      expect(parent.name).toBe('Test SubCalendar');
    });

    it('should create exactly 5 children with correct timing', () => {
      const parent = createTestSubCalendarWithChildren();

      expect(parent.children).toHaveLength(5);

      parent.children.forEach((child, index) => {
        expect(child.start).toBe(TIMING_CONSTANTS.CHILD_STARTS[index]);
        expect(child.id).toBe(Object.values(TEST_ITEM_IDS)[index + 1]);
      });
    });

    it('should create children with unique relationship IDs', () => {
      const parent = createTestSubCalendarWithChildren();
      const relationshipIds = parent.children.map(child => child.relationshipId);
      const uniqueIds = new Set(relationshipIds);

      expect(uniqueIds.size).toBe(relationshipIds.length);
    });
  });

  describe('createTestChildItems', () => {
    it('should create 5 BasicItems with correct properties', () => {
      const children = createTestChildItems();

      expect(children).toHaveLength(5);

      children.forEach((child, index) => {
        expect(child).toBeInstanceOf(BasicItem);
        expect(child.duration).toBe(TIMING_CONSTANTS.CHILD_DURATION);
        expect(child.id).toBe(Object.values(TEST_ITEM_IDS)[index + 1]);
        expect(child.name).toBe(`Test Child ${index + 1}`);
      });
    });
  });

  describe('createCompleteTestItemSet', () => {
    it('should create consistent parent and child items', () => {
      const { parentItem, childItems, allItems } = createCompleteTestItemSet();

      expect(parentItem).toBeInstanceOf(SubCalendarItem);
      expect(childItems).toHaveLength(5);
      expect(allItems).toHaveLength(6); // 1 parent + 5 children

      // Verify parent references correct children
      parentItem.children.forEach((childRef, index) => {
        const childItem = childItems[index];
        expect(childRef.id).toBe(childItem.id);
      });
    });
  });

  describe('createTestItemInstances', () => {
    let baseStartTime: number;

    beforeEach(() => {
      baseStartTime = Date.now();
    });

    it('should create instances with correct timing relationships', () => {
      const { parentInstance, childInstances } = createTestItemInstances(baseStartTime);

      expect(parentInstance.scheduledStartTime).toBe(baseStartTime);
      expect(childInstances).toHaveLength(5);

      childInstances.forEach((childInstance, index) => {
        const expectedStartTime = baseStartTime + TIMING_CONSTANTS.CHILD_STARTS[index];
        expect(childInstance.scheduledStartTime).toBe(expectedStartTime);
      });
    });

    it('should create instances with correct item IDs', () => {
      const { parentInstance, childInstances } = createTestItemInstances(baseStartTime);

      expect(parentInstance.itemId).toBe(TEST_ITEM_IDS.PARENT_SUBCALENDAR);

      childInstances.forEach((childInstance, index) => {
        const expectedItemId = Object.values(TEST_ITEM_IDS)[index + 1];
        expect(childInstance.itemId).toBe(expectedItemId);
      });
    });

    it('should create instances that are initially incomplete', () => {
      const { allInstances } = createTestItemInstances(baseStartTime);

      allInstances.forEach(instance => {
        expect(instance.isComplete).toBe(false);
        expect(instance.actualStartTime).toBeUndefined();
        expect(instance.completedAt).toBeUndefined();
      });
    });
  });

  describe('createTestBaseCalendarEntries', () => {
    let baseStartTime: number;

    beforeEach(() => {
      baseStartTime = Date.now();
    });

    it('should create calendar entries for all items', () => {
      const entries = createTestBaseCalendarEntries(baseStartTime);

      expect(entries).toHaveLength(6); // 1 parent + 5 children

      // Verify parent entry
      const parentEntry = entries.find(entry => entry.itemId === TEST_ITEM_IDS.PARENT_SUBCALENDAR);
      expect(parentEntry).toBeDefined();
      expect(parentEntry!.startTime).toBe(baseStartTime);

      // Verify child entries
      Object.values(TEST_ITEM_IDS).slice(1).forEach((childId, index) => {
        const childEntry = entries.find(entry => entry.itemId === childId);
        expect(childEntry).toBeDefined();
        expect(childEntry!.startTime).toBe(baseStartTime + TIMING_CONSTANTS.CHILD_STARTS[index]);
      });
    });
  });

  describe('markInstanceComplete', () => {
    it('should mark instance as complete with correct completion time', () => {
      const { parentInstance } = createTestItemInstances();
      const completionTime = Date.now();

      const completedInstance = markInstanceComplete(parentInstance, completionTime);

      expect(completedInstance.isComplete).toBe(true);
      expect(completedInstance.completedAt).toBe(completionTime);
      expect(completedInstance.actualStartTime).toBe(parentInstance.scheduledStartTime);
    });

    it('should preserve other instance properties', () => {
      const { parentInstance } = createTestItemInstances();
      const completionTime = Date.now();

      const completedInstance = markInstanceComplete(parentInstance, completionTime);

      expect(completedInstance.id).toBe(parentInstance.id);
      expect(completedInstance.itemId).toBe(parentInstance.itemId);
      expect(completedInstance.calendarEntryId).toBe(parentInstance.calendarEntryId);
      expect(completedInstance.scheduledStartTime).toBe(parentInstance.scheduledStartTime);
    });
  });

  describe('createTestItemLookupMap', () => {
    it('should create a map with all test items', () => {
      const lookupMap = createTestItemLookupMap();

      expect(lookupMap.size).toBe(6); // 1 parent + 5 children

      Object.values(TEST_ITEM_IDS).forEach(itemId => {
        expect(lookupMap.has(itemId)).toBe(true);
        expect(lookupMap.get(itemId)).toBeDefined();
      });
    });

    it('should map parent item correctly', () => {
      const lookupMap = createTestItemLookupMap();
      const parentItem = lookupMap.get(TEST_ITEM_IDS.PARENT_SUBCALENDAR);

      expect(parentItem).toBeInstanceOf(SubCalendarItem);
      expect(parentItem!.id).toBe(TEST_ITEM_IDS.PARENT_SUBCALENDAR);
    });

    it('should map child items correctly', () => {
      const lookupMap = createTestItemLookupMap();

      Object.values(TEST_ITEM_IDS).slice(1).forEach(childId => {
        const childItem = lookupMap.get(childId);
        expect(childItem).toBeInstanceOf(BasicItem);
        expect(childItem!.id).toBe(childId);
      });
    });
  });

  describe('validateTestItemStructure', () => {
    it('should pass validation for correct test structure', () => {
      const parent = createTestSubCalendarWithChildren();
      const children = createTestChildItems();

      expect(() => {
        validateTestItemStructure(parent, children);
      }).not.toThrow();
    });

    it('should throw error for incorrect parent duration', () => {
      const parent = new SubCalendarItem({
        id: 'test',
        name: 'Test',
        duration: 5000, // Wrong duration
        children: []
      });
      const children = createTestChildItems();

      expect(() => {
        validateTestItemStructure(parent, children);
      }).toThrow(/Parent duration.*does not match expected/);
    });

    it('should throw error for incorrect child count', () => {
      const parent = createTestSubCalendarWithChildren();
      const children = createTestChildItems().slice(0, 3); // Only 3 children

      expect(() => {
        validateTestItemStructure(parent, children);
      }).toThrow(/Expected 5 child items, got 3/);
    });

    it('should throw error for incorrect child start times', () => {
      // Create parent with wrong start times
      const parent = new SubCalendarItem({
        id: TEST_ITEM_IDS.PARENT_SUBCALENDAR,
        name: 'Test SubCalendar',
        duration: TIMING_CONSTANTS.PARENT_DURATION,
        children: [
          { id: TEST_ITEM_IDS.CHILD_1, start: 1000 }, // Wrong start time
          { id: TEST_ITEM_IDS.CHILD_2, start: 2000 },
          { id: TEST_ITEM_IDS.CHILD_3, start: 4000 },
          { id: TEST_ITEM_IDS.CHILD_4, start: 6000 },
          { id: TEST_ITEM_IDS.CHILD_5, start: 8000 }
        ].map(data => ({ ...data, relationshipId: 'test' }))
      });
      const children = createTestChildItems();

      expect(() => {
        validateTestItemStructure(parent, children);
      }).toThrow(/Child 1 start time.*does not match expected/);
    });
  });
});

describe('AccountingTestDataFactory', () => {
  let factory: AccountingTestDataFactory;
  let baseStartTime: number;

  beforeEach(() => {
    baseStartTime = 1640995200000; // Fixed timestamp for predictable tests
    factory = new AccountingTestDataFactory(baseStartTime);
  });

  describe('createCompleteTestScenario', () => {
    it('should create a complete test scenario with all components', () => {
      const scenario = factory.createCompleteTestScenario();

      expect(scenario.parentItem).toBeInstanceOf(SubCalendarItem);
      expect(scenario.childItems).toHaveLength(5);
      expect(scenario.parentInstance).toBeDefined();
      expect(scenario.childInstances).toHaveLength(5);
      expect(scenario.calendarEntries).toHaveLength(6);
      expect(scenario.allItems).toHaveLength(6);
      expect(scenario.allInstances).toHaveLength(6);
      expect(scenario.baseStartTime).toBe(baseStartTime);
    });
  });

  describe('createScenarioAtTime', () => {
    it('should correctly identify active child during first child execution', () => {
      const result = factory.createScenarioAtTime(500); // 0.5 seconds

      expect(result.expectedActiveChild).toBe(0); // First child active
      expect(result.expectedCompletedChildren).toEqual([]); // None completed yet
    });

    it('should correctly identify completed children after first child', () => {
      const result = factory.createScenarioAtTime(1500); // 1.5 seconds

      expect(result.expectedActiveChild).toBe(null); // In gap period
      expect(result.expectedCompletedChildren).toEqual([0]); // First child completed
    });

    it('should correctly identify active child during second child execution', () => {
      const result = factory.createScenarioAtTime(2500); // 2.5 seconds

      expect(result.expectedActiveChild).toBe(1); // Second child active
      expect(result.expectedCompletedChildren).toEqual([0]); // First child completed
    });

    it('should correctly identify all completed children after execution', () => {
      const result = factory.createScenarioAtTime(9500); // 9.5 seconds

      expect(result.expectedActiveChild).toBe(null); // No active child
      expect(result.expectedCompletedChildren).toEqual([0, 1, 2, 3, 4]); // All completed
    });
  });

  describe('predefined scenario methods', () => {
    it('should create first second scenario correctly', () => {
      const result = factory.createFirstSecondScenario();

      expect(result.expectedActiveChild).toBe(0);
      expect(result.expectedCompletedChildren).toEqual([]);
    });

    it('should create after first child scenario correctly', () => {
      const result = factory.createAfterFirstChildScenario();

      expect(result.expectedActiveChild).toBe(null);
      expect(result.expectedCompletedChildren).toEqual([0]);
    });
  });
});

describe('TEST_SCENARIOS', () => {
  describe('createFreshScenario', () => {
    it('should create scenario with recent timestamp', () => {
      const scenario = TEST_SCENARIOS.createFreshScenario();
      const now = Date.now();

      // Should be within last few seconds
      expect(scenario.baseStartTime).toBeGreaterThan(now - 5000);
      expect(scenario.baseStartTime).toBeLessThanOrEqual(now);
    });
  });

  describe('createPredictableScenario', () => {
    it('should create scenario with fixed timestamp', () => {
      const scenario = TEST_SCENARIOS.createPredictableScenario();

      expect(scenario.baseStartTime).toBe(1640995200000);
    });
  });

  describe('createTimeProgressionScenarios', () => {
    it('should create scenarios for different time points', () => {
      const baseTime = 1640995200000;
      const scenarios = TEST_SCENARIOS.createTimeProgressionScenarios(baseTime);

      expect(scenarios.beforeStart.currentTime).toBe(baseTime - 1000);
      expect(scenarios.duringFirstChild.currentTime).toBe(baseTime + 500);
      expect(scenarios.afterFirstChild.currentTime).toBe(baseTime + 1500);
      expect(scenarios.afterCompletion.currentTime).toBe(baseTime + 10500);
    });
  });
});

describe('TEST_ASSERTIONS', () => {
  let scenario: ReturnType<AccountingTestDataFactory['createCompleteTestScenario']>;

  beforeEach(() => {
    const factory = new AccountingTestDataFactory();
    scenario = factory.createCompleteTestScenario();
  });

  describe('validateBasicStructure', () => {
    it('should validate correct structure', () => {
      const validation = TEST_ASSERTIONS.validateBasicStructure(scenario);

      expect(validation.hasParentItem).toBe(true);
      expect(validation.hasCorrectChildCount).toBe(true);
      expect(validation.hasCorrectParentDuration).toBe(true);
      expect(validation.hasCorrectChildDurations).toBe(true);
      expect(validation.hasCorrectInstanceCount).toBe(true);
      expect(validation.hasValidItemIds).toBe(true);
    });
  });

  describe('validateTiming', () => {
    it('should validate correct timing relationships', () => {
      const validation = TEST_ASSERTIONS.validateTiming(scenario);

      expect(validation.hasCorrectStartTimes).toBe(true);
      expect(validation.hasCorrectSequence).toBe(true);
      expect(validation.hasProperGaps).toBe(true);
    });
  });
});
