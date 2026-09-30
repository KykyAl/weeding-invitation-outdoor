import type { CoupleLook } from '@/components/cinematic/hall/art/couple'
import type { Wedding } from '@/types'

/** How the couple is illustrated, from backend appearance data (with neutral defaults). */
export function getCoupleLook(wedding: Wedding): CoupleLook {
  return {
    hijab: wedding.bride.appearance?.hijab ?? false,
    groomSkin: wedding.groom.appearance?.skinTone ?? 'medium',
    brideSkin: wedding.bride.appearance?.skinTone ?? 'medium',
  }
}
