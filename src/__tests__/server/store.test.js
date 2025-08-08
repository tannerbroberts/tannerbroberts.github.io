import { describe, it, expect } from 'vitest'
import { Store } from '../../../server/store/timeIndex.js'

const user = 'test-user'

describe('Store time-index', () => {
  it('inserts and queries largest fit items', () => {
    Store.ensureUser(user)
    const a = Store.upsertItem(user, { type: 'container', start: 0, end: 1000, templateHash: 'A' })
    Store.upsertItem(user, { type: 'basic', start: 100, end: 200, priority: 1, templateHash: 'B', parentId: a.id })
    Store.upsertItem(user, { type: 'basic', start: 300, end: 400, priority: 0, templateHash: 'C', parentId: a.id })

    const r = Store.query(user, 0, 1000, { largestFit: true })
    expect(r[0].id).toBe(a.id)
    expect(r.length).toBe(1)

    const r2 = Store.query(user, 50, 250, { largestFit: true })
    expect(r2.some((x) => x.id === a.id)).toBe(false)
  })

  it('detects conflict groups by priority', () => {
    const start = 10000
    Store.upsertItem(user, { type: 'basic', start: start, end: start + 100, priority: 0, templateHash: 'X' })
    Store.upsertItem(user, { type: 'basic', start: start + 50, end: start + 120, priority: 2, templateHash: 'Y' })
    const groups = Store.conflicts(user, start, start + 200)
    expect(groups.length).toBeGreaterThan(0)
    expect(groups[0][0].priority).toBe(2)
  })

  it('summarizes busy by priority buckets', () => {
    const now = Date.now()
    const windowStart = now
    const windowEnd = now + 3600_000
    Store.upsertItem(user, { type: 'basic', start: windowStart + 0, end: windowStart + 600_000, priority: 2, templateHash: 'P2' })
    Store.upsertItem(user, { type: 'basic', start: windowStart + 900_000, end: windowStart + 1_200_000, priority: 1, templateHash: 'P1' })
    const summary = Store.busySummary(user, windowStart, windowEnd, [2, 1])
    expect(summary.unscheduled_p2).toBeLessThanOrEqual(3600_000)
    expect(summary.unscheduled_p1).toBeLessThanOrEqual(3600_000)
  })
})
