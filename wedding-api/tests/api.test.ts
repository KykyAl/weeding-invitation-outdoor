import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { migrate } from '../scripts/migrate.js'
import { SEED_ADMIN, SEED_SLUG, seed } from '../scripts/seed.js'
import { app } from '../src/app.js'
import { pool } from '../src/db/pool.js'

const silent = () => {}

beforeAll(async () => {
  // Fresh schema for every run.
  await pool.query(
    'DROP TABLE IF EXISTS rsvps, gallery, stories, events, weddings, admin_users, schema_migrations CASCADE',
  )
  await migrate(silent)
  await seed(silent)
})

afterAll(async () => {
  await pool.end()
})

async function adminToken() {
  const res = await request(app).post('/api/v1/auth/login').send(SEED_ADMIN)
  return res.body.data.token as string
}

describe('health', () => {
  it('reports ok and database readiness', async () => {
    expect((await request(app).get('/health')).body).toEqual({ status: 'ok' })
    expect((await request(app).get('/ready')).status).toBe(200)
  })
})

describe('GET /api/v1/weddings/:slug', () => {
  it('returns the whole invitation in one response', async () => {
    const res = await request(app).get(`/api/v1/weddings/${SEED_SLUG}`)
    expect(res.status).toBe(200)
    const w = res.body.data
    expect(w).toMatchObject({
      slug: SEED_SLUG,
      groom: { name: 'Example Groom', fullName: 'Example Groom Full Name' },
      bride: { name: 'Example Bride' },
      weddingDate: '2026-11-11',
      venue: { name: 'Example Wedding Hall' },
      music: null,
    })
    expect(w.events.map((e: { title: string }) => e.title)).toEqual(['Akad Nikah', 'Resepsi'])
    expect(w.events[0]).toMatchObject({ date: '2026-11-11', startTime: '08:00', endTime: '10:00' })
    expect(w.stories).toHaveLength(4)
    expect(w.gallery[0]).toHaveProperty('imageUrl')
  })

  it('404s for an unknown slug', async () => {
    const res = await request(app).get('/api/v1/weddings/does-not-exist')
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: { code: 'WEDDING_NOT_FOUND', message: 'Wedding tidak ditemukan' } })
  })
})

describe('POST /api/v1/weddings/:slug/rsvp', () => {
  it('stores a valid RSVP', async () => {
    const res = await request(app)
      .post(`/api/v1/weddings/${SEED_SLUG}/rsvp`)
      .send({ guestName: 'Andi', attendance: 'attending', guestCount: 2, message: 'Selamat menempuh hidup baru' })
    expect(res.status).toBe(201)
    expect(res.body.message).toBe('RSVP berhasil')
    const { rows } = await pool.query('SELECT guest_name, guest_count FROM rsvps WHERE guest_name = $1', ['Andi'])
    expect(rows).toEqual([{ guest_name: 'Andi', guest_count: 2 }])
  })

  it('rejects invalid input with per-field errors', async () => {
    const res = await request(app)
      .post(`/api/v1/weddings/${SEED_SLUG}/rsvp`)
      .send({ guestName: 'A', attendance: 'maybe', guestCount: 11 })
    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(Object.keys(res.body.error.details).sort()).toEqual(['attendance', 'guestCount', 'guestName'])
  })

  it('404s for an unknown wedding', async () => {
    const res = await request(app)
      .post('/api/v1/weddings/does-not-exist/rsvp')
      .send({ guestName: 'Andi', attendance: 'attending' })
    expect(res.status).toBe(404)
  })
})

describe('POST /api/v1/auth/login', () => {
  it('returns a JWT for valid credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send(SEED_ADMIN)
    expect(res.status).toBe(200)
    expect(res.body.data.token.split('.')).toHaveLength(3)
  })

  it('rejects a wrong password and an unknown user the same way', async () => {
    const wrong = await request(app).post('/api/v1/auth/login').send({ username: SEED_ADMIN.username, password: 'nope' })
    const unknown = await request(app).post('/api/v1/auth/login').send({ username: 'ghost', password: 'nope' })
    expect(wrong.status).toBe(401)
    expect(unknown.status).toBe(401)
    expect(wrong.body).toEqual(unknown.body)
  })
})

describe('admin API', () => {
  it('requires a valid bearer token', async () => {
    expect((await request(app).get('/api/v1/admin/weddings')).status).toBe(401)
    const bad = await request(app).get('/api/v1/admin/weddings').set('Authorization', 'Bearer not.a.token')
    expect(bad.status).toBe(401)
    expect(bad.body.error.code).toBe('INVALID_TOKEN')
  })

  it('lists weddings with a valid token', async () => {
    const res = await request(app)
      .get('/api/v1/admin/weddings')
      .set('Authorization', `Bearer ${await adminToken()}`)
    expect(res.status).toBe(200)
    expect(res.body.data[0]).toMatchObject({ slug: SEED_SLUG })
    expect(JSON.stringify(res.body)).not.toContain('password')
  })

  it('creates a wedding with an event, then deletes it', async () => {
    const auth = { Authorization: `Bearer ${await adminToken()}` }
    const created = await request(app)
      .post('/api/v1/admin/weddings')
      .set(auth)
      .send({ slug: 'another-wedding', groomName: 'Groom', brideName: 'Bride', weddingDate: '2027-01-01' })
    expect(created.status).toBe(201)
    const id = created.body.data.id

    const duplicate = await request(app)
      .post('/api/v1/admin/weddings')
      .set(auth)
      .send({ slug: 'another-wedding', groomName: 'G', brideName: 'B', weddingDate: '2027-01-01' })
    expect(duplicate.status).toBe(409)

    const event = await request(app)
      .post(`/api/v1/admin/weddings/${id}/events`)
      .set(auth)
      .send({ title: 'Akad', eventDate: '2027-01-01', startTime: '08:00' })
    expect(event.status).toBe(201)

    expect((await request(app).get('/api/v1/weddings/another-wedding')).body.data.events).toHaveLength(1)
    expect((await request(app).delete(`/api/v1/admin/weddings/${id}`).set(auth)).status).toBe(200)
    expect((await request(app).get('/api/v1/weddings/another-wedding')).status).toBe(404)
  })
})
