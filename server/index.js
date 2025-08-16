import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import calendarRouter from './routes/calendar.js'
import templatesRouter from './routes/templates.js'
import usersRouter from './routes/users.js'
import publicRouter from './routes/public.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(bodyParser.json({ limit: '2mb' }))

// Health
app.get('/health', (_req, res) => res.json({ ok: true }))

// Public, no auth required
app.use('/public', publicRouter)

// Simple dev user injection (auth removed)
app.use((req, _res, next) => { req.user = { id: req.header('x-user-id') || 'dev-user' }; next(); })

app.use('/api/calendar', calendarRouter)
app.use('/api/templates', templatesRouter)
app.use('/api/users', usersRouter)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'internal_error', message: err?.message || 'Unknown error' })
})

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`)
})
