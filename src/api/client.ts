export type QueryOptions = {
  busyOnly?: boolean
  largestFit?: boolean
  fullyWithin?: boolean
}

const BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:4000'

function headers() {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  const uid = localStorage.getItem('x-user-id') || 'dev-user'
  h['x-user-id'] = uid
  return h
}

export type CalendarItemInput = {
  type: 'basic' | 'container'
  start: number
  end: number
  templateHash: string
  priority?: number
  parentId?: string | null
  children?: string[]
}

export async function createItem(item: CalendarItemInput) {
  const r = await fetch(`${BASE}/api/calendar/items`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(item)
  })
  if (!r.ok) throw new Error('createItem failed')
  return r.json()
}

export type CalendarItemUpsert = CalendarItemInput & { id: string }

// Upsert an item (create or update by id)
export async function upsertItem(item: CalendarItemUpsert) {
  const r = await fetch(`${BASE}/api/calendar/items`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(item)
  })
  if (!r.ok) throw new Error('upsertItem failed')
  return r.json()
}

export async function deleteItem(id: string) {
  const r = await fetch(`${BASE}/api/calendar/items/${id}`, {
    method: 'DELETE',
    headers: headers(),
  })
  if (!r.ok) throw new Error('deleteItem failed')
  return r.json()
}

export async function queryItems(start: number, end: number, opts: QueryOptions = {}) {
  const u = new URL(`${BASE}/api/calendar/items`)
  u.searchParams.set('start', String(start))
  u.searchParams.set('end', String(end))
  if (opts.busyOnly) u.searchParams.set('busyOnly', 'true')
  if (opts.largestFit === false) u.searchParams.set('largestFit', 'false')
  if (opts.fullyWithin === false) u.searchParams.set('fullyWithin', 'false')
  const r = await fetch(u.toString(), { headers: headers() })
  if (!r.ok) throw new Error('queryItems failed')
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

export type ClonePublicTemplateResponse = { ok: true; template: { hash: string; name: string; kind: string; data: unknown } }

// Clone a public template via QR deep link (owner/hash)
export async function clonePublicTemplate(ownerId: string, hash: string): Promise<ClonePublicTemplateResponse> {
  const url = `${BASE}/public/templates/${encodeURIComponent(ownerId)}/${encodeURIComponent(hash)}/clone`
  const r = await fetch(url, { method: 'POST', headers: headers() })
  if (!r.ok) throw new Error('clonePublicTemplate failed')
  return r.json()
}
