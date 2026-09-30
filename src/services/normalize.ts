/**
 * Runtime validation + normalisation of backend payloads (wedding-api).
 *
 * wedding-api sends e.g. `groom.name`, `weddingDate`, `stories[].year`,
 * `gallery[].imageUrl`, `venue.mapsUrl` and events as `date` + `startTime`;
 * this maps them onto the frontend `Wedding` model. Richer optional fields
 * (appearance, timeZone, rsvp settings…) are accepted when present.
 *
 * The backend is the source of truth, but a wedding page must never crash on a
 * half-filled record: optional fields are tolerated (nulls, missing lists,
 * broken items are dropped), sensible fallbacks are derived, and only data the
 * invitation truly cannot render without raises a `WeddingDataError`.
 */
import type {
  ImageAsset,
  Music,
  Person,
  PersonAppearance,
  Quote,
  RsvpResponse,
  RsvpSettings,
  SkinTone,
  StoryChapter,
  Venue,
  Wedding,
  WeddingEvent,
  WeddingEventType,
} from '@/types'

export class WeddingDataError extends Error {
  readonly missing: string[]

  constructor(missing: string[]) {
    super(`Wedding data is missing: ${missing.join(', ')}`)
    this.name = 'WeddingDataError'
    this.missing = missing
  }
}

type Raw = Record<string, unknown>

const isObj = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v)
const obj = (v: unknown): Raw => (isObj(v) ? v : {})

const str = (v: unknown): string | undefined => {
  if (typeof v === 'number') return String(v)
  if (typeof v !== 'string') return undefined
  const s = v.trim()
  return s || undefined
}

const num = (v: unknown): number | undefined => {
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : undefined
}

const bool = (v: unknown): boolean | undefined => (typeof v === 'boolean' ? v : undefined)

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/
const TIME = /^\d{2}:\d{2}(:\d{2})?$/

/**
 * Valid date string, or undefined. A bare `YYYY-MM-DD` would parse as UTC
 * midnight and show the previous day west of UTC, so it becomes local noon.
 */
const date = (v: unknown): string | undefined => {
  let s = str(v)
  if (s && DATE_ONLY.test(s)) s = `${s}T12:00:00`
  return s && !Number.isNaN(new Date(s).getTime()) ? s : undefined
}

/** Combines `2026-11-11` + `08:00` into a local wall-clock date-time. */
const dateTime = (day: unknown, time: unknown): string | undefined => {
  const d = str(day)
  const t = str(time)
  if (!d || !DATE_ONLY.test(d)) return undefined
  return date(t && TIME.test(t) ? `${d}T${t.length === 5 ? `${t}:00` : t}` : d)
}

const oneOf = <T extends string>(v: unknown, allowed: readonly T[]): T | undefined =>
  allowed.includes(v as T) ? (v as T) : undefined

/** Maps a list, dropping items the parser rejects. */
const list = <T>(v: unknown, parse: (item: Raw, index: number) => T | undefined): T[] =>
  Array.isArray(v) ? v.flatMap((item, i) => (isObj(item) ? (parse(item, i) ?? []) : [])) : []

const SKIN_TONES: readonly SkinTone[] = ['light', 'medium', 'tan', 'deep']
const EVENT_TYPES: readonly WeddingEventType[] = ['akad', 'reception', 'other']

function image(raw: Raw, fallbackAlt: string): ImageAsset | undefined {
  const url = str(raw.url) ?? str(raw.imageUrl)
  if (!url) return undefined
  return {
    url,
    thumbnailUrl: str(raw.thumbnailUrl),
    alt: str(raw.alt) ?? str(raw.caption) ?? fallbackAlt,
    caption: str(raw.caption),
    width: num(raw.width),
    height: num(raw.height),
  }
}

function appearance(raw: unknown): PersonAppearance | undefined {
  if (!isObj(raw)) return undefined
  return { hijab: bool(raw.hijab), skinTone: oneOf(raw.skinTone, SKIN_TONES) }
}

function person(raw: unknown): Person | undefined {
  const p = obj(raw)
  const fullName = str(p.fullName)
  const nickname = str(p.nickname) ?? str(p.name) ?? fullName?.split(/\s+/)[0]
  if (!fullName && !nickname) return undefined
  return {
    fullName: fullName ?? nickname!,
    nickname: nickname!,
    childOrder: str(p.childOrder),
    father: str(p.father),
    mother: str(p.mother),
    instagram: str(p.instagram),
    photo: isObj(p.photo) ? image(p.photo, fullName ?? nickname!) : undefined,
    appearance: appearance(p.appearance),
  }
}

function venue(raw: unknown): Venue | undefined {
  const v = obj(raw)
  const name = str(v.name)
  if (!name) return undefined
  const c = obj(v.coordinates)
  const lat = num(c.lat)
  const lng = num(c.lng)
  return {
    name,
    address: str(v.address) ?? '',
    mapUrl: str(v.mapUrl) ?? str(v.mapsUrl),
    coordinates: lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
    image: isObj(v.image) ? image(v.image, name) : undefined,
  }
}

