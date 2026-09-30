import type { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { AppError } from './errorHandler.js'

/** Requires `Authorization: Bearer <token>`; puts `{ id, username }` in `res.locals.admin`. */
export const requireAdmin: RequestHandler = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ')
  if (scheme !== 'Bearer' || !token) {
    throw new AppError(401, 'UNAUTHORIZED', 'Token autentikasi diperlukan')
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] })
    if (typeof payload === 'string' || !payload.sub) throw new Error('bad payload')
    res.locals.admin = { id: payload.sub, username: payload.username as string }
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError(401, 'TOKEN_EXPIRED', 'Sesi telah berakhir, silakan login kembali')
    }
    throw new AppError(401, 'INVALID_TOKEN', 'Token tidak valid')
  }
  next()
}
