import { z } from 'zod'

// ─── TMDB Raw Response Schemas ───────────────────────────────────────────────

const tmdbMovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  original_title: z.string().optional(),
  overview: z.string(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  vote_average: z.number(),
  release_date: z.string().optional().default(''),
  media_type: z.string().optional(),
  genre_ids: z.array(z.number()).optional(),
  adult: z.boolean().optional(),
})

const tmdbTvSchema = z.object({
  id: z.number(),
  name: z.string(),
  original_name: z.string().optional(),
  overview: z.string(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  vote_average: z.number(),
  first_air_date: z.string().optional().default(''),
  media_type: z.string().optional(),
  genre_ids: z.array(z.number()).optional(),
})

export const tmdbListResponseSchema = z.object({
  page: z.number(),
  results: z.array(tmdbMovieSchema.or(tmdbTvSchema)),
  total_pages: z.number(),
  total_results: z.number(),
})

// ─── Search Response (multi-search) ──────────────────────────────────────────

const tmdbMultiResultSchema = z.discriminatedUnion('media_type', [
  tmdbMovieSchema.extend({ media_type: z.literal('movie') }),
  tmdbTvSchema.extend({ media_type: z.literal('tv') }),
  z.object({ media_type: z.literal('person') }).passthrough(),
])

export const tmdbSearchResponseSchema = z.object({
  page: z.number(),
  results: z.array(tmdbMultiResultSchema),
  total_pages: z.number(),
  total_results: z.number(),
})

// ─── Detail Response Schemas ─────────────────────────────────────────────────

export const tmdbMovieDetailSchema = tmdbMovieSchema.extend({
  genres: z.array(z.object({ id: z.number(), name: z.string() })),
  runtime: z.number().nullable().optional(),
  status: z.string().optional(),
  tagline: z.string().optional(),
})

export const tmdbTvDetailSchema = tmdbTvSchema.extend({
  genres: z.array(z.object({ id: z.number(), name: z.string() })),
  number_of_seasons: z.number().optional(),
  number_of_episodes: z.number().optional(),
  status: z.string().optional(),
  tagline: z.string().optional(),
})

// ─── Person Schema ──────────────────────────────────────────────────────────

const tmdbPersonSchema = z.object({
  id: z.number(),
  name: z.string(),
  profile_path: z.string().nullable(),
  known_for_department: z.string().optional(),
  popularity: z.number().optional(),
  known_for: z.array(z.object({
    media_type: z.string().optional(),
    title: z.string().optional(),
    name: z.string().optional(),
  }).passthrough()).optional(),
})

export const tmdbPersonListResponseSchema = z.object({
  page: z.number(),
  results: z.array(tmdbPersonSchema),
  total_pages: z.number(),
  total_results: z.number(),
})

export const personSummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  profilePath: z.string().nullable(),
  department: z.string().optional(),
  popularity: z.number().optional(),
  knownFor: z.string().optional(),
})

export type PersonSummary = z.infer<typeof personSummarySchema>

// ─── Internal Domain Types (derived from schemas) ────────────────────────────

export type MediaType = 'movie' | 'tv'

export const mediaSummarySchema = z.object({
  id: z.number(),
  mediaType: z.enum(['movie', 'tv']),
  title: z.string(),
  originalTitle: z.string().optional(),
  overview: z.string(),
  posterPath: z.string().nullable(),
  backdropPath: z.string().nullable(),
  rating: z.number().nullable(),
  date: z.string().nullable(),
})

export type MediaSummary = z.infer<typeof mediaSummarySchema>

export const mediaDetailSchema = mediaSummarySchema.extend({
  genres: z.array(z.object({ id: z.number(), name: z.string() })),
  runtimeMinutes: z.number().optional(),
  numberOfSeasons: z.number().optional(),
  tagline: z.string().optional(),
})

export type MediaDetail = z.infer<typeof mediaDetailSchema>

export const watchlistItemSchema = z.object({
  id: z.number(),
  mediaType: z.enum(['movie', 'tv']),
  title: z.string(),
  posterPath: z.string().nullable(),
  rating: z.number().nullable(),
  date: z.string().nullable(),
  savedAt: z.string(),
})

export type WatchlistItem = z.infer<typeof watchlistItemSchema>

// ─── TMDB Genre ID mapping (for list endpoints that return genre_ids only) ───

export const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
}
