import type { RequestHandler } from 'express'
import { pool } from '../db/pool.js'
import { AppError } from '../middleware/errorHandler.js'
import {
  eventSchema,
  gallerySchema,
  storySchema,
  uuidParam,
  weddingSchema,
  type EventInput,
  type WeddingInput,
} from '../schemas/weddingSchema.js'
import { validate } from '../schemas/validate.js'
import type {
  EventRow,
  GalleryRow,
  RsvpRow,
  StoryRow,
  Wedding,
  WeddingEvent,
  WeddingPhoto,
  WeddingRow,
  WeddingStory,
} from '../types/wedding.js'

// ---------------------------------------------------------------------------
// Row → API mapping
// ---------------------------------------------------------------------------

export const toEvent = (e: EventRow): WeddingEvent => ({
  id: e.id,
  type: e.event_type,
  title: e.title,
  date: e.event_date,
  startTime: e.start_time,
  endTime: e.end_time,
  venue: e.venue_name || e.venue_address ? { name: e.venue_name, address: e.venue_address } : null,
  sortOrder: e.sort_order,
})

export const toStory = (s: StoryRow): WeddingStory => ({
  id: s.id,
  year: s.year,
  title: s.title,
  description: s.description,
  sortOrder: s.sort_order,
})

export const toPhoto = (g: GalleryRow): WeddingPhoto => ({
  id: g.id,
  imageUrl: g.image_url,
  caption: g.caption,
  sortOrder: g.sort_order,
})

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const EVENT_COLUMNS = `id, wedding_id, event_type, title, event_date,
  to_char(start_time, 'HH24:MI') AS start_time, to_char(end_time, 'HH24:MI') AS end_time,
  venue_name, venue_address, sort_order`

const SELECT_EVENT = `SELECT ${EVENT_COLUMNS} FROM events WHERE id = $1`

/** A wedding with its events, stories and gallery, or `null`. */
export async function loadWedding(where: 'slug' | 'id', value: string): Promise<Wedding | null> {
  const sql = where === 'slug' ? 'SELECT * FROM weddings WHERE slug = $1' : 'SELECT * FROM weddings WHERE id = $1'
  const { rows } = await pool.query<WeddingRow>(sql, [value])
  const w = rows[0]
  if (!w) return null

  const [events, stories, gallery] = await Promise.all([
    pool.query<EventRow>(
      `SELECT ${EVENT_COLUMNS} FROM events WHERE wedding_id = $1 ORDER BY sort_order, event_date, start_time`,
      [w.id],
    ),
    pool.query<StoryRow>(
      'SELECT id, wedding_id, year, title, description, sort_order FROM stories WHERE wedding_id = $1 ORDER BY sort_order, year',
      [w.id],
    ),
    pool.query<GalleryRow>(
      'SELECT id, wedding_id, image_url, caption, sort_order FROM gallery WHERE wedding_id = $1 ORDER BY sort_order, created_at',
      [w.id],
    ),
  ])

  return {
    id: w.id,
    slug: w.slug,
    groom: { name: w.groom_name, fullName: w.groom_full_name },
    bride: { name: w.bride_name, fullName: w.bride_full_name },
    weddingDate: w.wedding_date,
    quote: w.quote ? { text: w.quote, source: w.quote_source } : null,
    venue: { name: w.venue_name, address: w.venue_address, mapsUrl: w.venue_maps_url },
    events: events.rows.map(toEvent),
    stories: stories.rows.map(toStory),
    gallery: gallery.rows.map(toPhoto),
    music: w.music_url ? { url: w.music_url } : null,
  }
}

/** Same shape as the public RSVP response. */
export const toRsvp = (r: RsvpRow) => ({
  id: r.id,
  guestName: r.guest_name,
  attendance: r.attendance,
  guestCount: r.guest_count,
  message: r.message,
  createdAt: r.created_at,
})

export const weddingNotFound = () => new AppError(404, 'WEDDING_NOT_FOUND', 'Wedding tidak ditemukan')

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

/** GET /api/v1/weddings/:slug — everything the invitation page needs, in one response. */
export const getPublicWedding: RequestHandler<{ slug: string }> = async (req, res) => {
  const wedding = await loadWedding('slug', req.params.slug)
  if (!wedding) throw weddingNotFound()
  res.json({ data: wedding })
}

// ---------------------------------------------------------------------------
// Admin — weddings
// ---------------------------------------------------------------------------

const eventNotFound = () => new AppError(404, 'EVENT_NOT_FOUND', 'Event tidak ditemukan')
const storyNotFound = () => new AppError(404, 'STORY_NOT_FOUND', 'Story tidak ditemukan')
const photoNotFound = () => new AppError(404, 'GALLERY_NOT_FOUND', 'Foto tidak ditemukan')

