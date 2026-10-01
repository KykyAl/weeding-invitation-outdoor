import { useRef, type ReactNode } from 'react'
import type { SceneId } from '@/scenes/timeline'
import { useSceneTimeline } from '@/hooks/useSceneTimeline'
import { pinnedHoldY, scrollToY } from '@/utils/scroll'

interface SceneSectionProps {
  id: SceneId
  label: string
  children: ReactNode
  className?: string
  /** Scroll length in viewport heights. */
  length?: number
  /**
   * Pinned scenes hold their content on screen (sticky) while the camera
   * moves, then fade it out before the next scene — like a shot, not a page.
   */
  pin?: boolean
  /** When set, content plays in on a timer once `true` instead of on scroll. */
  play?: boolean
  /** Pinned scenes: ScrollTrigger [start, end] for the intro (relative to the section top). */
  revealAt?: [start: string, end: string]
  /** Pinned scenes fade out before the next one; the final scene stays. */
  fadeOut?: boolean
}

/** Semantic wrapper for a scene. Children marked `data-reveal` animate in sequence. */
export function SceneSection({
  id,
  label,
  children,
  className = '',
  length = 1,
  pin = false,
  play,
  revealAt,
  fadeOut = true,
}: SceneSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  useSceneTimeline(sectionRef, contentRef, { pin, play, revealAt, fadeOut })

  return (
    <section
      ref={sectionRef}
      id={id}
      aria-label={label}
      data-scene={id}
      style={{ minHeight: `${length * 100}dvh` }}
      className="relative"
      // A pinned scene's content may be faded out; bring the scene on screen when focus lands in it.
      onFocus={
        pin
          ? (e) => {
              const hold = pinnedHoldY(e.currentTarget)
              if (Math.abs(window.scrollY - hold) > window.innerHeight * 0.25) scrollToY(hold)
            }
          : undefined
      }
    >
      <div
        ref={contentRef}
        className={`flex flex-col items-center text-center ${
          pin ? 'sticky top-0 h-dvh justify-center px-8' : 'min-h-dvh justify-center px-8 py-24'
        } ${className}`}
      >
        {children}
      </div>
    </section>
  )
}
