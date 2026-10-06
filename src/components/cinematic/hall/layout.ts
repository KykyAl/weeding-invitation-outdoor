/**
 * Depth layout of the illustrated hall: which art sits at which depth, and how
 * each layer reacts to the director (curtains opening, veil fading, sway).
 * Both renderers (WebGL planes and the CSS fallback) consume `resolveLayers`,
 * so they always show the same composition.
 */
import { REST_CAMERA, SCENE_KEYFRAMES, TAN_HALF_FOV } from '@/scenes/timeline'
import type { DirectorState } from '../director'
import { VEIL_ANCHOR, type CoupleLook } from './art/couple'
import { ART_SIZE, type ArtId } from './art/layers'

export interface LayerDef {
  id: string
  art: ArtId
  /** Depth; larger is closer to the camera. */
  z: number
  /** Anchor y (world units). */
  y: number
  x?: number
  /** Uniform scale of the art's natural size. */
  scale?: number
  /** Explicit size (stretches the art); for soft gradients only. */
  w?: number
  h?: number
  anchor?: 'center' | 'top' | 'bottom'
  /** Pin to the left (-1) / right (1) edge of the frame, `inset` units visible. */
  hug?: -1 | 1
  inset?: number
  /** Camera distance used to measure the frame edge for `hug` (default: hall camera). */
  hugCameraZ?: number
  mirror?: boolean
  flipY?: boolean
  role?: 'veil' | 'curtain' | 'glow' | 'couple'
  /** Multiplier for the director's `part`: pushes the layer outward along `hug`. */
  part?: number
  /** Subtle vertical "breathing" scale around the anchor. */
  breath?: { amp: number; speed: number }
  /** Only shown when the couple is a photo (e.g. its ground shadow). */
  photoOnly?: boolean
  opacity?: number
  sway?: { amp: number; speed: number; phase?: number }
  breathe?: { amp: number; speed: number }
}

const OPENING_Z = SCENE_KEYFRAMES.opening.camera[2]

// The couple stands in front of the sofa; the veil hangs from the bride's head.
const COUPLE_SCALE = 0.8
const COUPLE_FEET = -1.95
const COUPLE_ART = ART_SIZE.couple
const VEIL_X = (VEIL_ANCHOR.x / 100 - COUPLE_ART.w / 2) * COUPLE_SCALE
const VEIL_Y = COUPLE_FEET + (COUPLE_ART.h - VEIL_ANCHOR.y / 100) * COUPLE_SCALE
/** World height of a couple photo (head to feet), matching the illustration's scale. */
const PHOTO_HEIGHT = 1.72

export const HALL_LAYERS: readonly LayerDef[] = [
  // BACKGROUND
  { id: 'wall', art: 'wall', z: -5.5, y: 0 },
  { id: 'shafts', art: 'shafts', z: -4.8, y: 1.2, opacity: 0.5, breathe: { amp: 0.25, speed: 0.35 } },
  { id: 'backdrop', art: 'backdrop', z: -4, y: 1.05 },
  // MIDGROUND
  { id: 'stage-glow', art: 'glow', z: -3.2, y: -1.1, w: 4, h: 3.2, role: 'glow', opacity: 0.8, breathe: { amp: 0.15, speed: 0.5 } },
  { id: 'stage', art: 'stage', z: -2.5, y: -2.3, scale: 0.55, anchor: 'bottom' },
  // CHARACTER
  { id: 'couple-glow', art: 'glow', z: -2.1, y: -1, w: 2.4, h: 2.8, role: 'couple', opacity: 0.75, breathe: { amp: 0.2, speed: 0.6 } },
  { id: 'bride-veil', art: 'brideVeil', z: -1.95, x: VEIL_X, y: VEIL_Y, scale: COUPLE_SCALE, anchor: 'top', role: 'couple', sway: { amp: 0.035, speed: 0.7 } },
  { id: 'couple-shadow', art: 'shadow', z: -1.91, y: COUPLE_FEET + 0.03, w: 1.6, h: 0.3, role: 'couple', photoOnly: true },
  { id: 'couple', art: 'couple', z: -1.9, y: COUPLE_FEET, scale: COUPLE_SCALE, anchor: 'bottom', role: 'couple', breath: { amp: 0.0045, speed: 1.1 } },
  { id: 'pedestal-l', art: 'pedestal', z: -1, y: -2.75, scale: 0.78, anchor: 'bottom', hug: -1, inset: 1.12, part: 0.35 },
  { id: 'pedestal-r', art: 'pedestal', z: -1, y: -2.75, scale: 0.78, anchor: 'bottom', hug: 1, inset: 1.12, mirror: true, part: 0.35 },
  // FOREGROUND
  { id: 'curtain-l', art: 'curtain', z: 0.6, y: 3.7, anchor: 'top', hug: -1, inset: 0.42, role: 'curtain', sway: { amp: 0.004, speed: 0.45 } },
  { id: 'curtain-r', art: 'curtain', z: 0.6, y: 3.7, anchor: 'top', hug: 1, inset: 0.42, role: 'curtain', mirror: true, sway: { amp: 0.004, speed: 0.45, phase: 1.7 } },
  { id: 'greenery', art: 'greenery', z: 1.3, y: 3.2, anchor: 'top', sway: { amp: 0.008, speed: 0.55 } },
  { id: 'flowers-l', art: 'foreground', z: 2.4, y: -1.95, scale: 1, anchor: 'bottom', hug: -1, inset: 1.02, part: 1 },
  { id: 'flowers-r', art: 'foreground', z: 2.4, y: -1.95, scale: 1, anchor: 'bottom', hug: 1, inset: 1.02, mirror: true, part: 1 },
  // OPENING VEIL (fades as the camera enters the hall)
  { id: 'veil', art: 'veil', z: 4, y: 0.3, role: 'veil' },
  { id: 'veil-spray-tl', art: 'veilSpray', z: 4.6, y: 2.25, anchor: 'top', hug: -1, inset: 1.15, hugCameraZ: OPENING_Z, role: 'veil' },
  { id: 'veil-spray-br', art: 'veilSpray', z: 4.6, y: -1.65, anchor: 'bottom', hug: 1, inset: 1.15, hugCameraZ: OPENING_Z, role: 'veil', mirror: true, flipY: true },
]

