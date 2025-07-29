import { BasicItem, SubCalendarItem, Child } from '../../../functions/utils/item/index';
import { ItemInstanceImpl } from '../../../functions/utils/itemInstance/types';
import { BaseCalendarEntry } from '../../../functions/reducers/AppReducer';
import { v4 as uuid } from 'uuid';

/**
 * Test constants for predictable test data
 */
export const TEST_ITEM_IDS = {
  PARENT_SUBCALENDAR: 'test-subcalendar-parent',
  CHILD_1: 'test-child-1',
  CHILD_2: 'test-child-2',
  CHILD_3: 'test-child-3',
  CHILD_4: 'test-child-4',
  CHILD_5: 'test-child-5'
} as const;

/**
 * Timing constants for test execution pattern
 */
export const TIMING_CONSTANTS = {
  PARENT_DURATION: 10000, // 10 seconds
  CHILD_DURATION: 1000,   // 1 second each
  CHILD_STARTS: [0, 2000, 4000, 6000, 8000] // 0s, 2s, 4s, 6s, 8s
} as const;

/**
 * Creates a SubCalendarItem with 5 BasicItem children following the test pattern:
 * - Parent: 10 seconds duration
 * - Children: 1 second each, starting at 0s, 2s, 4s, 6s, 8s
 * 
 * @returns {SubCalendarItem} The test SubCalendar with scheduled children
 */
export function createTestSubCalendarWithChildren(): SubCalendarItem {
  // Create child items first
  const children: Child[] = TIMING_CONSTANTS.CHILD_STARTS.map((startTime, index) => {
    return new Child({
      id: Object.values(TEST_ITEM_IDS)[index + 1], // Skip PARENT_SUBCALENDAR
      start: startTime
    });
  });

  // Create parent SubCalendar with children
  return new SubCalendarItem({
    id: TEST_ITEM_IDS.PARENT_SUBCALENDAR,
    name: 'Test SubCalendar',
    duration: TIMING_CONSTANTS.PARENT_DURATION,
    children: children
  });
}

/**
 * Creates BasicItem instances for the test children
 * 
 * @returns {BasicItem[]} Array of 5 BasicItems for the test children
 */
export function createTestChildItems(): BasicItem[] {
  return Object.values(TEST_ITEM_IDS)
    .slice(1) // Skip parent ID
    .map((childId, index) => new BasicItem({
      id: childId,
      name: `Test Child ${index + 1}`,
      duration: TIMING_CONSTANTS.CHILD_DURATION
    }));
}

/**
 * Creates a complete set of test items (parent + children)
 * 
 * @returns {Object} Object with parent SubCalendar and child BasicItems
 */
export function createCompleteTestItemSet(): {
  parentItem: SubCalendarItem;
  childItems: BasicItem[];
  allItems: (SubCalendarItem | BasicItem)[];
} {
  const parentItem = createTestSubCalendarWithChildren();
  const childItems = createTestChildItems();
  const allItems = [parentItem, ...childItems];

  return {
    parentItem,
    childItems,
    allItems
  };
}

/**
 * Creates ItemInstances for the test items with specified base start time
 * 
 * @param baseStartTime - The absolute start time for the parent item (default: current time)
 * @returns {Object} Object with parent and child instances
 */
export function createTestItemInstances(baseStartTime: number = Date.now()): {
  parentInstance: ItemInstanceImpl;
  childInstances: ItemInstanceImpl[];
  allInstances: ItemInstanceImpl[];
} {
  const { parentItem, childItems } = createCompleteTestItemSet();

  // Create parent instance
  const parentCalendarEntryId = uuid();
  const parentInstance = new ItemInstanceImpl({
    itemId: parentItem.id,
    calendarEntryId: parentCalendarEntryId,
    scheduledStartTime: baseStartTime
  });

  // Create child instances with proper timing
  const childInstances = childItems.map((childItem, index) => {
    const childCalendarEntryId = uuid();
    const childStartTime = baseStartTime + TIMING_CONSTANTS.CHILD_STARTS[index];

    return new ItemInstanceImpl({
      itemId: childItem.id,
      calendarEntryId: childCalendarEntryId,
      scheduledStartTime: childStartTime
    });
  });

  return {
    parentInstance,
    childInstances,
    allInstances: [parentInstance, ...childInstances]
  };
}

