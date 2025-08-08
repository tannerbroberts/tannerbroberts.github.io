import { Router } from 'express'
import { Store } from '../store/timeIndex.js'
import { validateTemplate } from '../utils/validate.js'

const router = Router()

router.post('/', (req, res) => {
  const userId = req.user.id
  const tpl = req.body
  const v = validateTemplate(tpl)
  if (!v.ok) return res.status(400).json({ error: v.error })
  Store.upsertTemplate(userId, v.value)
  res.json({ ok: true })
})

router.get('/:hash', (req, res) => {
  const userId = req.user.id
  const tpl = Store.getTemplate(userId, req.params.hash)
  if (!tpl) return res.status(404).json({ error: 'not_found' })
  res.json(tpl)
})

export default router
