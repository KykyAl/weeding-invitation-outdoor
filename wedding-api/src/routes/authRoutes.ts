import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { login } from '../controllers/authController.js'

export const authRoutes = Router()

/** Slows down password guessing: 10 attempts per IP per 15 minutes. */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: { code: 'TOO_MANY_REQUESTS', message: 'Terlalu banyak percobaan login. Silakan coba lagi nanti.' },
    })
  },
})

authRoutes.post('/login', loginLimiter, login)
