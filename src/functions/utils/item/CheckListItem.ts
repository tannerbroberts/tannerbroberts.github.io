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

  /**
   * Add a child to this checklist item
   * @param child The CheckListChild to add
   * @returns void - modifies the current instance
   */
  addChild(child: CheckListChild): void {
    this.children.push(child);
  }

  /**
   * Remove a child from this checklist item by relationship ID
   * @param relationshipId The relationship ID of the child to remove
   * @returns void - modifies the current instance
   */
  removeChild(relationshipId: string): void {
    this.children = this.children.filter((c) => c.relationshipId !== relationshipId);
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
}
