import { SceneSection } from '@/components/cinematic'
import { copy } from '@/locales/id'
import { formatDateCompact, getCouple } from '@/utils/format'
import type { SceneProps } from '../types'

/**
 * Scene 01 — plays on its own once the invitation opens:
 * "Pernikahan" → names → "Simpan Tanggalnya", framed by the veil's arch.
 */
export function OpeningScene({ wedding, active = false }: SceneProps) {
  const [first, second] = getCouple(wedding)

  return (
    <SceneSection id="opening" label={copy.scenes.opening} pin length={1.8} play={active}>
      <p data-reveal className="eyebrow">{copy.opening.eyebrow}</p>
      <h1 data-reveal className="display-names mt-7 text-[min(15cqw,4.25rem)] break-words">
        {first.nickname}
        <span className="my-3 block font-script text-[0.6em] leading-none text-gold">&amp;</span>
        {second.nickname}
      </h1>
      <div data-reveal className="mt-10 flex flex-col items-center">
        <span className="hairline" aria-hidden="true" />
        <p className="eyebrow mt-5">{copy.opening.saveTheDate}</p>
        <p className="mt-3 font-serif text-xl tracking-[0.22em]">{formatDateCompact(wedding.date, wedding.timeZone)}</p>
      </div>
      <div
        data-reveal
        aria-hidden="true"
        className="absolute bottom-[max(2.25rem,env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="eyebrow text-[0.5625rem]">{copy.opening.scroll}</span>
        <span className="scroll-cue" />
      </div>
    </SceneSection>
  )
}
