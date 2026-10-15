import type { Wedding } from '@/types'
import { USE_SAMPLE_DATA } from './config'
import { request } from './httpClient'
import { parseWedding } from './normalize'

/**
 * `GET /api/v1/weddings/:slug[?to=&k=]` — the guest's name comes back only when
 * the link's signature is valid, so an edited `?to=` never shows a fake name.
 */
export async function getWedding(
  slug: string,
  signal?: AbortSignal,
  guest?: { to: string; k: string } | null,
): Promise<Wedding> {
  // `import.meta.env.DEV` is inlined so this branch is removed from production builds.
  if (import.meta.env.DEV && USE_SAMPLE_DATA) {
    const { getSampleWedding } = await import('@/data/sampleWedding')
    const { getGuestNameFromSearch } = await import('@/utils/guest')
    return { ...getSampleWedding(slug), guestName: getGuestNameFromSearch(window.location.search) ?? undefined }
  }

  const query = guest ? `?${new URLSearchParams(guest)}` : ''
  const raw = await request<unknown>(`/weddings/${encodeURIComponent(slug)}${query}`, { signal, retries: 2 })
  return parseWedding(raw, slug)
}
