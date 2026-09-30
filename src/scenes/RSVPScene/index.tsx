import { useLayoutEffect, useRef, useState } from 'react'
import { SceneSection } from '@/components/cinematic'
import { RsvpForm } from '@/components/wedding/RsvpForm'
import { RsvpThanks } from '@/components/wedding/RsvpThanks'
import { useRsvp } from '@/hooks/useRsvp'
import { copy } from '@/locales/id'
import { formatDate } from '@/utils/format'
import { gsap } from '@/utils/gsap'
import type { SceneProps } from '../types'

const DEFAULT_MAX_GUESTS = 5

/** Scene 09 — RSVP form; a successful reply dissolves into a cinematic thank-you. */
export function RSVPScene({ wedding, guestName }: SceneProps) {
  const settings = wedding.rsvp
  const { state, submit, reset } = useRsvp(wedding.slug)
  const panel = useRef<HTMLDivElement>(null)
  // Evaluated once when the invitation opens; a guest won't sit on the page past the deadline.
  const [closed] = useState(() => (settings?.deadline ? Date.now() > new Date(settings.deadline).getTime() : false))
  const view = state.status === 'success' ? 'thanks' : 'form'

  // Crossfade between the form and the confirmation.
  useLayoutEffect(() => {
    if (!panel.current) return
    const tween = gsap.fromTo(panel.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: 'power2.out' })
    return () => {
      tween.kill()
    }
  }, [view])

  if (settings?.enabled === false) return null

  return (
    <SceneSection id="rsvp" label={copy.scenes.rsvp}>
      <h2 data-reveal className="eyebrow">{copy.rsvp.heading}</h2>
      <span data-reveal className="hairline mt-4" aria-hidden="true" />
      <p data-reveal className="mt-5 max-w-[19rem] font-serif text-lg leading-relaxed text-cocoa-soft italic">
        {copy.rsvp.intro}
      </p>
      {settings?.deadline && !closed && view === 'form' && (
        <p data-reveal className="eyebrow mt-3 text-[0.5625rem]">
          {copy.rsvp.deadline(formatDate(settings.deadline, wedding.timeZone))}
        </p>
      )}

      <div ref={panel} data-reveal className="mt-9 flex w-full justify-center">
        {closed && view === 'form' ? (
          <p className="max-w-[18rem] font-serif text-base text-cocoa-soft italic">{copy.rsvp.closed}</p>
        ) : state.status === 'success' ? (
          <RsvpThanks response={state.response} onChange={reset} />
        ) : (
          <RsvpForm
            defaultName={guestName ?? ''}
            maxGuests={settings?.maxGuests ?? DEFAULT_MAX_GUESTS}
            submitting={state.status === 'submitting'}
            error={state.status === 'error' ? state.message : undefined}
            serverErrors={state.status === 'error' ? state.fields : undefined}
            onSubmit={submit}
          />
        )}
      </div>
    </SceneSection>
  )
}
