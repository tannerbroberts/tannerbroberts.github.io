import type { Item } from '../functions/utils/item'

// Minimal stubs retained for API compatibility after removing rule-based scheduling
export type SchedulingEvalResult = { updatedItems: Item[]; summary?: string }
export type SchedulingPreflight = { ok: boolean; failedRuleIndexes: number[] }

export function evaluateScheduling(): SchedulingEvalResult {
  return { updatedItems: [], summary: undefined }
}

export function verifySchedulingPreconditions(): SchedulingPreflight {
  return { ok: true, failedRuleIndexes: [] }
}
