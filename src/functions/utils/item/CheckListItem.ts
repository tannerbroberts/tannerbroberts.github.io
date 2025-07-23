import { Item } from "./Item";
import { CheckListChild } from "./CheckListChild";
import { Parent } from "./Parent";
import type { ItemJSON } from "./ItemJSON";
import type { SortType } from "./SortType";

export class CheckListItem extends Item {
  children: CheckListChild[];
  readonly sortType: SortType;

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
      id: this.id,
      name: this.name,
      duration: this.duration,
      parents: this.parents,
      allOrNothing: this.allOrNothing,
      type: this.constructor.name,
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
      sortType: (typeof json.sortType === 'string' && (json.sortType === 'alphabetical' || json.sortType === 'manual' || json.sortType === 'duration')) ? json.sortType : "manual",
    });
  }
}
