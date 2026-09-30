/**
 * Procedural botanical primitives (leaves, blooms, hanging strands, domes,
 * sprays) rendered as compact SVG using shared <symbol>s. Seeded, so every
 * build produces the same illustration.
 */

export type Rand = () => number

export function createRandom(seed: number): Rand {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Tone = 'deep' | 'mid' | 'light'

const LEAF_TONES: Record<Tone, string[]> = {
  deep: ['#34453a', '#3e5445', '#4a5f4c', '#56694f'],
  mid: ['#5f7259', '#6f8466', '#7f937a', '#8a9c82'],
  light: ['#9fae94', '#aebba4', '#bcc7b1', '#c7d0bc'],
}

const STEM: Record<Tone, string> = { deep: '#3e5445', mid: '#6f8466', light: '#aebba4' }

const r1 = (v: number) => Math.round(v * 10) / 10
const r2 = (v: number) => Math.round(v * 100) / 100
const pt = (p: readonly number[]) => `${r1(p[0])} ${r1(p[1])}`

export const pick = <T>(rand: Rand, list: readonly T[]): T => list[Math.floor(rand() * list.length)]
const leafColor = (rand: Rand, tone: Tone) => pick(rand, LEAF_TONES[tone])

type Sym = 'la' | 'lb' | 'lc' | 'bl' | 'ly' | 'bb' | 'bd'

/** Places a symbol. Leaves point "up" (-y) at rotate(0); blooms have radius 1. */
export function place(sym: Sym, x: number, y: number, scale: number, rotate = 0, fill?: string) {
  return `<use href="#${sym}" transform="translate(${r1(x)} ${r1(y)}) rotate(${Math.round(rotate)}) scale(${r2(scale)})"${
    fill ? ` fill="${fill}"` : ''
  }/>`
}

const petals = (angles: number[], shape: string) => angles.map((a) => shape.replace('{a}', String(a))).join('')

/** Shared defs every botanical SVG includes. */
export const FLORA_DEFS = `
<radialGradient id="pg" cx=".5" cy=".65" r=".7"><stop offset="0" stop-color="#fffefb"/><stop offset=".65" stop-color="#fbf7ef"/><stop offset="1" stop-color="#e6dccb"/></radialGradient>
<radialGradient id="pc" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="#f6ecd4"/><stop offset="1" stop-color="#d6c095"/></radialGradient>
<symbol id="la" overflow="visible"><path d="M0 0C.34-.22.36-.72 0-1C-.36-.72-.34-.22 0 0Z"/><path d="M0-.05V-.9" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width=".035"/></symbol>
<symbol id="lb" overflow="visible"><path d="M0 0C.56-.1.6-.8 0-1C-.6-.8-.56-.1 0 0Z"/><path d="M0-.05V-.85" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width=".03"/></symbol>
<symbol id="lc" overflow="visible"><path d="M0 0C.14-.3.12-.8 0-1C-.12-.8-.14-.3 0 0Z"/></symbol>
<symbol id="bl" overflow="visible"><circle cx=".1" cy=".16" r="1" fill="#6b5a44" opacity=".1"/>${petals(
  [0, 72, 144, 216, 288],
  '<ellipse cy="-.48" rx=".5" ry=".56" transform="rotate({a})" fill="url(#pg)" stroke="#ddd2bd" stroke-width=".025"/>',
)}${petals(
  [36, 108, 180, 252, 324],
  '<ellipse cy="-.3" rx=".38" ry=".4" transform="rotate({a})" fill="url(#pg)" stroke="#e4dac8" stroke-width=".02"/>',
)}${petals(
  [0, 120, 240],
  '<ellipse cy="-.12" rx=".22" ry=".2" transform="rotate({a})" fill="#fdfaf3" stroke="#e4dac8" stroke-width=".02"/>',
)}<circle r=".12" fill="url(#pc)"/></symbol>
<symbol id="ly" overflow="visible"><circle cx=".08" cy=".12" r=".85" fill="#6b5a44" opacity=".08"/>${petals(
  [0, 60, 120, 180, 240, 300],
  '<path d="M0 0C.22-.25.18-.78 0-1C-.18-.78-.22-.25 0 0Z" transform="rotate({a})" fill="url(#pg)" stroke="#ddd2bd" stroke-width=".02"/>',
)}${petals(
  [20, 90, 160, 230, 300],
  '<path d="M0 0V-.5" transform="rotate({a})" stroke="#c8ad78" stroke-width=".025"/><ellipse cy="-.52" rx=".04" ry=".07" transform="rotate({a})" fill="#b8975a"/>',
)}<circle r=".09" fill="#e4ebd3"/></symbol>
<symbol id="bb" overflow="visible">${[
  [0, 0],
  [0.35, -0.2],
  [-0.3, -0.25],
  [0.1, -0.45],
  [-0.15, 0.3],
  [0.4, 0.25],
]
  .map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".16" fill="#fffdf8" stroke="#e2d9c7" stroke-width=".03"/>`)
  .join('')}</symbol>