/**
 * Creates BaseCalendarEntries for the test items
 * 
 * @param baseStartTime - The absolute start time for the parent item (default: current time)
 * @returns {BaseCalendarEntry[]} Array of calendar entries for parent and children
 */
export function createTestBaseCalendarEntries(baseStartTime: number = Date.now()): BaseCalendarEntry[] {
  const { parentItem, childItems } = createCompleteTestItemSet();
  const entries: BaseCalendarEntry[] = [];

  // Parent entry
  entries.push({
    id: uuid(),
    itemId: parentItem.id,
    startTime: baseStartTime
  });

  // Child entries
  childItems.forEach((childItem, index) => {
    entries.push({
      id: uuid(),
      itemId: childItem.id,
      startTime: baseStartTime + TIMING_CONSTANTS.CHILD_STARTS[index]
    });
  });

  return entries;
}

/**
 * Utility to mark an instance as complete at a specific time
 * 
 * @param instance - The instance to mark complete
 * @param completionTime - When the instance was completed
 * @returns {ItemInstanceImpl} New instance with completion data
 */
export function markInstanceComplete(
  instance: ItemInstanceImpl,
  completionTime: number
): ItemInstanceImpl {
  return new ItemInstanceImpl({
    id: instance.id,
    itemId: instance.itemId,
    calendarEntryId: instance.calendarEntryId,
    scheduledStartTime: instance.scheduledStartTime,
    actualStartTime: instance.actualStartTime || instance.scheduledStartTime,
    completedAt: completionTime,
    isComplete: true,
    executionDetails: instance.executionDetails
  });
}

/**
 * Creates a Map of itemId -> Item for easy lookup in tests
 * 
 * @returns {Map<string, SubCalendarItem | BasicItem>} Map for item lookup
 */
export function createTestItemLookupMap(): Map<string, SubCalendarItem | BasicItem> {
  const { allItems } = createCompleteTestItemSet();
  const map = new Map<string, SubCalendarItem | BasicItem>();

  allItems.forEach(item => {
    map.set(item.id, item);
  });

  return map;
}

/**
 * Resets all test data - utility for test cleanup
 * (Currently just recreates fresh data, can be extended for cleanup)
 */
export function resetTestData(): void {
  // For now, this is a no-op since we create fresh data each time
  // In the future, this could clear any persistent test state
}

/**
 * Validates that a test item structure matches expected specifications
 * 
 * @param parentItem - The SubCalendar to validate
 * @param childItems - The child BasicItems to validate
 * @throws {Error} If validation fails
 */
export function validateTestItemStructure(
  parentItem: SubCalendarItem,
  childItems: BasicItem[]
): void {
  // Validate parent
  if (parentItem.duration !== TIMING_CONSTANTS.PARENT_DURATION) {
    throw new Error(`Parent duration ${parentItem.duration} does not match expected ${TIMING_CONSTANTS.PARENT_DURATION}`);
  }

  if (parentItem.children.length !== 5) {
    throw new Error(`Expected 5 children, got ${parentItem.children.length}`);
  }

  // Validate children count and duration
  if (childItems.length !== 5) {
    throw new Error(`Expected 5 child items, got ${childItems.length}`);
  }

  childItems.forEach((child, index) => {
    if (child.duration !== TIMING_CONSTANTS.CHILD_DURATION) {
      throw new Error(`Child ${index + 1} duration ${child.duration} does not match expected ${TIMING_CONSTANTS.CHILD_DURATION}`);
    }
  });

  // Validate child start times
  parentItem.children.forEach((child, index) => {
    const expectedStart = TIMING_CONSTANTS.CHILD_STARTS[index];
    if (child.start !== expectedStart) {
      throw new Error(`Child ${index + 1} start time ${child.start} does not match expected ${expectedStart}`);
    }
  });
}
