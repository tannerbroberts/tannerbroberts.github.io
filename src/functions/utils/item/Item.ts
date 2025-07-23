import { v4 as uuid } from "uuid";
import { Parent } from "./Parent";
import type { ItemJSON } from "./ItemJSON";

export abstract class Item {
  readonly id: string;
  readonly name: string;
  readonly duration: number;
  readonly parents: Parent[];
  readonly allOrNothing: boolean;

  constructor({
    id = uuid(),
    name,
    duration,
    parents = [],
    allOrNothing = false,
  }: {
    id?: string;
    name: string;
    duration: number;
    parents?: Parent[];
    allOrNothing?: boolean;
  }) {
    this.id = id;
    this.name = name;
    this.duration = duration;
    this.parents = parents;
    this.allOrNothing = allOrNothing;
  }

  abstract toJSON(): ItemJSON;
}
