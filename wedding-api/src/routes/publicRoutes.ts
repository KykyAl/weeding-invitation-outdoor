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

/**
 * Anti-guessing: only failed lookups (unknown slug) count. Once an IP reaches the
 * limit every lookup is refused (otherwise a real slug would still stand out).
 * The limit is generous because many mobile users share one IP (carrier NAT);
 * with ~887 million possible suffixes, 100 tries per 15 minutes is no threat.
 */
export const notFoundLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: { code: 'TOO_MANY_REQUESTS', message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' },
    })
  },
})

publicRoutes.get('/weddings/:slug', notFoundLimiter, getPublicWedding)
publicRoutes.post('/weddings/:slug/rsvp', rsvpLimiter, createRsvp)
