import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { server } from '@/test/msw-server'
import {
  fetchPopularMovies,
  fetchPopularTv,
  fetchTopRatedTv,
  fetchNowPlayingMovies,
  fetchUpcomingMovies,
  searchMulti,
  fetchMovieDetail,
  fetchTvDetail,
} from './client'
import {
  tmdbListResponseSchema,
  tmdbSearchResponseSchema,
  tmdbMovieDetailSchema,
  tmdbTvDetailSchema,
} from './schemas'
import { partialFailureHandlers } from '@/test/msw-handlers'

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// ─── List Endpoints ──────────────────────────────────────────────────────────

describe('TMDB List Endpoints', () => {
  it('fetches popular movies and validates schema', async () => {
    const data = await fetchPopularMovies()
    const result = tmdbListResponseSchema.safeParse(data)
    expect(result.success).toBe(true)
    expect(result.success && result.data.results.length).toBeGreaterThan(0)
  })

  it('fetches now playing movies', async () => {
    const data = await fetchNowPlayingMovies()
    const result = tmdbListResponseSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('fetches upcoming movies', async () => {
    const data = await fetchUpcomingMovies()
    const result = tmdbListResponseSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('fetches popular TV shows', async () => {
    const data = await fetchPopularTv()
    const result = tmdbListResponseSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('fetches top rated TV shows', async () => {
    const data = await fetchTopRatedTv()
    const result = tmdbListResponseSchema.safeParse(data)
    expect(result.success).toBe(true)
  })
})

// ─── Search ──────────────────────────────────────────────────────────────────

describe('TMDB Search', () => {
  it('returns results for valid query', async () => {
    const data = await searchMulti('Fight')
    const result = tmdbSearchResponseSchema.safeParse(data)
    expect(result.success).toBe(true)
    expect(result.success && result.data.results.length).toBeGreaterThan(0)
  })

  it('returns empty results for "empty" query', async () => {
    const data = await searchMulti('empty query')
    const result = tmdbSearchResponseSchema.safeParse(data)
    expect(result.success).toBe(true)
    expect(result.success && result.data.results).toHaveLength(0)
  })

  it('throws on invalid API key', async () => {
    await expect(searchMulti('error')).rejects.toThrow()
  })
})

// ─── Detail Endpoints ────────────────────────────────────────────────────────

describe('TMDB Detail Endpoints', () => {
  it('fetches movie detail', async () => {
    const data = await fetchMovieDetail(550)
    const result = tmdbMovieDetailSchema.safeParse(data)
    expect(result.success).toBe(true)
    expect(result.success && result.data.title).toBe('Fight Club')
  })

  it('fetches TV detail', async () => {
    const data = await fetchTvDetail(1399)
    const result = tmdbTvDetailSchema.safeParse(data)
    expect(result.success).toBe(true)
    expect(result.success && result.data.name).toBe('Game of Thrones')
  })

  it('throws on 404 movie', async () => {
    await expect(fetchMovieDetail(404)).rejects.toThrow()
  })

  it('throws on 404 TV show', async () => {
    await expect(fetchTvDetail(404)).rejects.toThrow()
  })
})

// ─── Partial Failure (isolation) ─────────────────────────────────────────────

describe('Partial Failure Isolation', () => {
  it('popular movies still work when now_playing fails', async () => {
    server.use(...partialFailureHandlers)

    const popular = await fetchPopularMovies()
    expect(tmdbListResponseSchema.safeParse(popular).success).toBe(true)

    await expect(fetchNowPlayingMovies()).rejects.toThrow()
  })

  it('TV endpoints still work when movie endpoints fail', async () => {
    server.use(...partialFailureHandlers)

    const tv = await fetchPopularTv()
    expect(tmdbListResponseSchema.safeParse(tv).success).toBe(true)

    const topRated = await fetchTopRatedTv()
    expect(tmdbListResponseSchema.safeParse(topRated).success).toBe(true)
  })
})
