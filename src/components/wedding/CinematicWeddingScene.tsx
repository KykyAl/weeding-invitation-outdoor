import { useEffect, useMemo, useRef, useState } from 'react'
import type { Wedding } from '@/types'
import { CinematicBackdrop, CinematicStage } from '@/components/cinematic'
import { MusicToggle } from '@/components/ui'
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useCinematicDirector } from '@/hooks/useCinematicDirector'
import { copy } from '@/locales/id'
import { getCoupleLook } from '@/utils/appearance'
import { ScrollTrigger } from '@/utils/gsap'
import {
  ClosingScene,
  CoupleScene,
  EventScene,
  GalleryScene,
  OpeningScene,
  RSVPScene,
  StoryScene,
  VenueScene,
  WeddingHallScene,
} from '@/scenes'
import { InvitationCover } from './InvitationCover'

interface CinematicWeddingSceneProps {
  wedding: Wedding
  guestName: string | null
}

/** Reusable invitation experience for any wedding record. */
export function CinematicWeddingScene({ wedding, guestName }: CinematicWeddingSceneProps) {
  const reducedMotion = useReducedMotion()
  const [opened, setOpened] = useState(false)
  const timelineRef = useRef<HTMLElement>(null)
  const director = useCinematicDirector(timelineRef, { enabled: opened, reducedMotion })
  const music = useBackgroundMusic(wedding.music)
  const look = useMemo(() => getCoupleLook(wedding), [wedding])

  // The cover locks scrolling until the guest opens the invitation.
  useEffect(() => {
    document.documentElement.classList.toggle('is-locked', !opened)
    if (opened) {
      window.scrollTo(0, 0)
      ScrollTrigger.refresh()
      // The cover is gone; give screen readers and keyboard users a place to start.
      document.getElementById('opening-title')?.focus({ preventScroll: true })
    }
    return () => document.documentElement.classList.remove('is-locked')
  }, [opened])

  const handleOpen = () => {
    setOpened(true)
    if (wedding.music?.autoplay) music.play()
  }

  return (
    <CinematicStage>
      <CinematicBackdrop director={director} reducedMotion={reducedMotion} look={look} started={opened} />

      <main ref={timelineRef} className="relative z-10" inert={!opened}>
        <OpeningScene wedding={wedding} active={opened} />
        {/* Right after the opening title, which receives focus when the invitation opens. */}
        {wedding.rsvp?.enabled !== false && (
          <a
            href="#rsvp"
            className="sr-only z-50 rounded-full border border-gold/50 bg-ivory text-[0.6875rem] tracking-[0.2em] whitespace-nowrap text-cocoa uppercase shadow-lg focus:not-sr-only focus:fixed focus:top-4 focus:left-1/2 focus:-translate-x-1/2 focus:px-5 focus:py-3 focus:whitespace-nowrap"
          >
            {copy.skipToRsvp}
          </a>
        )}
        <WeddingHallScene wedding={wedding} />
        <CoupleScene wedding={wedding} />
        <StoryScene wedding={wedding} />
        <EventScene wedding={wedding} />
        <VenueScene wedding={wedding} />
        <GalleryScene wedding={wedding} />
        <RSVPScene wedding={wedding} guestName={guestName} />
        <ClosingScene wedding={wedding} />
      </main>

      {!opened && (
        <InvitationCover
          wedding={wedding}
          guestName={guestName}
          reducedMotion={reducedMotion}
          onOpen={handleOpen}
        />
      )}

      {opened && music.available && <MusicToggle playing={music.playing} onToggle={music.toggle} />}
    </CinematicStage>
  )
}
