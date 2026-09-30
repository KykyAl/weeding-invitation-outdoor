import { useLayoutEffect, useRef } from 'react'
import type { RsvpResponse } from '@/types'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { copy } from '@/locales/id'
import { gsap } from '@/utils/gsap'

interface RsvpThanksProps {
  response: RsvpResponse
  onChange: () => void
}

const PETALS = 14

/** Cinematic confirmation: a gold ring draws itself, petals drift down, the message fades in. */
export function RsvpThanks({ response, onChange }: RsvpThanksProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const attending = response.attendance === 'attending'

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
      tl.fromTo('[data-ring]', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: reducedMotion ? 0.01 : 2.2, ease: 'power2.inOut' })
        .fromTo('[data-mark]', { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.9, transformOrigin: '50% 50%' }, '-=1')
        .fromTo(
          '[data-thanks]',
          { autoAlpha: 0, y: reducedMotion ? 0 : 16, filter: reducedMotion ? 'blur(0px)' : 'blur(6px)' },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.1, stagger: 0.25 },
          '-=0.5',
        )
      if (reducedMotion) return
      gsap.utils.toArray<HTMLElement>('[data-petal]', el).forEach((petal) => {
        gsap.fromTo(
          petal,
          { x: gsap.utils.random(-140, 140), y: -40, rotation: gsap.utils.random(0, 360), autoAlpha: 0 },
          {
            y: gsap.utils.random(260, 420),
            x: `+=${gsap.utils.random(-60, 60)}`,
            rotation: `+=${gsap.utils.random(120, 360)}`,
            autoAlpha: 0,
            duration: gsap.utils.random(4, 7),
            delay: gsap.utils.random(0.2, 2.5),
            ease: 'sine.in',
            keyframes: { autoAlpha: [0, 0.9, 0.9, 0] },
          },
        )
      })
    }, el)
    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <div ref={ref} role="status" className="relative flex w-full max-w-[20rem] flex-col items-center text-center">
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center" aria-hidden="true">
        {Array.from({ length: PETALS }, (_, i) => (
          <svg key={i} data-petal viewBox="0 0 10 14" className="absolute h-3.5 w-2.5 opacity-0">
            <path d="M5 0C9 4 9 10 5 14C1 10 1 4 5 0Z" fill={i % 3 ? '#fffdf8' : '#ead7ce'} stroke="#e2d6c2" strokeWidth=".4" />
          </svg>
        ))}
      </div>

      <svg viewBox="0 0 120 120" className="h-28 w-28" aria-hidden="true">
        <circle data-ring cx="60" cy="60" r="52" fill="none" stroke="#b8975a" strokeWidth="1" pathLength={1} strokeDasharray="1" />
        <circle cx="60" cy="60" r="46" fill="none" stroke="#d8c295" strokeWidth=".5" opacity=".6" />
        <g data-mark>
          <path d="M60 80S40 67 40 53a10 10 0 0 1 20-3.5A10 10 0 0 1 80 53c0 14-20 27-20 27Z" fill="none" stroke="#b8975a" strokeWidth="1.2" />
          <path d="M36 88c8-6 16-6 24 0c8-6 16-6 24 0" fill="none" stroke="#9fae94" strokeWidth="1" />
        </g>
      </svg>

      <p data-thanks className="mt-6 font-script text-[min(12cqw,3rem)] leading-tight text-gold">
        {copy.rsvp.thanks(response.name)}
      </p>
      <p data-thanks className="mt-4 font-serif text-lg leading-relaxed text-cocoa-soft italic">
        {attending ? copy.rsvp.attendingNote : copy.rsvp.notAttendingNote}
      </p>
      {attending && response.guestCount > 0 && (
        <p data-thanks className="eyebrow mt-5">
          {copy.rsvp.attending} · {copy.rsvp.guestsValue(response.guestCount)}
        </p>
      )}
      <button
        data-thanks
        type="button"
        onClick={onChange}
        className="mt-7 text-[0.625rem] tracking-[0.28em] text-cocoa-soft uppercase underline decoration-gold/50 underline-offset-8 hover:text-cocoa"
      >
        {copy.rsvp.change}
      </button>
    </div>
  )
}
