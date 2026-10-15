const MAX_GUEST_NAME_LENGTH = 60

/** Reads the (unverified) guest name from `?to=`. Only used by the dev sample data. */
export function getGuestNameFromSearch(search: string): string | null {
  const raw = new URLSearchParams(search).get('to')
  if (!raw) return null

  const name = raw.replace(/\s+/g, ' ').trim().slice(0, MAX_GUEST_NAME_LENGTH)
  return name || null
}

/**
 * The guest part of an invitation link (`?to=Andi&k=<signature>`), passed on to
 * the API, which returns the name only if the signature is valid.
 */
export function getGuestLinkParams(search: string): { to: string; k: string } | null {
  const params = new URLSearchParams(search)
  const to = params.get('to')
  const k = params.get('k')
  return to && k ? { to, k } : null
}
