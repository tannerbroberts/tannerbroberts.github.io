import { useState } from 'react'
import { Box, Paper, Tabs, Tab, TextField, Button, Alert, Typography } from '@mui/material'
import { useAuth } from '../auth/useAuth'

export default function AuthGate() {
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
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: (t) => t.palette.background.default, p: 2 }}>
      <Paper elevation={4} sx={{ width: '100%', maxWidth: 420, p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 600 }}>About Time</Typography>
        <Tabs value={mode} onChange={(_e, v) => setMode(v)} centered>
          <Tab value="login" label="Login" />
          <Tab value="register" label="Register" />
        </Tabs>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} fullWidth autoFocus />
        <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth />
        <Button onClick={handleSubmit} variant="contained" disabled={loading} fullWidth>
          {mode === 'login' ? 'Login' : 'Create Account'}
        </Button>
      </Paper>
    </Box>
  )
}
