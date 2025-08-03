import { v4 as uuid } from "uuid";
import { Parent } from "./Parent";
import type { ItemJSON } from "./ItemJSON";

export abstract class Item {
  readonly id: string;
  readonly name: string;
  readonly duration: number;
  readonly parents: Parent[];
  readonly allOrNothing: boolean;
  readonly variables: Record<string, number>;
  readonly variableSummary: Record<string, number>;

  constructor({
    id = uuid(),
    name,
    duration,
    parents = [],
    allOrNothing = false,
    variables = {},
    variableSummary = {},
  }: {
    id?: string;
    name: string;
    duration: number;
    parents?: Parent[];
    allOrNothing?: boolean;
    variables?: Record<string, number>;
    variableSummary?: Record<string, number>;
  }) {
    this.id = id;
    this.name = name;
    this.duration = duration;
    this.parents = parents;
    this.allOrNothing = allOrNothing;
    this.variables = variables;
    this.variableSummary = variableSummary;
  }

  abstract toJSON(): ItemJSON;
}
