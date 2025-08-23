import { Item } from "./Item";
import type { ItemJSON } from "./ItemJSON";
import { Parent } from "./Parent";

export class BasicItem extends Item {
  readonly priority: number;

  constructor({
    priority = 0,
    ...rest
  }: {
    id?: string;
    name: string;
    duration: number;
    parents?: Parent[];
    variables?: Record<string, number>;
    variableSummary?: Record<string, number>;
    priority?: number;
    color?: string;
    pattern?: string;
  }) {
  super(rest);
  this.priority = priority;
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
      priority: this.priority,
      color: this.color,
  pattern: this.pattern,
    };
  }

  static fromJSON(json: ItemJSON): BasicItem {
    return new BasicItem({
      id: json.id,
      name: json.name,
      duration: json.duration,
      parents: Array.isArray(json.parents) ? json.parents.map((p) => new Parent(p as { id: string; relationshipId?: string })) : [],
      variables: json.variables || {},
      variableSummary: json.variableSummary || {},
      priority: typeof json.priority === 'number' ? json.priority : 0,
      color: json.color,
  pattern: json.pattern,
    });
  }

  withUpdatedProperty<K extends keyof this>(key: K, value: this[K]): this {
  const { priority, ...rest } = this;
  const updated = { ...rest, priority: key === 'priority' ? value as number : priority, [key]: value };
  return new BasicItem(updated as ConstructorParameters<typeof BasicItem>[0]) as this;
  }
}
