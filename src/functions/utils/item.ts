
import { v4 as uuid } from "uuid";
import type { BaseCalendarEntry } from "../reducers/AppReducer";



// --- Types and Interfaces ---

export interface ItemJSON {
  id: string;
  name: string;
  duration: number;
  parents: Array<{ id: string }>;
  allOrNothing: boolean;
  type: string;
  // Add additional properties as needed for serialization, but do not use an index signature
  priority?: number;
  children?: unknown[];
  sortType?: SortType;
}

// ...existing code...

// --- Classes ---

export class Parent {
  id: string;
  relationshipId: string;
  constructor({ id, relationshipId = uuid() }: { id: string; relationshipId?: string }) {
    this.id = id;
    this.relationshipId = relationshipId;
  }
}

export class Child {
  id: string;
  start: number;
  relationshipId: string;
  constructor({ id, start, relationshipId = uuid() }: { id: string; start: number; relationshipId?: string }) {
    this.id = id;
    this.start = start;
    this.relationshipId = relationshipId;
  }
}

class IntervalTree<T> {
  intervals: { start: number; end: number; data: T }[] = [];

  insert(start: number, end: number, data: T) {
    this.intervals.push({ start, end, data });
    // Keep sorted for easier queries
    this.intervals.sort((a, b) => a.start - b.start);
  }

  overlaps(start: number, end: number): boolean {
    return this.intervals.some(
      (iv) => Math.max(iv.start, start) < Math.min(iv.end, end)
    );
  }

  removeByData(data: T) {
    this.intervals = this.intervals.filter((iv) => iv.data !== data);
  }

  findAllOverlapping(start: number, end: number): T[] {
    return this.intervals.filter(
      (iv) => Math.max(iv.start, start) < Math.min(iv.end, end)
    ).map((iv) => iv.data);
  }
}



export class Item {
  id: string;
  name: string;
  duration: number;
  parents: Parent[];
  allOrNothing: boolean;

  constructor({
    id = uuid(),
    name,
    duration,
    parents = [],
    allOrNothing = false,
  }: {
    id?: string;
    name: string;
    duration: number;
    parents?: Parent[];
    allOrNothing?: boolean;
  }) {
    this.id = id;
    this.name = name;
    this.duration = duration;
    this.parents = parents;
    this.allOrNothing = allOrNothing;
  }

  updateDuration(duration: number): this {
    const Ctor = Object.getPrototypeOf(this).constructor as new (args: any) => this;
    return new Ctor({ ...this, duration });
  }

  updateName(name: string): this {
    const Ctor = Object.getPrototypeOf(this).constructor as new (args: any) => this;
    return new Ctor({ ...this, name });
  }

  updateParents(parents: Parent[]): this {
    const newParents = [...this.parents, ...parents];
    const Ctor = Object.getPrototypeOf(this).constructor as new (args: any) => this;
    return new Ctor({ ...this, parents: newParents });
  }

  toJSON(): ItemJSON {
    return {
      id: this.id,
      name: this.name,
      duration: this.duration,
      parents: this.parents,
      allOrNothing: this.allOrNothing,
      type: this.constructor.name,
    };
  }

  static toJSONArray(items: Item[]): ItemJSON[] {
    return items.map((item) => item.toJSON());
  }
}

export class BasicItem extends Item {
  priority: number;

  constructor({
    priority = 0,
    ...rest
  }: {
    id?: string;
    name: string;
    duration: number;
    parents?: Parent[];
    allOrNothing?: boolean;
    priority?: number;
  }) {
    super(rest);
    this.priority = priority;
  }

  toJSON(): ItemJSON {
    return {
      ...super.toJSON(),
      priority: this.priority,
    };
  }

  static fromJSON(json: ItemJSON): BasicItem {
    return new BasicItem({
      id: json.id,
      name: json.name,
      duration: json.duration,
      parents: Array.isArray(json.parents) ? json.parents.map((p) => new Parent(p as { id: string; relationshipId?: string })) : [],
      allOrNothing: json.allOrNothing || false,
      priority: typeof json.priority === 'number' ? json.priority : 0,
    });
  }
}

