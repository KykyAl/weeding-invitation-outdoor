import type { Person, Wedding } from '@/types'

const DEFAULT_LOCALE = 'id-ID'

export function formatDate(iso: string, timeZone?: string, locale = DEFAULT_LOCALE) {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone,
  }).format(new Date(iso))
}

/** Compact "save the date" format, e.g. `12 . 12 . 2026`. */
export function formatDateCompact(iso: string, timeZone?: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone,
  }).formatToParts(new Date(iso))
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? ''
  return `${get('day')} . ${get('month')} . ${get('year')}`
}

export function formatTime(iso: string, timeZone?: string, locale = DEFAULT_LOCALE) {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  }).format(new Date(iso))
}

/** Headline couple pair in the order configured by the backend. */
export function getCouple(wedding: Wedding): [Person, Person] {
  return wedding.nameOrder === 'bride-first'
    ? [wedding.bride, wedding.groom]
    : [wedding.groom, wedding.bride]
}
