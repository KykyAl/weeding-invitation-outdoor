import { lazy, Suspense, useCallback, useState, type RefObject } from 'react'
import { useWebGLSupport } from '@/hooks/useWebGLSupport'
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
}

/**
 * Fixed, stage-sized visual layer behind the scroll content. The CSS hall
 * renders immediately; the WebGL hall replaces it once its textures are ready.
 */
export function CinematicBackdrop({ director, reducedMotion, look }: CinematicBackdropProps) {
  const webgl = useWebGLSupport()
  const [webglReady, setWebglReady] = useState(false)
  const handleReady = useCallback(() => setWebglReady(true), [])
  const handleError = useCallback(() => setWebglReady(false), [])

  return (
    <div className="pointer-events-none fixed inset-y-0 left-1/2 z-0 w-[var(--stage-width)] -translate-x-1/2 overflow-hidden bg-cream">
      {!webglReady && <HallFallback director={director} reducedMotion={reducedMotion} look={look} />}
      {webgl && (
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
