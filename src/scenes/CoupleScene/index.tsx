import { SceneSection } from '@/components/cinematic'
import { copy } from '@/locales/id'
import { formatDate, getCouple } from '@/utils/format'
import type { SceneProps } from '../types'

/**
 * Scenes 03–04 — the camera travels to the stage and the couple steps into the
 * light (drawn by the cinematic backdrop). Once the camera settles, the wedding
 * information appears above them on the arched panel.
 */
export function CoupleScene({ wedding }: SceneProps) {
  const [first, second] = getCouple(wedding)
  // Full names vary a lot in length; keep them clear of the couple below.
  const longNames = Math.max(first.fullName.length, second.fullName.length) > 18

  return (
    <SceneSection
      id="couple"
      label={copy.scenes.couple}
      pin
      length={2.8}
      revealAt={['top -45%', 'top -90%']}
      className="!justify-start"
    >
      <div className="mt-[8dvh] flex w-full flex-col items-center">
        <p data-reveal className="eyebrow">{copy.couple.eyebrow}</p>
        <h2
          data-reveal
          className={`display-names mt-4 text-balance break-words ${
            longNames ? 'text-[min(7.6cqw,2rem)] leading-[1.05]' : 'text-[min(10.5cqw,2.75rem)]'
          }`}
        >
          {first.fullName}
          <span className="my-1 block font-script text-[0.75em] leading-none text-gold">&amp;</span>
          {second.fullName}
        </h2>
      </div>
      <div data-reveal className="absolute inset-x-8 bottom-[9dvh] flex flex-col items-center">
        <span className="hairline" aria-hidden="true" />
        <p className="eyebrow mt-5 text-cocoa">
          <time dateTime={wedding.date}>{formatDate(wedding.date, wedding.timeZone)}</time>
        </p>
        <p className="mt-2 font-serif text-lg text-cocoa-soft italic">{wedding.venue.name}</p>
      </div>
    </SceneSection>
  )
}
