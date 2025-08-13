import { Router } from 'express'
import { Store } from '../store/timeIndex.js'
import { validateCalendarItem } from '../utils/validate.js'

const router = Router()

// Create or update an item
router.post('/items', (req, res) => {
  const userId = req.user.id
  const body = req.body || {}
  const v = validateCalendarItem(body)
  if (!v.ok) return res.status(400).json({ error: v.error })
  const saved = Store.upsertItem(userId, v.value)
  res.json(saved)
})

router.delete('/items/:id', (req, res) => {
  const ok = Store.deleteItem(req.user.id, req.params.id)
  res.json({ ok })
})

// Query items
router.get('/items', (req, res) => {
  const userId = req.user.id
  const start = Number(req.query.start)
  let end = Number(req.query.end)
  const duration = req.query.duration != null ? Number(req.query.duration) : null
  if (!Number.isFinite(start)) return res.status(400).json({ error: 'missing:start' })
  if (Number.isFinite(duration) && duration >= 0) {
    end = start + duration
  }
  if (!Number.isFinite(end)) return res.status(400).json({ error: 'missing:range' })

  const busyOnly = req.query.busyOnly === 'true'
  const largestFit = req.query.largestFit !== 'false'
  const fullyWithin = req.query.fullyWithin !== 'false'
  const items = Store.query(userId, start, end, { busyOnly, largestFit, fullyWithin })
  res.json({ items, window: { start, duration: end - start } })
})

// Conflict groups
router.get('/conflicts', (req, res) => {
  const userId = req.user.id
  const start = Number(req.query.start)
  let end = Number(req.query.end)
  const duration = req.query.duration != null ? Number(req.query.duration) : null
  if (!Number.isFinite(start)) return res.status(400).json({ error: 'missing:start' })
  if (Number.isFinite(duration) && duration >= 0) {
    end = start + duration
  }
  if (!Number.isFinite(end)) return res.status(400).json({ error: 'missing:range' })
  const groups = Store.conflicts(userId, start, end)
  res.json({ groups, window: { start, duration: end - start } })
})

// Busy summary (unscheduled by priority)
router.get('/summary', (req, res) => {
  const userId = req.user.id
  const start = Number(req.query.start)
  let end = Number(req.query.end)
  const duration = req.query.duration != null ? Number(req.query.duration) : null
  if (!Number.isFinite(start)) return res.status(400).json({ error: 'missing:start' })
  if (Number.isFinite(duration) && duration >= 0) {
    end = start + duration
  }
  if (!Number.isFinite(end)) return res.status(400).json({ error: 'missing:range' })
  const summary = Store.busySummary(userId, start, end, [2, 1, 0])
  res.json({ ...summary, window: { start, duration: end - start } })
})

export default router
