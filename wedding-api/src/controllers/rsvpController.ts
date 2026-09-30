import type { RequestHandler } from 'express'
import { pool } from '../db/pool.js'
import { rsvpSchema } from '../schemas/rsvpSchema.js'
import { validate } from '../schemas/validate.js'
import type { RsvpRow } from '../types/wedding.js'
import { toRsvp, weddingNotFound } from './weddingController.js'

/** POST /api/v1/weddings/:slug/rsvp */
export const createRsvp: RequestHandler<{ slug: string }> = async (req, res) => {
  const input = validate(rsvpSchema, req.body)

  const wedding = await pool.query<{ id: string }>('SELECT id FROM weddings WHERE slug = $1', [req.params.slug])
  if (!wedding.rows[0]) throw weddingNotFound()

  const { rows } = await pool.query<RsvpRow>(
    `INSERT INTO rsvps (wedding_id, guest_name, attendance, guest_count, message)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [wedding.rows[0].id, input.guestName, input.attendance, input.guestCount, input.message],
  )

  res.status(201).json({ message: 'RSVP berhasil', data: toRsvp(rows[0]) })
}