const weddingValues = (w: WeddingInput) => [
  w.slug,
  w.groomName,
  w.groomFullName,
  w.brideName,
  w.brideFullName,
  w.weddingDate,
  w.quote,
  w.quoteSource,
  w.venueName,
  w.venueAddress,
  w.venueMapsUrl,
  w.musicUrl,
]

/** GET /admin/weddings */
export const listWeddings: RequestHandler = async (_req, res) => {
  const { rows } = await pool.query<WeddingRow & { rsvp_count: number }>(
    `SELECT w.*, (SELECT count(*) FROM rsvps r WHERE r.wedding_id = w.id)::int AS rsvp_count
     FROM weddings w
     ORDER BY w.wedding_date DESC, w.created_at DESC`,
  )
  res.json({
    data: rows.map((w) => ({
      id: w.id,
      slug: w.slug,
      groomName: w.groom_name,
      brideName: w.bride_name,
      weddingDate: w.wedding_date,
      venueName: w.venue_name,
      rsvpCount: w.rsvp_count,
      createdAt: w.created_at,
      updatedAt: w.updated_at,
    })),
  })
}

/** GET /admin/weddings/:id — the public shape plus the RSVPs received. */
export const getWedding: RequestHandler<{ id: string }> = async (req, res) => {
  const id = uuidParam(req.params.id, weddingNotFound)
  const wedding = await loadWedding('id', id)
  if (!wedding) throw weddingNotFound()
  const rsvps = await pool.query<RsvpRow>('SELECT * FROM rsvps WHERE wedding_id = $1 ORDER BY created_at DESC', [id])
  res.json({ data: { ...wedding, rsvps: rsvps.rows.map(toRsvp) } })
}

