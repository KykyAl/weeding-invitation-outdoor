/**
 * Picks how the illustrated hall is drawn. Both renderers show the same layered
 * composition; WebGL adds sparkles, the CSS renderer is lighter. WebGL is used
 * only where it will actually be smooth.
 *
 * `?renderer=css` / `?renderer=webgl` forces one (for testing on real devices).
 */
export type HallRenderer = 'webgl' | 'css'

interface DeviceHints {
  deviceMemory?: number
  connection?: { saveData?: boolean }
}

/** WebGL with real GPU acceleration (software rendering reports a "major performance caveat"). */
function hasWebGL(requireFast: boolean): boolean {
  try {
    const canvas = document.createElement('canvas')
    const attrs: WebGLContextAttributes = { failIfMajorPerformanceCaveat: requireFast, powerPreference: 'low-power' }
    const gl = canvas.getContext('webgl2', attrs) ?? canvas.getContext('webgl', attrs)
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return !!gl
  } catch {
    return false
  }
}

export function chooseHallRenderer(reducedMotion: boolean): HallRenderer {
  const forced = new URLSearchParams(window.location.search).get('renderer')
  if (forced === 'css') return 'css'
  if (forced === 'webgl') return hasWebGL(false) ? 'webgl' : 'css'

  // Without motion WebGL adds nothing but cost.
  if (reducedMotion) return 'css'
  const nav = navigator as Navigator & DeviceHints
  if (nav.connection?.saveData) return 'css'
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return 'css'
  if (nav.hardwareConcurrency && nav.hardwareConcurrency < 4) return 'css'
  return hasWebGL(true) ? 'webgl' : 'css'
}

/** Runs `fn` when the browser is idle (or soon, where idle callbacks are unsupported). */
export function whenIdle(fn: () => void, timeout = 1500): () => void {
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(fn, { timeout })
    return () => window.cancelIdleCallback(id)
  }
  const id = setTimeout(fn, 200)
  return () => clearTimeout(id)
}
