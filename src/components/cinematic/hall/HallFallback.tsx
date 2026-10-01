import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { REST_CAMERA, TAN_HALF_FOV } from '@/scenes/timeline'
import { gsap } from '@/utils/gsap'
import { whenIdle } from '@/utils/renderer'
import { computeCamera, type CameraPose, type DirectorState } from '../director'
import type { CoupleLook } from './art/couple'
import { getArtUrl } from './art/layers'
import { HALL_LAYERS, createResolved, layerSize, resolveLayers } from './layout'

/**
 * At the opening the veil card covers the whole hall, so only the veil layers
 * are needed for the first paint. The rest are added one per idle slot (back to
 * front), long before the guest scrolls the veil away. This keeps dozens of
 * large SVGs from being rasterised during page load.
 */
const DEFERRED = HALL_LAYERS.map((l, i) => (l.role === 'veil' ? -1 : i)).filter((i) => i >= 0)
const deferredRank = new Map(DEFERRED.map((layerIndex, rank) => [layerIndex, rank]))

interface HallFallbackProps {
  director: RefObject<DirectorState>
  reducedMotion: boolean
  look: CoupleLook
}

/**
 * HTML/CSS rendition of the same layered hall, used while WebGL loads or when
 * it is unavailable. Layers are projected with the same camera maths as the
 * WebGL scene, so parallax and the camera timeline still work.
 */
export function HallFallback({ director, reducedMotion, look }: HallFallbackProps) {
  const root = useRef<HTMLDivElement>(null)
  const imgs = useRef<(HTMLImageElement | null)[]>([])
  // Vector art scales crisply in <img>, so the smallest raster hint is enough.
  const urls = useMemo(() => HALL_LAYERS.map((l) => getArtUrl(l.art, 0.5, look)), [look])
  const [revealed, setRevealed] = useState(0)

  useEffect(() => {
    if (revealed >= DEFERRED.length) return
    return whenIdle(() => setRevealed((n) => n + 1), 800)
  }, [revealed])

  useEffect(() => {
    const el = root.current
    if (!el) return
    const resolved = createResolved()
    const pose: CameraPose = { x: 0, y: 0, z: 0 }
    let vw = 0
    let vh = 0

    // Size each layer as it appears from the hall camera; per-frame changes are transforms only.
    const size = (img: HTMLImageElement, i: number) => {
      const { w, h } = layerSize(HALL_LAYERS[i])
      const ppu = vh / 2 / ((REST_CAMERA[2] - HALL_LAYERS[i].z) * TAN_HALF_FOV)
      img.style.width = `${w * ppu}px`
      img.style.height = `${h * ppu}px`
      img.dataset.sized = String(vh)
    }
    const measure = () => {
      vw = el.clientWidth
      vh = el.clientHeight
      imgs.current.forEach((img, i) => img && size(img, i))
    }

    const tick = () => {
      const s = director.current
      if (!s || !vh) return
      computeCamera(s, reducedMotion, pose)
      resolveLayers(s, vw / vh, reducedMotion, resolved)
      HALL_LAYERS.forEach((l, i) => {
        const img = imgs.current[i]
        if (!img) return
        // Layers mounted after the last resize are sized on their first frame.
        if (img.dataset.sized !== String(vh)) size(img, i)
        const r = resolved[i]
        const d = pose.z - l.z
        if (d <= 0.05 || r.opacity <= 0.003) {
          img.style.visibility = 'hidden'
          return
        }
        const ppu = vh / 2 / (d * TAN_HALF_FOV)
        const scale = (REST_CAMERA[2] - l.z) / d
        const cx = vw / 2 + (r.x - pose.x) * ppu
        const cy = vh / 2 - (r.y - pose.y) * ppu
        img.style.visibility = 'visible'
        img.style.opacity = String(r.opacity)
        img.style.transform = `translate3d(${cx}px,${cy}px,0) translate(-50%,-50%) rotate(${-r.rot}rad) scale(${
          scale * r.sx
        },${scale * r.sy})`
      })
    }

    measure()
    tick()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    gsap.ticker.add(tick)
    return () => {
      ro.disconnect()
      gsap.ticker.remove(tick)
    }
  }, [director, reducedMotion])

  return (
    <div ref={root} aria-hidden="true" className="absolute inset-0 overflow-hidden bg-cream">
      {HALL_LAYERS.map((l, i) => {
        const rank = deferredRank.get(i)
        if (rank !== undefined && rank >= revealed) return null
        return (
          <img
            key={l.id}
            ref={(el) => {
              imgs.current[i] = el
            }}
            src={urls[i]}
            alt=""
            decoding="async"
            draggable={false}
            className="absolute top-0 left-0 max-w-none origin-center will-change-transform select-none"
          />
        )
      })}
    </div>
  )
}