<symbol id="bd" overflow="visible"><ellipse rx=".35" ry=".5" fill="url(#pg)" stroke="#ddd2bd" stroke-width=".03"/><path d="M-.3.2Q0 .62.3.2Z" fill="#8a9c82"/></symbol>`

type Vec = [number, number]

function bezier(p0: Vec, p1: Vec, p2: Vec, p3: Vec, t: number): Vec {
  const u = 1 - t
  const a = u * u * u
  const b = 3 * u * u * t
  const c = 3 * u * t * t
  const d = t * t * t
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]]
}

interface StrandOptions {
  tone?: Tone
  size?: number
  bloomChance?: number
  /** Horizontal drift of the tip, as a fraction of the length. */
  drift?: number
}

/** A hanging vine: stem curving down with alternating leaves tapering to the tip. */
export function strand(rand: Rand, x: number, y: number, len: number, o: StrandOptions = {}) {
  const tone = o.tone ?? 'mid'
  const size = o.size ?? 10
  const drift = (o.drift ?? (rand() - 0.5) * 0.35) * len
  const p0: Vec = [x, y]
  const p1: Vec = [x + drift * 0.1, y + len * 0.35]
  const p2: Vec = [x + drift * 0.7, y + len * 0.7]
  const p3: Vec = [x + drift, y + len]

  let s = `<path d="M${pt(p0)}C${pt(p1)} ${pt(p2)} ${pt(p3)}" fill="none" stroke="${STEM[tone]}" stroke-width="${r2(
    size * 0.08,
  )}" stroke-linecap="round"/>`

  const count = Math.max(3, Math.round(len / (size * 0.55)))
  for (let i = 0; i < count; i++) {
    const t = (i + 1) / (count + 1)
    const [px, py] = bezier(p0, p1, p2, p3, t)
    const side = i % 2 ? 1 : -1
    const ls = size * (1 - t * 0.45) * (0.8 + rand() * 0.4)
    s += place(rand() < 0.65 ? 'la' : 'lb', px, py, ls, 180 + side * (30 + rand() * 35), leafColor(rand, tone))
    if (rand() < (o.bloomChance ?? 0)) {
      s += place(rand() < 0.5 ? 'bb' : 'bd', px + side * ls * 0.3, py, size * 0.35, rand() * 360)
    }
  }
  s += place('la', p3[0], p3[1] - size * 0.2, size * 0.55, 180 + (rand() - 0.5) * 20, leafColor(rand, tone))
  return s
}

interface DomeOptions {
  tone?: Tone
  bloom?: number
  blooms?: number
  leaves?: number
  trails?: number
  trailLen?: number
  lilies?: number
}

