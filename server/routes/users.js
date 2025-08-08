import { Router } from 'express'

const router = Router()

// For dev: returns the current dev user identity
router.get('/me', (req, res) => {
  res.json({ id: req.user.id })
})

export default router
