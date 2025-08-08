// Minimal dev auth: use x-user-id to scope stores. In real life, use JWT/OAuth.
import { verifyToken } from '../utils/auth.js'

export function authMiddleware(req, res, next) {
  const auth = req.header('authorization')
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.slice('Bearer '.length)
    const decoded = verifyToken(token)
    if (decoded?.sub) {
      req.user = { id: decoded.sub }
      return next()
    }
  }

  const userId = req.header('x-user-id')?.trim()
  req.user = { id: userId || 'dev-user' }
  next()
}
