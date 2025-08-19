import { BASE, headers } from './client-helpers'

export type CalendarItemInput = {
  type: 'basic' | 'container'
  start: number
  end: number
  templateHash: string
  priority?: number
  parentId?: string | null
  children?: string[]
}

export type CalendarItemUpsert = CalendarItemInput & { id: string }

export type QueryOptions = {
  busyOnly?: boolean
  largestFit?: boolean
  fullyWithin?: boolean
}

export async function createCalendarItem(item: CalendarItemInput) {
  const r = await fetch(`${BASE}/api/calendar/items`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(item)
  })
  if (!r.ok) throw new Error('createCalendarItem failed')
  return r.json()
}

export async function upsertCalendarItem(item: CalendarItemUpsert) {
  const r = await fetch(`${BASE}/api/calendar/items`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(item)
  })
  if (!r.ok) throw new Error('upsertCalendarItem failed')
  return r.json()
}

export async function deleteCalendarItem(id: string) {
  const r = await fetch(`${BASE}/api/calendar/items/${id}`, {
    method: 'DELETE',
    headers: headers(),
  })
  if (!r.ok) throw new Error('deleteCalendarItem failed')
  return r.json()
}

export async function queryCalendarItems(start: number, end: number, opts: QueryOptions = {}) {
  const u = new URL(`${BASE}/api/calendar/items`)
  u.searchParams.set('start', String(start))
  u.searchParams.set('end', String(end))
  if (opts.busyOnly) u.searchParams.set('busyOnly', 'true')
  if (opts.largestFit === false) u.searchParams.set('largestFit', 'false')
  if (opts.fullyWithin === false) u.searchParams.set('fullyWithin', 'false')
  const r = await fetch(u.toString(), { headers: headers() })
  if (!r.ok) throw new Error('queryCalendarItems failed')
  return r.json()
}

export async function conflictGroups(start: number, end: number) {
  const u = new URL(`${BASE}/api/calendar/conflicts`)
  u.searchParams.set('start', String(start))
  u.searchParams.set('end', String(end))
  const r = await fetch(u.toString(), { headers: headers() })
  if (!r.ok) throw new Error('conflictGroups failed')
  return r.json()
}

export async function busySummary(start: number, end: number) {
  const u = new URL(`${BASE}/api/calendar/summary`)
  u.searchParams.set('start', String(start))
  u.searchParams.set('end', String(end))
  const r = await fetch(u.toString(), { headers: headers() })
  if (!r.ok) throw new Error('busySummary failed')
  return r.json()
}
