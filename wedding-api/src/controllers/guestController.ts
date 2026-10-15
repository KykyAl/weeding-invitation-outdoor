import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'
import type { Request, RequestHandler } from 'express'
import { z } from 'zod'
import { env } from '../config/env.js'
import { pool } from '../db/pool.js'
import { uuidParam } from '../schemas/weddingSchema.js'
import { validate } from '../schemas/validate.js'
import { weddingNotFound } from './weddingController.js'

/**
 * Misuse protection for invitation links:
 * - slugs get a random suffix, so other invitations can't be guessed;
 * - guest names (`?to=`) are signed (`&k=`), so a link can't be edited to show
 *   any other name — an unsigned or altered name is simply not displayed.
 */

const SUFFIX_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789' // no look-alikes (0/o, 1/l/i)

/** `arga-nadia` → `arga-nadia-7k3p9q` (31^6 ≈ 887 million possibilities). */
export const withRandomSuffix = (slug: string) =>
  `${slug}-${Array.from({ length: 6 }, () => SUFFIX_ALPHABET[randomInt(SUFFIX_ALPHABET.length)]).join('')}`

/** Same rule as the frontend: collapse spaces, trim, max 60 characters. */
export const normalizeGuestName = (name: string) => name.replace(/\s+/g, ' ').trim().slice(0, 60)

// A dedicated key, so rotating JWT_SECRET doesn't invalidate guest links already sent.
const key = env.GUEST_LINK_SECRET ?? createHmac('sha256', env.JWT_SECRET).update('guest-links').digest('hex')

const sign = (slug: string, name: string) =>
  createHmac('sha256', key).update(`${slug}\n${name}`).digest('base64url').slice(0, 16)

/** The guest's name if `?to=` carries a valid `&k=` signature for this wedding, else null. */
export function verifiedGuest(req: Request, slug: string): string | null {
  const { to, k } = req.query
  if (typeof to !== 'string' || typeof k !== 'string') return null
  const name = normalizeGuestName(to)
  const expected = Buffer.from(sign(slug, name))
  const given = Buffer.from(k)
  return name && given.length === expected.length && timingSafeEqual(given, expected) ? name : null
}

const guestLinksSchema = z.object({
  guests: z
    .array(z.string({ error: 'Nama tamu harus berupa teks' }), { error: 'guests harus berupa daftar nama' })
    .min(1, 'Isi minimal 1 nama tamu')
    .max(500, 'Maksimal 500 nama per permintaan')
    .transform((names) => [...new Set(names.map(normalizeGuestName).filter(Boolean))]),
})

/** POST /admin/weddings/:id/guest-links — `{ guests: ["Andi", …] }` → a signed link per guest. */
export const createGuestLinks: RequestHandler<{ id: string }> = async (req, res) => {
  const id = uuidParam(req.params.id, weddingNotFound)
  const { guests } = validate(guestLinksSchema, req.body)
  const { rows } = await pool.query<{ slug: string }>('SELECT slug FROM weddings WHERE id = $1', [id])
  if (!rows[0]) throw weddingNotFound()

  const { slug } = rows[0]
  const origin = `${req.protocol}://${req.get('host')}`
  res.json({
    data: guests.map((name) => ({
      name,
      url: `${origin}/wedding/${slug}?to=${encodeURIComponent(name)}&k=${sign(slug, name)}`,
    })),
  })
}
