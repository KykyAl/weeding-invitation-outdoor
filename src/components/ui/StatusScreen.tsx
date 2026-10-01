import type { ReactNode } from 'react'

interface StatusScreenProps {
  title: string
  children?: ReactNode
  busy?: boolean
}

/** Quiet full-screen state used for loading / not found / errors. */
export function StatusScreen({ title, children, busy }: StatusScreenProps) {
  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-cream px-8 text-center"
      aria-busy={busy || undefined}
    >
      <span className={`hairline ${busy ? 'status-pulse' : ''}`} aria-hidden="true" />
      <h1 className="font-serif text-2xl italic text-cocoa" role={busy ? 'status' : undefined}>
        {title}
      </h1>
      {children && <div className="max-w-xs text-sm leading-relaxed text-cocoa-soft">{children}</div>}
      <span className={`hairline ${busy ? 'status-pulse' : ''}`} aria-hidden="true" />
    </main>
  )
}
