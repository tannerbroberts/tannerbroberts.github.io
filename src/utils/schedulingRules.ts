import { Item, CheckListItem, BasicItem, getItemById, SubCalendarItem, CheckListChild } from '../functions/utils/item'
import type { SchedulingConfig, SchedulingRule, ConditionExpr, ConditionStep, MatchCriteria } from '../functions/utils/item/types/Scheduling'

export type SchedulingEvalResult = { updatedItems: Item[]; summary?: string }
export type SchedulingPreflight = { ok: boolean; failedRuleIndexes: number[] }

function matchName(name: string, m: MatchCriteria): boolean {
  if (m.nameEquals && name !== m.nameEquals) return false
  if (m.nameIncludes) {
    const needle = m.nameIncludes.toLowerCase()
    if (!name.toLowerCase().includes(needle)) return false
  }
  if (m.nameRegex) {
    try {
      const re = new RegExp(m.nameRegex)
      if (!re.test(name)) return false
    } catch {
      return false
    }
  }
  return true
}

function matches(item: Item, m?: MatchCriteria): boolean {
  if (!m) return true
  if (m.idEquals && (item as { id: string }).id !== m.idEquals) return false
  const name = item.name
  if (!matchName(name, m)) return false
  if (m.typeIs && item.constructor.name !== m.typeIs) return false
  const color = (item as unknown as { color?: string }).color
  const pattern = (item as unknown as { pattern?: string }).pattern
  if (m.colorEquals && color !== m.colorEquals) return false
  if (m.patternEquals && pattern !== m.patternEquals) return false
  return true
}

function step(items: Item[], scope: Item[], s: ConditionStep, parent: SubCalendarItem): Item[] {
  switch (s.op) {
    case 'findChildren': {
      const children: Item[] = []
      for (const child of parent.children) {
        const it = getItemById(items, child.id)
        if (it && matches(it, s.match)) children.push(it)
      }
      return children
    }
    case 'filter':
      return scope.filter(i => matches(i, s.match))
  }
}

function cmp(op: '<' | '<=' | '>' | '>=' | '==' | '!=', a: number, b: number): boolean {
  switch (op) {
    case '<': return a < b
    case '<=': return a <= b
    case '>': return a > b
    case '>=': return a >= b
    case '==': return a === b
    case '!=': return a !== b
  }
}

function assertConditions(scope: Item[], expr?: ConditionExpr['assert']): boolean {
  if (!expr || expr.length === 0) return scope.length > 0 // default: exists
  for (const a of expr) {
    if (a.kind === 'exists') {
      if ((scope.length > 0) !== a.value) return false
    } else if (a.kind === 'count') {
      if (!cmp(a.op, scope.length, a.value)) return false
    }
  }
  return true
}

function applyActions(actions: SchedulingRule['then'], scope: Item[], parent: SubCalendarItem, updated: Item[], summaries: string[], lastCreatedRef: { current: Item | null }) {
  for (const action of actions) {
    if (action.type === 'createItem') {
      const created = new BasicItem({ name: action.name, duration: action.duration, variables: action.variables || {}, color: action.color, pattern: action.pattern })
      updated.push(created)
      lastCreatedRef.current = created
      summaries.push(`created: ${action.name}`)
    } else if (action.type === 'addToChecklist') {
      let target: CheckListItem | null = null
      for (const i of [...scope, parent]) { if (i instanceof CheckListItem) { target = i; break } }
      if (target && lastCreatedRef.current) {
        target.addChild(new CheckListChild({ itemId: lastCreatedRef.current.id }))
        updated.push(target)
        summaries.push(`added to checklist: ${target.name}`)
      }
    } else if (action.type === 'addExistingToChecklist') {
      let target: CheckListItem | null = null
      if (action.target !== 'firstMatch') {
        const explicit = getItemById(updated.length ? updated : scope, (action.target as { checklistId: string }).checklistId)
        if (explicit && explicit instanceof CheckListItem) target = explicit
      }
      if (!target) {
        for (const i of [...scope, parent]) { if (i instanceof CheckListItem) { target = i; break } }
      }
      if (target) {
        target.addChild(new CheckListChild({ itemId: action.sourceItemId }))
        updated.push(target)
        summaries.push(`added existing to checklist: ${target.name}`)
      }
    }
  }
}

export function evaluateScheduling(items: Item[], parent: SubCalendarItem, child: Item, config?: SchedulingConfig): SchedulingEvalResult {
  const updated: Item[] = []
  const summaries: string[] = []
  const rules: SchedulingRule[] = config?.rules || child.scheduling?.rules || []
  const lastCreatedRef: { current: Item | null } = { current: null }

  for (const rule of rules) {
    let scope: Item[] = rule.when.start === 'child' ? [child] : [parent]
    for (const s of rule.when.chain || []) {
      scope = step(items, scope, s, parent)
    }
    if (!assertConditions(scope, rule.when.assert)) continue
    applyActions(rule.then, scope, parent, updated, summaries, lastCreatedRef)
  }

  return { updatedItems: updated, summary: summaries.join('; ') || undefined }
}

// Preflight: if a rule has no actions (then.length === 0), treat it as a gating condition.
// If its condition does not hold, scheduling should be blocked before applying.
export function verifySchedulingPreconditions(items: Item[], parent: SubCalendarItem, child: Item, config?: SchedulingConfig): SchedulingPreflight {
  const failed: number[] = []
  const rules: SchedulingRule[] = config?.rules || child.scheduling?.rules || []
  rules.forEach((rule, idx) => {
    if ((rule.then?.length ?? 0) > 0) return // only gating when no side effects
    let scope: Item[] = rule.when.start === 'child' ? [child] : [parent]
    for (const s of rule.when.chain || []) {
      scope = step(items, scope, s, parent)
    }
    const ok = assertConditions(scope, rule.when.assert)
    if (!ok) failed.push(idx)
  })
  return { ok: failed.length === 0, failedRuleIndexes: failed }
}
