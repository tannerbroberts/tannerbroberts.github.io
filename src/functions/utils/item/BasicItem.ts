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
    allOrNothing?: boolean;
    variables?: Record<string, number>;
    variableSummary?: Record<string, number>;
    priority?: number;
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
      allOrNothing: this.allOrNothing,
      type: this.constructor.name,
      variables: this.variables,
      variableSummary: this.variableSummary,
      priority: this.priority,
    };
  }

  static fromJSON(json: ItemJSON): BasicItem {
    return new BasicItem({
      id: json.id,
      name: json.name,
      duration: json.duration,
      parents: Array.isArray(json.parents) ? json.parents.map((p) => new Parent(p as { id: string; relationshipId?: string })) : [],
      allOrNothing: json.allOrNothing || false,
      variables: json.variables || {},
      variableSummary: json.variableSummary || {},
      priority: typeof json.priority === 'number' ? json.priority : 0,
    });
  }
}
