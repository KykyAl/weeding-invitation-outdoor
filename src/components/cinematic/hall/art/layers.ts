/**
 * Original illustrated layers of the indoor wedding hall. Each art piece is an
 * SVG whose viewBox is its world size × 100, so 1 world unit = 100 art units.
 * No text is baked in — all wording comes from wedding data in the DOM.
 */
import { DEFAULT_LOOK, drawCouple, drawVeil, type CoupleLook } from './couple'
import { FLORA_DEFS, createRandom, dome, place, spray, strand, type Rand } from './flora'

export type { CoupleLook } from './couple'

export type ArtId =
  | 'wall'
  | 'shafts'
  | 'backdrop'
  | 'glow'
  | 'stage'
  | 'pedestal'
  | 'curtain'
  | 'greenery'
  | 'foreground'
  | 'veil'
  | 'veilSpray'
  | 'couple'
  | 'brideVeil'
  | 'shadow'

interface ArtSpec {
  /** viewBox size (world units × 100). */
  vw: number
  vh: number
  /** Extra transparent margin (art units) so foliage can spill past the drawing. */
  padX?: number
  padTop?: number
  /** Texture width in px at full quality. */
  px: number
  seed: number
  draw: (rand: Rand, look: CoupleLook) => { defs?: string; body: string }
}

const FOLDS = (id: string, stops: string, scale = 0.12) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${scale}" y2="0" spreadMethod="reflect">${stops}</linearGradient>`

const mirrorX = (w: number, body: string) => `<g transform="translate(${w} 0) scale(-1 1)">${body}</g>`

