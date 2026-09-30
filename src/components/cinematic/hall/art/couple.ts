/**
 * Original bride & groom illustration: an elegant, faceless editorial style
 * (no game-like features). Drawn arm in arm — groom in a black tuxedo, bride
 * in a white A-line gown with a cascade bouquet, with or without hijab.
 *
 * viewBox 170 × 220, feet on y≈214, groom centred on x≈55, bride on x≈115.
 */
import type { SkinTone } from '@/types'
import { dome, place, strand, type Rand } from './flora'

export interface CoupleLook {
  hijab: boolean
  groomSkin: SkinTone
  brideSkin: SkinTone
}

export const DEFAULT_LOOK: CoupleLook = { hijab: false, groomSkin: 'medium', brideSkin: 'medium' }

const SKIN: Record<SkinTone, [base: string, shade: string]> = {
  light: ['#f1d6c1', '#dfbca2'],
  medium: ['#e3bb98', '#cc9d7a'],
  tan: ['#c9976f', '#ae7d58'],
  deep: ['#9a6a4c', '#7c5238'],
}

const HAIR = '#2b211b'
const TUX = '#23201f'
const SHIRT = '#f8f4ec'
const GOLD = '#d8c295'

/** Where the bride's veil hangs from, in couple art units. */
export const VEIL_ANCHOR = { x: 118, y: 26 }

export const COUPLE_DEFS = `
<linearGradient id="tx" x2="1"><stop offset="0" stop-color="#2e2a28"/><stop offset=".6" stop-color="#24201f"/><stop offset="1" stop-color="#1a1817"/></linearGradient>
<linearGradient id="gw" x2="0" y2="1"><stop offset="0" stop-color="#fffefb"/><stop offset="1" stop-color="#f2ebe0"/></linearGradient>
<linearGradient id="gs" x2="1"><stop offset="0" stop-color="#e3d9c9" stop-opacity=".7"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#ddd2c1" stop-opacity=".8"/></linearGradient>
<linearGradient id="hj" x2="0" y2="1"><stop offset="0" stop-color="#fffdf8"/><stop offset="1" stop-color="#eee6d8"/></linearGradient>
<pattern id="lace" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".55" fill="#e9e0d1"/></pattern>`

function groom(skin: string, shade: string) {
  return `
<path d="M44 124L41 208H53L57 134L61 208H73L71 124Z" fill="#1d1b1a"/>
<path d="M49 132L47 206M66 134L67 206" stroke="#35302d" stroke-width="1.2"/>
<path d="M38 207H54V212C54 214 52 215 50 215H40C37 215 36 213 38 207Z" fill="#121111"/>
<path d="M60 207H75C77 213 76 215 73 215H62C60 215 59 214 60 207Z" fill="#121111"/>
<path d="M38 60C31 78 30 100 32 121H40C40 102 41 84 45 66Z" fill="${TUX}"/>
<rect x="32" y="119" width="8" height="3" fill="${SHIRT}"/>
<ellipse cx="36" cy="126" rx="4" ry="5" fill="${skin}"/>
<path d="M37 60C40 53 48 50 55 50C62 50 70 53 73 60L75 102L72 130L55 133L39 130L36 102Z" fill="url(#tx)"/>
<path d="M49 51H61L55 90Z" fill="${SHIRT}"/>
<path d="M49 51L55 90L46 72L44 56Z" fill="#37322f"/><path d="M61 51L55 90L64 72L66 56Z" fill="#37322f"/>
<path d="M50 54L55 56.5L50 59ZM60 54L55 56.5L60 59Z" fill="#111"/><circle cx="55" cy="56.5" r="1.3" fill="#111"/>
<circle cx="55" cy="97" r="1.1" fill="#111"/><circle cx="55" cy="106" r="1.1" fill="#111"/>
<path d="M55 108V133" stroke="#161413" stroke-width=".8"/><path d="M40 78H47" stroke="#3b3634"/>
${place('la', 64, 68, 6, -140, '#5f7259')}${place('bl', 66, 64, 3.2, 20)}
<path d="M70 60C77 70 80 84 79 96L93 101L91 108L74 103C73 90 70 76 65 66Z" fill="${TUX}"/>
<ellipse cx="93" cy="105" rx="3.6" ry="3" fill="${skin}"/>
<path d="M51 40H59V52H51Z" fill="${shade}"/>
<ellipse cx="45.5" cy="31" rx="2" ry="3" fill="${shade}"/>
<ellipse cx="55" cy="30" rx="9.5" ry="12" fill="${skin}"/>
<path d="M46 30C46 37 50 42 55 42C51 40 48 36 47.5 30Z" fill="${shade}" opacity=".45"/>
<path d="M45 31C43 18 51 13 57 13.5C65 14 68 20 66 29C64 23 58 20.5 52 22C49 23 47 26 46.5 31Z" fill="${HAIR}"/>`
}

