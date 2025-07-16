import { v4 as uuid } from "uuid";
import type { BaseCalendarEntry } from "../reducers/AppReducer";

export interface ItemJSON {
  id: string;
  name: string;
  duration: number;
  children: Child[];
  parents: Parent[];
  showChildren: boolean;
}

export class Item {
  id: string;
  name: string;
  duration: number;
  children: Child[];
  parents: Parent[];
  showChildren: boolean;

  constructor({
    name,
    id = uuid(),
    duration,
    children = [],
    parents = [],
    showChildren = false,
  }: {
    name: string;
    id?: string;
    duration: number;
    children?: Child[];
    parents?: Parent[];
    showChildren?: boolean;
  }) {
    this.name = name;
    this.id = id;
    this.duration = duration;
    this.children = children;
    this.parents = parents;
    this.showChildren = showChildren;
  }

  updateChildren(children: Child[]): Item {
    const newChildren = [...this.children, ...children];
    return new Item({ ...this, children: newChildren });
  }

  updateDuration(duration: number): Item {
    return new Item({
      ...this,
      duration,
    });
  }

  updateName(name: string): Item {
    return new Item({
      ...this,
      name,
    });
  }

  updateParents(parents: Parent[]): Item {
    const newParents = [...this.parents, ...parents];
    return new Item({ ...this, parents: newParents });
  }

  updateShowChildren(showChildren?: boolean): Item {
    return new Item({
      ...this,
      showChildren: showChildren ?? !this.showChildren,
    });
  }

  toJSON(): ItemJSON {
    return {
      id: this.id,
      name: this.name,
      duration: this.duration,
      children: this.children,
      parents: this.parents,
      showChildren: this.showChildren,
    };
  }

  static toJSONArray(items: Item[]): ItemJSON[] {
    return items.map((item) => item.toJSON());
  }

  static fromJSON(json: ItemJSON): Item {
    return new Item({
      id: json.id,
      name: json.name,
      duration: json.duration,
      children: json.children || [],
      parents: json.parents || [],
      showChildren: json.showChildren || false,
    });
  }

  static fromJSONArray(jsonArray: ItemJSON[]): Item[] {
    return jsonArray.map((json) => Item.fromJSON(json));
  }
}

export class Child {
  id: string;
  relationshipId: string;
  start: number;

  constructor(
    { id, relationshipId, start }: {
      id: string;
      relationshipId: string;
      start: number;
    },
  ) {
    this.id = id;
    this.relationshipId = relationshipId;
    this.start = start;
  }
}

export class Parent {
  id: string;
  relationshipId: string;

  constructor({ id, relationshipId }: { id: string; relationshipId: string }) {
    this.id = id;
    this.relationshipId = relationshipId;
  }
}

/**
 * Create two new items based on the parent and child items.
 *
 * The new child will be an Item that has a Parent reference to the parent item,
 *
 * The new parent will be an Item that has a Child reference to the child item.
 */
export function scheduleItem({
  childItem,
  parentItem,
  start,
}: {
  childItem: Item;
  parentItem: Item;
  start: number;
}): { newChildItem: Item; newParentItem: Item } {
  const relationshipId = uuid();
  const childReference = new Child({
    id: childItem.id,
    relationshipId,
    start,
  });
  const parentReference = new Parent({
    id: parentItem.id,
    relationshipId,
  });

  const newChildItem = childItem.updateParents([parentReference]);
  const newParentItem = parentItem.updateChildren([childReference]);

  return { newChildItem, newParentItem };
}

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
  const chain: Item[] = [];

  // Find the top-most item that overlaps with current time
  const topMostItem = findTopMostActiveItem(items, currentTime, baseCalendar);
  if (!topMostItem) return chain;

  // Build chain recursively from top-most parent to deepest child
  buildChainRecursively(items, topMostItem, currentTime, chain);

  return chain;
}

/**
 * Find the top-most item that is active at the current time
 */
function findTopMostActiveItem(items: Item[], currentTime: number, baseCalendar?: Map<string, BaseCalendarEntry>): Item | null {
  // First check base calendar entries
  if (baseCalendar) {
    for (const [, entry] of baseCalendar) {
      const item = getItemById(items, entry.itemId);
      if (item && isItemActiveAtTime(item, currentTime, entry.startTime)) {
        return item;
      }
    }
  }

  // Then check items with no parents (top-level items)
  for (const item of items) {
    if (item.parents.length === 0 && isItemActiveAtTime(item, currentTime)) {
      return item;
    }
  }
  return null;
}/**
 * Build the task chain recursively from parent to child
 */
function buildChainRecursively(items: Item[], currentItem: Item, currentTime: number, chain: Item[]): void {
  chain.push(currentItem);

  // Find child items that are active at current time
  const activeChild = findActiveChildAtTime(items, currentItem, currentTime);
  if (activeChild) {
    buildChainRecursively(items, activeChild, currentTime, chain);
  }
}

/**
 * Find a child item that is active at the given time
 */
function findActiveChildAtTime(items: Item[], parentItem: Item, currentTime: number): Item | null {
  for (const childRef of parentItem.children) {
    const childItem = getItemById(items, childRef.id);
    if (childItem && isItemActiveAtTime(childItem, currentTime, childRef.start)) {
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

  // For repeating items, check if current time falls within any cycle
  if (item.duration > 0) {
    // If we're before the start time, not active
    if (currentTime < itemStart) return false;

    // Calculate position within the cycle
    const cycleTime = currentTime - itemStart;
    const cyclePosition = cycleTime % item.duration;

    // Item is active if we're within the duration of the current cycle
    return cyclePosition >= 0 && cyclePosition < item.duration;
  }

  // For non-repeating items, simple range check
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

    // Find the child reference to get the start offset
    if (i + 1 < taskChain.length) {
      const nextItem = taskChain[i + 1];
      const childRef = currentItem.children.find(child => child.id === nextItem.id);
      if (childRef) {
        offset += childRef.start;
      }
    }
  }

  return offset;
}