export const layerSize = (l: LayerDef, look?: CoupleLook) => {
  if (l.art === 'couple' && look?.photo) return { w: PHOTO_HEIGHT * look.photo.aspect, h: PHOTO_HEIGHT }
  return {
    w: l.w ?? ART_SIZE[l.art].w * (l.scale ?? 1),
    h: l.h ?? ART_SIZE[l.art].h * (l.scale ?? 1),
  }
}

/** Layers that are switched off for this look (photo vs illustration, photo still loading). */
const isHidden = (l: LayerDef, look?: CoupleLook) =>
  (l.photoOnly && !look?.photo) ||
  (l.art === 'brideVeil' && !!look?.photo) ||
  (!!look?.pending && l.role === 'couple')

export interface ResolvedLayer {
  x: number
  y: number
  rot: number
  sx: number
  sy: number
  opacity: number
}

export const createResolved = () => HALL_LAYERS.map<ResolvedLayer>(() => ({ x: 0, y: 0, rot: 0, sx: 1, sy: 1, opacity: 1 }))

/** Half-width of the frame at depth `z` for a camera at distance `camZ`. */
const halfWidthAt = (z: number, camZ: number, aspect: number) => (camZ - z) * TAN_HALF_FOV * aspect

export function resolveLayers(
  s: DirectorState,
  aspect: number,
  reducedMotion: boolean,
  out: ResolvedLayer[],
  look?: CoupleLook,
) {
  const t = s.time
  for (let i = 0; i < HALL_LAYERS.length; i++) {
    const l = HALL_LAYERS[i]
    const r = out[i]
    const { w, h } = layerSize(l, look)

    let x = l.x ?? 0
    if (l.hug) {
      const halfW = halfWidthAt(l.z, l.hugCameraZ ?? REST_CAMERA[2], aspect)
      const open = l.hug * (halfW + w / 2 - (l.inset ?? 0))
      if (l.role === 'curtain') {
        const closed = l.hug * (w / 2 - 0.06)
        x = closed + (open - closed) * s.curtains
      } else {
        x = open + l.hug * s.part * (l.part ?? 0)
      }
    }

    const rot = l.sway && !reducedMotion ? Math.sin(t * l.sway.speed + (l.sway.phase ?? 0)) * l.sway.amp : 0
    // Rotate around the anchor so hanging layers swing from their top edge.
    let y = l.y
    if (l.anchor === 'top') {
      x += (h / 2) * Math.sin(rot)
      y -= (h / 2) * Math.cos(rot)
    } else if (l.anchor === 'bottom') {
      x -= (h / 2) * Math.sin(rot)
      y += (h / 2) * Math.cos(rot)
    }

    let sy = l.flipY ? -1 : 1
    if (l.breath && !reducedMotion) {
      const k = 1 + Math.sin(t * l.breath.speed) * l.breath.amp
      sy *= k
      // Keep the feet planted: grow from the anchor edge.
      if (l.anchor === 'bottom') y += (h / 2) * (k - 1)
    }

    let opacity = l.opacity ?? 1
    if (l.role === 'veil') opacity *= s.veil
    if (l.role === 'glow') opacity *= s.glow
    if (l.role === 'couple') {
      opacity *= s.couple
      // Rise gently into place as the couple is revealed.
      if (!reducedMotion) y -= (1 - s.couple) * 0.14
    }
    if (l.breathe && !reducedMotion) opacity *= 1 - l.breathe.amp * (0.5 + 0.5 * Math.sin(t * l.breathe.speed))

    r.x = x
    r.y = y
    r.rot = rot
    r.sx = l.mirror ? -1 : 1
    r.sy = sy
    r.opacity = isHidden(l, look) ? 0 : Math.min(1, Math.max(0, opacity))
  }
  return out
}

/** Texture resolution factor: full size on high-DPR phones, lighter elsewhere. */
export function textureQuality() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  return dpr >= 1.75 ? 1 : 0.75
}
