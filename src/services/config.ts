const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim()

/** API root, e.g. `https://api.example.com/api/v1` or `/api/v1` (same origin). */
export const API_BASE_URL = `${rawBaseUrl.replace(/\/+$/, '')}/api/v1`

/**
 * Development-only switch to render the local sample wedding without a backend.
 * `import.meta.env.DEV` is statically `false` in production builds, so the
 * sample data is never bundled or used there.
 */
export const USE_SAMPLE_DATA =
  import.meta.env.DEV && import.meta.env.VITE_USE_SAMPLE_DATA === 'true'

export const REQUEST_TIMEOUT_MS = 15_000
