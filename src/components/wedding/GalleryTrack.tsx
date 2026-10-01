import { useLayoutEffect, useRef } from 'react'
import type { ImageAsset } from '@/types'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { copy } from '@/locales/id'
import { gsap } from '@/utils/gsap'
import { pageTop, scrollToY } from '@/utils/scroll'

interface GalleryTrackProps {
  images: ImageAsset[]
  onOpen: (index: number) => void
}

/** Frame shapes rotate so the strip reads as an editorial layout, not a grid. */
const FRAMES = ['rounded-t-full', 'rounded-sm', 'rounded-[1.75rem]'] as const
/** Near (larger, drifts more) and far (smaller, drifts less) layers. */
const DEPTHS = [1, 0.8, 0.92] as const

/**
 * A cinematic filmstrip: vertical scrolling slides it sideways while each photo
 * drifts at its own depth and eases from a soft zoom into focus at centre.
 */
export function GalleryTrack({ images, onOpen }: GalleryTrackProps) {
  const viewport = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLUListElement>(null)
  const counter = useRef<HTMLSpanElement>(null)
  const reducedMotion = useReducedMotion()

  /** Keyboard / screen-reader focus on a photo scrolls the strip until it is centred. */
  const revealItem = (item: HTMLElement) => {
    const vp = viewport.current
    const list = track.current
    const section = vp?.closest<HTMLElement>('[data-scene]')
    if (!vp || !list || !section) return
    const distance = Math.max(1, list.scrollWidth - vp.clientWidth)
    const x = Math.min(distance, Math.max(0, item.offsetLeft + item.offsetWidth / 2 - vp.clientWidth / 2))
    const range = section.offsetHeight - window.innerHeight * 1.55
    scrollToY(pageTop(section) + (x / distance) * range)
  }

  useLayoutEffect(() => {
    const vp = viewport.current
    const list = track.current
    const section = vp?.closest<HTMLElement>('[data-scene]')
    if (!vp || !list || !section) return

    const ctx = gsap.context(() => {
      const distance = () => Math.max(0, list.scrollWidth - vp.clientWidth)
      const slide = gsap.to(list, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `bottom bottom+=${Math.round(window.innerHeight * 0.55)}`,
          scrub: reducedMotion ? true : 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (counter.current) {
              const n = Math.min(images.length, Math.round(self.progress * (images.length - 1)) + 1)
              counter.current.textContent = String(n).padStart(2, '0')
            }
          },
        },
      })

      gsap.utils.toArray<HTMLElement>('[data-item]', list).forEach((item) => {
        const media = item.querySelector('img')
        // Fade only the photo frame: captions stay at full contrast.
        const frame = item.querySelector('button')
        const depth = Number(item.dataset.depth)
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: item, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true },
        })
        tl.fromTo(frame, { opacity: 0.6 }, { opacity: 1, duration: 0.5 }, 0).to(frame, { opacity: 0.6, duration: 0.5 }, 0.5)
        if (!reducedMotion) {
          // Nearer frames travel further, so overlapping photos slide past each other.
          tl.fromTo(item, { y: 24 * depth, xPercent: (depth - 0.9) * 60 }, { y: -24 * depth, xPercent: -(depth - 0.9) * 60, duration: 1 }, 0)
          if (media) tl.fromTo(media, { scale: 1.18 }, { scale: 1, duration: 0.5 }, 0).to(media, { scale: 1.08, duration: 0.5 }, 0.5)
        }
      })
    }, vp)

    return () => ctx.revert()
  }, [images.length, reducedMotion])

  return (
    <div ref={viewport} className="relative mt-8 h-[58dvh] w-[calc(100%+4rem)] overflow-hidden">
      <ul ref={track} className="absolute inset-y-0 left-0 flex items-center px-[19cqw]">
        {images.map((image, i) => {
          const ratio = image.width && image.height ? image.width / image.height : 4 / 5
          const depth = DEPTHS[i % DEPTHS.length]
          const landscape = ratio > 1
          return (
            <li
              key={image.url}
              data-item
              data-depth={depth}
              onFocus={(e) => {
                e.stopPropagation()
                revealItem(e.currentTarget)
              }}
              className="relative shrink-0"
              style={{
                width: `${(landscape ? 76 : 62) * depth}cqw`,
                // Frames overlap a little and alternate height; nearer ones sit on top.
                marginLeft: i ? '-7cqw' : 0,
                translate: `0 ${i % 2 ? 7 : -7}dvh`,
                zIndex: Math.round(depth * 10),
              }}
            >
              <button
                type="button"
                onClick={() => onOpen(i)}
                aria-label={copy.gallery.open(i + 1, images.length)}
                className={`block w-full overflow-hidden border border-gold/40 bg-linen p-1 shadow-[0_18px_40px_-24px_rgba(74,58,46,0.5)] ${
                  FRAMES[i % FRAMES.length]
                }`}
              >
                <span className={`photo-frame block overflow-hidden ${FRAMES[i % FRAMES.length]}`} style={{ aspectRatio: ratio }}>
                  <img
                    src={image.thumbnailUrl ?? image.url}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    loading="lazy"
                    decoding="async"
                    // A missing file shows a soft placeholder frame instead of a broken-image icon.
                    onError={(e) => {
                      e.currentTarget.style.visibility = 'hidden'
                      e.currentTarget.parentElement?.setAttribute('data-failed', '')
                    }}
                    className="h-full w-full object-cover"
                  />
                </span>
              </button>
              {image.caption && <p className="mt-3 font-serif text-sm text-cocoa-soft italic">{image.caption}</p>}
            </li>
          )
        })}
      </ul>
      <p className="pointer-events-none absolute right-8 bottom-0 font-serif text-sm tracking-[0.2em] text-cocoa-soft" aria-hidden="true">
        <span ref={counter}>01</span> / {String(images.length).padStart(2, '0')}
      </p>
    </div>
  )
}