const ART: Record<ArtId, ArtSpec> = {
  wall: {
    vw: 900,
    vh: 1100,
    px: 1024,
    seed: 11,
    draw: () => {
      const win = (x: number) => `
<path d="M${x} 700V235A85 85 0 0 1 ${x + 170} 235V700Z" fill="#efe5d4" stroke="#e0d3bd" stroke-width="3"/>
<path d="M${x + 12} 688V235A73 73 0 0 1 ${x + 158} 235V688Z" fill="url(#gl)"/>
<g stroke="#e3d8c5" stroke-width="3" fill="none">
<path d="M${x + 85} 162V688M${x + 12} 330H${x + 158}M${x + 12} 450H${x + 158}M${x + 12} 570H${x + 158}"/>
<path d="M${x + 85} 235L${x + 33} 183M${x + 85} 235L${x + 137} 183"/></g>
<path d="M${x + 12} 175Q${x + 58} 420 ${x + 34} 688H${x + 12}Z" fill="#fff" opacity=".55"/>
<path d="M${x + 158} 175Q${x + 112} 420 ${x + 136} 688H${x + 158}Z" fill="#fff" opacity=".55"/>
<rect x="${x - 10}" y="700" width="190" height="10" fill="#e6dac6"/>
<ellipse cx="${x + 85}" cy="430" rx="170" ry="320" fill="url(#wl)" opacity=".7"/>`
      return {
        defs: `
<linearGradient id="wg" x2="0" y2="1"><stop offset="0" stop-color="#ebe1d0"/><stop offset=".3" stop-color="#f6f0e5"/><stop offset="1" stop-color="#f2eadc"/></linearGradient>
<linearGradient id="fl" x2="0" y2="1"><stop offset="0" stop-color="#e7dccb"/><stop offset=".1" stop-color="#f3ede2"/><stop offset="1" stop-color="#fcfaf6"/></linearGradient>
<linearGradient id="gl" x2="0" y2="1"><stop offset="0" stop-color="#fffefa"/><stop offset="1" stop-color="#f3ecdf"/></linearGradient>
<radialGradient id="wl" cx=".5" cy=".42" r=".55"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`,
        body: `
<rect width="900" height="820" fill="url(#wg)"/>
<rect y="820" width="900" height="280" fill="url(#fl)"/>
<rect width="900" height="44" fill="#e8ddca"/><rect y="44" width="900" height="8" fill="#ddd0b9"/><rect y="58" width="900" height="2" fill="#d8c295" opacity=".6"/>
<rect x="270" y="110" width="360" height="580" rx="4" fill="none" stroke="#e3d7c3" stroke-width="3"/>
<rect x="290" y="130" width="320" height="540" rx="3" fill="none" stroke="#eadfcd" stroke-width="2"/>
${win(40)}${win(690)}
<g fill="none" stroke="#e3d7c3" stroke-width="2">${[20, 240, 460, 680].map((x) => `<rect x="${x}" y="728" width="200" height="70" rx="3"/>`).join('')}</g>
<rect y="806" width="900" height="16" fill="#e4d8c3"/><rect y="806" width="900" height="2" fill="#d8c9ae"/>
<ellipse cx="125" cy="900" rx="150" ry="40" fill="#fff" opacity=".6"/>
<ellipse cx="775" cy="900" rx="150" ry="40" fill="#fff" opacity=".6"/>
<ellipse cx="450" cy="980" rx="320" ry="70" fill="#fff" opacity=".5"/>`,
      }
    },
  },

  shafts: {
    vw: 600,
    vh: 800,
    px: 256,
    seed: 12,
    draw: () => ({
      defs: `<linearGradient id="sh" x1="0" y1="0" x2=".25" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
      body: `<g fill="url(#sh)">
<polygon points="0,0 90,0 330,800 150,800"/>
<polygon points="120,0 165,0 420,800 330,800" opacity=".6"/>
<polygon points="600,0 545,0 330,800 450,800" opacity=".45"/></g>`,
    }),
  },

  backdrop: {
    vw: 600,
    vh: 750,
    px: 1024,
    seed: 21,
    draw: (rand) => {
      const drape = `<path d="M0 0H230C215 150 180 330 150 430C175 520 215 640 240 750H0Z" fill="url(#fo)"/>
<path d="M230 0C215 150 180 330 150 430C175 520 215 640 240 750" fill="none" stroke="#fffdf8" stroke-width="3" opacity=".8"/>
<ellipse cx="156" cy="430" rx="12" ry="4" fill="#d8c295"/><path d="M156 433L153 452H159Z" fill="#c9ad76" opacity=".8"/>`
      let climb = ''
      for (let y = 575; y > 280; y -= 20) {
        for (const x of [180, 420]) {
          const side = (y / 20) % 2 ? 1 : -1
          climb += place('la', x + side * 4, y, 16 + rand() * 6, side * (35 + rand() * 25), pick3(rand))
          if (rand() < 0.35) climb += place(rand() < 0.5 ? 'bl' : 'bb', x, y - 6, 7 + rand() * 3, rand() * 360)
        }
      }
      return {
        defs: `${FOLDS('fo', '<stop offset="0" stop-color="#fdfbf6"/><stop offset=".5" stop-color="#f2ebdf"/><stop offset="1" stop-color="#e2d6c2"/>')}
<linearGradient id="apg" x2="0" y2="1"><stop offset="0" stop-color="#fdfaf3"/><stop offset="1" stop-color="#f3eadc"/></linearGradient>
<linearGradient id="sw" x2="0" y2="1"><stop offset="0" stop-color="#ede4d6"/><stop offset=".5" stop-color="#fbf8f1"/><stop offset="1" stop-color="#e8dece"/></linearGradient>`,
        body: `
${drape}${mirrorX(600, drape)}
<rect x="168" y="588" width="264" height="24" rx="2" fill="#eee5d5" stroke="#e1d5c0"/>
<path d="M180 590V270A120 120 0 0 1 420 270V590Z" fill="url(#apg)" stroke="#d8c295" stroke-width="3"/>
<path d="M194 578V270A106 106 0 0 1 406 270V578Z" fill="none" stroke="#d8c295" stroke-width="1" opacity=".6"/>
<path d="M300 136L310 150L300 164L290 150Z" fill="#d8c295"/>
<path d="M0 0H600V26C470 122 130 122 0 26Z" fill="url(#sw)"/>
<path d="M0 0H600V12C480 72 120 72 0 12Z" fill="#fbf8f1" opacity=".9"/>
<path d="M120 42C220 92 380 92 480 42M60 30C200 104 400 104 540 30" fill="none" stroke="#e4d8c4" stroke-width="2"/>
${climb}
${dome(rand, 300, 150, 82, 30, { tone: 'light', bloom: 15, blooms: 12, leaves: 26 })}
${dome(rand, 205, 212, 40, 28, { tone: 'light', bloom: 11, blooms: 5, leaves: 14 })}
${dome(rand, 395, 212, 40, 28, { tone: 'light', bloom: 11, blooms: 5, leaves: 14 })}
${dome(rand, 178, 572, 72, 50, { tone: 'mid', bloom: 17, blooms: 14, leaves: 30, trails: 3, trailLen: 45 })}
${dome(rand, 422, 572, 72, 50, { tone: 'mid', bloom: 17, blooms: 14, leaves: 30, trails: 3, trailLen: 45 })}`,
      }
    },
  },

  glow: {
    vw: 200,
    vh: 200,
    px: 128,
    seed: 31,
    draw: () => ({
      defs: `<radialGradient id="g"><stop offset="0" stop-color="#fff6e2" stop-opacity=".95"/><stop offset=".55" stop-color="#fff3dc" stop-opacity=".35"/><stop offset="1" stop-color="#fff3dc" stop-opacity="0"/></radialGradient>`,
      body: `<rect width="200" height="200" fill="url(#g)"/>`,
    }),
  },

  stage: {
    vw: 500,
    vh: 400,
    padX: 40,
    px: 1024,
    seed: 41,
    draw: (rand) => {
      const arm = `<path d="M126 290V252C126 234 148 228 160 244V290Z" fill="url(#up)" stroke="#6b4a35" stroke-width="4" stroke-linejoin="round"/>
<circle cx="136" cy="246" r="6" fill="none" stroke="#5b3c2b" stroke-width="3"/>
<path d="M146 294C144 300 141 302 138 305" fill="none" stroke="#5b3c2b" stroke-width="5" stroke-linecap="round"/>
<rect x="-22" y="-18" width="44" height="36" rx="11" transform="translate(186 242) rotate(-8)" fill="#f1e8d8" stroke="#e1d4bd" stroke-width="1.5"/>`
      const candles = `<circle cx="104" cy="262" r="20" fill="url(#cg)"/><circle cx="115" cy="270" r="16" fill="url(#cg)"/>
<rect x="99" y="266" width="10" height="30" rx="1.5" fill="#fbf7ee" stroke="#e6dac6"/><ellipse cx="104" cy="261" rx="2.2" ry="5" fill="#f3d9a0"/>
<rect x="111" y="276" width="9" height="20" rx="1.5" fill="#fbf7ee" stroke="#e6dac6"/><ellipse cx="115.5" cy="271" rx="2" ry="4.5" fill="#f3d9a0"/>`
      const urn = (cx: number) => `
<path d="M${cx - 14} 296H${cx + 14}L${cx + 9} 286H${cx - 9}Z" fill="#d8c295"/>
<rect x="${cx - 5}" y="270" width="10" height="16" fill="#e9dfcc"/>
<path d="M${cx - 28} 232C${cx - 28} 262 ${cx - 12} 272 ${cx} 272C${cx + 12} 272 ${cx + 28} 262 ${cx + 28} 232Z" fill="url(#ur)" stroke="#d8c295" stroke-width="1.5"/>
<rect x="${cx - 31}" y="227" width="62" height="6" rx="3" fill="#d8c295" opacity=".85"/>`
      const arrangement = (cx: number, dir: number) =>
        spray(rand, cx, 215, -90 - dir * 12, 95, { size: 11, tone: 'mid', blooms: 3 }) +
        spray(rand, cx, 215, dir > 0 ? -150 : -30, 80, { size: 10, tone: 'mid', blooms: 2 }) +
        dome(rand, cx, 205, 50, 40, { tone: 'mid', bloom: 12, blooms: 14, leaves: 28, trails: 4, trailLen: 58, lilies: 0.25 })

      let tufts = ''
      for (let row = 0, y = 206; y < 252; y += 13, row++) {
        for (let x = 168 + (row % 2) * 10; x <= 332; x += 20) {
          if (Math.abs(x - 250) < 70 + (y - 200) * 1.4) tufts += `<circle cx="${x}" cy="${y}" r="1.6"/>`
        }
      }

      return {
        defs: `
<linearGradient id="up" x2="0" y2="1"><stop offset="0" stop-color="#faf5ec"/><stop offset="1" stop-color="#e9dfcd"/></linearGradient>
<linearGradient id="pff" x2="0" y2="1"><stop offset="0" stop-color="#efe7d9"/><stop offset="1" stop-color="#e3d8c5"/></linearGradient>
<linearGradient id="ur" x2="1"><stop offset="0" stop-color="#e8dcc6"/><stop offset=".45" stop-color="#fbf8f1"/><stop offset="1" stop-color="#e2d5bd"/></linearGradient>
<radialGradient id="cg"><stop offset="0" stop-color="#fff1cf" stop-opacity=".9"/><stop offset="1" stop-color="#fff1cf" stop-opacity="0"/></radialGradient>`,
        body: `
<ellipse cx="250" cy="388" rx="265" ry="10" fill="#d6c8b0" opacity=".3"/>
<rect x="10" y="342" width="480" height="10" fill="#f7f2ea"/><rect x="10" y="352" width="480" height="32" fill="url(#pff)"/>
<rect x="45" y="296" width="410" height="10" fill="#fbf8f2"/><rect x="45" y="306" width="410" height="36" fill="url(#pff)"/>
<rect x="45" y="306" width="410" height="2" fill="#d8c295" opacity=".8"/><rect x="10" y="352" width="480" height="2" fill="#d8c295" opacity=".6"/>
<ellipse cx="250" cy="298" rx="132" ry="6" fill="#bca98a" opacity=".35"/>
${urn(58)}${urn(442)}
${arrangement(58, -1)}${arrangement(442, 1)}
<path d="M142 262C138 214 160 190 196 192C214 158 286 158 304 192C340 190 362 214 358 262Z" fill="url(#up)" stroke="#6b4a35" stroke-width="4.5" stroke-linejoin="round"/>
<path d="M154 258C152 222 168 204 198 205C216 176 284 176 302 205C332 204 348 222 346 258Z" fill="#fbf7ef" opacity=".7"/>
<g fill="#d6c7ad">${tufts}</g>
${place('lc', 250, 164, 16, -62, '#6b4a35')}${place('lc', 250, 164, 16, 62, '#6b4a35')}<circle cx="250" cy="163" r="3.2" fill="#86624a"/>
${arm}${mirrorX(500, arm)}
<rect x="-22" y="-18" width="44" height="36" rx="11" transform="translate(314 242) rotate(8)" fill="#cfd6c4" stroke="#b9c3ad" stroke-width="1.5"/>
<rect x="150" y="256" width="200" height="26" rx="9" fill="#fcf8f0" stroke="#e0d3bd" stroke-width="2"/>
<path d="M250 258V280" stroke="#e6dac6" stroke-width="2"/>
<path d="M130 282H370C368 292 360 296 350 296H150C140 296 132 292 130 282Z" fill="#5b3c2b"/>
<circle cx="250" cy="289" r="3" fill="#86624a"/>
${candles}${mirrorX(500, candles)}`,
      }
    },
  },

  pedestal: {
    vw: 120,
    vh: 300,
    padX: 36,
    padTop: 16,
    px: 320,
    seed: 51,
    draw: (rand) => ({
      defs: `
<linearGradient id="cw" x2="1"><stop offset="0" stop-color="#3f2a1f"/><stop offset=".4" stop-color="#6b4a35"/><stop offset=".55" stop-color="#86624a"/><stop offset="1" stop-color="#4a3124"/></linearGradient>
<linearGradient id="vs" x2="1"><stop offset="0" stop-color="#e5d9c3"/><stop offset=".45" stop-color="#fbf8f1"/><stop offset="1" stop-color="#ddd0b8"/></linearGradient>`,
      body: `
<ellipse cx="60" cy="296" rx="46" ry="5" fill="#bfae90" opacity=".4"/>
<rect x="30" y="276" width="60" height="16" fill="url(#cw)"/><rect x="26" y="289" width="68" height="8" rx="2" fill="#3f2a1f"/>
<rect x="40" y="150" width="40" height="126" fill="url(#cw)"/>
<g stroke="#3f2a1f" stroke-opacity=".35" stroke-width="1.5"><path d="M48 156V270M56 156V270M64 156V270M72 156V270"/></g>
<rect x="32" y="142" width="56" height="10" rx="2" fill="#5b3c2b"/><rect x="36" y="136" width="48" height="6" fill="#86624a"/>
<path d="M42 136C38 118 40 104 50 96H70C80 104 82 118 78 136Z" fill="url(#vs)" stroke="#dccfb6"/>
${strand(rand, 26, 92, 115, { tone: 'deep', size: 9, drift: -0.12, bloomChance: 0.1 })}
${strand(rand, 94, 92, 95, { tone: 'deep', size: 9, drift: 0.1, bloomChance: 0.1 })}
${strand(rand, 40, 100, 60, { tone: 'mid', size: 8, drift: -0.05 })}
${dome(rand, 60, 76, 54, 40, { tone: 'deep', bloom: 11, blooms: 14, leaves: 30, lilies: 0.3 })}`,
    }),
  },

  curtain: {
    vw: 200,
    vh: 620,
    px: 320,
    seed: 61,
    draw: () => {
      const edge = 'C182 170 170 360 176 480C180 540 190 590 200 620'
      return {
        defs: `${FOLDS('fo', '<stop offset="0" stop-color="#fefcf8"/><stop offset=".45" stop-color="#f4ede2"/><stop offset=".8" stop-color="#e6dbc9"/><stop offset="1" stop-color="#dccfb8"/>', 0.14)}
<linearGradient id="cv" x2="0" y2="1"><stop offset="0" stop-color="#cdbd9f" stop-opacity=".45"/><stop offset=".14" stop-color="#cdbd9f" stop-opacity="0"/><stop offset=".85" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".5"/></linearGradient>`,
        body: `
<path d="M0 0H196${edge}H0Z" fill="url(#fo)"/>
<path d="M0 0H196${edge}H0Z" fill="url(#cv)"/>
<path d="M190 0${edge.replace('C182', 'C176')}" fill="none" stroke="#e0d4c0" stroke-width="10" opacity=".35"/>
<path d="M196 0${edge}" fill="none" stroke="#fffdf8" stroke-width="3" opacity=".9"/>
<ellipse cx="100" cy="616" rx="110" ry="7" fill="#e3d8c6" opacity=".6"/>`,
      }
    },
  },

  greenery: {
    vw: 360,
    vh: 180,
    // Dense canopy above the garland so upward camera tilts never reveal an edge.
    padTop: 70,
    px: 1024,
    seed: 71,
    draw: (rand) => {
      let back = ''
      for (let y = -70; y < 0; y += 12) {
        for (let x = -10; x < 372; x += 16) {
          back += place(pick3Sym(rand), x + rand() * 16, y + rand() * 12, 18 + rand() * 12, rand() * 360, deepOrMid(rand))
        }
      }
      for (let i = 0; i < 16; i++) {
        back += place(rand() < 0.3 ? 'ly' : 'bl', rand() * 360, -60 + rand() * 60, 8 + rand() * 6, rand() * 360)
      }
      for (let x = -10; x < 372; x += 14) {
        for (let k = 0; k < 3; k++) {
          back += place(pick3Sym(rand), x + rand() * 14, rand() * 26, 15 + rand() * 12, 110 + rand() * 140, deepOrMid(rand))
        }
      }
      let strands = ''
      for (let x = 0; x < 362; x += 13) {
        const edge = Math.abs(x - 180) / 180
        const len = 25 + edge * edge * 120 + rand() * 35
        strands += strand(rand, x + rand() * 8, 16 + rand() * 10, len, {
          tone: rand() < 0.55 ? 'deep' : 'mid',
          size: 8.5 + rand() * 3.5,
          bloomChance: 0.12,
        })
      }
      let blooms = ''
      for (let i = 0; i < 22; i++) {
        blooms += place(rand() < 0.3 ? 'ly' : 'bl', rand() * 360, 8 + rand() * 24, 8 + rand() * 6, rand() * 360)
      }
      let front = ''
      for (let x = 0; x < 372; x += 20) {
        front += place('la', x + rand() * 10, 4 + rand() * 10, 18 + rand() * 8, 180 + (rand() - 0.5) * 90, deepOrMid(rand))
      }
      return { body: back + strands + blooms + front }
    },
  },

  foreground: {
    vw: 150,
    vh: 150,
    px: 384,
    seed: 81,
    draw: (rand) => {
      let leaves = ''
      for (let i = 0; i < 16; i++) {
        const angle = -100 + rand() * 95
        leaves += place(rand() < 0.6 ? 'la' : 'lb', rand() * 40, 150 - rand() * 36, 32 + rand() * 30, angle + 90, deepOrMid(rand))
      }
      return {
        defs: `<filter id="df" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.3"/></filter>`,
        body: `<g filter="url(#df)">${leaves}
${spray(rand, 0, 132, -58, 112, { size: 16, tone: 'deep', blooms: 2 })}
${dome(rand, 38, 120, 52, 38, { tone: 'deep', bloom: 18, blooms: 7, leaves: 12 })}</g>`,
      }
    },
  },

  veil: {
    vw: 300,
    vh: 520,
    px: 512,
    seed: 91,
    draw: () => ({
      defs: `
<linearGradient id="vg" x2="0" y2="1"><stop offset="0" stop-color="#fbf8f1"/><stop offset="1" stop-color="#f3ebde"/></linearGradient>
<radialGradient id="vr" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<filter id="nz" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .42 0 0 0 0 .35 0 0 0 0 .27 0 0 0 .07 0"/></filter>`,
      body: `
<rect width="300" height="520" fill="url(#vg)"/><rect width="300" height="520" fill="url(#vr)"/>
<rect width="300" height="520" filter="url(#nz)"/>
<path d="M90 410V185A60 60 0 0 1 210 185V410Z" fill="none" stroke="#d8c295" stroke-width="1.2"/>
<path d="M96 404V185A54 54 0 0 1 204 185V404Z" fill="none" stroke="#d8c295" stroke-width=".5" opacity=".7"/>
${place('lc', 150, 118, 9, -55, '#d8c295')}${place('lc', 150, 118, 9, 55, '#d8c295')}
<circle cx="150" cy="120" r="1.8" fill="#b8975a"/>`,
    }),
  },

  couple: {
    vw: 170,
    vh: 220,
    px: 512,
    seed: 111,
    draw: (rand, look) => drawCouple(rand, look),
  },

  brideVeil: {
    vw: 70,
    vh: 170,
    px: 160,
    seed: 121,
    draw: () => drawVeil(),
  },

  shadow: {
    vw: 200,
    vh: 40,
    px: 128,
    seed: 131,
    draw: () => ({
      defs: `<radialGradient id="s"><stop offset="0" stop-color="#4a3a2e" stop-opacity=".42"/><stop offset=".6" stop-color="#4a3a2e" stop-opacity=".16"/><stop offset="1" stop-color="#4a3a2e" stop-opacity="0"/></radialGradient>`,
      body: `<rect width="200" height="40" fill="url(#s)"/>`,
    }),
  },

  veilSpray: {
    vw: 160,
    vh: 200,
    px: 400,
    seed: 101,
    draw: (rand) => ({
      body: `
${spray(rand, -8, 18, 28, 105, { size: 10, tone: 'light', blooms: 2 })}
${spray(rand, 8, -10, 78, 125, { size: 10, tone: 'mid', blooms: 3 })}
${spray(rand, -6, -6, 52, 155, { size: 12, tone: 'light', blooms: 5 })}`,
    }),
  },
}

