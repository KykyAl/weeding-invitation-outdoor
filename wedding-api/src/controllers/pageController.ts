import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { RequestHandler } from 'express'
import { env } from '../config/env.js'
import { loadWedding } from './weddingController.js'

/**
 * Link previews (WhatsApp, Telegram, Facebook…): crawlers don't run JavaScript,
 * so `/wedding/:slug` gets its Open Graph tags filled in on the server. The page
 * itself is the normal frontend `index.html`.
 */

const OG_BLOCK = /<!-- og:start[\s\S]*?<!-- og:end -->/
const TITLE = /<title>[^<]*<\/title>/

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ESCAPES[c])

let cachedTemplate: string | undefined

/** The built frontend's index.html (re-read in development so rebuilds show up). */
async function template() {
  if (!cachedTemplate || !env.isProduction) {
    cachedTemplate = await readFile(path.resolve(env.FRONTEND_DIST ?? '', 'index.html'), 'utf8')
  }
  return cachedTemplate
}

const formatDate = (day: string) =>
  new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${day}T00:00:00Z`),
  )

/** GET /wedding/:slug — the invitation page with per-wedding (and per-guest) preview tags. */
export const renderInvitationPage: RequestHandler<{ slug: string }> = async (req, res) => {
  const html = await template()
  const wedding = await loadWedding('slug', req.params.slug)
  if (!wedding) {
    // The frontend shows its own "not found" screen.
    res.status(404).type('html').send(html)
    return
  }

  const origin = `${req.protocol}://${req.get('host')}`
  const guest = typeof req.query.to === 'string' ? req.query.to.replace(/\s+/g, ' ').trim().slice(0, 60) : ''
  const title = `Pernikahan ${wedding.groom.name} & ${wedding.bride.name}`
  const description = [guest && `Kepada Yth. ${guest}`, formatDate(wedding.weddingDate), wedding.venue.name]
    .filter(Boolean)
    .join(' · ')
  // WhatsApp previews are reliable only for JPEG/PNG; other formats (e.g. WebP) use the illustrated default.
  const photo = wedding.gallery.map((g) => g.imageUrl).find((url) => /\.(jpe?g|png)(\?|#|$)/i.test(url))

  const tags: [attr: 'name' | 'property', key: string, value: string][] = [
    ['name', 'description', description],
    ['property', 'og:type', 'website'],
    ['property', 'og:site_name', 'Undangan Pernikahan'],
    ['property', 'og:title', title],
    ['property', 'og:description', description],
    ['property', 'og:url', `${origin}${req.originalUrl}`],
    ['property', 'og:image', photo ?? `${origin}/og-image.jpg`],
    ['property', 'og:image:alt', title],
    ['property', 'og:locale', 'id_ID'],
    ['name', 'twitter:card', 'summary_large_image'],
  ]
  if (!photo) tags.push(['property', 'og:image:width', '1200'], ['property', 'og:image:height', '630'])

  const meta = tags.map(([attr, key, value]) => `<meta ${attr}="${key}" content="${escapeHtml(value)}" />`).join('\n    ')
  res
    .set('Cache-Control', 'no-cache')
    .type('html')
    .send(html.replace(OG_BLOCK, meta).replace(TITLE, `<title>${escapeHtml(title)}</title>`))
}
