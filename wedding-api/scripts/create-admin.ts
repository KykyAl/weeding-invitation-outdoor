/**
 * Creates an admin user, or resets their password, without touching any wedding data.
 *
 *   ADMIN_USERNAME=admin ADMIN_PASSWORD='a-long-password' npm run create-admin
 */
import bcrypt from 'bcrypt'
import { pool } from '../src/db/pool.js'

const username = process.env.ADMIN_USERNAME?.trim()
const password = process.env.ADMIN_PASSWORD ?? ''

async function main() {
  if (!username) throw new Error('Set ADMIN_USERNAME.')
  if (password.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters.')
  const hash = await bcrypt.hash(password, 12)
  await pool.query(
    `INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [username, hash],
  )
  console.log(`admin user "${username}" is ready`)
}

main()
  .catch((err) => {
    console.error(err.message)
    process.exitCode = 1
  })
  .finally(() => pool.end())
