import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { createRsvp } from '../controllers/rsvpController.js'
import { getPublicWedding } from '../controllers/weddingController.js'

export const publicRoutes = Router()

/** 10 RSVPs per IP per 15 minutes — enough for real guests, stops spam. */
const rsvpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: { code: 'TOO_MANY_REQUESTS', message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' },
    })
  },
})

publicRoutes.get('/weddings/:slug', getPublicWedding)
publicRoutes.post('/weddings/:slug/rsvp', rsvpLimiter, createRsvp)
