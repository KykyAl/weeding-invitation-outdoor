import { useState } from 'react'
import { SceneSection } from '@/components/cinematic'
import { GalleryLightbox } from '@/components/wedding/GalleryLightbox'
import { GalleryTrack } from '@/components/wedding/GalleryTrack'
import { copy } from '@/locales/id'
import type { SceneProps } from '../types'

/** Scene 08 — a layered, sideways-drifting filmstrip of the couple's photos. */
export function GalleryScene({ wedding }: SceneProps) {
  const { gallery } = wedding
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  if (!gallery.length) return null

  return (
    <SceneSection id="gallery" label={copy.scenes.gallery} pin length={1.55 + gallery.length * 0.5} className="py-[9dvh]">
      <h2 data-reveal className="eyebrow">{copy.gallery.heading}</h2>
      <span data-reveal className="hairline mt-4" aria-hidden="true" />
      <GalleryTrack images={gallery} onOpen={setOpenIndex} />
      <p data-reveal className="eyebrow mt-5 text-[0.5625rem] normal-case tracking-[0.2em]">
        {copy.gallery.hint}
      </p>
      {openIndex !== null && (
        <GalleryLightbox images={gallery} index={openIndex} onIndex={setOpenIndex} onClose={() => setOpenIndex(null)} />
      )}
    </SceneSection>
  )
}
