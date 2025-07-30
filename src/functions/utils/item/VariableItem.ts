import { Item } from "./Item";
import { Parent } from "./Parent";
import type { ItemJSON } from "./ItemJSON";

export class VariableItem extends Item {
  readonly description?: string;
  readonly value: number;

  constructor({
    description,
    value,
    ...rest
  }: {
    id?: string;
    name: string;
    description?: string;
    value: number;
    parents?: Parent[];
    allOrNothing?: boolean;
  }) {
    // VariableItem always has duration 0 since it represents a value, not a time-based task
    super({ ...rest, duration: 0 });
    this.description = description;
    this.value = value;
  }

  toJSON(): ItemJSON {
    return {
      id: this.id,
      name: this.name,
      duration: this.duration,
      parents: this.parents,
      allOrNothing: this.allOrNothing,
      type: this.constructor.name,
      description: this.description,
      value: this.value,
    };
  }

  static fromJSON(json: ItemJSON): VariableItem {
    return new VariableItem({
      id: json.id,
      name: json.name,
      description: (json as any).description,
      value: (json as any).value || 0,
      parents: Array.isArray(json.parents) ? json.parents.map((p) => new Parent(p as { id: string; relationshipId?: string })) : [],
      allOrNothing: json.allOrNothing || false,
    });
  }

  // Immutable update methods following the same pattern as other Item types
  updateValue(newValue: number): VariableItem {
    return new VariableItem({
      id: this.id,
      name: this.name,
      description: this.description,
      value: newValue,
      parents: this.parents,
      allOrNothing: this.allOrNothing,
    });
  }

  updateDescription(newDescription?: string): VariableItem {
    return new VariableItem({
      id: this.id,
      name: this.name,
      description: newDescription,
      value: this.value,
      parents: this.parents,
      allOrNothing: this.allOrNothing,
    });
  }
}
