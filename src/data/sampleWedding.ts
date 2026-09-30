/**
 * DEVELOPMENT SAMPLE ONLY.
 *
 * Placeholder content used when `VITE_USE_SAMPLE_DATA=true` in dev. It is never
 * bundled into production builds (see `services/config.ts`). Real invitations
 * always come from `GET /api/v1/weddings/:slug`.
 */
import type { Wedding } from '@/types'
import { samplePhotos } from './samplePhotos'

const venue = {
  name: 'Gedung Serbaguna',
  address: 'Jl. Contoh No. 1, Kota Contoh',
  mapUrl: 'https://maps.google.com/?q=-6.200000,106.816666',
  coordinates: { lat: -6.2, lng: 106.816666 },
}

const sampleWedding: Wedding = {
  slug: 'sample-wedding',
  groom: {
    fullName: 'Nama Lengkap Mempelai Pria',
    nickname: 'Pria',
    childOrder: 'Putra pertama dari',
    father: 'Bapak Ayah Mempelai Pria',
    mother: 'Ibu Mempelai Pria',
    appearance: { skinTone: 'medium' },
  },
  bride: {
    fullName: 'Nama Lengkap Mempelai Wanita',
    nickname: 'Wanita',
    childOrder: 'Putri kedua dari',
    father: 'Bapak Ayah Mempelai Wanita',
    mother: 'Ibu Mempelai Wanita',
    appearance: { hijab: true, skinTone: 'medium' },
  },
  date: '2026-12-12T08:00:00+07:00',
  timeZone: 'Asia/Jakarta',
  venue,
  quote: {
    text: 'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu merasa tenteram kepadanya.',
    source: 'QS. Ar-Rum: 21',
  },
  story: [
    {
      id: 's1',
      period: '2019',
      title: 'Awal Bertemu',
      description: 'Sebuah sore yang tenang, satu meja yang sama, dan percakapan yang tak pernah benar-benar usai.',
    },
    {
      id: 's2',
      period: '2021',
      title: 'Perjalanan Pertama',
      description: 'Kota-kota baru, jalan panjang, dan momen kecil yang perlahan terasa seperti rumah.',
    },
    {
      id: 's3',
      period: '2024',
      title: 'Memilih Selamanya',
      description: 'Dengan restu kedua keluarga, kami berjanji melangkah bersama untuk seterusnya.',
    },
    {
      id: 's4',
      period: '2026',
      title: 'Awal dari Selamanya',
      description: 'Kini, kami berbahagia mengundang Anda untuk hadir di hari istimewa kami.',
    },
  ],
  events: [
    {
      id: 'akad',
      type: 'akad',
      title: 'Akad Nikah',
      startAt: '2026-12-12T08:00:00+07:00',
      endAt: '2026-12-12T10:00:00+07:00',
      timeZone: 'Asia/Jakarta',
      timeZoneLabel: 'WIB',
      venue,
    },
    {
      id: 'reception',
      type: 'reception',
      title: 'Resepsi',
      startAt: '2026-12-12T11:00:00+07:00',
      endAt: '2026-12-12T14:00:00+07:00',
      timeZone: 'Asia/Jakarta',
      timeZoneLabel: 'WIB',
      venue,
    },
  ],
  gallery: samplePhotos,
  music: undefined,
  rsvp: { enabled: true, maxGuests: 4, deadline: '2026-12-05T23:59:00+07:00' },
}

export function getSampleWedding(slug: string): Wedding {
  return { ...sampleWedding, slug }
}
