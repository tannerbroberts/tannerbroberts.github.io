import { Router } from 'express'
import { Store } from '../store/timeIndex.js'

const router = Router()

// Get a public template by user and hash (no auth required)
router.get('/templates/:ownerId/:hash', (req, res) => {
  const { ownerId, hash } = req.params
  const tpl = Store.getTemplate(ownerId, hash)
  if (!tpl) return res.status(404).json({ error: 'not_found' })
  if (tpl.visibility !== 'public' || tpl.license !== 'free') return res.status(403).json({ error: 'not_public_free' })
  res.json(tpl)
})

// Clone a public-free template into the caller's space (auth optional; x-user-id for dev)
router.post('/templates/:ownerId/:hash/clone', (req, res) => {
  const { ownerId, hash } = req.params
  const targetUser = (req.user && req.user.id) || req.header('x-user-id') || 'dev-user'
  const tpl = Store.getTemplate(ownerId, hash)
  if (!tpl) return res.status(404).json({ error: 'not_found' })
  if (tpl.visibility !== 'public' || tpl.license !== 'free') return res.status(403).json({ error: 'not_public_free' })
  // Keep same hash to allow dedupe across users; record origin
  const cloned = { ...tpl, origin: { ownerId, hash, license: tpl.license }, visibility: 'private' }
  Store.upsertTemplate(targetUser, cloned)
  res.json({ ok: true, template: cloned })
})

export default router
