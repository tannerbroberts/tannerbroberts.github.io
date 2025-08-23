import { Item } from "./Item";
import { CheckListChild } from "./CheckListChild";
import { Parent } from "./Parent";
import type { ItemJSON } from "./ItemJSON";
import type { SortType } from "./SortType";

export class CheckListItem extends Item {
  readonly children: CheckListChild[];
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
    variables?: Record<string, number>;
    variableSummary?: Record<string, number>;
    children?: CheckListChild[];
    sortType?: SortType;
    color?: string;
    pattern?: string;
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
      type: this.constructor.name,
      variables: this.variables,
      variableSummary: this.variableSummary,
      children: this.children,
      sortType: this.sortType,
      color: this.color,
  pattern: this.pattern,
    };
  }

  static fromJSON(json: ItemJSON): CheckListItem {
    return new CheckListItem({
      id: json.id,
      name: json.name,
      duration: json.duration,
      parents: Array.isArray(json.parents) ? json.parents.map((p) => new Parent(p as { id: string; relationshipId?: string })) : [],
      variables: json.variables || {},
      variableSummary: json.variableSummary || {},
      children: Array.isArray(json.children) ? json.children.map((c) => new CheckListChild(c as { itemId: string; complete?: boolean; relationshipId?: string })) : [],
      sortType: (typeof json.sortType === 'string' && (json.sortType === 'alphabetical' || json.sortType === 'manual' || json.sortType === 'duration')) ? json.sortType : "manual",
      color: json.color,
  pattern: json.pattern,
    });
  }

  withUpdatedProperty<K extends keyof this>(key: K, value: this[K]): this {
    const { children, sortType, ...rest } = this;
    const updated = {
      ...rest,
      children: key === 'children' ? value as CheckListChild[] : children,
      sortType: key === 'sortType' ? value as SortType : sortType,
      [key]: value
    };
    return new CheckListItem(updated as ConstructorParameters<typeof CheckListItem>[0]) as this;
  }
}