/** POST /admin/weddings */
export const createWedding: RequestHandler = async (req, res) => {
  const input = validate(weddingSchema, req.body)
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO weddings (slug, groom_name, groom_full_name, bride_name, bride_full_name, wedding_date,
       quote, quote_source, venue_name, venue_address, venue_maps_url, music_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING id`,
    weddingValues(input),
  )
  res.status(201).json({ message: 'Wedding berhasil dibuat', data: await loadWedding('id', rows[0].id) })
}

/** PUT /admin/weddings/:id — full replace; omitted optional fields become null. */
export const updateWedding: RequestHandler<{ id: string }> = async (req, res) => {
  const id = uuidParam(req.params.id, weddingNotFound)
  const input = validate(weddingSchema, req.body)
  const { rowCount } = await pool.query(
    `UPDATE weddings SET slug = $2, groom_name = $3, groom_full_name = $4, bride_name = $5, bride_full_name = $6,
       wedding_date = $7, quote = $8, quote_source = $9, venue_name = $10, venue_address = $11,
       venue_maps_url = $12, music_url = $13, updated_at = now()
     WHERE id = $1`,
    [id, ...weddingValues(input)],
  )
  if (!rowCount) throw weddingNotFound()
  res.json({ message: 'Wedding berhasil diperbarui', data: await loadWedding('id', id) })
}

/** DELETE /admin/weddings/:id — events, stories, gallery and RSVPs go with it (ON DELETE CASCADE). */
export const deleteWedding: RequestHandler<{ id: string }> = async (req, res) => {
  const id = uuidParam(req.params.id, weddingNotFound)
  const { rowCount } = await pool.query('DELETE FROM weddings WHERE id = $1', [id])
  if (!rowCount) throw weddingNotFound()
  res.json({ message: 'Wedding berhasil dihapus' })
}

// ---------------------------------------------------------------------------
// Admin — events
// ---------------------------------------------------------------------------

const eventValues = (e: EventInput) => [
  e.eventType,
  e.title,
  e.eventDate,
  e.startTime,
  e.endTime,
  e.venueName,
  e.venueAddress,
  e.sortOrder,
]

/** POST /admin/weddings/:id/events */
export const createEvent: RequestHandler<{ id: string }> = async (req, res) => {
  const weddingId = uuidParam(req.params.id, weddingNotFound)
  const input = validate(eventSchema, req.body)
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO events (wedding_id, event_type, title, event_date, start_time, end_time, venue_name, venue_address, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [weddingId, ...eventValues(input)],
  )
  const created = await pool.query<EventRow>(SELECT_EVENT, [rows[0].id])
  res.status(201).json({ message: 'Event berhasil dibuat', data: toEvent(created.rows[0]) })
}

/** PUT /admin/events/:eventId */
export const updateEvent: RequestHandler<{ eventId: string }> = async (req, res) => {
  const id = uuidParam(req.params.eventId, eventNotFound)
  const input = validate(eventSchema, req.body)
  const { rowCount } = await pool.query(
    `UPDATE events SET event_type = $2, title = $3, event_date = $4, start_time = $5, end_time = $6,
       venue_name = $7, venue_address = $8, sort_order = $9
     WHERE id = $1`,
    [id, ...eventValues(input)],
  )
  if (!rowCount) throw eventNotFound()
  const updated = await pool.query<EventRow>(SELECT_EVENT, [id])
  res.json({ message: 'Event berhasil diperbarui', data: toEvent(updated.rows[0]) })
}

/** DELETE /admin/events/:eventId */
export const deleteEvent: RequestHandler<{ eventId: string }> = async (req, res) => {
  const id = uuidParam(req.params.eventId, eventNotFound)
  const { rowCount } = await pool.query('DELETE FROM events WHERE id = $1', [id])
  if (!rowCount) throw eventNotFound()
  res.json({ message: 'Event berhasil dihapus' })
}

// ---------------------------------------------------------------------------
// Admin — stories
// ---------------------------------------------------------------------------

/** POST /admin/weddings/:id/stories */
export const createStory: RequestHandler<{ id: string }> = async (req, res) => {
  const weddingId = uuidParam(req.params.id, weddingNotFound)
  const s = validate(storySchema, req.body)
  const { rows } = await pool.query<StoryRow>(
    `INSERT INTO stories (wedding_id, year, title, description, sort_order)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, wedding_id, year, title, description, sort_order`,
    [weddingId, s.year, s.title, s.description, s.sortOrder],
  )
  res.status(201).json({ message: 'Story berhasil dibuat', data: toStory(rows[0]) })
}

/** PUT /admin/stories/:storyId */
export const updateStory: RequestHandler<{ storyId: string }> = async (req, res) => {
  const id = uuidParam(req.params.storyId, storyNotFound)
  const s = validate(storySchema, req.body)
  const { rows } = await pool.query<StoryRow>(
    `UPDATE stories SET year = $2, title = $3, description = $4, sort_order = $5
     WHERE id = $1
     RETURNING id, wedding_id, year, title, description, sort_order`,
    [id, s.year, s.title, s.description, s.sortOrder],
  )
  if (!rows[0]) throw storyNotFound()
  res.json({ message: 'Story berhasil diperbarui', data: toStory(rows[0]) })
}

/** DELETE /admin/stories/:storyId */
export const deleteStory: RequestHandler<{ storyId: string }> = async (req, res) => {
  const id = uuidParam(req.params.storyId, storyNotFound)
  const { rowCount } = await pool.query('DELETE FROM stories WHERE id = $1', [id])
  if (!rowCount) throw storyNotFound()
  res.json({ message: 'Story berhasil dihapus' })
}

// ---------------------------------------------------------------------------
// Admin — gallery (URLs only; no uploads yet)
// ---------------------------------------------------------------------------

/** POST /admin/weddings/:id/gallery */
export const createPhoto: RequestHandler<{ id: string }> = async (req, res) => {
  const weddingId = uuidParam(req.params.id, weddingNotFound)
  const g = validate(gallerySchema, req.body)
  const { rows } = await pool.query<GalleryRow>(
    `INSERT INTO gallery (wedding_id, image_url, caption, sort_order)
     VALUES ($1, $2, $3, $4)
     RETURNING id, wedding_id, image_url, caption, sort_order`,
    [weddingId, g.imageUrl, g.caption, g.sortOrder],
  )
  res.status(201).json({ message: 'Foto berhasil ditambahkan', data: toPhoto(rows[0]) })
}

/** PUT /admin/gallery/:galleryId */
export const updatePhoto: RequestHandler<{ galleryId: string }> = async (req, res) => {
  const id = uuidParam(req.params.galleryId, photoNotFound)
  const g = validate(gallerySchema, req.body)
  const { rows } = await pool.query<GalleryRow>(
    `UPDATE gallery SET image_url = $2, caption = $3, sort_order = $4
     WHERE id = $1
     RETURNING id, wedding_id, image_url, caption, sort_order`,
    [id, g.imageUrl, g.caption, g.sortOrder],
  )
  if (!rows[0]) throw photoNotFound()
  res.json({ message: 'Foto berhasil diperbarui', data: toPhoto(rows[0]) })
}

/** DELETE /admin/gallery/:galleryId */
export const deletePhoto: RequestHandler<{ galleryId: string }> = async (req, res) => {
  const id = uuidParam(req.params.galleryId, photoNotFound)
  const { rowCount } = await pool.query('DELETE FROM gallery WHERE id = $1', [id])
  if (!rowCount) throw photoNotFound()
  res.json({ message: 'Foto berhasil dihapus' })
}
