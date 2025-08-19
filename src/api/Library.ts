import { BASE, headers } from './client-helpers'

export type LibraryItemInput = {
  type: 'basic' | 'container'
  templateHash: string
  priority?: number
  parentId?: string | null
  children?: string[]
}

export type LibraryItemUpsert = LibraryItemInput & { id: string }

export async function createLibraryItem(item: LibraryItemInput) {
  const r = await fetch(`${BASE}/api/library/items`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(item)
  })
  if (!r.ok) throw new Error('createLibraryItem failed')
  return r.json()
}

export async function upsertLibraryItem(item: LibraryItemUpsert) {
  const r = await fetch(`${BASE}/api/library/items`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(item)
  })
  if (!r.ok) throw new Error('upsertLibraryItem failed')
  return r.json()
}

export async function deleteLibraryItem(id: string) {
  const r = await fetch(`${BASE}/api/library/items/${id}`, {
    method: 'DELETE',
    headers: headers(),
  })
  if (!r.ok) throw new Error('deleteLibraryItem failed')
  return r.json()
}

export async function queryLibraryItems() {
  const r = await fetch(`${BASE}/api/library/items`, { headers: headers() })
  if (!r.ok) throw new Error('queryLibraryItems failed')
  return r.json()
}
