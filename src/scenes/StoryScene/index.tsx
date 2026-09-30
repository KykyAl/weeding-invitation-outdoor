import { SceneSection, ShotSequence } from '@/components/cinematic'
import { copy } from '@/locales/id'
import type { SceneProps } from '../types'

/** Scene 05 — our story, told one chapter (shot) at a time over the softened hall. */
export function StoryScene({ wedding }: SceneProps) {
  const { story } = wedding
  if (!story.length) return null

  return (
    <SceneSection id="story" label={copy.scenes.story} pin length={1.55 + story.length * 0.9} className="py-[9dvh]">
      <h2 data-reveal className="eyebrow">{copy.story.heading}</h2>
      <span data-reveal className="hairline mt-4" aria-hidden="true" />
      <ShotSequence className="mt-6 mb-2">
        {story.map((chapter) => (
          <article key={chapter.id} className="flex max-w-[20rem] flex-col items-center">
            {chapter.image && (
              <div className="mb-7 h-[30dvh] w-[52cqw] max-w-[15rem] overflow-hidden rounded-t-full border border-gold/40 p-1.5">
                <img
                  data-shot-media
                  src={chapter.image.thumbnailUrl ?? chapter.image.url}
                  alt={chapter.image.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full rounded-t-full object-cover"
                />
              </div>
            )}
            <p className="font-serif text-[min(24cqw,6.5rem)] leading-none font-light text-gold/90">{chapter.period}</p>
            <h3 className="eyebrow mt-5 text-cocoa">{chapter.title}</h3>
            {chapter.description && (
              <p className="mt-4 font-serif text-[clamp(0.95rem,4.2cqw,1.1rem)] leading-relaxed text-cocoa-soft italic">
                {chapter.description}
              </p>
            )}
          </article>
        ))}
      </ShotSequence>
    </SceneSection>
  )
}
