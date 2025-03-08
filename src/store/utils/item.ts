import { v4 as uuid } from "uuid";

export class Item {
  id: string;
  name: string;
  duration: number;
  children: Child[];
  parents: Parent[];
  showChildren: boolean;

  constructor({
    id = uuid(),
    name,
    duration,
    children = [],
    parents = [],
    showChildren = false,
  }: {
    id?: string;
    name: string;
    duration: number;
    children?: Child[];
    parents?: Parent[];
    showChildren?: boolean;
  }) {
    this.id = id;
    this.name = name;
    this.duration = duration;
    this.children = children;
    this.parents = parents;
    this.showChildren = showChildren;
  }

  addChild(child: Child): Item {
    const newChildren = [...this.children, child];
    return new Item({ ...this, children: newChildren });
  }

  addParent(parent: Parent): Item {
    const newParents = [...this.parents, parent];
    return new Item({ ...this, parents: newParents });
  }

  toggleShowChildren(showChildren?: boolean): Item {
    return new Item({
      ...this,
      showChildren: showChildren ?? !this.showChildren,
    });
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

  // TODO: Instert rules for scheduling here

  const newChildItem = childItem.addParent(parentReference);
  const newParentItem = parentItem.addChild(childReference);

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
