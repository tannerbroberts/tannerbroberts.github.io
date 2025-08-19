export const BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:4000'

export function headers() {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  const uid = localStorage.getItem('x-user-id') || 'dev-user'
  h['x-user-id'] = uid
  return h
}
