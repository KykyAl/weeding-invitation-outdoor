import path from 'node:path'
import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { renderInvitationPage } from './controllers/pageController.js'
import { pool } from './db/pool.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'
import { adminRoutes } from './routes/adminRoutes.js'
import { authRoutes } from './routes/authRoutes.js'
import { publicRoutes } from './routes/publicRoutes.js'

export const app = express()

app.disable('x-powered-by')
app.set('trust proxy', env.TRUST_PROXY)
app.use(cors({ origin: env.corsOrigins }))
app.use(express.json({ limit: '100kb' }))

/** Liveness: the process is up. */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

/** Readiness: the process can reach the database. */
app.get('/ready', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok' })
  } catch {
    res.status(503).json({ status: 'unavailable', error: { code: 'DATABASE_UNAVAILABLE', message: 'Database tidak tersedia' } })
  }
})

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1', publicRoutes)

// Optional: serve the built frontend too, with link-preview tags on invitation pages.
if (env.FRONTEND_DIST) {
  const dist = path.resolve(env.FRONTEND_DIST)
  app.get('/wedding/:slug', renderInvitationPage)
  app.use(
    express.static(dist, {
      index: false,
      setHeaders: (res, file) => {
        // Vite fingerprints everything in assets/, so it can be cached forever.
        if (file.includes(`${path.sep}assets${path.sep}`)) res.set('Cache-Control', 'public, max-age=31536000, immutable')
      },
    }),
  )
  // Any other page (e.g. "/") is the single-page app.
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next()
    res.sendFile(path.join(dist, 'index.html'))
  })
}

app.use(notFound)
app.use(errorHandler)