function pick3(rand: Rand) {
  return ['#8a9c82', '#9fae94', '#aebba4'][Math.floor(rand() * 3)]
}
function deepOrMid(rand: Rand) {
  return ['#34453a', '#3e5445', '#4a5f4c', '#5f7259', '#6f8466'][Math.floor(rand() * 5)]
}
function pick3Sym(rand: Rand) {
  return (['la', 'lb', 'la'] as const)[Math.floor(rand() * 3)]
}

const box = (a: ArtSpec) => {
  const padX = a.padX ?? 0
  const padTop = a.padTop ?? 0
  return { x: -padX, y: -padTop, w: a.vw + padX * 2, h: a.vh + padTop }
}

/** World size (units) of each art piece, including its padding. */
export const ART_SIZE: Record<ArtId, { w: number; h: number }> = Object.fromEntries(
  Object.entries(ART).map(([id, a]) => {
    const b = box(a)
    return [id, { w: b.w / 100, h: b.h / 100 }]
  }),
) as Record<ArtId, { w: number; h: number }>

const cache = new Map<string, string>()

/** Art pieces whose drawing depends on the couple's appearance. */
const LOOK_DEPENDENT = new Set<ArtId>(['couple'])

/**
 * Data URL for an art piece rasterised at `quality` (0–1) of its full texture
 * size. The same URL feeds WebGL textures and the HTML/CSS fallback.
 */
export function getArtUrl(id: ArtId, quality = 1, look: CoupleLook = DEFAULT_LOOK): string {
  // A real cut-out photo replaces the illustrated couple.
  if (id === 'couple' && look.photo) return look.photo.url
  const variant = LOOK_DEPENDENT.has(id) ? `:${look.hijab ? 'h' : 'n'}-${look.groomSkin}-${look.brideSkin}` : ''
  const key = `${id}@${quality}${variant}`
  const hit = cache.get(key)
  if (hit) return hit

  const spec = ART[id]
  const { defs = '', body } = spec.draw(createRandom(spec.seed), look)
  const b = box(spec)
  const pxW = Math.round(((spec.px * b.w) / spec.vw) * quality)
  const pxH = Math.round((pxW * b.h) / b.w)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${pxW}" height="${pxH}" viewBox="${b.x} ${b.y} ${b.w} ${b.h}" preserveAspectRatio="none"><defs>${FLORA_DEFS}${defs}</defs>${body}</svg>`
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s*\n\s*/g, ' '))}`
  cache.set(key, url)
  return url
}
