import { describe, it, expect } from 'vitest'
import {
  tmdbListResponseSchema,
  tmdbSearchResponseSchema,
  tmdbMovieDetailSchema,
  tmdbTvDetailSchema,
  mediaSummarySchema,
  mediaDetailSchema,
  watchlistItemSchema,
  type MediaSummary,
} from './schemas'

// ─── TMDB List Response ──────────────────────────────────────────────────────

describe('tmdbListResponseSchema', () => {
  it('validates a valid movie list response', () => {
    const data = {
      page: 1,
      results: [
        {
          id: 550,
          title: 'Fight Club',
          overview: 'A movie',
          poster_path: '/poster.jpg',
          backdrop_path: '/backdrop.jpg',
          vote_average: 8.4,
          release_date: '1999-10-15',
        },
      ],
      total_pages: 10,
      total_results: 200,
    }

    const result = tmdbListResponseSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('validates a TV list response', () => {
    const data = {
      page: 1,
      results: [
        {
          id: 1399,
          name: 'Game of Thrones',
          overview: 'A show',
          poster_path: null,
          backdrop_path: null,
          vote_average: 8.4,
          first_air_date: '2011-04-17',
        },
      ],
      total_pages: 5,
      total_results: 100,
    }

    const result = tmdbListResponseSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('rejects response missing required fields', () => {
    const data = { results: [] }
    const result = tmdbListResponseSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects individual items with missing fields', () => {
    const data = {
      page: 1,
      results: [{ id: 1 }],
      total_pages: 1,
      total_results: 1,
    }
    const result = tmdbListResponseSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

// ─── TMDB Search Response ────────────────────────────────────────────────────

describe('tmdbSearchResponseSchema', () => {
  it('validates search response with mixed results', () => {
    const data = {
      page: 1,
      results: [
        {
          id: 550,
          title: 'Fight Club',
          overview: 'A movie',
          poster_path: null,
          backdrop_path: null,
          vote_average: 8.4,
          release_date: '1999-10-15',
          media_type: 'movie',
        },
        {
          id: 1399,
          name: 'Game of Thrones',
          overview: 'A show',
          poster_path: null,
          backdrop_path: null,
          vote_average: 8.4,
          first_air_date: '2011-04-17',
          media_type: 'tv',
        },
        {
          id: 12345,
          name: 'Brad Pitt',
          media_type: 'person',
        },
      ],
      total_pages: 1,
      total_results: 3,
    }

    const result = tmdbSearchResponseSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('rejects invalid media_type discriminator', () => {
    const data = {
      page: 1,
      results: [
        {
          id: 1,
          media_type: 'invalid',
        },
      ],
      total_pages: 1,
      total_results: 1,
    }

    const result = tmdbSearchResponseSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

// ─── Movie Detail ────────────────────────────────────────────────────────────

describe('tmdbMovieDetailSchema', () => {
  it('validates a complete movie detail', () => {
    const data = {
      id: 550,
      title: 'Fight Club',
      overview: 'A movie',
      poster_path: '/poster.jpg',
      backdrop_path: '/backdrop.jpg',
      vote_average: 8.4,
      release_date: '1999-10-15',
      genres: [{ id: 18, name: 'Drama' }],
      runtime: 139,
      status: 'Released',
      tagline: 'Soap.',
    }

    const result = tmdbMovieDetailSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.runtime).toBe(139)
      expect(result.data.genres).toHaveLength(1)
    }
  })

  it('handles missing optional fields', () => {
    const data = {
      id: 550,
      title: 'Fight Club',
      overview: 'A movie',
      poster_path: null,
      backdrop_path: null,
      vote_average: 0,
      genres: [],
    }

    const result = tmdbMovieDetailSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.runtime).toBeUndefined()
      expect(result.data.tagline).toBeUndefined()
    }
  })
})

// ─── TV Detail ───────────────────────────────────────────────────────────────

describe('tmdbTvDetailSchema', () => {
  it('validates a complete TV detail', () => {
    const data = {
      id: 1399,
      name: 'Game of Thrones',
      overview: 'A show',
      poster_path: '/poster.jpg',
      backdrop_path: '/backdrop.jpg',
      vote_average: 8.4,
      first_air_date: '2011-04-17',
      genres: [{ id: 18, name: 'Drama' }],
      number_of_seasons: 8,
      number_of_episodes: 73,
      status: 'Ended',
      tagline: 'Winter Is Coming',
    }

    const result = tmdbTvDetailSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.number_of_seasons).toBe(8)
      expect(result.data.number_of_episodes).toBe(73)
    }
  })
})

// ─── Domain Schemas ──────────────────────────────────────────────────────────

describe('mediaSummarySchema', () => {
  it('validates a complete media summary', () => {
    const item: MediaSummary = {
      id: 550,
      mediaType: 'movie',
      title: 'Fight Club',
      overview: 'A movie',
      posterPath: '/poster.jpg',
      backdropPath: '/backdrop.jpg',
      rating: 8.4,
      date: '1999',
    }
    const result = mediaSummarySchema.safeParse(item)
    expect(result.success).toBe(true)
  })

  it('rejects invalid mediaType', () => {
    const result = mediaSummarySchema.safeParse({
      id: 1,
      mediaType: 'invalid',
      title: 'Test',
      overview: '',
      posterPath: null,
      backdropPath: null,
      rating: null,
      date: null,
    })
    expect(result.success).toBe(false)
  })

  it('accepts movie and tv media types', () => {
    expect(mediaSummarySchema.safeParse({ id: 1, mediaType: 'movie', title: 'M', overview: '', posterPath: null, backdropPath: null, rating: null, date: null }).success).toBe(true)
    expect(mediaSummarySchema.safeParse({ id: 2, mediaType: 'tv', title: 'T', overview: '', posterPath: null, backdropPath: null, rating: null, date: null }).success).toBe(true)
  })
})

describe('mediaDetailSchema', () => {
  it('extends mediaSummary with genres', () => {
    const result = mediaDetailSchema.safeParse({
      id: 550,
      mediaType: 'movie',
      title: 'Fight Club',
      overview: 'A movie',
      posterPath: null,
      backdropPath: null,
      rating: 8.4,
      date: '1999',
      genres: [{ id: 18, name: 'Drama' }],
      runtimeMinutes: 139,
      tagline: 'Soap.',
    })
    expect(result.success).toBe(true)
  })

  it('handles optional fields', () => {
    const result = mediaDetailSchema.safeParse({
      id: 550,
      mediaType: 'tv',
      title: 'Show',
      overview: '',
      posterPath: null,
      backdropPath: null,
      rating: null,
      date: null,
      genres: [],
    })
    expect(result.success).toBe(true)
  })
})

describe('watchlistItemSchema', () => {
  it('validates a complete watchlist item', () => {
    const item = {
      id: 550,
      mediaType: 'movie',
      title: 'Fight Club',
      posterPath: '/poster.jpg',
      rating: 8.4,
      date: '1999',
      savedAt: '2024-01-15T10:00:00.000Z',
    }
    const result = watchlistItemSchema.safeParse(item)
    expect(result.success).toBe(true)
  })

  it('rejects item with wrong mediaType', () => {
    const result = watchlistItemSchema.safeParse({
      id: 1,
      mediaType: 'invalid',
      title: 'Test',
      posterPath: null,
      rating: null,
      date: null,
      savedAt: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects item missing savedAt', () => {
    const result = watchlistItemSchema.safeParse({
      id: 1,
      mediaType: 'movie',
      title: 'Test',
      posterPath: null,
      rating: null,
      date: null,
    })
    expect(result.success).toBe(false)
  })
})
