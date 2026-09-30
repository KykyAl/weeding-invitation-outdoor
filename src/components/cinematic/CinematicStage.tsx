import type { ReactNode } from 'react'

/**
 * Mobile-first 9:16 stage. On phones it fills the screen; on desktop it is a
 * centred column framed by a soft, blurred linen surround.
 */
export function CinematicStage({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-linen">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 hidden bg-[radial-gradient(ellipse_at_center,var(--color-cream),var(--color-beige))] min-[541px]:block"
      />
      <div className="@container relative mx-auto w-[var(--stage-width)] min-[541px]:shadow-[0_0_80px_-20px_rgba(74,58,46,0.35)]">
        {children}
      </div>
    </div>
  )
}
