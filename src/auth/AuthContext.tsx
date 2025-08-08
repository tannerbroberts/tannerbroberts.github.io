import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'

type User = { id: string; email?: string }

type AuthContextType = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:4000'

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const t = localStorage.getItem('auth_token')
    const u = localStorage.getItem('auth_user')
    if (t) setToken(t)
    if (u) setUser(JSON.parse(u))
  }, [])

  useEffect(() => {
    if (token) localStorage.setItem('auth_token', token)
    else localStorage.removeItem('auth_token')
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem('auth_user', JSON.stringify(user))
    else localStorage.removeItem('auth_user')
  }, [user])

  async function call(path: string, body: unknown) {
    const res = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error('auth_failed')
    return res.json()
  }

  const login = useCallback(async (email: string, password: string) => {
    const r = await call('/api/auth/login', { email, password })
    setToken(r.token)
    setUser(r.user)
    localStorage.setItem('x-user-id', r.user.id)
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const r = await call('/api/auth/register', { email, password })
    setToken(r.token)
    setUser(r.user)
    localStorage.setItem('x-user-id', r.user.id)
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, token, login, register, logout }), [user, token, login, register, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
