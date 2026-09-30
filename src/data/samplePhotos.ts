/**
 * DEVELOPMENT SAMPLE ONLY — soft, abstract placeholder "photos" so the gallery
 * can be designed without real images. Never used in production builds.
 */
import type { ImageAsset } from '@/types'

const TONES = [
  ['#cdb89a', '#6f5a45', '#f4e9d8'],
  ['#aebba4', '#465a48', '#eef0e6'],
  ['#d9b9a8', '#7c5647', '#f8eee6'],
  ['#c7b394', '#5e4b3a', '#f3eadc'],
  ['#9fae94', '#34453a', '#e9ede3'],
  ['#e0c9a2', '#8a6a3f', '#fbf3e6'],
]

function photo(i: number, w: number, h: number) {
  const [base, deep, light] = TONES[i % TONES.length]
  let seed = i * 9301 + 49297
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  const bokeh = Array.from({ length: 14 }, () => {
    const r = 20 + rand() * 90
    return `<circle cx="${rand() * w}" cy="${rand() * h}" r="${r}" fill="${light}" opacity="${0.15 + rand() * 0.35}"/>`
  }).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light}"/><stop offset=".55" stop-color="${base}"/><stop offset="1" stop-color="${deep}"/></linearGradient>
<filter id="b"><feGaussianBlur stdDeviation="${Math.round(w / 40)}"/></filter><filter id="s"><feGaussianBlur stdDeviation="${Math.round(w / 160)}"/></filter></defs>
<rect width="${w}" height="${h}" fill="url(#g)"/><g filter="url(#b)">${bokeh}
<ellipse cx="${w * 0.72}" cy="${h * 0.22}" rx="${w * 0.3}" ry="${h * 0.22}" fill="#fff8ea" opacity=".6"/></g>
<g filter="url(#s)"><circle cx="${w * 0.43}" cy="${h * 0.42}" r="${w * 0.055}" fill="${deep}" opacity=".85"/>
<path d="M${w * 0.35} ${h}C${w * 0.35} ${h * 0.7} ${w * 0.37} ${h * 0.5} ${w * 0.43} ${h * 0.49}C${w * 0.49} ${h * 0.5} ${w * 0.5} ${h * 0.7} ${w * 0.5} ${h}Z" fill="${deep}" opacity=".85"/>
<circle cx="${w * 0.57}" cy="${h * 0.45}" r="${w * 0.05}" fill="#fffdf8" opacity=".95"/>
<path d="M${w * 0.47} ${h}C${w * 0.5} ${h * 0.72} ${w * 0.52} ${h * 0.53} ${w * 0.57} ${h * 0.52}C${w * 0.63} ${h * 0.53} ${w * 0.66} ${h * 0.75} ${w * 0.7} ${h}Z" fill="#fffdf8" opacity=".95"/></g></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const SIZES: [number, number][] = [
  [800, 1000],
  [1200, 800],
  [800, 1000],
  [800, 1200],
  [1200, 800],
  [800, 1000],
]

export const samplePhotos: ImageAsset[] = SIZES.map(([w, h], i) => ({
  url: photo(i, w, h),
  alt: `Foto contoh ${i + 1}`,
  width: w,
  height: h,
}))
