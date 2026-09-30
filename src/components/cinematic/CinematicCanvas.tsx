import type { RefObject } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { CAMERA_FOV, SCENE_KEYFRAMES } from '@/scenes/timeline'
import type { DirectorState } from './director'
import type { CoupleLook } from './hall/art/couple'
import { HallWebGL } from './hall/HallWebGL'

export interface CinematicCanvasProps {
  director: RefObject<DirectorState>
  reducedMotion: boolean
  look: CoupleLook
  onReady?: () => void
}

/** Lazy-loaded WebGL layer. Unlit planes + a few sparkles keep it light for phones. */
export default function CinematicCanvas({ director, reducedMotion, look, onReady }: CinematicCanvasProps) {
  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, 1.75]}
      camera={{ fov: CAMERA_FOV, near: 0.1, far: 40, position: SCENE_KEYFRAMES.opening.camera }}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power', stencil: false }}
    >
      <HallWebGL director={director} reducedMotion={reducedMotion} look={look} onReady={onReady} />
      {!reducedMotion && (
        <Sparkles count={22} position={[0, -0.3, -0.5]} scale={[3.2, 4, 4]} size={2.4} speed={0.15} opacity={0.5} color="#e9d7a8" />
      )}
    </Canvas>
  )
}
