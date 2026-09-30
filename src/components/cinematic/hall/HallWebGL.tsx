import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { DoubleSide, SRGBColorSpace, type Mesh, type MeshBasicMaterial, type Texture } from 'three'
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

const prepareTexture = (tex: Texture | Texture[]) => {
  for (const t of Array.isArray(tex) ? tex : [tex]) {
    t.colorSpace = SRGBColorSpace
    t.anisotropy = 1
  }
}

/** The illustrated hall as depth-sorted textured planes (no lights, unlit materials). */
export function HallWebGL({ director, reducedMotion, look, onReady }: HallWebGLProps) {
  const urls = useMemo(() => {
    const q = textureQuality()
    return HALL_LAYERS.map((l) => getArtUrl(l.art, q, look))
  }, [look])
  const textures = useTexture(urls, prepareTexture)

  const meshes = useRef<(Mesh | null)[]>([])
  const resolved = useMemo(() => createResolved(), [])
  const pose = useMemo<CameraPose>(() => ({ x: 0, y: 0, z: 0 }), [])

  useEffect(() => {
    if (!onReady) return
    // Two frames: one to upload textures, one to present the first full frame.
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(onReady)
    })
    return () => cancelAnimationFrame(id)
  }, [onReady])

  useFrame(({ camera, size }) => {
    const s = director.current
    if (!s) return
    computeCamera(s, reducedMotion, pose)
    camera.position.set(pose.x, pose.y, pose.z)
    resolveLayers(s, size.width / size.height, reducedMotion, resolved)

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

  return (
    <>
      {HALL_LAYERS.map((layer, i) => {
        const { w, h } = layerSize(layer)
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
