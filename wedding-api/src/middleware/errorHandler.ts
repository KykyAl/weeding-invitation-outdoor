import type { ErrorRequestHandler } from 'express'
import { env } from '../config/env.js'

/** Throw this from anywhere to send a specific error response. */
export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message)
  }
}

/** Single place that turns any error into `{ error: { code, message } }`. Never leaks stack traces. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } })
    return
  }

  // PostgreSQL constraint errors that are really client mistakes.
  const pgCode = typeof err === 'object' && err !== null && 'code' in err && 'severity' in err ? err.code : undefined
  if (pgCode === '23505') {
    const slug = 'constraint' in err && err.constraint === 'weddings_slug_key'
    res.status(409).json({
      error: slug
        ? { code: 'SLUG_TAKEN', message: 'Slug sudah digunakan wedding lain' }
        : { code: 'CONFLICT', message: 'Data sudah ada' },
    })
    return
  }
  if (pgCode === '23503') {
    // The only foreign keys point at weddings(id).
    res.status(404).json({ error: { code: 'WEDDING_NOT_FOUND', message: 'Wedding tidak ditemukan' } })
    return
  }

  // Malformed JSON body from express.json().
  if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
    res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Body request bukan JSON yang valid' } })
    return
  }

  console.error(err)
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: env.isProduction ? 'Terjadi kesalahan pada server' : String(err?.message ?? err),
    },
  })
}