const DEFAULT_EVENT_TITLE: Record<WeddingEventType, string> = {
  akad: 'Akad Nikah',
  reception: 'Resepsi',
  other: 'Acara',
}

function event(raw: Raw, i: number, fallbackVenue?: Venue, fallbackTz?: string): WeddingEvent | undefined {
  const startAt = date(raw.startAt) ?? dateTime(raw.date, raw.startTime)
  const eventVenue = venue(raw.venue) ?? fallbackVenue
  if (!startAt || !eventVenue) return undefined
  const type = oneOf(raw.type, EVENT_TYPES) ?? 'other'
  const endAt = date(raw.endAt) ?? (str(raw.endTime) ? dateTime(raw.date, raw.endTime) : undefined)
  return {
    id: str(raw.id) ?? `event-${i}`,
    type,
    title: str(raw.title) ?? DEFAULT_EVENT_TITLE[type],
    startAt,
    endAt: endAt && new Date(endAt) > new Date(startAt) ? endAt : undefined,
    timeZone: str(raw.timeZone) ?? fallbackTz,
    timeZoneLabel: str(raw.timeZoneLabel),
    venue: eventVenue,
  }
}

function chapter(raw: Raw, i: number): StoryChapter | undefined {
  const title = str(raw.title)
  const period = str(raw.period) ?? str(raw.year)
  if (!title && !period) return undefined
  return {
    id: str(raw.id) ?? `story-${i}`,
    period: period ?? '',
    title: title ?? '',
    description: str(raw.description),
    image: isObj(raw.image) ? image(raw.image, title ?? period ?? '') : undefined,
  }
}

function quote(raw: unknown): Quote | undefined {
  const q = obj(raw)
  const text = str(q.text)
  return text ? { text, source: str(q.source) } : undefined
}

function music(raw: unknown): Music | undefined {
  const m = obj(raw)
  const url = str(m.url)
  if (!url) return undefined
  const volume = num(m.volume)
  return {
    url,
    title: str(m.title),
    artist: str(m.artist),
    autoplay: bool(m.autoplay),
    loop: bool(m.loop),
    volume: volume === undefined ? undefined : Math.min(1, Math.max(0, volume)),
  }
}

function rsvpSettings(raw: unknown): RsvpSettings | undefined {
  if (!isObj(raw)) return undefined
  const max = num(raw.maxGuests)
  return {
    enabled: bool(raw.enabled),
    maxGuests: max === undefined ? undefined : Math.max(1, Math.floor(max)),
    deadline: date(raw.deadline),
  }
}

/** Parses `GET /weddings/:slug` data into a render-safe `Wedding`. */
export function parseWedding(raw: unknown, requestedSlug: string): Wedding {
  const w = obj(raw)
  const timeZone = str(w.timeZone)
  const mainVenue = venue(w.venue)
  const events = list(w.events, (e, i) => event(e, i, mainVenue, timeZone)).sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  )

  const groom = person(w.groom)
  const bride = person(w.bride)
  // Fall back to the first event when the headline date / venue is not set.
  const weddingDate = date(w.weddingDate) ?? date(w.date) ?? events[0]?.startAt
  const weddingVenue = mainVenue ?? events[0]?.venue

  const missing = [
    !groom && 'groom.fullName',
    !bride && 'bride.fullName',
    !weddingDate && 'date',
    !weddingVenue && 'venue.name',
  ].filter((f): f is string => !!f)
  if (missing.length) throw new WeddingDataError(missing)

  return {
    slug: str(w.slug) ?? requestedSlug,
    groom: groom!,
    bride: bride!,
    date: weddingDate!,
    timeZone,
    venue: weddingVenue!,
    quote: quote(w.quote),
    story: list(w.stories ?? w.story, chapter),
    events,
    gallery: list(w.gallery, (g, i) => image(g, `Foto ${i + 1}`)),
    music: music(w.music),
    rsvp: rsvpSettings(w.rsvp),
    nameOrder: oneOf(w.nameOrder, ['groom-first', 'bride-first'] as const),
  }
}

/** RSVP responses are echoed back to the guest; fall back to what they sent. */
export function parseRsvpResponse(raw: unknown, sent: RsvpResponse): RsvpResponse {
  const r = obj(raw)
  return {
    id: str(r.id),
    name: str(r.guestName) ?? str(r.name) ?? sent.name,
    attendance: oneOf(r.attendance, ['attending', 'not_attending'] as const) ?? sent.attendance,
    guestCount: num(r.guestCount) ?? sent.guestCount,
    message: str(r.message) ?? sent.message,
    createdAt: date(r.createdAt),
  }
}
