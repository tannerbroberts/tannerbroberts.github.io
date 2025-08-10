import { describe, it, expect } from 'vitest'
import { BasicItem } from '../../functions/utils/item'
import { canMake, filterMakeableItems, getItemRequirements } from '../../utils/pantry'

function itemWith(vars: Record<string, number>, summary?: Record<string, number>) {
  return new BasicItem({ name: 'x', duration: 1000, variables: vars, variableSummary: summary || {} })
}

describe('pantry utils', () => {
  it('extracts requirements from summary when present', () => {
    const it = itemWith({ eggs: 1 }, { eggs: 2, flour: 3 })
    expect(getItemRequirements(it)).toEqual({ eggs: 2, flour: 3 })
  })

  it('falls back to own variables when no summary', () => {
    const it = itemWith({ eggs: 1, milk: 0 })
    expect(getItemRequirements(it)).toEqual({ eggs: 1 })
  })

  it('canMake respects pantry quantities', () => {
    const it = itemWith({ eggs: 2, flour: 1 })
    expect(canMake(it, { eggs: 2, flour: 1 })).toBe(true)
    expect(canMake(it, { eggs: 1, flour: 1 })).toBe(false)
    expect(canMake(it, { eggs: 2 })).toBe(false)
  })

  it('filters makeable items', () => {
    const a = itemWith({ eggs: 1 })
    const b = itemWith({ eggs: 3 })
    const c = itemWith({ milk: 2 })
    const list = [a, b, c]
    const out = filterMakeableItems(list, { eggs: 2, milk: 2 })
    expect(out.map(i => i === a || i === c)).toContain(true)
    expect(out).toHaveLength(2)
  })
})
