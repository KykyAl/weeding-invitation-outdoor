import { SceneSection, ShotSequence } from '@/components/cinematic'
import { InviteButton } from '@/components/ui'
import { copy } from '@/locales/id'
import type { WeddingEvent } from '@/types'
import { formatDate, formatTime } from '@/utils/format'
import type { SceneProps } from '../types'

/** Scene 06 — Akad & Reception, each presented as its own shot over the hall. */
export function EventScene({ wedding }: SceneProps) {
  const { events } = wedding
  if (!events.length) return null

  return (
    <SceneSection id="event" label={copy.scenes.event} pin length={1.55 + events.length * 0.9} className="py-[9dvh]">
      <h2 data-reveal className="eyebrow">{copy.event.heading}</h2>
      <span data-reveal className="hairline mt-4" aria-hidden="true" />
      <ShotSequence className="mt-6 mb-2">
        {events.map((event) => (
          <EventShot key={event.id} event={event} fallbackTimeZone={wedding.timeZone} />
        ))}
      </ShotSequence>
    </SceneSection>
  )
}

function EventShot({ event, fallbackTimeZone }: { event: WeddingEvent; fallbackTimeZone?: string }) {
  const tz = event.timeZone ?? fallbackTimeZone
  const day = new Intl.DateTimeFormat('id-ID', { day: 'numeric', timeZone: tz }).format(new Date(event.startAt))

  return (
    <article className="flex max-w-[20rem] flex-col items-center">
      <h3 className="font-script text-[min(14cqw,3.5rem)] leading-tight text-gold">{event.title}</h3>

      <div className="mt-6 flex items-center gap-5" aria-hidden="true">
        <span className="h-px w-10 bg-gold/50" />
        <span className="font-serif text-6xl leading-none font-light">{day}</span>
        <span className="h-px w-10 bg-gold/50" />
      </div>
      <p className="eyebrow mt-4 text-cocoa">
        <time dateTime={event.startAt}>{formatDate(event.startAt, tz)}</time>
      </p>
      <p className="mt-2 text-sm tracking-[0.12em]">
        <time dateTime={event.startAt}>{formatTime(event.startAt, tz)}</time>
        {event.endAt ? (
          <>
            {' – '}
            <time dateTime={event.endAt}>{formatTime(event.endAt, tz)}</time>
          </>
        ) : (
          ` – ${copy.event.untilFinished}`
        )}
        {event.timeZoneLabel && ` ${event.timeZoneLabel}`}
      </p>

      <span className="hairline mt-7" aria-hidden="true" />
      <p className="mt-6 font-serif text-xl italic">{event.venue.name}</p>
      <address className="mt-2 text-xs leading-relaxed text-cocoa-soft not-italic">{event.venue.address}</address>
      {event.venue.mapUrl && (
        <InviteButton href={event.venue.mapUrl} className="mt-7 px-5 py-2.5 text-[0.625rem]">
          {copy.event.viewMap}
        </InviteButton>
      )}
    </article>
  )
}
