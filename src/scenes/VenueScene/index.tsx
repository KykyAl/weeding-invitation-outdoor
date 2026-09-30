import { SceneSection } from '@/components/cinematic'
import { VenueIllustration } from '@/components/cinematic/venue/VenueIllustration'
import { InviteButton } from '@/components/ui'
import { copy } from '@/locales/id'
import type { SceneProps } from '../types'

/** Scene 07 — the venue as a living illustration (or its photo), with the map link. */
export function VenueScene({ wedding }: SceneProps) {
  const { venue } = wedding

  return (
    <SceneSection id="venue" label={copy.scenes.venue} pin length={2.2} className="py-[8dvh]">
      <p data-reveal className="eyebrow">{copy.venue.heading}</p>
      <div data-reveal className="mt-6 w-[64cqw] max-w-[18rem]">
        <VenueIllustration image={venue.image} alt={copy.venue.illustrationAlt(venue.name)} className="aspect-[3/4] w-full" />
      </div>
      <h2 data-reveal className="mt-7 font-serif text-[clamp(1.5rem,7cqw,2rem)] leading-tight">{venue.name}</h2>
      <address data-reveal className="mt-2 max-w-[18rem] text-sm leading-relaxed text-cocoa-soft not-italic">
        {venue.address}
      </address>
      {venue.mapUrl && (
        <div data-reveal className="mt-6">
          <InviteButton href={venue.mapUrl}>{copy.venue.openMap}</InviteButton>
        </div>
      )}
    </SceneSection>
  )
}
