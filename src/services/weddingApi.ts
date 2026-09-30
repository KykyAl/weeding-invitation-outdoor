import type { Wedding } from '@/types'
import { USE_SAMPLE_DATA } from './config'
import { request } from './httpClient'
import { parseWedding } from './normalize'

/** `GET /api/v1/weddings/:slug` */
export async function getWedding(slug: string, signal?: AbortSignal): Promise<Wedding> {
  // `import.meta.env.DEV` is inlined so this branch is removed from production builds.
  if (import.meta.env.DEV && USE_SAMPLE_DATA) {
    const { getSampleWedding } = await import('@/data/sampleWedding')
    return getSampleWedding(slug)
  }

  const raw = await request<unknown>(`/weddings/${encodeURIComponent(slug)}`, { signal, retries: 2 })
  return parseWedding(raw, slug)
}
