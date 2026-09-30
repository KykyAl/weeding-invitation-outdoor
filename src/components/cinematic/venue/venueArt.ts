/**
 * Original illustrated ballroom for the Venue scene, in one-point perspective:
 * back wall with arched windows and a floral stage arch, a crystal chandelier,
 * an aisle lined with chairs and flower stands, and a foreground floral frame.
 * Each part is its own layer so the scene can parallax inside its arch frame.
 */
import { FLORA_DEFS, createRandom, dome, place, strand, type Rand } from '../hall/art/flora'

export type VenueLayerId = 'room' | 'chandelier' | 'aisle' | 'frame'

const toUrl = (w: number, h: number, body: string, defs = '') =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w * 2}" height="${h * 2}" viewBox="0 0 ${w} ${h}"><defs>${FLORA_DEFS}${defs}</defs>${body}</svg>`,
  )}`

const FOLDS = `<linearGradient id="fo" x2=".18" spreadMethod="reflect"><stop offset="0" stop-color="#fdfbf6"/><stop offset=".55" stop-color="#f1e9dc"/><stop offset="1" stop-color="#e0d4c0"/></linearGradient>`

function room(rand: Rand) {
  const backWin = (x: number) => `
<path d="M${x} 200V92A15 15 0 0 1 ${x + 30} 92V200Z" fill="url(#gl)" stroke="#e2d6c2" stroke-width="1.5"/>
<path d="M${x + 15} 78V200M${x} 130H${x + 30}M${x} 165H${x + 30}" stroke="#e6dccb" stroke-width="1"/>`
  const sideWin = (flip: boolean) => {
    const pts = [
      [12, 70, 42, 84, 42, 205, 12, 228],
      [48, 88, 62, 95, 62, 212, 48, 220],
    ]
    return pts
      .map(([a, b, c, d, e, f, g, h]) => {
        const X = (v: number) => (flip ? 300 - v : v)
        return `<polygon points="${X(a)},${b} ${X(c)},${d} ${X(e)},${f} ${X(g)},${h}" fill="url(#gl)" stroke="#e2d6c2"/>`
      })
      .join('')
  }
  const drape = `<path d="M0 0H34C30 90 24 190 30 320H0Z" fill="url(#fo)"/><path d="M34 0C30 90 24 190 30 320" fill="none" stroke="#fffdf8" stroke-width="2"/>`
  return toUrl(
    300,
    400,
    `
<rect width="300" height="400" fill="url(#rg)"/>
<polygon points="0,0 70,40 70,232 0,300" fill="#ece2d2"/><polygon points="300,0 230,40 230,232 300,300" fill="#ece2d2"/>
<polygon points="0,0 300,0 230,40 70,40" fill="#e7dccb"/>
<path d="M70 40H230M40 22H260M20 10H280" stroke="#dccfb8" stroke-width="1.2"/>
${sideWin(false)}${sideWin(true)}
${backWin(80)}${backWin(190)}
<g fill="#fff" opacity=".28"><polygon points="42,84 62,95 140,400 70,400"/><polygon points="258,84 238,95 160,400 230,400"/></g>
<path d="M118 226V120A32 32 0 0 1 182 120V226Z" fill="#fbf7ef" stroke="#d8c295" stroke-width="1.6"/>
<rect x="108" y="222" width="84" height="10" fill="#f3ece0" stroke="#e2d6c1" stroke-width=".8"/>
${dome(rand, 150, 92, 30, 12, { tone: 'light', bloom: 5, blooms: 9, leaves: 18 })}
${dome(rand, 118, 214, 18, 14, { tone: 'mid', bloom: 5, blooms: 6, leaves: 14, trails: 2, trailLen: 14 })}
${dome(rand, 182, 214, 18, 14, { tone: 'mid', bloom: 5, blooms: 6, leaves: 14, trails: 2, trailLen: 14 })}
${drape}<g transform="translate(300 0) scale(-1 1)">${drape}</g>`,
    `<linearGradient id="rg" x2="0" y2="1"><stop offset="0" stop-color="#ebe1d0"/><stop offset=".5" stop-color="#f8f3ea"/><stop offset="1" stop-color="#f1e9dc"/></linearGradient>
<linearGradient id="gl" x2="0" y2="1"><stop offset="0" stop-color="#fffefa"/><stop offset="1" stop-color="#f1e9da"/></linearGradient>${FOLDS}`,
  )
}

function chandelier() {
  const arms = [18, 39, 81, 102]
  const cups = arms
    .map(
      (x) => `<path d="M60 70Q${(60 + x) / 2} ${x < 60 ? 88 : 88} ${x} 72" fill="none" stroke="#c9ad76" stroke-width="2"/>
<circle cx="${x}" cy="60" r="11" fill="url(#cg)"/><rect x="${x - 2.5}" y="60" width="5" height="11" fill="#fbf7ee"/>
<ellipse cx="${x}" cy="58" rx="1.6" ry="3.4" fill="#f3d9a0"/><path d="M${x - 5} 72H${x + 5}" stroke="#c9ad76" stroke-width="2"/>`,
    )
    .join('')
  const drops = (x1: number, x2: number, sag: number) => {
    let s = `<path d="M${x1} 74Q${(x1 + x2) / 2} ${74 + sag} ${x2} 74" fill="none" stroke="#efe6d2" stroke-width=".6"/>`
    for (let i = 1; i < 6; i++) {
      const t = i / 6
      const x = x1 + (x2 - x1) * t
      const y = 74 + sag * 4 * t * (1 - t) * 0.5
      s += `<ellipse cx="${x}" cy="${y + 2}" rx="1.3" ry="2.2" fill="#fff" stroke="#e3d6bb" stroke-width=".4"/>`
    }
    return s
  }
  const hanging = [30, 45, 60, 75, 90]
    .map((x, i) => {
      const len = 16 + (i % 2 ? 6 : 12)
      return `<path d="M${x} 78V${78 + len}" stroke="#efe6d2" stroke-width=".6"/><ellipse cx="${x}" cy="${80 + len}" rx="2" ry="3.6" fill="#fff" stroke="#e3d6bb" stroke-width=".5"/>`
    })
    .join('')
  return toUrl(
    120,
    150,
    `
