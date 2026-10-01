/** Scrolls the page to `y`, smoothly unless the guest prefers reduced motion. */
export function scrollToY(y: number) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' })
}

/** Document-relative top of an element. */
export const pageTop = (el: Element) => el.getBoundingClientRect().top + window.scrollY

/**
 * Scroll position where a pinned scene is "on its mark" (halfway through its
 * sticky hold) — the same point the camera director uses.
 */
export const pinnedHoldY = (section: HTMLElement) =>
  pageTop(section) + Math.max(0, (section.offsetHeight - window.innerHeight) / 2)
