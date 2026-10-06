import { lazy, Suspense, useCallback, useEffect, useState, type RefObject } from 'react'
import { chooseHallRenderer, whenIdle } from '@/utils/renderer'
import type { DirectorState } from './director'
import type { CoupleLook } from './hall/art/couple'
import { HallFallback } from './hall/HallFallback'
import { SceneWash } from './SceneWash'
import { WebGLErrorBoundary } from './WebGLErrorBoundary'

const CinematicCanvas = lazy(() => import('./CinematicCanvas'))

interface CinematicBackdropProps {
  director: RefObject<DirectorState>
  reducedMotion: boolean
  look: CoupleLook
  /** The invitation has been opened; heavier work may start. */
  started: boolean
}

/**
 * Fixed, stage-sized visual layer behind the scroll content. The CSS hall
 * renders immediately; on capable devices the WebGL hall is loaded once the
 * guest opens the invitation and replaces it when its textures are ready.
 */
export function CinematicBackdrop({ director, reducedMotion, look, started }: CinematicBackdropProps) {
  const [loadWebGL, setLoadWebGL] = useState(false)
  const [webglReady, setWebglReady] = useState(false)
  const handleReady = useCallback(() => setWebglReady(true), [])
  const handleError = useCallback(() => setWebglReady(false), [])

  // Keep the cover snappy: probe the GPU and fetch three.js only after opening, when idle.
  // (and only once the couple photo's size is known, so textures load once).
  useEffect(() => {
    if (!started || look.pending) return
    return whenIdle(() => {
      if (chooseHallRenderer(reducedMotion) === 'webgl') setLoadWebGL(true)
    })
  }, [started, reducedMotion, look.pending])

  return (
    <div className="pointer-events-none fixed inset-y-0 left-1/2 z-0 w-[var(--stage-width)] -translate-x-1/2 overflow-hidden bg-cream">
      {!webglReady && <HallFallback director={director} reducedMotion={reducedMotion} look={look} />}
      {loadWebGL && (
        <WebGLErrorBoundary fallback={null} onError={handleError}>
          <Suspense fallback={null}>
            <div className="absolute inset-0">
              <CinematicCanvas director={director} reducedMotion={reducedMotion} look={look} onReady={handleReady} />
            </div>
          </Suspense>
        </WebGLErrorBoundary>
      )}
      <SceneWash director={director} />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_55%,rgba(122,103,87,0.18))]"
      />
    </div>
  )
}
