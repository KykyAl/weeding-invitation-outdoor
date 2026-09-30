export type AppRoute =
  | { name: 'wedding'; slug: string }
  | { name: 'not-found' }

const WEDDING_PATH = /^\/wedding\/([^/]+)\/?$/

/** Tiny path matcher: the invitation only needs `/wedding/:slug`. */
export function matchRoute(pathname: string): AppRoute {
  const match = WEDDING_PATH.exec(pathname)
  if (match) return { name: 'wedding', slug: decodeURIComponent(match[1]) }
  return { name: 'not-found' }
}
