import {
  Item,
  SubCalendarItem,
  CheckListItem,
  Child,
  CheckListChild,
  ItemInstance,
  ItemInstanceImpl,
  getCurrentTaskChain
} from "../../functions/utils/item/index";
import { getItemById } from "../../functions/utils/item/utils";
import type { BaseCalendarEntry } from "../../functions/reducers/AppReducer";

/**
 * Enhanced execution context that includes instance information
 */
export interface ExecutionContextWithInstances {
  currentItem: Item | null;
  currentInstance: ItemInstance | null;
  taskChain: Array<{ item: Item; instance: ItemInstance | null }>;
  baseStartTime: number;
  actualStartTime?: number;
}

/**
 * Get execution context including instance information
 */
export function getExecutionContext(
  items: Item[],
  instances: Map<string, ItemInstance>,
  baseCalendar: Map<string, BaseCalendarEntry>,
  currentTime: number = Date.now()
): ExecutionContextWithInstances {
  // Get the current task chain using existing logic
  const taskChain = getCurrentTaskChain(items, currentTime, baseCalendar);

  if (taskChain.length === 0) {
    return {
      currentItem: null,
      currentInstance: null,
      taskChain: [],
      baseStartTime: currentTime
    };
  }

  // Find base calendar entry for root item
  const rootItem = taskChain[0];
  let baseCalendarEntry: BaseCalendarEntry | null = null;

  for (const [, entry] of baseCalendar) {
    if (entry.itemId === rootItem.id) {
      baseCalendarEntry = entry;
      break;
    }
  }

  if (!baseCalendarEntry) {
    console.warn('No base calendar entry found for root item:', rootItem.id);
    return {
      currentItem: taskChain[taskChain.length - 1],
      currentInstance: null,
      taskChain: taskChain.map((item: Item) => ({ item, instance: null })),
      baseStartTime: currentTime
    };
  }

  // Get or create instance for base calendar entry
  const rootInstance = instances.get(baseCalendarEntry.instanceId || '');

  if (!rootInstance && baseCalendarEntry.instanceId) {
    console.warn('Instance not found for calendar entry:', baseCalendarEntry.instanceId);
  }

  // Build task chain with instances
  const taskChainWithInstances = taskChain.map((item: Item) => {
    if (item.id === rootItem.id) {
      return { item, instance: rootInstance || null };
    } else {
      // For child items, instances are created when they start executing
      // Look for existing instance or create placeholder
      const childInstances = Array.from(instances.values()).filter(
        inst => inst.itemId === item.id && inst.calendarEntryId === baseCalendarEntry.id
      );

      return {
        item,
        instance: childInstances.length > 0 ? childInstances[0] : null
      };
    }
  });

  const currentItem = taskChain[taskChain.length - 1];
  const currentInstance = taskChainWithInstances[taskChainWithInstances.length - 1]?.instance || null;

  return {
    currentItem,
    currentInstance,
    taskChain: taskChainWithInstances,
    baseStartTime: baseCalendarEntry.startTime,
    actualStartTime: rootInstance?.actualStartTime
  };
}

/**
 * Start tracking execution for a checklist item
 */
export function startChecklistItemExecution(
  item: CheckListItem,
  parentInstance: ItemInstance,
  startTime: number = Date.now()
): ItemInstance {
  // Update parent instance with checklist start time
  const updatedExecutionDetails = {
    ...parentInstance.executionDetails,
    checklistStartTimes: {
      ...parentInstance.executionDetails.checklistStartTimes,
      [item.id]: startTime
    }
  };

  return new ItemInstanceImpl({
    ...parentInstance,
    executionDetails: updatedExecutionDetails
  });
}

/**
 * Check if a checklist item has started based on parent instance
 */
export function hasChecklistItemStarted(
  item: CheckListItem,
  parentInstance: ItemInstance | null
): boolean {
  if (!parentInstance) return false;

  return Boolean(parentInstance.executionDetails.checklistStartTimes?.[item.id]);
}