function brideBody(rand: Rand, skin: string) {
  return `
<path d="M104 88C99 122 91 168 82 213C100 217 150 218 166 214C170 213 170 210 166 208C150 180 138 130 128 88Z" fill="url(#gw)"/>
<path d="M104 88C99 122 91 168 82 213C100 217 150 218 166 214C170 213 170 210 166 208C150 180 138 130 128 88Z" fill="url(#gs)"/>
<path d="M110 92C106 130 100 170 96 212M118 92C119 130 121 170 124 214M124 92C130 130 140 175 152 212" fill="none" stroke="#e6ddcf" stroke-width="1.2"/>
<path d="M84 211C100 215 150 216 165 212" fill="none" stroke="#e9e1d3" stroke-width="2"/>
<path d="M103 60C106 56 124 56 127 60L128 90H102Z" fill="#fffdf9"/>
<path d="M103 60C106 56 124 56 127 60L128 90H102Z" fill="url(#lace)"/>
<path d="M102 87H128V91H102Z" fill="${GOLD}" opacity=".9"/>
<path d="M106 61C99 70 96 86 95 100L101 102C102 90 105 76 110 68Z" fill="#fbf8f2" stroke="#e3d9c9" stroke-width=".8"/>
<ellipse cx="96" cy="103.5" rx="3.6" ry="3" fill="${skin}"/>
<path d="M124 61C131 70 132 86 128 98L114 104L113 98L123 93C124 84 122 74 118 67Z" fill="#fbf8f2" stroke="#e3d9c9" stroke-width=".8"/>
<ellipse cx="113" cy="101" rx="3.4" ry="3" fill="${skin}"/>
${strand(rand, 110, 106, 38, { size: 4, tone: 'mid', bloomChance: 0.35, drift: -0.08 })}
${strand(rand, 116, 106, 30, { size: 4, tone: 'mid', bloomChance: 0.35, drift: 0.1 })}
<path d="M112 108L109 124M114 108L118 122" stroke="${GOLD}" stroke-width="1"/>
${dome(rand, 112, 100, 15, 10, { tone: 'mid', bloom: 5, blooms: 9, leaves: 16, lilies: 0.2 })}`
}

function brideHead(skin: string, shade: string, hijab: boolean) {
  const blush = `<ellipse cx="118.5" cy="43" rx="2.2" ry="1.4" fill="#e3a292" opacity=".28"/>`
  if (hijab) {
    return `
<path d="M104 40C103 27 108 22 114 22C121 22 125.5 27 125 40C125.5 52 128 60 131 68C122 73 106 73 97 68C101 60 103.5 52 104 40Z" fill="url(#hj)"/>
<path d="M104 52C108 62 118 64 126 58M101 62C110 70 120 70 129 64" fill="none" stroke="#e5dccd" stroke-width="1"/>
<ellipse cx="114.5" cy="40" rx="7" ry="9" fill="${skin}"/>
<path d="M107.5 38C107.5 30 111 28 114.5 28C118 28 121.5 30 121.5 38" fill="none" stroke="#e7dfd1" stroke-width="1.2"/>
<path d="M106 28Q114.5 21 123 28" fill="none" stroke="${GOLD}" stroke-width="1.4"/>
<circle cx="110" cy="25.6" r=".9" fill="#fffaf0"/><circle cx="114.5" cy="24.6" r="1.1" fill="#fffaf0"/><circle cx="119" cy="25.6" r=".9" fill="#fffaf0"/>
${blush}`
  }
  return `
<rect x="110" y="47" width="8" height="11" fill="${shade}"/>
<circle cx="122" cy="31" r="6" fill="${HAIR}"/>
<ellipse cx="114" cy="40" rx="8.5" ry="10.5" fill="${skin}"/>
<path d="M105 42C103 29 109 25 115 25C121 25 125 30 123 38C121 32 116 30 111 31C108 32 106.5 36 106 42Z" fill="${HAIR}"/>
<path d="M107 30Q114 25 121 29" fill="none" stroke="${GOLD}" stroke-width="1.2"/>
<circle cx="110.5" cy="27.8" r=".8" fill="#fffaf0"/><circle cx="114" cy="26.6" r="1" fill="#fffaf0"/><circle cx="117.5" cy="27.2" r=".8" fill="#fffaf0"/>
${blush}`
}

export function drawCouple(rand: Rand, look: CoupleLook) {
  const [gSkin, gShade] = SKIN[look.groomSkin]
  const [bSkin, bShade] = SKIN[look.brideSkin]
  return {
    defs: COUPLE_DEFS,
    body: `<ellipse cx="92" cy="214" rx="78" ry="5" fill="#8a7458" opacity=".22"/>${groom(gSkin, gShade)}${brideBody(
      rand,
      bSkin,
    )}${brideHead(bSkin, bShade, look.hijab)}`,
  }
}

/** Long sheer veil hanging from the bride's head (a separate, swaying layer). */
export function drawVeil() {
  return {
    body: `
<path d="M33 0C46 36 58 100 66 170H38C33 110 28 50 26 3Z" fill="#fff" opacity=".5"/>
<path d="M33 0C46 36 58 100 66 170" fill="none" stroke="#efe8da" stroke-width="1.4" opacity=".85"/>
<path d="M38 170H66" stroke="#efe8da" stroke-width="2" opacity=".7"/>`,
  }
}
