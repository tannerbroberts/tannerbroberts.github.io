import { v4 as uuid } from "uuid";
import { Parent } from "./Parent";
import type { ItemJSON } from "./ItemJSON";

export class Item {
  id: string;
  name: string;
  duration: number;
  parents: Parent[];
  allOrNothing: boolean;

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

  updateDuration(duration: number): this {
    const Ctor = Object.getPrototypeOf(this).constructor as new (args: any) => this;
    return new Ctor({ ...this, duration });
  }

  updateName(name: string): this {
    const Ctor = Object.getPrototypeOf(this).constructor as new (args: any) => this;
    return new Ctor({ ...this, name });
  }

  updateParents(parents: Parent[]): this {
    const newParents = [...this.parents, ...parents];
    const Ctor = Object.getPrototypeOf(this).constructor as new (args: any) => this;
    return new Ctor({ ...this, parents: newParents });
  }

  toJSON(): ItemJSON {
    return {
      id: this.id,
      name: this.name,
      duration: this.duration,
      parents: this.parents,
      allOrNothing: this.allOrNothing,
      type: this.constructor.name,
    };
  }

  static toJSONArray(items: Item[]): ItemJSON[] {
    return items.map((item) => item.toJSON());
  }
}
