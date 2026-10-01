/**
 * "Dibuat oleh …" credit at the end of every invitation, configured at build
 * time (VITE_CREDIT_NAME, optional VITE_CREDIT_URL). Hidden when no name is set.
 */
const name = (import.meta.env.VITE_CREDIT_NAME ?? '').trim()
const rawUrl = (import.meta.env.VITE_CREDIT_URL ?? '').trim()

console.log(`CREDIT: name=${name}, url=${rawUrl}`)

/** Only http(s) links are used. */
const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : undefined

export const CREDIT = name ? { name, url } : null
