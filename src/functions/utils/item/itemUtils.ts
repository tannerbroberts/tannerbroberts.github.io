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
  // BasicItem doesn't have children
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
      variables: item.variables,
      variableSummary: item.variableSummary,
      children: newChildren,
    });
  } else if (item instanceof CheckListItem) {
    const newChildren = item.children.filter((child) => child.itemId !== childId);
    return new CheckListItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: item.parents,
      variables: item.variables,
      variableSummary: item.variableSummary,
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
      
      variables: item.variables,
      variableSummary: item.variableSummary,
      children: newChildren,
    });
  } else if (item instanceof CheckListItem) {
    const newChildren = item.children.filter((child) => child.relationshipId !== relationshipId);
    return new CheckListItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: item.parents,
      
      variables: item.variables,
      variableSummary: item.variableSummary,
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
      variables: item.variables,
      variableSummary: item.variableSummary,
      priority: item.priority,
    });
  } else if (item instanceof SubCalendarItem) {
    return new SubCalendarItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: newParents,
      variables: item.variables,
      variableSummary: item.variableSummary,
      children: item.children,
    });
  } else if (item instanceof CheckListItem) {
    return new CheckListItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: newParents,
      variables: item.variables,
      variableSummary: item.variableSummary,
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
      
      variables: item.variables,
      variableSummary: item.variableSummary,
      priority: item.priority,
    });
  } else if (item instanceof SubCalendarItem) {
    return new SubCalendarItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: newParents,
      
      variables: item.variables,
      variableSummary: item.variableSummary,
      children: item.children,
    });
  } else if (item instanceof CheckListItem) {
    return new CheckListItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: newParents,
      
      variables: item.variables,
      variableSummary: item.variableSummary,
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
      
      variables: item.variables,
      variableSummary: item.variableSummary,
      priority: item.priority,
    });
  } else if (item instanceof SubCalendarItem) {
    return new SubCalendarItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: newParents,
      
      variables: item.variables,
      variableSummary: item.variableSummary,
      children: item.children,
    });
  } else if (item instanceof CheckListItem) {
    return new CheckListItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: newParents,
      
      variables: item.variables,
      variableSummary: item.variableSummary,
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
      variables: item.variables,
      variableSummary: item.variableSummary,
      children: newChildren,
    });
  } else if (item instanceof CheckListItem && child instanceof CheckListChild) {
    const newChildren = [...item.children, child];
    return new CheckListItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: item.parents,
      variables: item.variables,
      variableSummary: item.variableSummary,
      children: newChildren,
      sortType: item.sortType,
    });
  }

  // BasicItem doesn't have children, or incompatible child type
  throw new Error(`Cannot add child of type ${child.constructor.name} to item of type ${item.constructor.name}`);
}

/**
 * Add or update a variable on an item, returning a new item instance
 */
export function setVariableOnItem(item: Item, variableName: string, quantity: number): Item {
  const newVariables = { ...item.variables, [variableName]: quantity };

  if (item instanceof BasicItem) {
    return new BasicItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: item.parents,
      variables: newVariables,
      variableSummary: item.variableSummary,
      priority: item.priority,
    });
  } else if (item instanceof SubCalendarItem) {
    return new SubCalendarItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: item.parents,
      variables: newVariables,
      variableSummary: item.variableSummary,
      children: item.children,
    });
  } else if (item instanceof CheckListItem) {
    return new CheckListItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: item.parents,
      variables: newVariables,
      variableSummary: item.variableSummary,
      children: item.children,
      sortType: item.sortType,
    });
  }

  throw new Error(`Unknown item type: ${item.constructor.name}`);
}

/**
 * Remove a variable from an item, returning a new item instance
 */
export function removeVariableFromItem(item: Item, variableName: string): Item {
  const newVariables = { ...item.variables };
  delete newVariables[variableName];

  if (item instanceof BasicItem) {
    return new BasicItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: item.parents,
      
      variables: newVariables,
      variableSummary: item.variableSummary,
      priority: item.priority,
    });
  } else if (item instanceof SubCalendarItem) {
    return new SubCalendarItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: item.parents,
      
      variables: newVariables,
      variableSummary: item.variableSummary,
      children: item.children,
    });
  } else if (item instanceof CheckListItem) {
    return new CheckListItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: item.parents,
      
      variables: newVariables,
      variableSummary: item.variableSummary,
      children: item.children,
      sortType: item.sortType,
    });
  }

  throw new Error(`Unknown item type: ${item.constructor.name}`);
}

/**
 * Calculate variable summary for an item by aggregating all children's variables (excluding item's own variables)
 */
