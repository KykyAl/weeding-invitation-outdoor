/**
 * Development seed with PLACEHOLDER data only (slug `example-wedding`).
 * Safe to re-run: the example wedding is recreated and the admin user upserted.
 */
import bcrypt from 'bcrypt'
import { fileURLToPath } from 'node:url'
import { pool } from '../src/db/pool.js'

export const SEED_SLUG = 'example-wedding'
export const SEED_ADMIN = { username: 'admin', password: process.env.SEED_ADMIN_PASSWORD ?? 'admin12345' }

export async function seed(log = console.log) {
  if (process.env.NODE_ENV === 'production' && !process.env.SEED_ADMIN_PASSWORD) {
    throw new Error('Set SEED_ADMIN_PASSWORD before seeding in production.')
  }
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM weddings WHERE slug = $1', [SEED_SLUG])

    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO weddings (slug, groom_name, groom_full_name, bride_name, bride_full_name, wedding_date,
         quote, quote_source, venue_name, venue_address, venue_maps_url, music_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id`,
      [
        SEED_SLUG,
        'Example Groom',
        'Example Groom Full Name',
        'Example Bride',
        'Example Bride Full Name',
        '2026-11-11',
        'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu merasa tenteram kepadanya.',
        'QS. Ar-Rum: 21',
        'Example Wedding Hall',
        'Jl. Contoh No. 1, Kota Contoh',
        'https://maps.google.com/?q=Example+Wedding+Hall',
        null,
      ],
    )
    const weddingId = rows[0].id

    const events = [
      ['akad', 'Akad Nikah', '2026-11-11', '08:00', '10:00', 'Example Wedding Hall', 'Jl. Contoh No. 1, Kota Contoh', 1],
      ['reception', 'Resepsi', '2026-11-11', '11:00', '14:00', 'Example Wedding Hall', 'Jl. Contoh No. 1, Kota Contoh', 2],
    ]
    for (const e of events) {
      await client.query(
        `INSERT INTO events (wedding_id, event_type, title, event_date, start_time, end_time, venue_name, venue_address, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [weddingId, ...e],
      )
    }

    const stories = [
      [2019, 'Awal Bertemu', 'Sebuah sore yang tenang dan percakapan yang tak pernah benar-benar usai.', 1],
      [2021, 'Perjalanan Pertama', 'Kota-kota baru dan momen kecil yang perlahan terasa seperti rumah.', 2],
      [2024, 'Memilih Selamanya', 'Dengan restu kedua keluarga, kami berjanji melangkah bersama.', 3],
      [2026, 'Awal dari Selamanya', 'Kini kami berbahagia mengundang Anda di hari istimewa kami.', 4],
    ]
    for (const s of stories) {
      await client.query(
        'INSERT INTO stories (wedding_id, year, title, description, sort_order) VALUES ($1, $2, $3, $4, $5)',
        [weddingId, ...s],
      )
    }

    const gallery = [
      ['https://cdn.example.com/example-wedding/photo-1.webp', 'Foto contoh 1', 1],
      ['https://cdn.example.com/example-wedding/photo-2.webp', 'Foto contoh 2', 2],
      ['https://cdn.example.com/example-wedding/photo-3.webp', null, 3],
    ]
    for (const g of gallery) {
      await client.query('INSERT INTO gallery (wedding_id, image_url, caption, sort_order) VALUES ($1, $2, $3, $4)', [
        weddingId,
        ...g,
      ])
    }

    const hash = await bcrypt.hash(SEED_ADMIN.password, 12)
    await client.query(
      `INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)
       ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [SEED_ADMIN.username, hash],
    )

    await client.query('COMMIT')
    log(`seeded wedding "${SEED_SLUG}" and admin user "${SEED_ADMIN.username}"`)
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed()
    .catch((err) => {
      console.error(err.message)
      process.exitCode = 1
    })
    .finally(() => pool.end())
}
