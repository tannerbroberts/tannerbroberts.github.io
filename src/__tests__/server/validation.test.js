import { describe, it, expect } from 'vitest'
import { validateCalendarItem, validateTemplate } from '../../../server/utils/validate.js'

describe('validation', () => {
  it('accepts basic item with priority and rejects extra fields', () => {
    const ok = validateCalendarItem({ type: 'basic', start: 1, end: 2, templateHash: 't', priority: 1, parentId: null })
    expect(ok.ok).toBe(true)
    const bad = validateCalendarItem({ type: 'basic', start: 1, end: 2, templateHash: 't', foo: 'bar' })
    expect(bad.ok).toBe(false)
  })

  it('normalizes subcalendar to container and rejects priority for containers', () => {
    const ok = validateCalendarItem({ type: 'subcalendar', start: 1, end: 5, templateHash: 's' })
    expect(ok.ok).toBe(true)
    expect(ok.value.type).toBe('container')
    const bad = validateCalendarItem({ type: 'container', start: 1, end: 5, templateHash: 'c', priority: 2 })
    expect(bad.ok).toBe(false)
  })

  it('validates templates with allowed fields only', () => {
    const t = validateTemplate({ hash: 'h', name: 'N', kind: 'basic', data: {} })
    expect(t.ok).toBe(true)
    const bad = validateTemplate({ hash: 'h', name: 'N', kind: 'unknown', data: {} })
    expect(bad.ok).toBe(false)
  })
})
