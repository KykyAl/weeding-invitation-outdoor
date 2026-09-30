/**
 * Domain types for a wedding invitation.
 *
 * Everything the invitation renders comes from these shapes, which mirror the
 * backend payload of `GET /api/v1/weddings/:slug`. Nothing here is tied to a
 * specific couple, venue or date.
 */

/** ISO-8601 date-time string, e.g. `2026-12-12T08:00:00+07:00`. */
export type ISODateTime = string

export interface ImageAsset {
  url: string
  /** Optional smaller variant (e.g. WebP thumbnail) for lazy/progressive loading. */
  thumbnailUrl?: string
  alt: string
  caption?: string
  width?: number
  height?: number
}

export type SkinTone = 'light' | 'medium' | 'tan' | 'deep'

/** How the person is drawn in the illustrated scenes. */
export interface PersonAppearance {
  /** Illustrated bride wears a hijab. */
  hijab?: boolean
  skinTone?: SkinTone
}

export interface Person {
  fullName: string
  nickname: string
  /** e.g. "Putra pertama dari" / "First son of". Free text from the backend. */
  childOrder?: string
  father?: string
  mother?: string
  instagram?: string
  photo?: ImageAsset
  appearance?: PersonAppearance
}

export type WeddingEventType = 'akad' | 'reception' | 'other'

export interface WeddingEvent {
  id: string
  type: WeddingEventType
  /** Display title, e.g. "Akad Nikah", "Resepsi". */
  title: string
  startAt: ISODateTime
  endAt?: ISODateTime
  /** IANA time zone used to display the time, e.g. `Asia/Jakarta`. */
  timeZone?: string
  /** Label shown next to the time, e.g. "WIB". */
  timeZoneLabel?: string
  venue: Venue
}

export interface Venue {
  name: string
  address: string
  /** Google Maps (or other) URL opened by the venue map button. */
  mapUrl?: string
  coordinates?: { lat: number; lng: number }
  /** Optional venue illustration/photo; the illustrated hall is used otherwise. */
  image?: ImageAsset
}

export interface StoryChapter {
  id: string
  /** Display label for the moment, usually a year: "2019". */
  period: string
  title: string
  description?: string
  image?: ImageAsset
}

export interface Quote {
  text: string
  source?: string
}

export interface Music {
  url: string
  title?: string
  artist?: string
  /** Try to start playing after the guest opens the invitation. */
  autoplay?: boolean
  loop?: boolean
  volume?: number
}

export interface RsvpSettings {
  /** Hide the RSVP scene entirely when false. */
  enabled?: boolean
  /** Maximum guests per invitation (including the invitee). */
  maxGuests?: number
  /** After this moment the form is closed. */
  deadline?: ISODateTime
}

export interface Wedding {
  slug: string
  groom: Person
  bride: Person
  /** Main wedding date used on the opening / save-the-date. */
  date: ISODateTime
  timeZone?: string
  /** Primary venue shown in the Venue scene. */
  venue: Venue
  quote?: Quote
  story: StoryChapter[]
  events: WeddingEvent[]
  gallery: ImageAsset[]
  music?: Music
  rsvp?: RsvpSettings
  /** Order of names in the headline. Defaults to groom first. */
  nameOrder?: 'groom-first' | 'bride-first'
}
