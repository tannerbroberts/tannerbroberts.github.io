import { Item } from "./Item";
import { SubCalendarItem } from "./SubCalendarItem";
import { CheckListItem } from "./CheckListItem";
import type { BaseCalendarEntry } from "../../reducers/AppReducer";

/**
 * Binary search through the sorted items array for an item with the given id
 */
export function getItemById(items: Item[], id: string | null): Item | null {
  if (!id) return null;

  let low = 0;
  let high = items.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midId = items[mid].id;

    if (midId === id) {
      return items[mid];
    } else if (midId < id) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return null;
}

/**
 * Binary search through the sorted items array for the index of an item with the given id
 */
export function getIndexById(items: Item[], id: string | null): number {
  if (!id) return -1;

  let low = 0;
  let high = items.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midId = items[mid].id;

    if (midId === id) {
      return mid;
    } else if (midId < id) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -1;
}

/**
 * Get the current task chain based on the current time
 * Returns an array of items ordered from top-most parent to deepest child
 */
export function getCurrentTaskChain(
  items: Item[],
  currentTime: number = Date.now(),
  baseCalendar?: Map<string, BaseCalendarEntry>
): Item[] {
  const startTime = performance.now();
  const chain: Item[] = [];

  try {
    // Find the top-most item that overlaps with current time
    const topMostItem = findTopMostActiveItem(items, currentTime, baseCalendar);
    if (!topMostItem) return chain;

    // Build chain recursively from top-most parent to deepest child
    buildChainRecursively(items, topMostItem, currentTime, chain, 0);

    const duration = performance.now() - startTime;
    if (duration > 10) { // Log if it takes more than 10ms
      console.warn(`getCurrentTaskChain took ${duration.toFixed(2)}ms to complete`);
    }

    return chain;
  } catch (error) {
    console.error('Error in getCurrentTaskChain:', error);
    return chain;
  }
}

/**
 * Find the top-most item that is active at the current time
 */
function findTopMostActiveItem(items: Item[], currentTime: number, baseCalendar?: Map<string, BaseCalendarEntry>): Item | null {
  // Only check base calendar entries - items must be scheduled to be executable
  if (baseCalendar) {
    for (const [, entry] of baseCalendar) {
      if (!entry?.itemId) {
        console.warn('Invalid base calendar entry found:', entry);
        continue;
      }

      const item = getItemById(items, entry.itemId);
      if (item && isItemActiveAtTime(item, currentTime, entry.startTime)) {
        return item;
      }
    }
  }

  // No fallback to unscheduled items - only scheduled items should be executable
  return null;
}

/**
 * Build the task chain recursively from parent to child
 */
function buildChainRecursively(items: Item[], currentItem: Item, currentTime: number, chain: Item[], depth: number = 0): void {
  // Prevent infinite recursion by limiting depth
  const MAX_DEPTH = 50;
  if (depth > MAX_DEPTH) {
    console.warn(`Maximum recursion depth (${MAX_DEPTH}) reached while building task chain. Stopping to prevent freeze.`);
    return;
  }

  // Prevent infinite recursion by checking if we've already added this item
  if (chain.some(item => item.id === currentItem.id)) {
    console.warn(`Circular reference detected: item ${currentItem.id} (${currentItem.name}) already in chain`);
    return;
  }

  chain.push(currentItem);

  // Find child items that are active at current time
  const activeChild = findActiveChildAtTime(items, currentItem, currentTime);
  if (activeChild) {
    buildChainRecursively(items, activeChild, currentTime, chain, depth + 1);
  }
}

/**
 * Find a child item that is active at the given time
 */
function findActiveChildAtTime(items: Item[], parentItem: Item, currentTime: number): Item | null {
  if (parentItem instanceof SubCalendarItem) {
    return findActiveSubCalendarChild(items, parentItem, currentTime);
  } else if (parentItem instanceof CheckListItem) {
    return findActiveCheckListChild(items, parentItem);
  }
  return null;
}

/**
 * Find active child in SubCalendarItem
 */
function findActiveSubCalendarChild(items: Item[], parentItem: SubCalendarItem, currentTime: number): Item | null {
  for (const childRef of parentItem.children) {
    if (!childRef?.id) {
      console.warn(`Invalid child reference found in SubCalendarItem ${parentItem.id}:`, childRef);
      continue;
    }

    const childItem = getItemById(items, childRef.id);
    if (childItem && isItemActiveAtTime(childItem, currentTime, childRef.start ?? 0)) {
      return childItem;
    }
  }
  return null;
}

/**
 * Find active child in CheckListItem
 */
