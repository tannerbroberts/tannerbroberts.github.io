import { Router } from 'express'
import { hashPassword, verifyPassword, signToken } from '../utils/auth.js'
import { readState, updateState, onShutdown } from '../store/persistence.js'

// simple in-memory user store {id,email,passwordHash}
const users = new Map()

function persistUsers() {
  const arr = Array.from(users.values())
  updateState(state => ({ ...state, users: arr }))
}

function loadUsers() {
  const state = readState()
  const arr = Array.isArray(state.users) ? state.users : []
  for (const u of arr) {
    if (u && u.email) users.set(u.email, u)
  }
}

// initialize from disk and ensure shutdown flush
loadUsers()
onShutdown(() => { try { persistUsers() } catch (e) { console.error('[auth] shutdown persist failed', e) } })

const router = Router()

router.post('/register', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'missing_fields' })
  if (users.has(email)) return res.status(409).json({ error: 'email_taken' })
  const id = `u_${Math.random().toString(36).slice(2)}`
  const passwordHash = await hashPassword(password)
  const user = { id, email, passwordHash }
  users.set(email, user)
  persistUsers()
  const token = signToken(user)
  res.json({ token, user: { id, email } })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {}
  const user = users.get(email)
  if (!user) return res.status(401).json({ error: 'invalid_credentials' })
  const ok = await verifyPassword(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' })
  const token = signToken(user)
  res.json({ token, user: { id: user.id, email } })
})

export default router
