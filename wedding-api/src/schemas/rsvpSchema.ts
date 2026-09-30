import { z } from 'zod'
import { optionalText } from './validate.js'

export const rsvpSchema = z.object({
  guestName: z
    .string({ error: 'Nama wajib diisi' })
    .trim()
    .min(2, 'Nama minimal 2 karakter')
    .max(150, 'Nama maksimal 150 karakter'),
  attendance: z.enum(['attending', 'not_attending'], { error: 'Kehadiran harus attending atau not_attending' }),
  guestCount: z
    .number({ error: 'Jumlah tamu harus berupa angka' })
    .int('Jumlah tamu harus bilangan bulat')
    .min(1, 'Jumlah tamu minimal 1')
    .max(10, 'Jumlah tamu maksimal 10')
    .default(1),
  message: optionalText(1000, 'Ucapan'),
})

export type RsvpInput = z.infer<typeof rsvpSchema>
