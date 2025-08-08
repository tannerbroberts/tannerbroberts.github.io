import { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Tabs, Tab, Alert } from '@mui/material'
import { useAuth } from '../auth/AuthContext'

export default function LoginDialog({ open, onClose }: Readonly<{ open: boolean; onClose: () => void }>) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null); setLoading(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(email, password)
      onClose()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Welcome</DialogTitle>
      <Tabs value={mode} onChange={(_e, v) => setMode(v)} sx={{ px: 2 }}>
        <Tab value="login" label="Login" />
        <Tab value="register" label="Register" />
      </Tabs>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} fullWidth autoFocus />
        <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>{mode === 'login' ? 'Login' : 'Create Account'}</Button>
      </DialogActions>
    </Dialog>
  )
}
