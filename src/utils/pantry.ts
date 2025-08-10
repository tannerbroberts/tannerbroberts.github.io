// Pantry filtering utilities for "What can I make?"
// An item is considered makeable if, for each required variable, the pantry has at least that amount.
// Requirements are taken from variableSummary when available (aggregated), otherwise from variables.

import type { Item } from "../functions/utils/item";

export type Pantry = Record<string, number>;

export function getItemRequirements(item: Item): Record<string, number> {
  const summary = item.variableSummary || {};
  const own = item.variables || {};
  const source = Object.keys(summary).length > 0 ? summary : own;
  // Keep only finite, non-negative numbers
  const req: Record<string, number> = {};
  for (const [k, v] of Object.entries(source)) {
    const n = typeof v === 'number' ? v : Number(v);
    if (Number.isFinite(n) && n > 0) req[k] = n;
  }
  return req;
}

export function canMake(item: Item, pantry: Pantry): boolean {
  const req = getItemRequirements(item);
  for (const [k, needed] of Object.entries(req)) {
    const have = pantry[k] ?? 0;
    if (have < needed) return false;
  }
  return true;
}

export function filterMakeableItems(items: Item[], pantry: Pantry): Item[] {
  return items.filter(it => canMake(it, pantry));
}
