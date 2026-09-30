import { useCallback, useState } from 'react'
import type { RsvpRequest, RsvpResponse } from '@/types'
import { copy } from '@/locales/id'
import { ApiError, submitRsvp } from '@/services'

export type RsvpFieldErrors = Partial<Record<keyof RsvpRequest, string>>

export type RsvpState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'error'; message: string; fields: RsvpFieldErrors }
  | { status: 'success'; response: RsvpResponse }

const storageKey = (slug: string) => `rsvp:${slug}`

/** Remembers this guest's last answer on this device (a convenience only). */
function readSaved(slug: string): RsvpResponse | null {
  try {
    const raw = localStorage.getItem(storageKey(slug))
    return raw ? (JSON.parse(raw) as RsvpResponse) : null
  } catch {
    return null
  }
}

function save(slug: string, response: RsvpResponse) {
  try {
    localStorage.setItem(storageKey(slug), JSON.stringify(response))
  } catch {
    // Storage unavailable (private mode, blocked) — nothing to remember.
  }
}

/** Backend field names → form field names. */
const FIELD: Record<string, keyof RsvpRequest> = {
  guestName: 'name',
  attendance: 'attendance',
  guestCount: 'guestCount',
  message: 'message',
}

function fieldErrors(error: ApiError): RsvpFieldErrors {
  const out: RsvpFieldErrors = {}
  for (const [key, value] of Object.entries(error.body?.error?.details ?? {})) {
    const field = FIELD[key]
    const text = Array.isArray(value) ? value[0] : value
    if (field && text) out[field] = text
  }
  return out
}

export function useRsvp(slug: string) {
  const [state, setState] = useState<RsvpState>(() => {
    const saved = readSaved(slug)
    return saved ? { status: 'success', response: saved } : { status: 'idle' }
  })

  const submit = useCallback(
    async (payload: RsvpRequest) => {
      setState({ status: 'submitting' })
      try {
        const response = await submitRsvp(slug, payload)
        const result = { ...payload, ...response }
        save(slug, result)
        setState({ status: 'success', response: result })
      } catch (error) {
        const fields = error instanceof ApiError ? fieldErrors(error) : {}
        const message = error instanceof ApiError && error.message ? error.message : copy.rsvp.failed
        setState({ status: 'error', message, fields })
      }
    },
    [slug],
  )

  const reset = useCallback(() => setState({ status: 'idle' }), [])

  return { state, submit, reset }
}
