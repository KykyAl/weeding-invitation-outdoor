import type { Wedding } from '@/types'

/** Every scene receives the full wedding record; none hold their own data. */
export interface SceneProps {
  wedding: Wedding
  /** The invitation has been opened (used by scenes with a timed intro). */
  active?: boolean
  /** Guest name from `?to=` (for personal touches such as prefilling RSVP). */
  guestName?: string | null
}
