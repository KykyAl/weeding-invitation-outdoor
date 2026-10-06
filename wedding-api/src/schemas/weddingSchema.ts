import { z } from 'zod'
import { AppError } from '../middleware/errorHandler.js'
import { SKIN_TONES } from '../types/wedding.js'
import { optionalText } from './validate.js'

const requiredText = (max: number, label: string) =>
  z
    .string({ error: `${label} wajib diisi` })
    .trim()
    .min(1, `${label} wajib diisi`)
    .max(max, `${label} maksimal ${max} karakter`)

const date = (label: string) => z.iso.date({ error: `${label} harus format YYYY-MM-DD` })

const time = (label: string) =>
  z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, `${label} harus format HH:MM`)
    .nullish()
    .transform((v) => v ?? null)

/** Only http(s) links, so nothing like `javascript:` can be stored and rendered as a link. */
const httpUrl = (label: string) => z.url({ protocol: /^https?$/, error: `${label} harus URL http(s) yang valid` }).max(2000)
const optionalUrl = (label: string) =>
  httpUrl(label)
    .nullish()
    .transform((v) => v ?? null)

const sortOrder = z.number({ error: 'Urutan harus berupa angka' }).int().min(0).default(0)

export const weddingSchema = z.object({
  slug: z
    .string({ error: 'Slug wajib diisi' })
    .trim()
    .toLowerCase()
    .max(100, 'Slug maksimal 100 karakter')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
  groomName: requiredText(100, 'Nama mempelai pria'),
  groomFullName: optionalText(150, 'Nama lengkap mempelai pria'),
  brideName: requiredText(100, 'Nama mempelai wanita'),
  brideFullName: optionalText(150, 'Nama lengkap mempelai wanita'),
  weddingDate: date('Tanggal pernikahan'),
  quote: optionalText(5000, 'Kutipan'),
  quoteSource: optionalText(255, 'Sumber kutipan'),
  venueName: optionalText(255, 'Nama venue'),
  venueAddress: optionalText(2000, 'Alamat venue'),
  venueMapsUrl: optionalUrl('Link maps'),
  musicUrl: optionalUrl('Link musik'),
  // Illustrated couple (not photos).
  brideHijab: z.boolean({ error: 'Hijab harus true atau false' }).default(false),
  groomSkinTone: z.enum(SKIN_TONES, { error: `Warna kulit harus salah satu dari: ${SKIN_TONES.join(', ')}` }).default('langsat'),
  brideSkinTone: z.enum(SKIN_TONES, { error: `Warna kulit harus salah satu dari: ${SKIN_TONES.join(', ')}` }).default('langsat'),
  /** Transparent cut-out photo of the couple; replaces the illustration when set. */
  couplePhotoUrl: optionalUrl('Foto pasangan'),
})

export const eventSchema = z
  .object({
    eventType: optionalText(50, 'Jenis acara'),
    title: optionalText(150, 'Judul acara'),
    eventDate: date('Tanggal acara')
      .nullish()
      .transform((v) => v ?? null),
    startTime: time('Jam mulai'),
    endTime: time('Jam selesai'),
    venueName: optionalText(255, 'Nama venue'),
    venueAddress: optionalText(2000, 'Alamat venue'),
    sortOrder,
  })
  .refine((e) => !e.startTime || !e.endTime || e.endTime > e.startTime, {
    path: ['endTime'],
    message: 'Jam selesai harus setelah jam mulai',
  })

export const storySchema = z.object({
  year: z
    .number({ error: 'Tahun harus berupa angka' })
    .int()
    .min(1900, 'Tahun tidak valid')
    .max(2200, 'Tahun tidak valid')
    .nullish()
    .transform((v) => v ?? null),
  title: optionalText(150, 'Judul'),
  description: optionalText(5000, 'Deskripsi'),
  sortOrder,
})

export const gallerySchema = z.object({
  imageUrl: httpUrl('URL gambar'),
  caption: optionalText(1000, 'Keterangan'),
  sortOrder,
})

export type WeddingInput = z.infer<typeof weddingSchema>
export type EventInput = z.infer<typeof eventSchema>
export type StoryInput = z.infer<typeof storySchema>
export type GalleryInput = z.infer<typeof gallerySchema>

/** Route ids must be UUIDs; anything else simply doesn't exist. */
export function uuidParam(value: string, notFound: () => AppError): string {
  if (!z.uuid().safeParse(value).success) throw notFound()
  return value
}
