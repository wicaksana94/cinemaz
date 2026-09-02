import { http, HttpResponse } from 'msw'
import {
  tmdbMovieListResponse,
  tmdbTvListResponse,
  tmdbSearchResponse,
  tmdbMovieDetailResponse,
  tmdbTvDetailResponse,
} from './fixtures'

// Client calls /api/tmdb/3/... which normally goes through the Vite proxy.
// In tests we intercept these gateway URLs directly.
const GW = '/api/tmdb'

export const handlers = [
  // ─── List Endpoints ──────────────────────────────────────────────────────

  http.get(`${GW}/3/movie/popular`, () => {
    return HttpResponse.json(tmdbMovieListResponse)
  }),

  http.get(`${GW}/3/movie/now_playing`, () => {
    return HttpResponse.json(tmdbMovieListResponse)
  }),

  http.get(`${GW}/3/movie/upcoming`, () => {
    return HttpResponse.json(tmdbMovieListResponse)
  }),

  http.get(`${GW}/3/tv/popular`, () => {
    return HttpResponse.json(tmdbTvListResponse)
  }),

  http.get(`${GW}/3/tv/top_rated`, () => {
    return HttpResponse.json(tmdbTvListResponse)
  }),

  // ─── Detail Endpoints ────────────────────────────────────────────────────

  http.get(`${GW}/3/movie/:id`, ({ params }) => {
    const id = Number(params.id)
    if (id === 404) {
      return HttpResponse.json(
        { status_code: 34, status_message: 'The resource you requested could not be found.' },
        { status: 404 },
      )
    }
    return HttpResponse.json({ ...tmdbMovieDetailResponse, id })
  }),

  http.get(`${GW}/3/tv/:id`, ({ params }) => {
    const id = Number(params.id)
    if (id === 404) {
      return HttpResponse.json(
        { status_code: 34, status_message: 'The resource you requested could not be found.' },
        { status: 404 },
      )
    }
    return HttpResponse.json({ ...tmdbTvDetailResponse, id })
  }),

  // ─── Search ──────────────────────────────────────────────────────────────

  http.get(`${GW}/3/search/multi`, ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('query') || ''

    if (query.toLowerCase().includes('error')) {
      return HttpResponse.json(
        { status_code: 7, status_message: 'Invalid API key' },
        { status: 401 },
      )
    }

    if (query.toLowerCase().includes('empty')) {
      return HttpResponse.json({
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      })
    }

    const filtered = tmdbSearchResponse.results.filter((r) => {
      if (r.media_type === 'person') return false
      const title = ('title' in r ? r.title : null) ?? ('name' in r ? r.name : null) ?? ''
      return title.toLowerCase().includes(query.toLowerCase())
    })

    return HttpResponse.json({
      page: 1,
      results: filtered.length > 0 ? filtered : tmdbSearchResponse.results,
      total_pages: 1,
      total_results: filtered.length > 0 ? filtered.length : tmdbSearchResponse.results.length,
    })
  }),
]

// Handlers that simulate partial failures
export const partialFailureHandlers = [
  http.get(`${GW}/3/movie/popular`, () => {
    return HttpResponse.json(tmdbMovieListResponse)
  }),

  http.get(`${GW}/3/movie/now_playing`, () => {
    return HttpResponse.json(
      { status_code: 7, status_message: 'Invalid API key' },
      { status: 401 },
    )
  }),

  http.get(`${GW}/3/movie/upcoming`, () => {
    return HttpResponse.json(tmdbMovieListResponse)
  }),

  http.get(`${GW}/3/tv/popular`, () => {
    return HttpResponse.json(tmdbTvListResponse)
  }),

  http.get(`${GW}/3/tv/top_rated`, () => {
    return HttpResponse.json(tmdbTvListResponse)
  }),
]
