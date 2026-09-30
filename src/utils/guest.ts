const MAX_GUEST_NAME_LENGTH = 60

/** Reads the guest name from `?to=`, e.g. `/wedding/:slug?to=Andi`. */
export function getGuestNameFromSearch(search: string): string | null {
  const raw = new URLSearchParams(search).get('to')
  if (!raw) return null

  const name = raw.replace(/\s+/g, ' ').trim().slice(0, MAX_GUEST_NAME_LENGTH)
  return name || null
}
