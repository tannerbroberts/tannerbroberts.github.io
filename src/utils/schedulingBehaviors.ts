import type { Item } from '../functions/utils/item'

export type SchedulingBehaviorResult = { updatedItems: Item[]; summary?: string }

// Scheduling behaviors removed; provide a no-op to maintain API stability if imported elsewhere
export function applySchedulingRules(): SchedulingBehaviorResult {
  return { updatedItems: [], summary: undefined }
}