export class SubCalendarItem extends Item {
  children: Child[];
  private readonly intervalTree: IntervalTree<Child>;

  constructor({
    children = [],
    ...rest
  }: {
    id?: string;
    name: string;
    duration: number;
    parents?: Parent[];
    allOrNothing?: boolean;
    children?: Child[];
  }) {
    super(rest);
    this.children = children;
    this.intervalTree = new IntervalTree<Child>();
    // No-op: do not pre-populate intervalTree, as duration lookup is external
  }

  scheduleChild(child: Child, getDuration: (itemId: string) => number): boolean {
    const duration = getDuration(child.id);
    const start = child.start;
    const end = start + duration;
    if (this.intervalTree.overlaps(start, end)) {
      return false;
    }
    this.children.push(child);
    this.intervalTree.insert(start, end, child);
    return true;
  }

  removeChild(child: Child): void {
    this.children = this.children.filter((c) => c.relationshipId !== child.relationshipId);
    this.intervalTree.removeByData(child);
  }

  toJSON(): ItemJSON {
    return {
      ...super.toJSON(),
      children: this.children,
    };
  }

  static fromJSON(json: ItemJSON): SubCalendarItem {
    return new SubCalendarItem({
      id: json.id,
      name: json.name,
      duration: json.duration,
      parents: Array.isArray(json.parents) ? json.parents.map((p) => new Parent(p as { id: string; relationshipId?: string })) : [],
      allOrNothing: json.allOrNothing || false,
      children: Array.isArray(json.children) ? json.children.map((c) => new Child(c as { id: string; start: number; relationshipId?: string })) : [],
    });
  }
}

export type SortType = "alphabetical" | "manual" | "duration";

export class CheckListChild {
  itemId: string;
  complete: boolean;
  relationshipId: string;

  constructor({ itemId, complete = false, relationshipId = uuid() }: { itemId: string; complete?: boolean; relationshipId?: string }) {
    this.itemId = itemId;
    this.complete = complete;
    this.relationshipId = relationshipId;
  }
}

export class CheckListItem extends Item {
  children: CheckListChild[];
  sortType: SortType;

  constructor({
    children = [],
    sortType = "manual",
    ...rest
  }: {
    id?: string;
    name: string;
    duration: number;
    parents?: Parent[];
    allOrNothing?: boolean;
    children?: CheckListChild[];
    sortType?: SortType;
  }) {
    super(rest);
    this.children = children;
    this.sortType = sortType;
  }

  toJSON(): ItemJSON {
    return {
      ...super.toJSON(),
      children: this.children,
      sortType: this.sortType,
    };
  }

  static fromJSON(json: ItemJSON): CheckListItem {
    return new CheckListItem({
      id: json.id,
      name: json.name,
      duration: json.duration,
      parents: Array.isArray(json.parents) ? json.parents.map((p) => new Parent(p as { id: string; relationshipId?: string })) : [],
      allOrNothing: json.allOrNothing || false,
      children: Array.isArray(json.children) ? json.children.map((c) => new CheckListChild(c as { itemId: string; complete?: boolean; relationshipId?: string })) : [],
      sortType: typeof json.sortType === 'string' ? json.sortType : "manual",
    });
  }
}


// ...existing code...


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

// ...existing code...

// ...existing code...

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
  // Only check base calendar entries - items must be scheduled to be executable
  if (baseCalendar) {
    for (const [, entry] of baseCalendar) {
      const item = getItemById(items, entry.itemId);
      if (item && isItemActiveAtTime(item, currentTime, entry.startTime)) {
        return item;
      }
    }
  }

  // No fallback to unscheduled items - only scheduled items should be executable
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
  if (parentItem instanceof SubCalendarItem) {
    for (const childRef of parentItem.children) {
      const childItem = getItemById(items, childRef.id);
      if (childItem && isItemActiveAtTime(childItem, currentTime, childRef.start ?? 0)) {
        return childItem;
      }
    }
    return null;
  } else if (parentItem instanceof CheckListItem) {
    for (const childRef of parentItem.children) {
      const childItem = getItemById(items, childRef.itemId);
      if (childItem) {
        return childItem;
      }
    }
    return null;
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
