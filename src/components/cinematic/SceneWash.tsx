import { useEffect, useRef, type RefObject } from 'react'
import { gsap } from '@/utils/gsap'
import type { DirectorState } from './director'

/** Soft cream wash over the hall, raised by the director for text-heavy scenes. */
export function SceneWash({ director }: { director: RefObject<DirectorState> }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let last = -1
    const tick = () => {
      const wash = Math.round((director.current?.wash ?? 0) * 1000) / 1000
      if (wash === last || !ref.current) return
      last = wash
      ref.current.style.opacity = String(wash)
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [director])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{ opacity: 0 }}
      className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(251,248,241,0.94),rgba(247,241,230,0.82)_60%,rgba(239,230,214,0.7))]"
    />
  )
}
