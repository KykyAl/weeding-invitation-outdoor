import { Children, useRef, type ReactNode } from 'react'
import { shotScrollY, useShotSequence } from '@/hooks/useShotSequence'
import { scrollToY } from '@/utils/scroll'

interface ShotSequenceProps {
  children: ReactNode
  className?: string
}

/** Stacks its children as full-frame "shots" that play in sequence on scroll. */
export function ShotSequence({ children, className = '' }: ShotSequenceProps) {
  const ref = useRef<HTMLDivElement>(null)
  const shots = Children.toArray(children)
  useShotSequence(ref, shots.length)

  return (
    <div ref={ref} className={`relative w-full flex-1 ${className}`}>
      {shots.map((shot, i) => (
        <div
          key={i}
          data-shot
          // Focusing something inside a shot (keyboard, screen reader) scrolls that shot into view.
          onFocus={(e) => {
            e.stopPropagation()
            const section = e.currentTarget.closest<HTMLElement>('[data-scene]')
            if (section) scrollToY(shotScrollY(section, i, shots.length))
          }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center data-[active]:pointer-events-auto"
        >
          {shot}
        </div>
      ))}
      {shots.length > 1 && (
        <ol aria-hidden="true" className="absolute bottom-0 left-1/2 flex -translate-x-1/2 gap-2.5">
          {shots.map((_, i) => (
            <li
              key={i}
              data-dot
              className="h-1.5 w-1.5 rounded-full bg-gold/25 transition-[background-color,transform] duration-500 data-[active]:scale-125 data-[active]:bg-gold"
            />
          ))}
        </ol>
      )}
    </div>
  )
}
