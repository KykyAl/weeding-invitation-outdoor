/**
 * Runs `migrations/*.sql` in filename order, each in its own transaction.
 * Applied files are recorded in `schema_migrations`, so running it again only
 * applies new files.
 */
import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { pool } from '../src/db/pool.js'

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations')

export async function migrate(log = console.log) {
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    filename   TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`)
  const { rows } = await pool.query<{ filename: string }>('SELECT filename FROM schema_migrations')
  const applied = new Set(rows.map((r) => r.filename))
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort()

  for (const file of files) {
    if (applied.has(file)) continue
    const sql = await readFile(path.join(dir, file), 'utf8')
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file])
      await client.query('COMMIT')
      log(`applied ${file}`)
    } catch (err) {
      await client.query('ROLLBACK')
      throw new Error(`Migration ${file} failed: ${(err as Error).message}`)
    } finally {
      client.release()
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate()
    .then(() => console.log('migrations up to date'))
    .catch((err) => {
      console.error(err.message)
      process.exitCode = 1
    })
    .finally(() => pool.end())
}
