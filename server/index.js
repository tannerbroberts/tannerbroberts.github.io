import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { authMiddleware } from './middleware/auth.js'
import calendarRouter from './routes/calendar.js'
import templatesRouter from './routes/templates.js'
import usersRouter from './routes/users.js'
import authRouter from './routes/auth.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(bodyParser.json({ limit: '2mb' }))

// Health
app.get('/health', (_req, res) => res.json({ ok: true }))

// Attach auth; for now accept x-user-id header, or create a dev user
app.use(authMiddleware)

app.use('/api/calendar', calendarRouter)
app.use('/api/templates', templatesRouter)
app.use('/api/users', usersRouter)
app.use('/api/auth', authRouter)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'internal_error', message: err?.message || 'Unknown error' })
})

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`)
})
