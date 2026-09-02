import type { MediaSummary, MediaDetail, MediaType, PersonSummary } from './schemas'

interface TmdbListItem {
  id: number
  title?: string
  name?: string
  original_title?: string
  original_name?: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  release_date?: string
  first_air_date?: string
  media_type?: string
}

interface TmdbDetailItem extends TmdbListItem {
  genres: Array<{ id: number; name: string }>
  runtime?: number | null
  number_of_seasons?: number
  tagline?: string
}

/**
 * Determine media type from a raw TMDB item.
 */
export function inferMediaType(item: TmdbListItem): MediaType {
  if (item.media_type === 'tv') return 'tv'
  if (item.media_type === 'movie') return 'movie'
  // Fallback heuristic: TMDB TV shows use "name" instead of "title"
  if (item.name && !item.title) return 'tv'
  return 'movie'
}

/**
 * Extract year from a date string, or null if unavailable.
 */
export function extractYear(dateStr: string | undefined): string | null {
  if (!dateStr) return null
  const match = dateStr.match(/^(\d{4})/)
  return match ? match[1] : null
}

/**
 * Map a raw TMDB list item to a MediaSummary domain object.
 */
export function toMediaSummary(item: TmdbListItem): MediaSummary {
  const mediaType = inferMediaType(item)
  const title = mediaType === 'tv' ? (item.name ?? 'Untitled') : (item.title ?? 'Untitled')
  const originalTitle = mediaType === 'tv' ? item.original_name : item.original_title
  const rawDate = mediaType === 'tv' ? item.first_air_date : item.release_date

  return {
    id: item.id,
    mediaType,
    title,
    originalTitle,
    overview: item.overview || '',
    posterPath: item.poster_path ?? null,
    backdropPath: item.backdrop_path ?? null,
    rating: item.vote_average || null,
    date: rawDate ? (rawDate.length >= 4 ? rawDate.slice(0, 4) : rawDate) : null,
  }
}

/**
 * Map a raw TMDB detail response to a MediaDetail domain object.
 */
export function toMediaDetail(
  item: TmdbDetailItem,
  mediaType?: MediaType,
): MediaDetail {
  const type = mediaType ?? inferMediaType(item)
  const title = type === 'tv' ? (item.name ?? 'Untitled') : (item.title ?? 'Untitled')
  const originalTitle = type === 'tv' ? item.original_name : item.original_title
  const rawDate = type === 'tv' ? item.first_air_date : item.release_date

  return {
    id: item.id,
    mediaType: type,
    title,
    originalTitle,
    overview: item.overview || '',
    posterPath: item.poster_path ?? null,
    backdropPath: item.backdrop_path ?? null,
    rating: item.vote_average || null,
    date: rawDate ? (rawDate.length >= 4 ? rawDate.slice(0, 4) : rawDate) : null,
    genres: item.genres ?? [],
    runtimeMinutes: item.runtime ?? undefined,
    numberOfSeasons: item.number_of_seasons ?? undefined,
    tagline: item.tagline,
  }
}

// ─── Person Mapper ───────────────────────────────────────────────────────────

interface TmdbPersonItem {
  id: number
  name: string
  profile_path: string | null
  known_for_department?: string
  popularity?: number
  known_for?: Array<{ media_type?: string; title?: string; name?: string }>
}

/**
 * Map a raw TMDB person item to a PersonSummary domain object.
 */
export function toPersonSummary(item: TmdbPersonItem): PersonSummary {
  const knownFor = item.known_for
    ?.map((kf) => kf.title ?? kf.name ?? '')
    .filter(Boolean)
    .join(', ')
    || undefined

  return {
    id: item.id,
    name: item.name ?? 'Unknown',
    profilePath: item.profile_path ?? null,
    department: item.known_for_department,
    popularity: item.popularity,
    knownFor,
  }
}