/** A rounded floral arrangement: radiating foliage, packed blooms, optional trailing vines. */
export function dome(rand: Rand, cx: number, cy: number, rx: number, ry: number, o: DomeOptions = {}) {
  const tone = o.tone ?? 'mid'
  const bloom = o.bloom ?? 12
  let s = ''

  for (let i = 0; i < (o.leaves ?? 24); i++) {
    const a = rand() * Math.PI * 2
    const k = 0.7 + rand() * 0.45
    const x = cx + Math.cos(a) * rx * k
    const y = cy + Math.sin(a) * ry * k
    const rot = (a * 180) / Math.PI + 90 + (rand() - 0.5) * 30
    s += place(pick(rand, ['la', 'lb', 'la', 'lc'] as const), x, y, bloom * (1.3 + rand() * 1.1), rot, leafColor(rand, tone))
  }

  for (let i = 0; i < (o.trails ?? 0); i++) {
    const u = rand() * 2 - 1
    s += strand(rand, cx + u * rx * 0.8, cy + ry * 0.45, (o.trailLen ?? 50) * (0.6 + rand() * 0.6), {
      tone,
      size: bloom * 0.85,
      drift: u * 0.3,
      bloomChance: 0.15,
    })
  }

  const blooms: { x: number; y: number; r: number }[] = []
  for (let i = 0, guard = 0; i < (o.blooms ?? 10) && guard < 400; guard++) {
    const u = rand() * 2 - 1
    const v = rand() * 2 - 1
    if (u * u + v * v > 1) continue
    blooms.push({ x: cx + u * rx * 0.85, y: cy + v * ry * 0.8, r: bloom * (0.7 + rand() * 0.5) })
    i++
  }
  blooms.sort((a, b) => a.y - b.y)

  for (const b of blooms) {
    if (rand() < 0.35) {
      s += place('la', b.x + (rand() - 0.5) * b.r * 2, b.y + b.r * 0.4, b.r * 0.9, (rand() - 0.5) * 160, leafColor(rand, 'mid'))
    }
    s += place(rand() < (o.lilies ?? 0.2) ? 'ly' : 'bl', b.x, b.y, b.r, rand() * 360)
  }

  for (let i = 0; i < Math.round(blooms.length * 0.6); i++) {
    const a = rand() * Math.PI * 2
    const k = rand()
    s += place('bb', cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k, bloom * 0.35, rand() * 360)
  }
  return s
}

interface SprayOptions {
  tone?: Tone
  size?: number
  blooms?: number
}

/** A branch growing in `angle` (degrees, 0 = right, 90 = down) with leaves and blooms near the base. */
export function spray(rand: Rand, x: number, y: number, angle: number, len: number, o: SprayOptions = {}) {
  const tone = o.tone ?? 'mid'
  const size = o.size ?? 12
  const a = (angle * Math.PI) / 180
  const dir: Vec = [Math.cos(a), Math.sin(a)]
  const nrm: Vec = [-dir[1], dir[0]]
  const bend = (rand() - 0.5) * 0.3 * len
  const p0: Vec = [x, y]
  const p3: Vec = [x + dir[0] * len + nrm[0] * bend, y + dir[1] * len + nrm[1] * bend]
  const p1: Vec = [x + dir[0] * len * 0.33, y + dir[1] * len * 0.33]
  const p2: Vec = [x + dir[0] * len * 0.66 + nrm[0] * bend * 0.8, y + dir[1] * len * 0.66 + nrm[1] * bend * 0.8]

  let s = `<path d="M${pt(p0)}C${pt(p1)} ${pt(p2)} ${pt(p3)}" fill="none" stroke="${STEM[tone]}" stroke-width="${r2(
    size * 0.09,
  )}" stroke-linecap="round"/>`

  const count = Math.max(4, Math.round(len / (size * 0.5)))
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count
    const [px, py] = bezier(p0, p1, p2, p3, t)
    const side = i % 2 ? 1 : -1
    const rot = angle + side * (40 + rand() * 30) + 90
    s += place(rand() < 0.7 ? 'la' : 'lb', px, py, size * (1.25 - t * 0.6) * (0.8 + rand() * 0.4), rot, leafColor(rand, tone))
  }
  s += place('la', p3[0], p3[1], size * 0.6, angle + 90, leafColor(rand, tone))

  for (let i = 0; i < (o.blooms ?? 3); i++) {
    const t = rand() * 0.55
    const [px, py] = bezier(p0, p1, p2, p3, t)
    const off = (rand() - 0.5) * size * 1.4
    s += place(rand() < 0.25 ? 'ly' : 'bl', px + nrm[0] * off, py + nrm[1] * off, size * (0.75 + rand() * 0.45), rand() * 360)
  }
  for (let i = 0; i < 2; i++) {
    const [px, py] = bezier(p0, p1, p2, p3, 0.6 + rand() * 0.3)
    s += place('bd', px, py, size * 0.4, angle + 90)
  }
  return s
}
