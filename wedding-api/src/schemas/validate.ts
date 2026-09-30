import { z } from 'zod'
import { AppError } from '../middleware/errorHandler.js'

/** Parses `data` or throws a 422 with per-field messages: `{ details: { field: ["…"] } }`. */
export function validate<T extends z.ZodType>(schema: T, data: unknown): z.output<T> {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Data tidak valid', z.flattenError(result.error).fieldErrors)
  }
  return result.data
}

/** Optional text: trims, and turns "" / null / missing into null. */
export const optionalText = (max: number, label: string) =>
  z
    .string({ error: `${label} harus berupa teks` })
    .trim()
    .max(max, `${label} maksimal ${max} karakter`)
    .nullish()
    .transform((v) => v || null)
