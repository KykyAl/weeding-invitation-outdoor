import type { RsvpRequest, RsvpResponse } from '@/types'
import { USE_SAMPLE_DATA } from './config'
import { request } from './httpClient'
import { parseRsvpResponse } from './normalize'

/**
 * `POST /api/v1/weddings/:slug/rsvp`
 *
 * Never retried automatically (a retry after a lost response could submit the
 * RSVP twice); the guest can simply press the button again.
 */
export async function submitRsvp(slug: string, payload: RsvpRequest): Promise<RsvpResponse> {
  // `import.meta.env.DEV` is inlined so this branch is removed from production builds.
  if (import.meta.env.DEV && USE_SAMPLE_DATA) {
    // Development-only: echo the submission so the RSVP flow can be exercised offline.
    await new Promise((resolve) => setTimeout(resolve, 600))
    return { ...payload, createdAt: new Date().toISOString() }
  }

  const raw = await request<unknown>(`/weddings/${encodeURIComponent(slug)}/rsvp`, {
    method: 'POST',
    body: {
      guestName: payload.name,
      attendance: payload.attendance,
      // The backend counts guests only for attendees (1–10); it defaults the rest.
      ...(payload.attendance === 'attending' ? { guestCount: payload.guestCount } : {}),
      ...(payload.message ? { message: payload.message } : {}),
    },
  })
  return parseRsvpResponse(raw, payload)
}
