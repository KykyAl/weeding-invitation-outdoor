import { useLayoutEffect, type RefObject } from 'react'
import { gsap } from '@/utils/gsap'
import { useReducedMotion } from './useReducedMotion'

interface SceneTimelineOptions {
  pin: boolean
  /** Time-based intro gate; `undefined` means the intro is driven by scroll. */
  play?: boolean
  revealAt?: [start: string, end: string]
  fadeOut?: boolean
}

const DEFAULT_REVEAL: [string, string] = ['top 5%', 'top -40%']

/**
 * In/out choreography for one scene:
 * - intro: `[data-reveal]` children fade/rise in sequence (on scroll, or on a
 *   timer when `play` is used);
 * - outro (pinned scenes): the whole shot fades out before the next scene.
 *
 * Only `opacity` is animated (never `visibility`), so faded content stays in the
 * accessibility tree and can still receive focus — `SceneSection` scrolls it
 * back into view when that happens.
 */
export function useSceneTimeline(
  section: RefObject<HTMLElement | null>,
  content: RefObject<HTMLElement | null>,
  { pin, play, revealAt, fadeOut = true }: SceneTimelineOptions,
) {
  const reducedMotion = useReducedMotion()
  const [revealStart, revealEnd] = revealAt ?? DEFAULT_REVEAL

  useLayoutEffect(() => {
    const el = section.current
    const inner = content.current
    if (!el || !inner) return

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>('[data-reveal]', el)
      const hidden = { opacity: 0, y: reducedMotion ? 0 : 26, filter: reducedMotion ? 'blur(0px)' : 'blur(8px)' }
      const shown = { opacity: 1, y: 0, filter: 'blur(0px)', ease: 'power2.out' }

      if (items.length) {
        if (play !== undefined) {
          if (!play) gsap.set(items, hidden)
          else
            gsap.fromTo(items, hidden, {
              ...shown,
              duration: reducedMotion ? 0.5 : 1.8,
              stagger: reducedMotion ? 0 : 0.55,
              delay: 0.3,
            })
        } else if (pin) {
          gsap.fromTo(items, hidden, {
            ...shown,
            stagger: reducedMotion ? 0 : 0.25,
            scrollTrigger: { trigger: el, start: revealStart, end: revealEnd, scrub: reducedMotion ? true : 0.6 },
          })
        } else {
          gsap.fromTo(items, hidden, {
            ...shown,
            duration: reducedMotion ? 0.4 : 1.4,
            stagger: reducedMotion ? 0 : 0.18,
            scrollTrigger: { trigger: el, start: 'top 70%', once: true },
          })
        }
      }

      if (pin && fadeOut) {
        gsap.fromTo(
          inner,
          { opacity: 1, y: 0 },
          {
            opacity: 0,
            y: reducedMotion ? 0 : -36,
            ease: 'power1.in',
            immediateRender: false,
            scrollTrigger: {
              trigger: el,
              start: () => `bottom bottom+=${Math.round(window.innerHeight * 0.5)}`,
              end: 'bottom bottom',
              scrub: reducedMotion ? true : 0.6,
              invalidateOnRefresh: true,
            },
          },
        )
      }
    }, el)

    return () => ctx.revert()
  }, [section, content, pin, play, revealStart, revealEnd, fadeOut, reducedMotion])
}
