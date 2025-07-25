import {
  Item,
  SubCalendarItem,
  CheckListItem,
  Child,
  CheckListChild
} from "../../functions/utils/item/index";
import { getItemById } from "../../functions/utils/item/utils";

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
