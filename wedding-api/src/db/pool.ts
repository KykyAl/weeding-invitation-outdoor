import pg from 'pg'
import { env } from '../config/env.js'

// Return DATE columns as-is ("2026-11-11") instead of a JS Date at local
// midnight, which can shift the day depending on the server's time zone.
pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value)

/** One shared connection pool for the whole app. */
export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

// An idle client erroring (e.g. the database restarted) must not crash the process.
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message)
})
