import { useEffect, useMemo, useState } from 'react'
import type { CoupleLook } from '@/components/cinematic/hall/art/couple'
import type { Wedding } from '@/types'
import { getCoupleLook } from '@/utils/appearance'

type PhotoState = { url: string; aspect: number } | { url: string; failed: true }

/**
 * The couple's look, including their cut-out photo when the wedding has one.
 * The photo is preloaded to learn its proportions; if it can't be loaded the
 * illustrated couple is used instead.
 */
export function useCoupleLook(wedding: Wedding): CoupleLook {
  const base = useMemo(() => getCoupleLook(wedding), [wedding])
  const url = wedding.couplePhoto?.url
  const [photo, setPhoto] = useState<PhotoState | null>(null)

  useEffect(() => {
    if (!url) return
    let cancelled = false
    const img = new Image()
    img.onload = () => !cancelled && setPhoto({ url, aspect: img.naturalWidth / img.naturalHeight })
    img.onerror = () => !cancelled && setPhoto({ url, failed: true })
    img.src = url
    return () => {
      cancelled = true
    }
  }, [url])

  return useMemo(() => {
    if (!url) return base
    if (!photo || photo.url !== url) return { ...base, pending: true }
    return 'failed' in photo ? base : { ...base, photo: { url, aspect: photo.aspect } }
  }, [base, url, photo])
}
