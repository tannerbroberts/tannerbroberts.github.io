import { Item, SubCalendarItem } from '../functions/utils/item'
import { evaluateScheduling } from './schedulingRules'

export type SchedulingBehaviorResult = { updatedItems: Item[]; summary?: string }

// Generic rules-based behavior entry point
export function applySchedulingRules(items: Item[], parent: SubCalendarItem, scheduledChild: Item): SchedulingBehaviorResult {
  return evaluateScheduling(items, parent, scheduledChild, scheduledChild.scheduling)
}
