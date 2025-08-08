import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

export async function hashPassword(pw) {
  const salt = await bcrypt.genSalt(8)
  return bcrypt.hash(pw, salt)
}

export async function verifyPassword(pw, hash) {
  return bcrypt.compare(pw, hash)
}

export function signToken(user) {
  return jwt.sign({ sub: user.id }, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET)
  } catch {
    return null
  }
}
