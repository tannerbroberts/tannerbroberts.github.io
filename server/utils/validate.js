// Tiny schema validator for our runtime JS APIs

const ITEM_TYPES = {
  basic: 'basic',
  container: 'container',
  subcalendar: 'container', // normalize synonym
}

const TEMPLATE_KINDS = new Set(['basic', 'container', 'checklist', 'variable-group'])

function isNumber(x) { return typeof x === 'number' && Number.isFinite(x) }
function isString(x) { return typeof x === 'string' && x.length > 0 }
function isNullableString(x) { return x == null || typeof x === 'string' }

export function validateTemplate(input) {
  const allowedKeys = new Set(['hash', 'name', 'kind', 'data'])
  const extra = Object.keys(input || {}).filter(k => !allowedKeys.has(k))
  if (extra.length) return { ok: false, error: `invalid_fields:${extra.join(',')}` }
  if (!isString(input?.hash)) return { ok: false, error: 'missing:hash' }
  if (!isString(input?.name)) return { ok: false, error: 'missing:name' }
  if (!isString(input?.kind) || !TEMPLATE_KINDS.has(input.kind)) return { ok: false, error: 'invalid:kind' }
  // data is free-form for now
  return { ok: true, value: { hash: input.hash, name: input.name, kind: input.kind, data: input.data } }
}

export function validateCalendarItem(input) {
  if (!input || typeof input !== 'object') return { ok: false, error: 'invalid_body' }
  const normalizedType = ITEM_TYPES[input.type]
  if (!normalizedType) return { ok: false, error: 'invalid:type' }

  // common required fields
  if (!isNumber(input.start)) return { ok: false, error: 'missing:start' }
  if (!isNumber(input.end)) return { ok: false, error: 'missing:end' }
  if (input.end <= input.start) return { ok: false, error: 'invalid:range' }
  if (!isString(input.templateHash)) return { ok: false, error: 'missing:templateHash' }

  // allowed keys per type
  if (normalizedType === 'basic') {
    const allowed = new Set(['id', 'type', 'start', 'end', 'templateHash', 'priority', 'parentId'])
    const extra = Object.keys(input).filter(k => !allowed.has(k))
    if (extra.length) return { ok: false, error: `invalid_fields:${extra.join(',')}` }
    if (input.priority != null && !isNumber(input.priority)) return { ok: false, error: 'invalid:priority' }
    if (!isNullableString(input.parentId)) return { ok: false, error: 'invalid:parentId' }
    return { ok: true, value: { id: input.id, type: 'basic', start: input.start, end: input.end, templateHash: input.templateHash, priority: input.priority ?? 0, parentId: input.parentId ?? null } }
  }

  if (normalizedType === 'container') {
    const allowed = new Set(['id', 'type', 'start', 'end', 'templateHash', 'parentId'])
    const extra = Object.keys(input).filter(k => !allowed.has(k))
    if (extra.length) return { ok: false, error: `invalid_fields:${extra.join(',')}` }
    if (!isNullableString(input.parentId)) return { ok: false, error: 'invalid:parentId' }
    return { ok: true, value: { id: input.id, type: 'container', start: input.start, end: input.end, templateHash: input.templateHash, parentId: input.parentId ?? null } }
  }

  return { ok: false, error: 'unsupported_type' }
}

export const __constants = { ITEM_TYPES, TEMPLATE_KINDS }
