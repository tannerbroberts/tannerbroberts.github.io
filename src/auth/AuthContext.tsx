import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { AuthContext, User } from './AuthContextCore'

const API = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:4000'

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // Initialize from localStorage synchronously to avoid unauthenticated flash
  const initialToken = (() => {
    try { return localStorage.getItem('auth_token') } catch { return null }
  })()
  const initialUser = (() => {
    try { const u = localStorage.getItem('auth_user'); return u ? JSON.parse(u) as User : null } catch { return null }
  })()
  const [user, setUser] = useState<User | null>(initialUser)
  const [token, setToken] = useState<string | null>(initialToken)

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

// This file only exports a component (AuthProvider) for fast refresh compatibility
