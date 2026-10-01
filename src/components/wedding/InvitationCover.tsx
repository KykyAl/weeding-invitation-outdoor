import { useLayoutEffect, useRef } from 'react'
import type { Wedding } from '@/types'
import { InviteButton } from '@/components/ui'
import { getCouple } from '@/utils/format'
import { copy } from '@/locales/id'
import { gsap } from '@/utils/gsap'

interface InvitationCoverProps {
  wedding: Wedding
  guestName: string | null
  reducedMotion: boolean
  onOpen: () => void
}

/**
 * Cover shown before the invitation plays. Opening it is the user gesture that
 * unlocks scrolling and (optionally) music.
 */
export function InvitationCover({ wedding, guestName, reducedMotion, onOpen }: InvitationCoverProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [first, second] = getCouple(wedding)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-cover-item]',
        // Opacity only: the button must stay focusable (autoFocus) while it fades in.
        { opacity: 0, y: reducedMotion ? 0 : 16 },
        {
          opacity: 1,
          y: 0,
          duration: reducedMotion ? 0.3 : 1.6,
          stagger: reducedMotion ? 0 : 0.25,
          ease: 'power3.out',
          delay: 0.2,
        },
      )
    }, ref)
    return () => ctx.revert()
  }, [reducedMotion])

  const opening = useRef(false)
  const handleOpen = () => {
    if (opening.current) return
    opening.current = true
    gsap.to(ref.current, {
      autoAlpha: 0,
      scale: reducedMotion ? 1 : 1.04,
      duration: reducedMotion ? 0.3 : 1.1,
      ease: 'power2.inOut',
      onComplete: onOpen,
    })
  }

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cover-title"
      className="fixed inset-y-0 left-1/2 z-50 flex w-[var(--stage-width)] -translate-x-1/2 flex-col items-center justify-center bg-cream/90 px-8 text-center backdrop-blur-sm"
    >
      <p data-cover-item className="eyebrow">{copy.cover.eyebrow}</p>
      <h1 id="cover-title" data-cover-item className="display-names mt-5 text-5xl">
        {first.nickname} <span className="font-script text-gold-deep">&amp;</span> {second.nickname}
      </h1>
      <span data-cover-item className="hairline mt-10 block" aria-hidden="true" />
      <p data-cover-item className="eyebrow mt-8">{copy.cover.dear}</p>
      <p data-cover-item className="mt-2 font-serif text-2xl italic">{guestName ?? copy.cover.guestFallback}</p>
      <div data-cover-item className="mt-10">
        <InviteButton onClick={handleOpen} autoFocus>
          {copy.cover.open}
        </InviteButton>
      </div>
    </div>
  )
}
