import { describe, it, expect } from 'vitest'
import { toMediaSummary, toMediaDetail, inferMediaType, extractYear } from './mappers'

// ─── inferMediaType ──────────────────────────────────────────────────────────

describe('inferMediaType', () => {
  it('returns tv when media_type is tv', () => {
    expect(inferMediaType({ id: 1, name: 'Show', overview: '', poster_path: null, backdrop_path: null, vote_average: 0, media_type: 'tv' })).toBe('tv')
  })

  it('returns movie when media_type is movie', () => {
    expect(inferMediaType({ id: 1, title: 'Film', overview: '', poster_path: null, backdrop_path: null, vote_average: 0, media_type: 'movie' })).toBe('movie')
  })

  it('infers tv when name is present but not title', () => {
    expect(inferMediaType({ id: 1, name: 'Show', overview: '', poster_path: null, backdrop_path: null, vote_average: 0 })).toBe('tv')
  })

  it('defaults to movie when neither name heuristic nor media_type', () => {
    expect(inferMediaType({ id: 1, title: 'Film', overview: '', poster_path: null, backdrop_path: null, vote_average: 0 })).toBe('movie')
  })

  it('prefers media_type over name heuristic', () => {
    expect(inferMediaType({ id: 1, name: 'Could be TV', title: 'Also here', overview: '', poster_path: null, backdrop_path: null, vote_average: 0, media_type: 'movie' })).toBe('movie')
  })

  it('returns movie when no name, no title, no media_type', () => {
    expect(inferMediaType({ id: 1, overview: '', poster_path: null, backdrop_path: null, vote_average: 0 })).toBe('movie')
  })
})

// ─── extractYear ─────────────────────────────────────────────────────────────

describe('extractYear', () => {
  it('extracts year from full date', () => {
    expect(extractYear('2024-01-15')).toBe('2024')
  })

  it('extracts year from year-only string', () => {
    expect(extractYear('2024')).toBe('2024')
  })

  it('returns null for empty string', () => {
    expect(extractYear('')).toBeNull()
  })

  it('returns null for undefined', () => {
    expect(extractYear(undefined)).toBeNull()
  })

  it('returns null for short dates (less than 4 digits)', () => {
    expect(extractYear('24')).toBeNull()
  })

  it('returns null for non-numeric string', () => {
    expect(extractYear('no-date')).toBeNull()
  })
})

// ─── toMediaSummary ──────────────────────────────────────────────────────────

describe('toMediaSummary', () => {
  it('maps a movie item correctly', () => {
    const item = {
      id: 1,
      title: 'Test Movie',
      original_title: 'Test Movie Original',
      overview: 'A great movie',
      poster_path: '/poster.jpg',
      backdrop_path: '/backdrop.jpg',
      vote_average: 8.5,
      release_date: '2024-06-15',
      media_type: 'movie',
    }

    const result = toMediaSummary(item)

    expect(result).toEqual({
      id: 1,
      mediaType: 'movie',
      title: 'Test Movie',
      originalTitle: 'Test Movie Original',
      overview: 'A great movie',
      posterPath: '/poster.jpg',
      backdropPath: '/backdrop.jpg',
      rating: 8.5,
      date: '2024',
    })
  })

  it('maps a TV item correctly using name and first_air_date', () => {
    const item = {
      id: 2,
      name: 'Test Show',
      original_name: 'Test Show Original',
      overview: 'A great show',
      poster_path: '/poster2.jpg',
      backdrop_path: '/backdrop2.jpg',
      vote_average: 7.2,
      first_air_date: '2023-09-01',
      media_type: 'tv',
    }

    const result = toMediaSummary(item)

    expect(result).toEqual({
      id: 2,
      mediaType: 'tv',
      title: 'Test Show',
      originalTitle: 'Test Show Original',
      overview: 'A great show',
      posterPath: '/poster2.jpg',
      backdropPath: '/backdrop2.jpg',
      rating: 7.2,
      date: '2023',
    })
  })

  it('handles missing values gracefully', () => {
    const item = {
      id: 3,
      overview: '',
      poster_path: null,
      backdrop_path: null,
      vote_average: 0,
    }

    const result = toMediaSummary(item)

    expect(result.title).toBe('Untitled')
    expect(result.originalTitle).toBeUndefined()
    expect(result.posterPath).toBeNull()
    expect(result.backdropPath).toBeNull()
    expect(result.rating).toBeNull()
    expect(result.date).toBeNull()
  })

  it('maps null rating to null (not zero)', () => {
    const item = {
      id: 4,
      title: 'Zero Rated',
      overview: '',
      poster_path: null,
      backdrop_path: null,
      vote_average: 0,
    }

    const result = toMediaSummary(item)
    expect(result.rating).toBeNull()
  })

  it('preserves non-zero ratings including 0.1', () => {
    const item = {
      id: 5,
      title: 'Low Rated',
      overview: '',
      poster_path: null,
      backdrop_path: null,
      vote_average: 0.1,
    }

    const result = toMediaSummary(item)
    expect(result.rating).toBe(0.1)
  })

  it('truncates date to year', () => {
    const item = {
      id: 6,
      title: 'Dated',
      overview: '',
      poster_path: null,
      backdrop_path: null,
      vote_average: 0,
      release_date: '2024-12-31',
    }

    const result = toMediaSummary(item)
    expect(result.date).toBe('2024')
  })

  it('handles empty release_date string', () => {
    const item = {
      id: 7,
      title: 'No Date',
      overview: '',
      poster_path: null,
      backdrop_path: null,
      vote_average: 0,
      release_date: '',
    }

    const result = toMediaSummary(item)
    expect(result.date).toBeNull()
  })

  it('handles year-only date string', () => {
    const item = {
      id: 8,
      title: 'Year Only',
      overview: '',
      poster_path: null,
      backdrop_path: null,
      vote_average: 0,
      release_date: '2024',
    }

    const result = toMediaSummary(item)
    expect(result.date).toBe('2024')
  })

  it('infers TV type from name heuristic without media_type', () => {
    const item = {
      id: 9,
      name: 'TV Show Without Type',
      overview: '',
      poster_path: null,
      backdrop_path: null,
      vote_average: 7.0,
      first_air_date: '2023-01-01',
    }

    const result = toMediaSummary(item)
    expect(result.mediaType).toBe('tv')
    expect(result.title).toBe('TV Show Without Type')
    expect(result.date).toBe('2023')
  })
})

