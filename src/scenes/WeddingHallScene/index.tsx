import { SceneSection } from '@/components/cinematic'
import { copy } from '@/locales/id'
import type { SceneProps } from '../types'

/**
 * Scene 02 — the camera travels through the parting curtains into the hall
 * (drawn by the cinematic backdrop). The quote settles on the arched panel.
 */
export function WeddingHallScene({ wedding }: SceneProps) {
  const { quote } = wedding

  return (
    <SceneSection id="hall" label={copy.scenes.hall} pin length={2.2} className="!justify-start">
      {quote && (
        <figure className="mt-[14dvh] flex h-[38dvh] w-[58cqw] max-w-[17rem] flex-col items-center justify-center">
          <span data-reveal className="hairline" aria-hidden="true" />
          <blockquote
            data-reveal
            className="mt-5 font-serif text-[clamp(0.85rem,4cqw,1.05rem)] leading-relaxed text-cocoa italic"
          >
            “{quote.text}”
          </blockquote>
          {quote.source && (
            <figcaption data-reveal className="eyebrow mt-4 text-[0.6875rem]">
              {quote.source}
            </figcaption>
          )}
        </figure>
      )}
    </SceneSection>
  )
}
