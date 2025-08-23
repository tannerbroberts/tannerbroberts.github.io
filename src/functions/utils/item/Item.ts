import { v4 as uuid } from "uuid";
import { Parent } from "./Parent";
import type { ItemJSON } from "./ItemJSON";

export abstract class Item {
  readonly id: string;
  readonly name: string;
  readonly duration: number;
  readonly parents: Parent[];
  readonly variables: Record<string, number>;
  readonly variableSummary: Record<string, number>;
  readonly color?: string;
  readonly pattern?: string;
  

  constructor({
    id = uuid(),
    name,
    duration,
    parents = [],
    variables = {},
    variableSummary = {},
    color,
    pattern,
  }: {
    id?: string;
    name: string;
    duration: number;
    parents?: Parent[];
    variables?: Record<string, number>;
    variableSummary?: Record<string, number>;
    color?: string;
    pattern?: string;
  }) {
    this.id = id;
    this.name = name;
    this.duration = duration;
    this.parents = parents;
    this.variables = variables;
    this.variableSummary = variableSummary;
    this.color = color;
    this.pattern = pattern;
  }

  static fromJSON(json: ItemJSON): Item {
    throw new Error(`fromJSON, called with ${JSON.stringify(json)} must be implemented by subclass`);
  }

  abstract toJSON(): ItemJSON;
  abstract withUpdatedProperty<K extends keyof this>(key: K, value: this[K]): this;
}
