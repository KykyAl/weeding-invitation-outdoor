import { useMemo } from 'react'
import { getGuestNameFromSearch } from '@/utils/guest'

/** Guest name from `?to=`, or `null` when the link isn't personalised. */
export function useGuestName(): string | null {
  return useMemo(() => getGuestNameFromSearch(window.location.search), [])
}
