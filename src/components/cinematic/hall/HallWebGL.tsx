import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { DoubleSide, SRGBColorSpace, Texture, type Mesh, type MeshBasicMaterial, type WebGLRenderer } from 'three'
import { computeCamera, type CameraPose, type DirectorState } from '../director'
import type { CoupleLook } from './art/couple'
import { getArtUrl } from './art/layers'
import { HALL_LAYERS, createResolved, layerSize, resolveLayers, textureQuality } from './layout'

interface HallWebGLProps {
  director: RefObject<DirectorState>
  reducedMotion: boolean
  look: CoupleLook
  onReady?: () => void
}

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

/**
 * Uploads one texture per frame. Uploading an SVG rasterises it synchronously,
 * so doing all layers at once would freeze the page for seconds on a phone.
 * Mirrored layers share a texture.
 */
async function loadTextures(urls: string[], gl: WebGLRenderer, isCancelled: () => boolean) {
  const byUrl = new Map<string, Texture>()
  for (const url of new Set(urls)) {
    const img = new Image()
    img.decoding = 'async'
    // Photos from another domain need CORS to be usable as WebGL textures.
    if (/^https?:/i.test(url)) img.crossOrigin = 'anonymous'
    img.src = url
    await img.decode()
    if (isCancelled()) break
    const texture = new Texture(img)
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 1
    texture.needsUpdate = true
    gl.initTexture(texture)
    byUrl.set(url, texture)
    await nextFrame()
  }
  return byUrl
}

/** The illustrated hall as depth-sorted textured planes (no lights, unlit materials). */
export function HallWebGL({ director, reducedMotion, look, onReady }: HallWebGLProps) {
  const urls = useMemo(() => {
    const q = textureQuality()
    return HALL_LAYERS.map((l) => getArtUrl(l.art, q, look))
  }, [look])
  const gl = useThree((s) => s.gl)
  const [textures, setTextures] = useState<Texture[] | null>(null)

  useEffect(() => {
    let cancelled = false
    let loaded: Map<string, Texture> | undefined
    loadTextures(urls, gl, () => cancelled)
      .then((byUrl) => {
        loaded = byUrl
        if (cancelled) byUrl.forEach((t) => t.dispose())
        else setTextures(urls.map((u) => byUrl.get(u)!))
      })
      // e.g. a photo host without CORS: the CSS renderer simply stays on screen.
      .catch((err) => import.meta.env.DEV && console.warn('[hall] WebGL textures unavailable:', err))
    return () => {
      cancelled = true
      loaded?.forEach((t) => t.dispose())
    }
  }, [urls, gl])

  const meshes = useRef<(Mesh | null)[]>([])
  const resolved = useMemo(() => createResolved(), [])
  const pose = useMemo<CameraPose>(() => ({ x: 0, y: 0, z: 0 }), [])

  useEffect(() => {
    if (!onReady || !textures) return
    // Two frames: one to upload textures, one to present the first full frame.
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(onReady)
    })
    return () => cancelAnimationFrame(id)
  }, [onReady, textures])

  useFrame(({ camera, size }) => {
    const s = director.current
    if (!s) return
    computeCamera(s, reducedMotion, pose)
    camera.position.set(pose.x, pose.y, pose.z)
    resolveLayers(s, size.width / size.height, reducedMotion, resolved, look)

    for (let i = 0; i < HALL_LAYERS.length; i++) {
      const mesh = meshes.current[i]
      if (!mesh) continue
      const r = resolved[i]
      const visible = r.opacity > 0.003 && pose.z - HALL_LAYERS[i].z > 0.05
      mesh.visible = visible
      if (!visible) continue
      mesh.position.set(r.x, r.y, HALL_LAYERS[i].z)
      mesh.rotation.z = r.rot
      mesh.scale.set(r.sx, r.sy, 1)
      ;(mesh.material as MeshBasicMaterial).opacity = r.opacity
    }
  })

  if (!textures) return null

  return (
    <>
      {HALL_LAYERS.map((layer, i) => {
        const { w, h } = layerSize(layer, look)
        return (
          <mesh
            key={layer.id}
            ref={(el) => {
              meshes.current[i] = el
            }}
            renderOrder={i}
          >
            <planeGeometry args={[w, h]} />
            <meshBasicMaterial
              map={textures[i]}
              transparent
              depthTest={false}
              depthWrite={false}
              toneMapped={false}
              side={DoubleSide}
            />
          </mesh>
        )
      })}
    </>
  )
}
