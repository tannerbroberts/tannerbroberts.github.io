import { Item } from "./Item";
import { Child } from "./Child";
import { Parent } from "./Parent";
import { IntervalTree } from "./IntervalTree";
import type { ItemJSON } from "./ItemJSON";

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
      id: this.id,
      name: this.name,
      duration: this.duration,
      parents: this.parents,
      allOrNothing: this.allOrNothing,
      type: this.constructor.name,
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
