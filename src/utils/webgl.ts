let cached: boolean | undefined

/** Detects WebGL support once; the invitation falls back to layered HTML/CSS without it. */
export function isWebGLAvailable(): boolean {
  if (cached !== undefined) return cached
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    cached = !!gl
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    cached = false
  }
  return cached
}
