import { SCENE_KEYFRAMES, type SceneId } from '@/scenes/timeline'

/**
 * Mutable per-frame state shared by the GSAP timeline (writer) and the WebGL /
 * CSS renderers (readers). Lives in a ref so animation never re-renders React.
 */
export interface DirectorState {
  /** Camera position driven by the scroll timeline. */
  x: number
  y: number
  z: number
  glow: number
  wash: number
  /** Opening veil opacity (1 = covering the hall). */
  veil: number
  /** Foreground curtains, 0 = closed, 1 = open. */
  curtains: number
  /** Couple reveal, 0 = hidden, 1 = fully present. */
  couple: number
  /** Foreground flowers parting outward (world units). */
  part: number
  /** Extra camera distance for the time-based push-in after opening. */
  introZ: number
  /** Raw and eased pointer position (-1…1) for subtle parallax. */
  pointerX: number
  pointerY: number
  px: number
  py: number
  /** Seconds, from the GSAP ticker. */
  time: number
}

export const INTRO_PUSH = 1.2

export function createDirectorState(reducedMotion: boolean): DirectorState {
  const { camera, glow, wash, couple, part } = SCENE_KEYFRAMES.opening
  return {
    couple,
    part,
    x: camera[0],
    y: camera[1],
    z: camera[2],
    glow,
    wash,
    veil: 1,
    curtains: 0,
    introZ: reducedMotion ? 0 : INTRO_PUSH,
    pointerX: 0,
    pointerY: 0,
    px: 0,
    py: 0,
    time: 0,
  }
}

/** Keyframe values for a scene (except `couple`, which has its own easing); reduced motion flattens camera travel. */
export function sceneValues(id: SceneId, reducedMotion: boolean) {
  const { camera, glow, wash, part } = SCENE_KEYFRAMES[id]
  if (!reducedMotion) return { x: camera[0], y: camera[1], z: camera[2], glow, wash, part }
  const rest = SCENE_KEYFRAMES.hall.camera
  return { x: 0, y: rest[1] + (camera[1] - rest[1]) * 0.5, z: rest[2] + (camera[2] - rest[2]) * 0.4, glow, wash, part }
}

export interface CameraPose {
  x: number
  y: number
  z: number
}

/** Final camera pose: timeline position + pointer parallax + idle drift. */
export function computeCamera(s: DirectorState, reducedMotion: boolean, out: CameraPose): CameraPose {
  if (reducedMotion) {
    out.x = s.x
    out.y = s.y
    out.z = s.z + s.introZ
    return out
  }
  out.x = s.x + s.px * 0.12 + Math.sin(s.time * 0.17) * 0.03
  out.y = s.y + s.py * 0.07 + Math.sin(s.time * 0.23 + 1.3) * 0.02
  out.z = s.z + s.introZ
  return out
}
