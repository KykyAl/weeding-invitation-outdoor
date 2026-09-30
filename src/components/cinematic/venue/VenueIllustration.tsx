import { useLayoutEffect, useMemo, useRef } from 'react'
import type { ImageAsset } from '@/types'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { gsap } from '@/utils/gsap'
import { getVenueArt } from './venueArt'

interface VenueIllustrationProps {
  /** Real venue photo from the backend; the illustrated ballroom is used otherwise. */
  image?: ImageAsset
  alt: string
  className?: string
}

/** Layer, depth (parallax strength) and extra classes for the illustrated ballroom. */
const LAYERS = [
  { id: 'room', depth: 0.15, className: 'inset-[-6%]' },
  { id: 'aisle', depth: 0.45, className: 'inset-[-6%]' },
  { id: 'chandelier', depth: 0.3, className: 'venue-sway left-[31%] top-[-2%] w-[38%] origin-top' },
  { id: 'frame', depth: 0.9, className: 'inset-[-8%]' },
] as const

/**
 * Arch-framed 2.5D venue view: layers drift at different speeds as the scene
 * scrolls, and the camera gently pushes into the ballroom.
 */
export function VenueIllustration({ image, alt, className = '' }: VenueIllustrationProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const art = useMemo(() => (image ? null : getVenueArt()), [image])

  useLayoutEffect(() => {
    const el = ref.current
    const section = el?.closest<HTMLElement>('[data-scene]')
    if (!el || !section || reducedMotion) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
      })
      gsap.utils.toArray<HTMLElement>('[data-depth]', el).forEach((layer) => {
        const depth = Number(layer.dataset.depth)
        tl.fromTo(layer, { yPercent: 6 * depth, scale: 1 }, { yPercent: -6 * depth, scale: 1 + depth * 0.08 }, 0)
      })
    }, el)
    return () => ctx.revert()
  }, [reducedMotion, art])

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-t-full border border-gold/50 bg-cream p-1.5 shadow-[0_24px_60px_-30px_rgba(74,58,46,0.45)] ${className}`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-t-full" role="img" aria-label={image?.alt ?? alt}>
        {image ? (
          <img
            data-depth="0.5"
            src={image.url}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-[-6%] h-[112%] w-[112%] max-w-none object-cover"
          />
        ) : (
          art &&
          LAYERS.map((layer) => (
            <img
              key={layer.id}
              data-depth={layer.depth}
              src={art[layer.id]}
              alt=""
              decoding="async"
              draggable={false}
              className={`absolute max-w-none select-none ${
                layer.id === 'chandelier' ? '' : 'h-[112%] w-[112%]'
              } ${layer.className}`}
            />
          ))
        )}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,transparent_50%,rgba(122,103,87,0.22))]" />
      </div>
    </div>
  )
}
