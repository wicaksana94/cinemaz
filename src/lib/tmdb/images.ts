import type { MediaType } from './schemas'

const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p'

export type ImageSlot = 'poster' | 'card' | 'hero' | 'backdrop'

const SLOT_CONFIG: Record<ImageSlot, { size: string; width: number; height: number }> = {
  poster: { size: 'w342', width: 342, height: 513 },
  card: { size: 'w342', width: 342, height: 513 },
  hero: { size: 'w1280', width: 1280, height: 720 },
  backdrop: { size: 'w780', width: 780, height: 439 },
}

export interface ImageInfo {
  src: string
  width: number
  height: number
}

/**
 * Get the full image URL for a TMDB path and slot.
 * Returns null if no path is provided.
 */
export function getImageUrl(
  path: string | null | undefined,
  slot: ImageSlot = 'card',
): ImageInfo | null {
  if (!path) return null
  const config = SLOT_CONFIG[slot]
  return {
    src: `${TMDB_IMG_BASE}/${config.size}${path}`,
    width: config.width,
    height: config.height,
  }
}

/**
 * Get a placeholder/fallback image URL based on media type.
 */
export function getPlaceholderImage(mediaType: MediaType): string {
  return mediaType === 'tv'
    ? '/placeholder-tv.svg'
    : '/placeholder-movie.svg'
}

/**
 * Build alt text for a poster image.
 */
export function getPosterAlt(title: string): string {
  return `Poster ${title}`
}