// ─── toMediaDetail ───────────────────────────────────────────────────────────

describe('toMediaDetail', () => {
  it('maps detail with genres and runtime', () => {
    const item = {
      id: 1,
      title: 'Detail Movie',
      overview: 'Details here',
      poster_path: '/p.jpg',
      backdrop_path: '/b.jpg',
      vote_average: 8.0,
      release_date: '2024-01-01',
      genres: [{ id: 28, name: 'Action' }],
      runtime: 120,
      tagline: 'An action movie',
    }

    const result = toMediaDetail(item, 'movie')

    expect(result.id).toBe(1)
    expect(result.mediaType).toBe('movie')
    expect(result.title).toBe('Detail Movie')
    expect(result.genres).toHaveLength(1)
    expect(result.genres[0]).toEqual({ id: 28, name: 'Action' })
    expect(result.runtimeMinutes).toBe(120)
    expect(result.tagline).toBe('An action movie')
  })

  it('maps TV detail with seasons', () => {
    const item = {
      id: 1399,
      name: 'Game of Thrones',
      overview: 'A show',
      poster_path: '/p.jpg',
      backdrop_path: '/b.jpg',
      vote_average: 8.4,
      first_air_date: '2011-04-17',
      genres: [{ id: 18, name: 'Drama' }],
      number_of_seasons: 8,
      number_of_episodes: 73,
      tagline: 'Winter Is Coming',
    }

    const result = toMediaDetail(item, 'tv')

    expect(result.mediaType).toBe('tv')
    expect(result.title).toBe('Game of Thrones')
    expect(result.numberOfSeasons).toBe(8)
    expect(result.genres).toHaveLength(1)
  })

  it('handles null runtime', () => {
    const item = {
      id: 1,
      title: 'No Runtime',
      overview: '',
      poster_path: null,
      backdrop_path: null,
      vote_average: 0,
      genres: [],
      runtime: null,
    }

    const result = toMediaDetail(item, 'movie')
    expect(result.runtimeMinutes).toBeUndefined()
  })

  it('handles missing optional detail fields', () => {
    const item = {
      id: 1,
      title: 'Minimal',
      overview: '',
      poster_path: null,
      backdrop_path: null,
      vote_average: 0,
      genres: [],
    }

    const result = toMediaDetail(item, 'movie')
    expect(result.runtimeMinutes).toBeUndefined()
    expect(result.numberOfSeasons).toBeUndefined()
    expect(result.tagline).toBeUndefined()
    expect(result.genres).toEqual([])
  })

  it('infers media type when not provided', () => {
    const movieItem = {
      id: 1,
      title: 'Movie',
      overview: '',
      poster_path: null,
      backdrop_path: null,
      vote_average: 0,
      genres: [],
      release_date: '2024-01-01',
    }

    const result = toMediaDetail(movieItem)
    expect(result.mediaType).toBe('movie')
  })

  it('uses explicit mediaType over inference', () => {
    const item = {
      id: 1,
      name: 'Has Name',
      overview: '',
      poster_path: null,
      backdrop_path: null,
      vote_average: 0,
      genres: [],
    }

    // Would infer as TV due to name, but we pass 'movie' explicitly
    const result = toMediaDetail(item, 'movie')
    expect(result.mediaType).toBe('movie')
    expect(result.title).toBe('Untitled') // uses title, not name, since we said movie
  })

  it('empty overview becomes empty string', () => {
    const item = {
      id: 1,
      title: 'Test',
      overview: '',
      poster_path: null,
      backdrop_path: null,
      vote_average: 0,
      genres: [],
    }

    const result = toMediaDetail(item, 'movie')
    expect(result.overview).toBe('')
  })

  it('falsy overview becomes empty string', () => {
    const item = {
      id: 1,
      title: 'Test',
      overview: '',
      poster_path: null,
      backdrop_path: null,
      vote_average: 0,
      genres: [],
    }

    const result = toMediaDetail(item, 'movie')
    expect(result.overview).toBe('')
  })
})