function findActiveCheckListChild(items: Item[], parentItem: CheckListItem): Item | null {
  for (const childRef of parentItem.children) {
    if (!childRef?.itemId) {
      console.warn(`Invalid child reference found in CheckListItem ${parentItem.id}:`, childRef);
      continue;
    }

    const childItem = getItemById(items, childRef.itemId);
    if (childItem) {
      return childItem;
    }
  }
  return null;
}

/**
 * Check if an item is active at the given time
 * For child items, the startTime is relative to their parent
 */
function isItemActiveAtTime(item: Item, currentTime: number, startTime: number = 0): boolean {
  if (!item.duration) return false;

  const itemStart = startTime;
  const itemEnd = startTime + item.duration;

  // Simple range check - item is active if current time is within its duration
  return currentTime >= itemStart && currentTime < itemEnd;
}

/**
 * Get the deepest (leaf) item in a task chain
 */
export function getDeepestItem(chain: Item[]): Item | null {
  return chain.length > 0 ? chain[chain.length - 1] : null;
}

/**
 * Check if an item is the deepest executable task in its chain
 */
export function isDeepestExecutableTask(items: Item[], item: Item, currentTime: number = Date.now()): boolean {
  const activeChild = findActiveChildAtTime(items, item, currentTime);
  return activeChild === null;
}

/**
 * Get base calendar entries that are active at the given time
 */
export function getActiveBaseCalendarEntries(
  baseCalendar: Map<string, BaseCalendarEntry>,
  items: Item[],
  currentTime: number = Date.now()
): BaseCalendarEntry[] {
  const activeEntries: BaseCalendarEntry[] = [];

  for (const [, entry] of baseCalendar) {
    const item = getItemById(items, entry.itemId);
    if (item && isItemActiveAtTime(item, currentTime, entry.startTime)) {
      activeEntries.push(entry);
    }
  }

  return activeEntries;
}

/**
 * Get all base calendar entries sorted by start time
 */
export function getSortedBaseCalendarEntries(
  baseCalendar: Map<string, BaseCalendarEntry>
): BaseCalendarEntry[] {
  return Array.from(baseCalendar.values()).sort((a, b) => a.startTime - b.startTime);
}

/**
 * Calculate the progress percentage of a task item
 * @param item The task item
 * @param currentTime Current time in milliseconds
 * @param startTime Start time of the task (default: 0)
 * @returns Progress percentage (0-100)
 */
export function getTaskProgress(item: Item, currentTime: number, startTime: number = 0): number {
  if (!item.duration || item.duration <= 0) return 0;

  const itemStart = startTime;
  const itemEnd = startTime + item.duration;

  // If we're before the start time, no progress
  if (currentTime <= itemStart) return 0;

  // If we're after the end time, 100% complete
  if (currentTime >= itemEnd) return 100;

  // Calculate progress percentage
  const elapsed = currentTime - itemStart;
  const progress = (elapsed / item.duration) * 100;

  return Math.max(0, Math.min(100, progress));
}

/**
 * Get the effective start time of a task in a chain
 * @param taskChain Array of tasks in the execution chain
 * @param targetItem The item to get the start time for
 * @param baseCalendar Base calendar entries
 * @returns Start time in milliseconds
 */
export function getTaskStartTime(
  taskChain: Item[],
  targetItem: Item,
  baseCalendar?: Map<string, BaseCalendarEntry>
): number {
  // If this is the root task, check base calendar
  if (taskChain.length > 0 && taskChain[0].id === targetItem.id) {
    return getBaseStartTime(taskChain[0], baseCalendar);
  }

  // For child tasks, calculate cumulative start time
  const baseStart = getBaseStartTime(taskChain[0], baseCalendar);
  return baseStart + calculateChildOffset(taskChain, targetItem);
}

/**
 * Get the base start time from calendar for a root item
 */
function getBaseStartTime(rootItem: Item, baseCalendar?: Map<string, BaseCalendarEntry>): number {
  if (!baseCalendar) return 0;

  for (const [, entry] of baseCalendar) {
    if (entry.itemId === rootItem.id) {
      return entry.startTime;
    }
  }
  return 0;
}

/**
 * Calculate the offset for a child task in the chain
 */
function calculateChildOffset(taskChain: Item[], targetItem: Item): number {
  let offset = 0;

  for (let i = 0; i < taskChain.length; i++) {
    const currentItem = taskChain[i];
    if (currentItem.id === targetItem.id) {
      break;
    }

    // Only SubCalendarItem has children with start times
    if (i + 1 < taskChain.length && currentItem instanceof SubCalendarItem) {
      const nextItem = taskChain[i + 1];
      const childRef = currentItem.children.find(child => child.id === nextItem.id);
      if (childRef) {
        offset += childRef.start;
      }
    }
  }

  return offset;
}
