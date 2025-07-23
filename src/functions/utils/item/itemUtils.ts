import { Item } from "./Item";
import { SubCalendarItem } from "./SubCalendarItem";
import { CheckListItem } from "./CheckListItem";
import { BasicItem } from "./BasicItem";

/**
 * Remove a child from an item by ID, returning a new item instance
 */
export function removeChildById(item: Item, childId: string): Item {
  if (item instanceof SubCalendarItem) {
    const newChildren = item.children.filter((child) => child.id !== childId);
    return new SubCalendarItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: item.parents,
      allOrNothing: item.allOrNothing,
      children: newChildren,
    });
  } else if (item instanceof CheckListItem) {
    const newChildren = item.children.filter((child) => child.itemId !== childId);
    return new CheckListItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: item.parents,
      allOrNothing: item.allOrNothing,
      children: newChildren,
      sortType: item.sortType,
    });
  }
  // BasicItem doesn't have children
  return item;
}

/**
 * Remove a child from an item by relationship ID, returning a new item instance
 */
export function removeChildByRelationshipId(item: Item, relationshipId: string): Item {
  if (item instanceof SubCalendarItem) {
    const newChildren = item.children.filter((child) => child.relationshipId !== relationshipId);
    return new SubCalendarItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: item.parents,
      allOrNothing: item.allOrNothing,
      children: newChildren,
    });
  } else if (item instanceof CheckListItem) {
    const newChildren = item.children.filter((child) => child.relationshipId !== relationshipId);
    return new CheckListItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: item.parents,
      allOrNothing: item.allOrNothing,
      children: newChildren,
      sortType: item.sortType,
    });
  }
  // BasicItem doesn't have children
  return item;
}

/**
 * Remove a parent from an item by ID, returning a new item instance
 */
export function removeParentById(item: Item, parentId: string): Item {
  const newParents = item.parents.filter((parent) => parent.id !== parentId);

  if (item instanceof BasicItem) {
    return new BasicItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: newParents,
      allOrNothing: item.allOrNothing,
      priority: item.priority,
    });
  } else if (item instanceof SubCalendarItem) {
    return new SubCalendarItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: newParents,
      allOrNothing: item.allOrNothing,
      children: item.children,
    });
  } else if (item instanceof CheckListItem) {
    return new CheckListItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: newParents,
      allOrNothing: item.allOrNothing,
      children: item.children,
      sortType: item.sortType,
    });
  }

  throw new Error(`Unknown item type: ${item.constructor.name}`);
}

/**
 * Remove a parent from an item by relationship ID, returning a new item instance
 */
export function removeParentByRelationshipId(item: Item, relationshipId: string): Item {
  const newParents = item.parents.filter((parent) => parent.relationshipId !== relationshipId);

  if (item instanceof BasicItem) {
    return new BasicItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: newParents,
      allOrNothing: item.allOrNothing,
      priority: item.priority,
    });
  } else if (item instanceof SubCalendarItem) {
    return new SubCalendarItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: newParents,
      allOrNothing: item.allOrNothing,
      children: item.children,
    });
  } else if (item instanceof CheckListItem) {
    return new CheckListItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: newParents,
      allOrNothing: item.allOrNothing,
      children: item.children,
      sortType: item.sortType,
    });
  }

  throw new Error(`Unknown item type: ${item.constructor.name}`);
}

/**
 * Check if an item has children with the given ID
 */
export function hasChildWithId(item: Item, childId: string): boolean {
  if (item instanceof SubCalendarItem) {
    return item.children.some((child) => child.id === childId);
  } else if (item instanceof CheckListItem) {
    return item.children.some((child) => child.itemId === childId);
  }
  return false;
}

/**
 * Check if an item has children with the given relationship ID
 */
export function hasChildWithRelationshipId(item: Item, relationshipId: string): boolean {
  if (item instanceof SubCalendarItem) {
    return item.children.some((child) => child.relationshipId === relationshipId);
  } else if (item instanceof CheckListItem) {
    return item.children.some((child) => child.relationshipId === relationshipId);
  }
  return false;
}

/**
 * Check if an item has parents with the given ID
 */
export function hasParentWithId(item: Item, parentId: string): boolean {
  return item.parents.some((parent) => parent.id === parentId);
}

/**
 * Check if an item has parents with the given relationship ID
 */
export function hasParentWithRelationshipId(item: Item, relationshipId: string): boolean {
  return item.parents.some((parent) => parent.relationshipId === relationshipId);
}
