import { useLayoutEffect, type RefObject } from 'react'
import { gsap } from '@/utils/gsap'
import { pageTop } from '@/utils/scroll'
import { useReducedMotion } from './useReducedMotion'

/**
 * Plays `[data-shot]` children one after another while their pinned scene is
 * scrolled: each shot rises out of a soft blur, holds, then dissolves as the
 * next arrives. `[data-shot-media]` gets a slow push-in; `[data-dot]`
 * indicators follow the active shot.
 */
/** Scroll position at which shot `index` of `count` is fully on screen (matches the timeline below). */
export function shotScrollY(section: HTMLElement, index: number, count: number) {
  const range = section.offsetHeight - window.innerHeight * 1.55
  return pageTop(section) + ((index + 0.5) / count) * range
}

export function useShotSequence(container: RefObject<HTMLElement | null>, count: number) {
  const reducedMotion = useReducedMotion()

  useLayoutEffect(() => {
    const el = container.current
    const section = el?.closest<HTMLElement>('[data-scene]')
    if (!el || !section || !count) return

    const ctx = gsap.context(() => {
      const shots = gsap.utils.toArray<HTMLElement>('[data-shot]', el)
      const dots = gsap.utils.toArray<HTMLElement>('[data-dot]', el)
      const blur = (px: number) => (reducedMotion ? 'blur(0px)' : `blur(${px}px)`)
      const setActive = (i: number) => {
        dots.forEach((d, k) => d.toggleAttribute('data-active', k === i))
        // Only the visible shot takes pointer input; the others are stacked on top of it.
        shots.forEach((s, k) => s.toggleAttribute('data-active', k === i))
      }

      gsap.set(shots, { opacity: 0, y: reducedMotion ? 0 : 40, filter: blur(10) })
      setActive(0)

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          // Finish before the scene's own fade-out begins.
          end: () => `bottom bottom+=${Math.round(window.innerHeight * 0.55)}`,
          scrub: reducedMotion ? true : 0.7,
          invalidateOnRefresh: true,
          onUpdate: (self) => setActive(Math.min(shots.length - 1, Math.floor(self.progress * shots.length))),
        },
      })

      shots.forEach((shot, i) => {
        tl.to(shot, { opacity: 1, y: 0, filter: blur(0), duration: 0.35 }, i)
        const media = shot.querySelector('[data-shot-media]')
        if (media && !reducedMotion) tl.fromTo(media, { scale: 1.08 }, { scale: 1, duration: 1, ease: 'none' }, i)
        if (i < shots.length - 1) {
          tl.to(shot, { opacity: 0, y: reducedMotion ? 0 : -30, filter: blur(6), duration: 0.3 }, i + 0.7)
        }
      })
      // Hold the last shot for the rest of the range.
      tl.to({}, { duration: 0.01 }, shots.length - 0.01)
    }, el)

    return () => ctx.revert()
  }, [container, count, reducedMotion])
}