<circle cx="60" cy="70" r="46" fill="url(#cg)" opacity=".6"/>
<path d="M60 0V48" stroke="#c9ad76" stroke-width="1.6"/>
<ellipse cx="60" cy="50" rx="6" ry="4" fill="#d8c295"/>
<path d="M56 52C54 62 54 72 60 80C66 72 66 62 64 52Z" fill="#d8c295"/>
${cups}${drops(18, 39, 12)}${drops(39, 60, 14)}${drops(60, 81, 14)}${drops(81, 102, 12)}${hanging}
<ellipse cx="60" cy="112" rx="3" ry="5" fill="#fff" stroke="#e3d6bb" stroke-width=".6"/>`,
    `<radialGradient id="cg"><stop offset="0" stop-color="#fff3d6" stop-opacity=".95"/><stop offset="1" stop-color="#fff3d6" stop-opacity="0"/></radialGradient>`,
  )
}

function aisle(rand: Rand) {
  let rows = ''
  const petals: string[] = []
  const horizon = 232
  for (let r = 0; r < 7; r++) {
    const t = Math.pow((r + 1) / 7, 1.35)
    const y = horizon + (400 - horizon) * t
    const s = 0.28 + 0.9 * t
    const half = 12 + (68 - 12) * t
    for (const side of [-1, 1]) {
      for (let c = 0; c < 4; c++) {
        const x = 150 + side * (half + 8 * s + c * 20 * s)
        rows += `<rect x="${x - 6 * s}" y="${y - 20 * s}" width="${12 * s}" height="${18 * s}" rx="${3 * s}" fill="#fcf9f3" stroke="#e1d5c0" stroke-width="${0.6 * s}"/>
<rect x="${x - 6 * s}" y="${y - 12 * s}" width="${12 * s}" height="${3 * s}" fill="#b9c4ad" opacity=".8"/>`
      }
      if (r % 2 === 1) {
        const sx = 150 + side * (half + 2 * s)
        rows += `<path d="M${sx} ${y}V${y - 34 * s}" stroke="#c9ad76" stroke-width="${1.2 * s}"/>
${dome(rand, sx, y - 38 * s, 9 * s, 7 * s, { tone: 'mid', bloom: 3.2 * s, blooms: 5, leaves: 10, trails: 1, trailLen: 14 * s })}`
      }
    }
  }
  for (let i = 0; i < 40; i++) {
    const t = Math.pow(rand(), 0.7)
    const y = horizon + (400 - horizon) * t
    const half = (12 + (68 - 12) * t) * 0.9
    const x = 150 + (rand() * 2 - 1) * half
    const s = 0.6 + 2.2 * t
    petals.push(
      `<ellipse cx="${x}" cy="${y}" rx="${1.6 * s}" ry="${0.9 * s}" transform="rotate(${Math.round(rand() * 180)} ${x} ${y})" fill="${
        rand() < 0.7 ? '#fffdf8' : '#ecd8cf'
      }" opacity=".9"/>`,
    )
  }
  return toUrl(
    300,
    400,
    `
<polygon points="0,300 70,${horizon} 230,${horizon} 300,300 300,400 0,400" fill="url(#fl)"/>
<polygon points="138,${horizon} 162,${horizon} 218,400 82,400" fill="#fffdf8"/>
<path d="M138 ${horizon}L82 400M162 ${horizon}L218 400" stroke="#d8c295" stroke-width="1.2"/>
${petals.join('')}${rows}`,
    `<linearGradient id="fl" x2="0" y2="1"><stop offset="0" stop-color="#ede4d5"/><stop offset="1" stop-color="#fbf8f3"/></linearGradient>`,
  )
}

function frame(rand: Rand) {
  let top = ''
  for (let x = 0; x <= 300; x += 16) {
    const edge = Math.abs(x - 150) / 150
    top += strand(rand, x + rand() * 6, -4, 20 + edge * edge * 90 + rand() * 20, { tone: 'deep', size: 8, bloomChance: 0.15 })
  }
  for (let x = 0; x <= 300; x += 14) {
    top += place('la', x + rand() * 8, 2 + rand() * 6, 14 + rand() * 6, 180 + (rand() - 0.5) * 80, '#4a5f4c')
  }
  return toUrl(
    300,
    400,
    `<g filter="url(#df)">
${dome(rand, 8, 392, 70, 50, { tone: 'deep', bloom: 16, blooms: 9, leaves: 18 })}
${dome(rand, 292, 392, 70, 50, { tone: 'deep', bloom: 16, blooms: 9, leaves: 18 })}</g>${top}`,
    `<filter id="df" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.2"/></filter>`,
  )
}

let cache: Record<VenueLayerId, string> | undefined

export function getVenueArt(): Record<VenueLayerId, string> {
  cache ??= {
    room: room(createRandom(201)),
    chandelier: chandelier(),
    aisle: aisle(createRandom(203)),
    frame: frame(createRandom(204)),
  }
  return cache
}
