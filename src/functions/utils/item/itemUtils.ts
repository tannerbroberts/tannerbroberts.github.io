import { Item } from "./Item";
import { SubCalendarItem } from "./SubCalendarItem";
import { CheckListItem } from "./CheckListItem";
import { BasicItem } from "./BasicItem";
import { Child } from "./Child";
import { CheckListChild } from "./CheckListChild";
import { Parent } from "./Parent";

/**
 * Type guard to check if an item has children
 */
export function hasChildren(item: Item): item is SubCalendarItem | CheckListItem {
  return item instanceof SubCalendarItem || item instanceof CheckListItem;
}

/**
 * Safely get children from an item, returning empty array if no children
 */
export function getChildren(item: Item): Child[] | CheckListChild[] | [] {
  if (item instanceof SubCalendarItem) {
    return item.children;
  } else if (item instanceof CheckListItem) {
    return item.children;
  }
  return [];
}

/**
 * Type for child references that can be either Child or CheckListChild
 */
export type ChildReference = Child | CheckListChild;

/**
 * Get child ID from either Child or CheckListChild
 */
export function getChildId(child: ChildReference): string {
  return 'id' in child ? child.id : child.itemId;
}

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

/**
 * Add a parent to an item, returning a new item instance
 */
export function addParentToItem(item: Item, parent: Parent): Item {
  const newParents = [...item.parents, parent];

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
 * Add a child to an item, returning a new item instance
 * For SubCalendarItem: child must be a Child with start time
 * For CheckListItem: child must be a CheckListChild 
 */
export function addChildToItem(item: Item, child: Child | CheckListChild): Item {
  if (item instanceof SubCalendarItem && child instanceof Child) {
    const newChildren = [...item.children, child];
    return new SubCalendarItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: item.parents,
      allOrNothing: item.allOrNothing,
      children: newChildren,
    });
  } else if (item instanceof CheckListItem && child instanceof CheckListChild) {
    const newChildren = [...item.children, child];
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
  
  // BasicItem doesn't have children, or incompatible child type
  throw new Error(`Cannot add child of type ${child.constructor.name} to item of type ${item.constructor.name}`);
}
