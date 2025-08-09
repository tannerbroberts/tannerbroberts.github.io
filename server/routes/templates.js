import { Router } from 'express'
import { Store } from '../store/timeIndex.js'
import { validateTemplate } from '../utils/validate.js'

const router = Router()

router.post('/', (req, res) => {
  const userId = req.user.id
  const tpl = req.body
  const v = validateTemplate(tpl)
  if (!v.ok) return res.status(400).json({ error: v.error })
  // Default owner-specific behavior: users manage their own templates. Visibility and license can be set by client.
  Store.upsertTemplate(userId, v.value)
  res.json({ ok: true })
})

router.get('/:hash', (req, res) => {
  const userId = req.user.id
  const tpl = Store.getTemplate(userId, req.params.hash)
  if (!tpl) return res.status(404).json({ error: 'not_found' })
  res.json(tpl)
})

// List my templates (optionally filter by visibility/license)
router.get('/', (req, res) => {
  const userId = req.user.id
  const all = []
  // Store doesn't expose listing; use Store.ensureUser to access the user's template map.
  const s = Store.ensureUser(userId)
  for (const t of s.templates.values()) all.push(t)
  const vis = req.query.visibility
  const lic = req.query.license
  const filtered = all.filter(t => (!vis || t.visibility === vis) && (!lic || t.license === lic))
  res.json({ templates: filtered })
})

export default router
