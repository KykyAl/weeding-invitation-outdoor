import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import { createDirectorState, INTRO_PUSH, sceneValues, type DirectorState } from '@/components/cinematic/director'
import { SCENE_KEYFRAMES, type SceneId } from '@/scenes/timeline'
import { gsap, ScrollTrigger } from '@/utils/gsap'

interface DirectorOptions {
  /** Build the scroll timeline (after the invitation is opened). */
  enabled: boolean
  reducedMotion: boolean
}

/**
 * Turns scrolling into a camera timeline. Measures where every `[data-scene]`
 * sits, then scrubs a GSAP timeline that eases the camera (and light, veil,
 * curtains, wash) from one scene's keyframe to the next.
 */
export function useCinematicDirector(
  main: RefObject<HTMLElement | null>,
  { enabled, reducedMotion }: DirectorOptions,
): RefObject<DirectorState> {
  const director = useRef<DirectorState>(null as unknown as DirectorState)
  if (director.current === null) director.current = createDirectorState(reducedMotion)

  // Pointer parallax (mouse only — touch scrolling shouldn't shake the camera) + clock.
  useEffect(() => {
    const s = director.current
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      s.pointerX = (e.clientX / window.innerWidth) * 2 - 1
      s.pointerY = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    const tick = (time: number, deltaMs: number) => {
      s.time = time
      const k = 1 - Math.exp((-deltaMs / 1000) * 2.5)
      s.px += (s.pointerX - s.px) * k
      s.py += (s.pointerY - s.py) * k
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    gsap.ticker.add(tick)
    return () => {
      window.removeEventListener('pointermove', onMove)
      gsap.ticker.remove(tick)
    }
  }, [])

  // Slow push-in once the invitation opens.
  useEffect(() => {
    if (!enabled) return
    const s = director.current
    const tween = reducedMotion
      ? gsap.set(s, { introZ: 0 })
      : gsap.fromTo(s, { introZ: INTRO_PUSH }, { introZ: 0, duration: 6, ease: 'power2.out' })
    return () => {
      tween.kill()
    }
  }, [enabled, reducedMotion])

  useLayoutEffect(() => {
    const el = main.current
    if (!enabled || !el) return
    const s = director.current
    let timeline: gsap.core.Timeline | undefined
    let pending = 0

    const build = () => {
      timeline?.scrollTrigger?.kill()
      timeline?.kill()

      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const keys = Array.from(el.querySelectorAll<HTMLElement>('[data-scene]')).map((section) => {
        const top = section.getBoundingClientRect().top + window.scrollY
        // A pinned scene is "on its mark" halfway through its sticky hold.
        const hold = top + Math.max(0, (section.offsetHeight - window.innerHeight) / 2)
        return { id: section.dataset.scene as SceneId, pos: Math.min(maxScroll, hold) }
      })
      if (!keys.length) return
      keys[0].pos = 0
      keys[keys.length - 1].pos = maxScroll

      const tl = gsap.timeline({
        defaults: { ease: 'sine.inOut', immediateRender: false },
        scrollTrigger: { start: 0, end: maxScroll, scrub: reducedMotion ? true : 1.1 },
      })
      tl.set(s, { ...sceneValues(keys[0].id, reducedMotion), couple: SCENE_KEYFRAMES[keys[0].id].couple, veil: 1, curtains: 0 }, 0)

      for (let i = 0; i < keys.length - 1; i++) {
        const a = keys[i]
        const b = keys[i + 1]
        const d = Math.max(1, b.pos - a.pos)
        tl.fromTo(s, sceneValues(a.id, reducedMotion), { ...sceneValues(b.id, reducedMotion), duration: d }, a.pos)
        const [ca, cb] = [SCENE_KEYFRAMES[a.id].couple, SCENE_KEYFRAMES[b.id].couple]
        if (cb > ca) {
          // The couple steps in late in the move, after the stage and flowers are established.
          tl.fromTo(s, { couple: ca }, { couple: cb, duration: d * 0.55, ease: 'power2.out' }, a.pos + d * 0.4)
        } else if (cb < ca) {
          // …and steps out early, before the next scene's text arrives.
          tl.fromTo(s, { couple: ca }, { couple: cb, duration: d * 0.3, ease: 'power1.in' }, a.pos + d * 0.08)
        }
        if (i === 0) {
          // Opening → hall: the veil dissolves first, then the curtains part.
          tl.fromTo(s, { veil: 1 }, { veil: 0, duration: d * 0.5, ease: 'power1.in' }, a.pos)
          tl.fromTo(s, { curtains: 0 }, { curtains: 1, duration: d * 0.75, ease: 'power2.inOut' }, a.pos + d * 0.25)
        }
      }
      if (keys.length === 1) tl.set(s, { veil: 0, curtains: 1 }, 0)
      timeline = tl
    }

    const schedule = () => {
      window.clearTimeout(pending)
      pending = window.setTimeout(() => {
        build()
        ScrollTrigger.refresh()
      }, 120)
    }

    build()
    const ro = new ResizeObserver(schedule)
    ro.observe(el)
    window.addEventListener('resize', schedule)

    return () => {
      window.clearTimeout(pending)
      ro.disconnect()
      window.removeEventListener('resize', schedule)
      timeline?.scrollTrigger?.kill()
      timeline?.kill()
    }
  }, [main, enabled, reducedMotion])

  return director
}
