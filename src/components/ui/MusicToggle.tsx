import { copy } from '@/locales/id'

interface MusicToggleProps {
  playing: boolean
  onToggle: () => void
}

/** Floating music control; stays out of the way of the cinematic stage. */
export function MusicToggle({ playing, onToggle }: MusicToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={playing}
      aria-label={copy.music.label}
      className="fixed right-[max(1rem,calc((100vw-var(--stage-width))/2+1rem))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex h-11 w-11 items-center justify-center rounded-full border border-gold/50 bg-ivory/70 text-cocoa shadow-[0_6px_24px_-12px_rgba(74,58,46,0.45)] backdrop-blur-md transition-colors duration-500 hover:bg-ivory"
    >
      <span className="flex h-3.5 items-end gap-[3px]" aria-hidden="true">
        {[0.55, 1, 0.7].map((h, i) => (
          <span
            key={i}
            className="w-[2px] rounded-full bg-gold transition-transform duration-700 ease-cinematic"
            style={{
              height: '100%',
              transformOrigin: 'bottom',
              transform: `scaleY(${playing ? h : 0.25})`,
            }}
          />
        ))}
      </span>
    </button>
  )
}
