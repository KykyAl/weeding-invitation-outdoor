/**
 * Camera direction per scene.
 *
 * The director (see `hooks/useCinematicDirector`) measures where each scene
 * actually sits in the scroll and eases between these keyframes with a
 * scrubbed GSAP timeline, so scroll behaves like a camera timeline no matter
 * how much content a wedding has.
 */
export type SceneId =
  | 'opening'
  | 'hall'
  | 'couple'
  | 'story'
  | 'event'
  | 'venue'
  | 'gallery'
  | 'rsvp'
  | 'closing'

export type Vec3 = [x: number, y: number, z: number]

export interface SceneKeyframe {
  camera: Vec3
  /** Warm light intensity behind the stage (1 = neutral). */
  glow: number
  /** Cream wash over the hall so text-heavy scenes stay readable (0–1). */
  wash: number
  /** Couple visibility (0 hidden → 1 revealed). */
  couple: number
  /** How far the foreground flowers part outward (world units). */
  part: number
}

export const SCENE_ORDER: readonly SceneId[] = [
  'opening',
  'hall',
  'couple',
  'story',
  'event',
  'venue',
  'gallery',
  'rsvp',
  'closing',
]

export const SCENE_KEYFRAMES: Record<SceneId, SceneKeyframe> = {
  opening: { camera: [0, 0.3, 9.5], glow: 0.6, wash: 0, couple: 0, part: 0 },
  hall: { camera: [0, 0.1, 7.2], glow: 1, wash: 0, couple: 0, part: 0 },
  couple: { camera: [0, -0.75, 5.2], glow: 1.15, wash: 0, couple: 1, part: 0.55 },
  // Text-led scenes tilt up to the ivory arch panel; the couple steps back out of the light.
  story: { camera: [-0.2, 1.1, 6.6], glow: 1, wash: 0.58, couple: 0, part: 0.3 },
  event: { camera: [0.2, 1.05, 6.9], glow: 1, wash: 0.62, couple: 0, part: 0.3 },
  venue: { camera: [0, 0.4, 8], glow: 0.9, wash: 0.78, couple: 0, part: 0.2 },
  gallery: { camera: [-0.2, 0, 7.4], glow: 1, wash: 0.8, couple: 0, part: 0.3 },
  rsvp: { camera: [0.2, -0.1, 6.9], glow: 1, wash: 0.8, couple: 0, part: 0.3 },
  closing: { camera: [0, -0.55, 5.6], glow: 1.3, wash: 0.25, couple: 1, part: 0.5 },
}

/** Vertical field of view shared by the WebGL camera and the CSS fallback. */
export const CAMERA_FOV = 40
export const TAN_HALF_FOV = Math.tan(((CAMERA_FOV / 2) * Math.PI) / 180)

/** The composition is laid out for the hall camera. */
export const REST_CAMERA = SCENE_KEYFRAMES.hall.camera
