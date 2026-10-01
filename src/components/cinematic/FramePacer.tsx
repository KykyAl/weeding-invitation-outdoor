import { useEffect, type RefObject } from 'react'
import { useThree } from '@react-three/fiber'
import { gsap } from '@/utils/gsap'
import type { DirectorState } from './director'

const IDLE_FPS = 30

/**
 * The canvas renders on demand: every tick while the camera or scene is
 * changing (scrolling, parallax), and at a relaxed 30 fps otherwise, which is
 * plenty for the slow sway, breathing light and sparkles.
 */
export function FramePacer({ director, reducedMotion }: { director: RefObject<DirectorState>; reducedMotion: boolean }) {
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    let last = ''
    let lastIdleFrame = 0
    const tick = (time: number) => {
      const s = director.current
      if (!s) return
      const key = [s.x, s.y, s.z, s.introZ, s.veil, s.curtains, s.couple, s.part, s.glow, s.px, s.py]
        .map((v) => v.toFixed(4))
        .join()
      if (key !== last) {
        last = key
        invalidate()
      } else if (!reducedMotion && time - lastIdleFrame >= 1 / IDLE_FPS) {
        lastIdleFrame = time
        invalidate()
      }
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [director, reducedMotion, invalidate])

  return null
}
