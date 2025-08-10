import { v4 as uuid } from "uuid";
import { Parent } from "./Parent";
import type { ItemJSON } from "./ItemJSON";
import type { SchedulingConfig } from './types/Scheduling'

export abstract class Item {
  readonly id: string;
  readonly name: string;
  readonly duration: number;
  readonly parents: Parent[];
  readonly allOrNothing: boolean;
  readonly variables: Record<string, number>;
  readonly variableSummary: Record<string, number>;
  readonly behavior?: { autoShoppingList?: boolean; targetChecklistName?: string };
  readonly criteria?: { requireChecklistNamed?: string };
  readonly color?: string;
  readonly pattern?: string;
  readonly scheduling?: SchedulingConfig;

  constructor({
    id = uuid(),
    name,
    duration,
    parents = [],
    allOrNothing = false,
    variables = {},
    variableSummary = {},
    behavior,
    criteria,
    color,
    pattern,
    scheduling,
  }: {
    id?: string;
    name: string;
    duration: number;
    parents?: Parent[];
    allOrNothing?: boolean;
    variables?: Record<string, number>;
    variableSummary?: Record<string, number>;
    behavior?: { autoShoppingList?: boolean; targetChecklistName?: string };
    criteria?: { requireChecklistNamed?: string };
    color?: string;
    pattern?: string;
    scheduling?: SchedulingConfig;
  }) {
    this.id = id;
    this.name = name;
    this.duration = duration;
    this.parents = parents;
    this.allOrNothing = allOrNothing;
    this.variables = variables;
    this.variableSummary = variableSummary;
    this.behavior = behavior;
    this.criteria = criteria;
    this.color = color;
    this.pattern = pattern;
    this.scheduling = scheduling;
  }

  abstract toJSON(): ItemJSON;
}
