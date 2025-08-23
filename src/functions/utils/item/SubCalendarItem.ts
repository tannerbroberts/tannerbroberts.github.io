import { Item } from "./Item";
import { Child } from "./Child";
import { Parent } from "./Parent";
import type { ItemJSON } from "./ItemJSON";

export class SubCalendarItem extends Item {
  readonly children: Child[];

  constructor({
    children = [],
    ...rest
  }: {
    id?: string;
    name: string;
    duration: number;
    parents?: Parent[];
    variables?: Record<string, number>;
    variableSummary?: Record<string, number>;
    children?: Child[];
    color?: string;
    pattern?: string;
  }) {
    super(rest);
    this.children = children;
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
      color: this.color,
  pattern: this.pattern,
    };
  }

  static fromJSON(json: ItemJSON): SubCalendarItem {
    return new SubCalendarItem({
      id: json.id,
      name: json.name,
      duration: json.duration,
      parents: Array.isArray(json.parents) ? json.parents.map((p) => new Parent(p as { id: string; relationshipId?: string })) : [],
      variables: json.variables || {},
      variableSummary: json.variableSummary || {},
      children: Array.isArray(json.children) ? json.children.map((c) => new Child(c as { id: string; start: number; relationshipId?: string })) : [],
      color: json.color,
  pattern: json.pattern,
    });
  }

  withUpdatedProperty<K extends keyof this>(key: K, value: this[K]): this {
  // Create a new instance with the updated property, type-safe
  const { children, ...rest } = this;
  const updated = { ...rest, children: key === 'children' ? value as Child[] : children, [key]: value };
  return new SubCalendarItem(updated as ConstructorParameters<typeof SubCalendarItem>[0]) as this;
  }
}
