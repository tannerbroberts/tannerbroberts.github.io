import {
  createTestSubCalendarWithChildren,
  createTestChildItems,
  createTestItemInstances,
  createTestBaseCalendarEntries,
  TIMING_CONSTANTS,
  TEST_ITEM_IDS
} from './testUtils';
import { BasicItem, SubCalendarItem } from '../../../functions/utils/item/index';
import { ItemInstanceImpl } from '../../../functions/utils/itemInstance/types';
import { BaseCalendarEntry } from '../../../functions/reducers/AppReducer';

/**
 * Factory for creating consistent test scenarios
 */
export class AccountingTestDataFactory {
  private baseStartTime: number;

  constructor(baseStartTime: number = Date.now()) {
    this.baseStartTime = baseStartTime;
  }

  /**
   * Create a complete test scenario with all necessary data structures
   */
  createCompleteTestScenario(): {
    parentItem: SubCalendarItem;
    childItems: BasicItem[];
    parentInstance: ItemInstanceImpl;
    childInstances: ItemInstanceImpl[];
    calendarEntries: BaseCalendarEntry[];
    allItems: (SubCalendarItem | BasicItem)[];
    allInstances: ItemInstanceImpl[];
    baseStartTime: number;
  } {
    const parentItem = createTestSubCalendarWithChildren();
    const childItems = createTestChildItems();
    const { parentInstance, childInstances, allInstances } = createTestItemInstances(this.baseStartTime);
    const calendarEntries = createTestBaseCalendarEntries(this.baseStartTime);

    return {
      parentItem,
      childItems,
      parentInstance,
      childInstances,
      calendarEntries,
      allItems: [parentItem, ...childItems],
      allInstances,
      baseStartTime: this.baseStartTime
    };
  }

  /**
   * Create test scenario at a specific execution time
   */
  createScenarioAtTime(executionTimeMs: number): {
    scenario: ReturnType<AccountingTestDataFactory['createCompleteTestScenario']>;
    currentTime: number;
    expectedActiveChild: number | null; // Index of active child (0-4) or null
    expectedCompletedChildren: number[]; // Indices of completed children
  } {
    const scenario = this.createCompleteTestScenario();
    const currentTime = this.baseStartTime + executionTimeMs;

    // Determine which children should be active/completed at this time
    let expectedActiveChild: number | null = null;
    const expectedCompletedChildren: number[] = [];

    TIMING_CONSTANTS.CHILD_STARTS.forEach((childStart, index) => {
      const childEnd = childStart + TIMING_CONSTANTS.CHILD_DURATION;

      if (executionTimeMs >= childStart && executionTimeMs < childEnd) {
        expectedActiveChild = index;
      } else if (executionTimeMs >= childEnd) {
        expectedCompletedChildren.push(index);
      }
    });

    return {
      scenario,
      currentTime,
      expectedActiveChild,
      expectedCompletedChildren
    };
  }

  /**
   * Create scenario for testing accounting view during first second (should show nothing)
   */
  createFirstSecondScenario() {
    return this.createScenarioAtTime(500); // 0.5 seconds into execution
  }

  /**
   * Create scenario for testing accounting view after first child completes
   */
  createAfterFirstChildScenario() {
    return this.createScenarioAtTime(1500); // 1.5 seconds into execution (after first child)
  }

  /**
   * Create scenario for testing accounting view during second child execution
   */
  createSecondChildActiveScenario() {
    return this.createScenarioAtTime(2500); // 2.5 seconds into execution (during second child)
  }

  /**
   * Create scenario for testing accounting view after all children complete
   */
  createAllChildrenCompleteScenario() {
    return this.createScenarioAtTime(9500); // 9.5 seconds into execution (all children done)
  }

  /**
   * Update base start time for new test scenarios
   */
  setBaseStartTime(newBaseStartTime: number): void {
    this.baseStartTime = newBaseStartTime;
  }
}

/**
 * Pre-configured test scenarios for common testing situations
 */
export const TEST_SCENARIOS = {
  /**
   * Fresh scenario with current timestamp
   */
  createFreshScenario: () => new AccountingTestDataFactory(Date.now()).createCompleteTestScenario(),

  /**
   * Scenario configured for predictable testing (fixed timestamp)
   */
  createPredictableScenario: () => new AccountingTestDataFactory(1640995200000).createCompleteTestScenario(), // Jan 1, 2022

  /**
   * Create multiple scenarios for testing state transitions
   */
  createTimeProgressionScenarios: (baseStartTime: number = Date.now()) => {
    const factory = new AccountingTestDataFactory(baseStartTime);

    return {
      beforeStart: factory.createScenarioAtTime(-1000), // 1 second before start
      duringFirstChild: factory.createScenarioAtTime(500), // During first child
      afterFirstChild: factory.createScenarioAtTime(1500), // After first child
      duringSecondChild: factory.createScenarioAtTime(2500), // During second child
      betweenSecondAndThird: factory.createScenarioAtTime(3500), // Gap between 2nd and 3rd
      duringThirdChild: factory.createScenarioAtTime(4500), // During third child
      nearEnd: factory.createScenarioAtTime(8500), // During fifth child
      afterCompletion: factory.createScenarioAtTime(10500) // After all complete
    };
  }
};

/**
 * Validation helpers for test assertions
 */
export const TEST_ASSERTIONS = {
  /**
   * Verify basic test data structure is correct
   */
  validateBasicStructure: (scenario: ReturnType<AccountingTestDataFactory['createCompleteTestScenario']>) => {
    return {
      hasParentItem: !!scenario.parentItem,
      hasCorrectChildCount: scenario.childItems.length === 5,
      hasCorrectParentDuration: scenario.parentItem.duration === TIMING_CONSTANTS.PARENT_DURATION,
      hasCorrectChildDurations: scenario.childItems.every(child => child.duration === TIMING_CONSTANTS.CHILD_DURATION),
      hasCorrectInstanceCount: scenario.allInstances.length === 6, // 1 parent + 5 children
      hasValidItemIds: Object.values(TEST_ITEM_IDS).every(id =>
        scenario.allItems.some(item => item.id === id)
      )
    };
  },

  /**
   * Verify timing relationships are correct
   */
  validateTiming: (scenario: ReturnType<AccountingTestDataFactory['createCompleteTestScenario']>) => {
    const childStartTimes = scenario.parentItem.children.map(child => child.start);

    return {
      hasCorrectStartTimes: JSON.stringify(childStartTimes) === JSON.stringify(TIMING_CONSTANTS.CHILD_STARTS),
      hasCorrectSequence: childStartTimes.every((start, index) =>
        index === 0 || start > childStartTimes[index - 1]
      ),
      hasProperGaps: childStartTimes.slice(1).every((start, index) =>
        start - childStartTimes[index] >= TIMING_CONSTANTS.CHILD_DURATION
      )
    };
  }
};
