/** Database rows (snake_case, as returned by `pg`). */
export interface WeddingRow {
  id: string
  slug: string
  groom_name: string
  groom_full_name: string | null
  bride_name: string
  bride_full_name: string | null
  wedding_date: string
  quote: string | null
  quote_source: string | null
  venue_name: string | null
  venue_address: string | null
  venue_maps_url: string | null
  music_url: string | null
  created_at: Date
  updated_at: Date
}

export interface EventRow {
  id: string
  wedding_id: string
  event_type: string | null
  title: string | null
  event_date: string | null
  /** "HH:MM" (formatted in SQL). */
  start_time: string | null
  end_time: string | null
  venue_name: string | null
  venue_address: string | null
  sort_order: number
}

export interface StoryRow {
  id: string
  wedding_id: string
  year: number | null
  title: string | null
  description: string | null
  sort_order: number
}

export interface GalleryRow {
  id: string
  wedding_id: string
  image_url: string
  caption: string | null
  sort_order: number
}

export interface RsvpRow {
  id: string
  wedding_id: string
  guest_name: string
  attendance: 'attending' | 'not_attending'
  guest_count: number
  message: string | null
  created_at: Date
}

export interface AdminUserRow {
  id: string
  username: string
  password_hash: string
}

/** API shapes (camelCase, what the React frontend consumes). */
export interface WeddingEvent {
  id: string
  type: string | null
  title: string | null
  date: string | null
  startTime: string | null
  endTime: string | null
  venue: { name: string | null; address: string | null } | null
  sortOrder: number
}

export interface WeddingStory {
  id: string
  year: number | null
  title: string | null
  description: string | null
  sortOrder: number
}

export interface WeddingPhoto {
  id: string
  imageUrl: string
  caption: string | null
  sortOrder: number
}

export interface Wedding {
  id: string
  slug: string
  groom: { name: string; fullName: string | null }
  bride: { name: string; fullName: string | null }
  weddingDate: string
  quote: { text: string; source: string | null } | null
  venue: { name: string | null; address: string | null; mapsUrl: string | null }
  events: WeddingEvent[]
  stories: WeddingStory[]
  gallery: WeddingPhoto[]
  music: { url: string } | null
}