/**
 * Get start time for a checklist item from parent instance
 */
export function getChecklistItemStartTime(
  item: CheckListItem,
  parentInstance: ItemInstance | null,
  fallbackTime: number
): number {
  if (!parentInstance) return fallbackTime;

  return parentInstance.executionDetails.checklistStartTimes?.[item.id] || fallbackTime;
}

/**
 * Calculate start time for a child item based on parent context
 */
export function calculateChildStartTime(
  parentStartTime: number,
  childReference: Child | CheckListChild
): number {
  // For CheckListItem children, they use the same start time as parent
  if ('complete' in childReference) {
    // This is a CheckListChild
    return parentStartTime;
  }

  // For SubCalendarItem children, add the child's start offset to parent start time
  return parentStartTime + childReference.start;
}

/**
 * Get the active child item for current time in execution context
 */
export function getActiveChildForExecution(
  parentItem: SubCalendarItem | CheckListItem,
  items: Item[],
  currentTime: number,
  parentStartTime: number
): Item | null {
  if (parentItem instanceof SubCalendarItem) {
    return getActiveSubCalendarChild(parentItem, items, currentTime, parentStartTime);
  } else if (parentItem instanceof CheckListItem) {
    return getActiveCheckListChild(parentItem, items);
  }

  return null;
}

/**
 * Get active child for SubCalendarItem based on current time
 */
function getActiveSubCalendarChild(
  parentItem: SubCalendarItem,
  items: Item[],
  currentTime: number,
  parentStartTime: number
): Item | null {
  if (parentItem.children.length === 0) return null;

  const elapsedTime = currentTime - parentStartTime;
  const sortedChildren = [...parentItem.children].sort((a, b) => a.start - b.start);

  // If we haven't started yet, return null
  if (elapsedTime < 0) return null;

  // Find the child that should be active at the current time
  let activeChild: Child | null = null;

  for (const child of sortedChildren) {
    if (elapsedTime >= child.start) {
      const childItem = getItemById(items, child.id);
      if (childItem) {
        // Check if we're within this child's duration
        if (elapsedTime < child.start + childItem.duration) {
          activeChild = child;
          break;
        } else {
          // This child has finished, but keep looking for the next one
          // If no other child is found, we'll return this one as the "last active"
          activeChild = child;
        }
      }
    } else {
      // We haven't reached this child yet, so the previous one should be active
      break;
    }
  }

  return activeChild ? getItemById(items, activeChild.id) : null;
}

/**
 * Get active child for CheckListItem (next incomplete or currently executing)
 */
function getActiveCheckListChild(
  parentItem: CheckListItem,
  items: Item[]
): Item | null {
  if (parentItem.children.length === 0) return null;

  // Find the first incomplete child
  for (const child of parentItem.children) {
    if (!child.complete) {
      const childItem = getItemById(items, child.itemId);
      if (childItem) return childItem;
    }
  }

  // If all children are complete, return the last one
  const lastChild = parentItem.children[parentItem.children.length - 1];
  return getItemById(items, lastChild.itemId);
}

/**
 * Determine if item should show as actively executing
 * In the context of the display router, an item is executing if it's the deepest item
 */
export function isItemCurrentlyExecuting(
  item: Item,
  taskChain: Item[]
): boolean {
  // Find the item in the task chain
  const itemIndex = taskChain.findIndex(chainItem => chainItem.id === item.id);
  if (itemIndex === -1) return false;

  // If it's the deepest item in chain, it's actively executing
  return itemIndex === taskChain.length - 1;
}

/**
 * Validate that recursion depth doesn't exceed maximum to prevent infinite loops
 */
export function isRecursionDepthValid(depth: number, maxDepth: number = 10): boolean {
  return depth < maxDepth;
}

/**
 * Get the display depth for an item based on its position in task chain
 */
export function getDisplayDepth(item: Item, taskChain: Item[]): number {
  const index = taskChain.findIndex(chainItem => chainItem.id === item.id);
  return index >= 0 ? index : 0;
}
