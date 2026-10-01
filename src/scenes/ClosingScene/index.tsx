import { SceneSection } from '@/components/cinematic'
import { copy } from '@/locales/id'
import { CREDIT } from '@/utils/credit'
import { getCouple } from '@/utils/format'
import type { SceneProps } from '../types'

/**
 * Scene 10 — the camera returns to the couple in a softer, warmer hall. The
 * thanks settle on the arched panel above them, the couple's names below.
 * As the final scene it stays on screen instead of fading out.
 */
export function ClosingScene({ wedding }: SceneProps) {
  const [first, second] = getCouple(wedding)

  return (
    <SceneSection
      id="closing"
      label={copy.scenes.closing}
      pin
      length={2}
      fadeOut={false}
      revealAt={['top 40%', 'top -25%']}
      className="!justify-start"
    >
      <div className="mt-[9dvh] flex w-full flex-col items-center">
        <h2 data-reveal className="font-script text-[min(16cqw,4rem)] leading-tight text-gold-deep">
          {copy.closing.thanks}
        </h2>
        <p data-reveal className="eyebrow mt-4">
          {copy.closing.seeYou}
        </p>
      </div>
      <div data-reveal className="absolute inset-x-8 bottom-[11dvh] flex flex-col items-center">
        <span className="hairline" aria-hidden="true" />
        <p className="mt-5 font-serif text-base text-cocoa-soft italic">{copy.closing.signature}</p>
        <p className="display-names mt-2 text-[min(9cqw,2.25rem)] text-balance">
          {first.nickname} <span className="font-script text-[0.85em] text-gold-deep">&amp;</span> {second.nickname}
        </p>
      </div>
      {CREDIT && (
        <p className="absolute inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] text-[0.6875rem] tracking-[0.18em] text-cocoa-soft">
          {copy.closing.credit}{' '}
          {CREDIT.url ? (
            <a
              href={CREDIT.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cocoa underline decoration-gold/60 underline-offset-4 hover:decoration-gold"
            >
              {CREDIT.name}
            </a>
          ) : (
            <span className="text-cocoa">{CREDIT.name}</span>
          )}
        </p>
      )}
    </SceneSection>
  )
}
