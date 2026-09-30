import type { ApiErrorBody } from '@/types'
import { copy } from '@/locales/id'
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from './config'

export class ApiError extends Error {
  /** HTTP status; 0 = network failure, -1 = timeout. */
  readonly status: number
  readonly body?: ApiErrorBody

  constructor(message: string, status: number, body?: ApiErrorBody) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }

  /** Machine-readable code from the backend, e.g. `WEDDING_NOT_FOUND`. */
  get code() {
    return this.body?.error?.code
  }

  get isNotFound() {
    return this.status === 404
  }

  /** Worth trying again: offline, timeout, rate limit or server trouble. */
  get isTransient() {
    return this.status <= 0 || this.status === 408 || this.status === 429 || this.status >= 500
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** Extra attempts for transient failures (only use for idempotent requests). */
  retries?: number
}

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const id = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(id)
        reject(signal.reason)
      },
      { once: true },
    )
  })

async function send<T>(path: string, { body, headers, signal, ...init }: RequestOptions): Promise<T> {
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    })
  } catch (error) {
    if (signal?.aborted) throw error
    if (timeout.aborted) throw new ApiError(copy.errors.timeout, -1)
    throw new ApiError(copy.errors.network, 0)
  }

  const payload: unknown = await response.json().catch(() => undefined)
  const envelope = typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : undefined

  if (!response.ok) {
    const errorBody = envelope as ApiErrorBody | undefined
    const message = errorBody?.error?.message || undefined
    throw new ApiError(message ?? copy.errors.requestFailed(response.status), response.status, errorBody)
  }

  if (!envelope || !('data' in envelope)) {
    throw new ApiError(copy.errors.invalidResponse, response.status)
  }
  return envelope.data as T
}

/**
 * Minimal JSON client for the `{ data }` envelope. Transient failures on
 * idempotent requests are retried with backoff (0.7s, 1.4s, …).
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { retries = 0, ...rest } = options
  for (let attempt = 0; ; attempt++) {
    try {
      return await send<T>(path, rest)
    } catch (error) {
      if (!(error instanceof ApiError) || !error.isTransient || attempt >= retries) throw error
      await wait(700 * 2 ** attempt, rest.signal ?? undefined)
    }
  }
}
