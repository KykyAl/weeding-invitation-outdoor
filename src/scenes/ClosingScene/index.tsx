import { SceneSection } from '@/components/cinematic'
import { copy } from '@/locales/id'
import { getCouple } from '@/utils/format'
import type { SceneProps } from '../types'

/** Scene 10 — back to the couple, softer hall. Visuals: Phase 3/8. */
export function ClosingScene({ wedding }: SceneProps) {
  const [first, second] = getCouple(wedding)

  return (
    <SceneSection id="closing" label={copy.scenes.closing}>
      <h2 data-reveal className="font-script text-5xl text-gold-deep">{copy.closing.thanks}</h2>
      <p data-reveal className="eyebrow mt-6">{copy.closing.seeYou}</p>
      <p data-reveal className="display-names mt-6 text-3xl">
        {first.nickname} &amp; {second.nickname}
      </p>
    </SceneSection>
  )
}