export function calculateVariableSummary(item: Item, allItems: Item[]): Record<string, number> {
  const summary: Record<string, number> = {};

  if (!hasChildren(item)) {
    return summary; // BasicItem has no children
  }

  const children = getChildren(item);

  for (const childRef of children) {
    const childId = getChildId(childRef);
    const childItem = allItems.find(i => i.id === childId);

    if (childItem) {
      // Add child's own variables to summary
      for (const [varName, quantity] of Object.entries(childItem.variables)) {
        summary[varName] = (summary[varName] || 0) + quantity;
      }

      // Add child's variable summary to our summary (recursive aggregation)
      for (const [varName, quantity] of Object.entries(childItem.variableSummary)) {
        summary[varName] = (summary[varName] || 0) + quantity;
      }
    }
  }

  return summary;
}

/**
 * Update an item's variable summary, returning a new item instance
 */
export function updateVariableSummary(item: Item, newSummary: Record<string, number>): Item {
  if (item instanceof BasicItem) {
    return new BasicItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: item.parents,
      variables: item.variables,
      variableSummary: newSummary,
      priority: item.priority,
    });
  } else if (item instanceof SubCalendarItem) {
    return new SubCalendarItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: item.parents,
      variables: item.variables,
      variableSummary: newSummary,
      children: item.children,
    });
  } else if (item instanceof CheckListItem) {
    return new CheckListItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: item.parents,
      variables: item.variables,
      variableSummary: newSummary,
      children: item.children,
      sortType: item.sortType,
    });
  }

  throw new Error(`Unknown item type: ${item.constructor.name}`);
}

/**
 * Propagate variable summary updates up the parent hierarchy
 * Returns a map of itemId -> updated item for all items that need to be updated
 */
export function propagateVariableUpdates(
  startingItemId: string,
  allItems: Item[]
): Map<string, Item> {
  const updatedItems = new Map<string, Item>();
  const processedItems = new Set<string>();
  const itemsToProcess = [startingItemId];

  // Create a lookup map for efficiency
  const itemMap = new Map(allItems.map(item => [item.id, item]));

  while (itemsToProcess.length > 0) {
    const currentItemId = itemsToProcess.shift()!;

    if (processedItems.has(currentItemId)) {
      continue;
    }

    processedItems.add(currentItemId);
    const currentItem = itemMap.get(currentItemId);

    if (!currentItem) {
      continue;
    }

    // Calculate new variable summary for this item
    const currentItems = Array.from(itemMap.values()).map(item =>
      updatedItems.get(item.id) || item
    );
    const newSummary = calculateVariableSummary(currentItem, currentItems);

    // Update the item with new summary
    const updatedItem = updateVariableSummary(currentItem, newSummary);
    updatedItems.set(currentItemId, updatedItem);
    itemMap.set(currentItemId, updatedItem); // Update the lookup map too

    // Add all parents to the processing queue
    for (const parent of currentItem.parents) {
      if (!processedItems.has(parent.id)) {
        itemsToProcess.push(parent.id);
      }
    }
  }

  return updatedItems;
}

/**
 * Set multiple variables on an item at once, returning a new item instance
 */
export function setVariablesOnItem(item: Item, variables: Record<string, number>): Item {
  const newVariables = { ...item.variables, ...variables };

  if (item instanceof BasicItem) {
    return new BasicItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: item.parents,
      
      variables: newVariables,
      variableSummary: item.variableSummary,
      priority: item.priority,
    });
  } else if (item instanceof SubCalendarItem) {
    return new SubCalendarItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: item.parents,
      
      variables: newVariables,
      variableSummary: item.variableSummary,
      children: item.children,
    });
  } else if (item instanceof CheckListItem) {
    return new CheckListItem({
      id: item.id,
      name: item.name,
      duration: item.duration,
      parents: item.parents,
      
      variables: newVariables,
      variableSummary: item.variableSummary,
      children: item.children,
      sortType: item.sortType,
    });
  }

  throw new Error(`Unknown item type: ${item.constructor.name}`);
}

/**
 * Get the total quantity of a specific variable across an item's own variables and variable summary
 */
export function getTotalVariableQuantity(item: Item, variableName: string): number {
  const ownQuantity = item.variables[variableName] || 0;
  const summaryQuantity = item.variableSummary[variableName] || 0;
  return ownQuantity + summaryQuantity;
}

/**
 * Get all unique variable names from an item (both own variables and summary)
 */
export function getAllVariableNames(item: Item): string[] {
  const ownVariableNames = Object.keys(item.variables);
  const summaryVariableNames = Object.keys(item.variableSummary);
  return Array.from(new Set([...ownVariableNames, ...summaryVariableNames]));
}

/**
 * Check if an item has a specific variable (either in own variables or summary)
 */
export function hasVariable(item: Item, variableName: string): boolean {
  return variableName in item.variables || variableName in item.variableSummary;
}
