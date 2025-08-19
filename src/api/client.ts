export type ClonePublicTemplateResponse = { ok: true; template: { hash: string; name: string; kind: string; data: unknown } }

import { BASE, headers } from './client-helpers'
export async function clonePublicTemplate(ownerId: string, hash: string): Promise<ClonePublicTemplateResponse> {
  const url = `${BASE}/public/templates/${encodeURIComponent(ownerId)}/${encodeURIComponent(hash)}/clone`
  const r = await fetch(url, { method: 'POST', headers: headers() })
  if (!r.ok) throw new Error('clonePublicTemplate failed')
  return r.json()
}
