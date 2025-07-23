# Item System Documentation

## Overview

The Item system is a hierarchical task management system that supports three types of items:

1. **BasicItem** - Simple tasks with no children
2. **SubCalendarItem** - Tasks that can contain scheduled child tasks with specific start times
3. **CheckListItem** - Tasks that contain child tasks as checklist items

## Core Classes

### Item (Abstract Base Class)

The base class for all items with common properties:

```typescript
abstract class Item {
  readonly id: string;           // Unique identifier
  readonly name: string;         // Display name
  readonly duration: number;     // Duration in milliseconds
  readonly parents: Parent[];    // Array of parent relationships
  readonly allOrNothing: boolean; // Completion behavior flag
}
```

### BasicItem

Simple task item with priority:

```typescript
class BasicItem extends Item {
  readonly priority: number; // Priority level (default: 0)
}
```

### SubCalendarItem

Container for scheduled child tasks:

```typescript
class SubCalendarItem extends Item {
  children: Child[];                           // Array of scheduled children
  private intervalTree: IntervalTree<Child>;   // For conflict detection
  
  scheduleChild(child: Child, getDuration: (itemId: string) => number): boolean;
  removeChild(child: Child): void;
}
```

### CheckListItem

Container for checklist items:

```typescript
class CheckListItem extends Item {
  children: CheckListChild[];    // Array of checklist children
  readonly sortType: SortType;   // How children are sorted
}
```

## Relationship Classes

### Parent

Represents a parent-child relationship:

```typescript
class Parent {
  id: string;              // ID of the parent item
  relationshipId: string;  // Unique relationship identifier
}
```

### Child

Represents a scheduled child in a SubCalendarItem:

```typescript
class Child {
  id: string;              // ID of the child item
  start: number;           // Start time relative to parent (milliseconds)
  relationshipId: string;  // Unique relationship identifier
}
```

### CheckListChild

Represents a checklist item in a CheckListItem:

```typescript
class CheckListChild {
  itemId: string;          // ID of the child item
  complete: boolean;       // Completion status
  relationshipId: string;  // Unique relationship identifier
}
```

## Key Methods and Functions

### SubCalendarItem.scheduleChild()

Schedules a child task with conflict detection:

```typescript
scheduleChild(child: Child, getDuration: (itemId: string) => number): boolean
```

- Uses an interval tree to detect time conflicts
- Returns `true` if scheduling succeeds, `false` if there's a conflict
- Automatically adds the child to the parent's children array

### Utility Functions (itemUtils.ts)

Since Items are immutable, use these utility functions to create modified copies:

```typescript
// Create new item instance with modified parents
function removeParentById(item: Item, parentId: string): Item
function removeParentByRelationshipId(item: Item, relationshipId: string): Item
function addParentToItem(item: Item, parent: Parent): Item

// Create new item instance with modified children  
function removeChildById(item: Item, childId: string): Item
function removeChildByRelationshipId(item: Item, relationshipId: string): Item

// Type guards and accessors
function hasChildren(item: Item): item is SubCalendarItem | CheckListItem
function getChildren(item: Item): Child[] | CheckListChild[] | []
function getChildId(child: ChildReference): string
```

## Creating Items with Parents

To create an item with specific parents, you can either use the constructor or the utility function:

```typescript
// Using constructor (verbose but explicit)
const childItem = new BasicItem({
  id: existingItem.id,
  name: existingItem.name, 
  duration: existingItem.duration,
  parents: [...existingItem.parents, newParent], // Add new parent
  allOrNothing: existingItem.allOrNothing,
  priority: existingItem.priority
});

// Using utility function (simpler and type-safe)
const childItem = addParentToItem(existingItem, newParent);
```

## Best Practices

1. **Immutability**: Items are immutable - always create new instances rather than modifying existing ones
2. **Relationship IDs**: Use the unique `relationshipId` to track specific parent-child relationships
3. **Conflict Detection**: SubCalendarItem automatically handles scheduling conflicts via interval trees
4. **Type Safety**: Use type guards like `hasChildren()` before accessing child-specific properties
