import { useCallback, useEffect, useState } from 'react'
import type { Wedding } from '@/types'
import { copy } from '@/locales/id'
import { ApiError, getWedding, WeddingDataError } from '@/services'

export type WeddingState =
  | { status: 'loading' }
  | { status: 'ready'; wedding: Wedding }
  | { status: 'not-found' }
  | { status: 'error'; message: string; offline: boolean }

function toErrorState(error: unknown): WeddingState {
  if (error instanceof ApiError && error.isNotFound) return { status: 'not-found' }
  if (error instanceof WeddingDataError) {
    if (import.meta.env.DEV) console.warn('[wedding] incomplete data:', error.missing)
    return { status: 'error', message: copy.errors.incompleteData, offline: false }
  }
  if (error instanceof ApiError) return { status: 'error', message: error.message, offline: error.status <= 0 }
  return { status: 'error', message: copy.errors.unknown, offline: false }
}

/** Loads a wedding by slug, with a manual `retry` and an automatic one when the device comes back online. */
export function useWedding(slug: string) {
  const [state, setState] = useState<WeddingState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    getWedding(slug, controller.signal)
      .then((wedding) => setState({ status: 'ready', wedding }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState(toErrorState(error))
      })
    return () => controller.abort()
  }, [slug, attempt])

  const offline = state.status === 'error' && state.offline
  useEffect(() => {
    if (!offline) return
    window.addEventListener('online', retry)
    return () => window.removeEventListener('online', retry)
  }, [offline, retry])

  const retryNow = useCallback(() => {
    setState({ status: 'loading' })
    retry()
  }, [retry])

  return { state, retry: retryNow }
}
