import bcrypt from 'bcrypt'
import type { RequestHandler } from 'express'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { z } from 'zod'
import { env } from '../config/env.js'
import { pool } from '../db/pool.js'
import { AppError } from '../middleware/errorHandler.js'
import { validate } from '../schemas/validate.js'
import type { AdminUserRow } from '../types/wedding.js'

const loginSchema = z.object({
  username: z.string({ error: 'Username wajib diisi' }).trim().min(1, 'Username wajib diisi').max(100),
  password: z.string({ error: 'Password wajib diisi' }).min(1, 'Password wajib diisi').max(200),
})

// Compared against when the username doesn't exist, so response time doesn't reveal valid usernames.
const DUMMY_HASH = '$2b$12$aQzlg0bKMqteqexZyq0Bd.0ji3HzVGMXrgtS4xnB6mkQzd4FMvPv2'

/** POST /api/v1/auth/login → { data: { token } } */
export const login: RequestHandler = async (req, res) => {
  const { username, password } = validate(loginSchema, req.body)

  const { rows } = await pool.query<AdminUserRow>(
    'SELECT id, username, password_hash FROM admin_users WHERE username = $1',
    [username],
  )
  const user = rows[0]
  const valid = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH)
  if (!user || !valid) throw new AppError(401, 'INVALID_CREDENTIALS', 'Username atau password salah')

  const token = jwt.sign({ username: user.username }, env.JWT_SECRET, {
    subject: user.id,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    algorithm: 'HS256',
  })
  res.json({ data: { token } })
}
