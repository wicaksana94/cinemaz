

const LANGUAGE = import.meta.env.VITE_TMDB_LANGUAGE || 'id-ID'
const REGION = import.meta.env.VITE_TMDB_REGION || 'ID'

interface GatewayParams {
  language?: string
  region?: string
  page?: number
  query?: string
  include_adult?: boolean
}

/**
 * Build query string from params, excluding undefined values.
 */
function buildQuery(params: GatewayParams): string {
  const entries: [string, string][] = []
  if (params.language) entries.push(['language', params.language])
  if (params.region) entries.push(['region', params.region])
  if (params.page) entries.push(['page', String(params.page)])
  if (params.query) entries.push(['query', params.query])
  if (params.include_adult !== undefined) entries.push(['include_adult', String(params.include_adult)])
  return entries.length > 0 ? `?${new URLSearchParams(entries).toString()}` : ''
}

/**
 * Fetch from our gateway. Never exposes tokens to the client.
 */
async function fetchGateway<T>(path: string, params: GatewayParams = {}): Promise<T> {
  const qs = buildQuery({ language: LANGUAGE, region: REGION, ...params })
  const url = `/api/tmdb/${path}${qs}`

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Gateway error: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface TmdbListParams {
  page?: number
}

export async function fetchPopularMovies(params: TmdbListParams = {}) {
  return fetchGateway('3/movie/popular', { page: params.page ?? 1 })
}

export async function fetchNowPlayingMovies(params: TmdbListParams = {}) {
  return fetchGateway('3/movie/now_playing', { page: params.page ?? 1 })
}

export async function fetchUpcomingMovies(params: TmdbListParams = {}) {
  return fetchGateway('3/movie/upcoming', { page: params.page ?? 1 })
}

export async function fetchPopularTv(params: TmdbListParams = {}) {
  return fetchGateway('3/tv/popular', { page: params.page ?? 1 })
}

export async function fetchTopRatedTv(params: TmdbListParams = {}) {
  return fetchGateway('3/tv/top_rated', { page: params.page ?? 1 })
}

export async function fetchTopRatedMovies(params: TmdbListParams = {}) {
  return fetchGateway('3/movie/top_rated', { page: params.page ?? 1 })
}

export async function fetchOnTheAirTv(params: TmdbListParams = {}) {
  return fetchGateway('3/tv/on_the_air', { page: params.page ?? 1 })
}

export async function fetchAiringTodayTv(params: TmdbListParams = {}) {
  return fetchGateway('3/tv/airing_today', { page: params.page ?? 1 })
}

export async function fetchPopularPeople(params: TmdbListParams = {}) {
  return fetchGateway('3/person/popular', { page: params.page ?? 1 })
}

export async function searchMulti(query: string, page = 1) {
  const trimmed = query.trim().slice(0, 100)
  return fetchGateway('3/search/multi', { query: trimmed, include_adult: false, page })
}

export async function fetchMovieDetail(id: number) {
  return fetchGateway(`3/movie/${id}`)
}

export async function fetchTvDetail(id: number) {
  return fetchGateway(`3/tv/${id}`)
}

// ─── Reactivity-compatible query functions for Vue Query ──────────────────────

import { queryOptions, infiniteQueryOptions } from '@tanstack/vue-query'
import { tmdbKeys } from './keys'

const FIVE_MINUTES = 1000 * 60 * 5
const TEN_MINUTES = 1000 * 60 * 10

interface TmdbListResponse {
  page: number
  total_pages: number
  total_results: number
  results: unknown[]
}

export type ListFetcher = (params: TmdbListParams) => Promise<TmdbListResponse> | Promise<unknown>

function createInfiniteListOptions(kind: string, fetcher: ListFetcher) {
  return infiniteQueryOptions({
    queryKey: tmdbKeys.list(kind),
    queryFn: ({ pageParam }) => fetcher({ page: pageParam }) as Promise<TmdbListResponse>,
    initialPageParam: 1 as number,
    getNextPageParam: (lastPage: TmdbListResponse, allPages: TmdbListResponse[]) => {
      if (lastPage.total_pages && allPages.length >= lastPage.total_pages) return undefined
      return allPages.length + 1
    },
    staleTime: TEN_MINUTES,
  })
}

export const tmdbQueries = {
  popularMovies: () =>
    queryOptions({
      queryKey: tmdbKeys.list('popular-movies'),
      queryFn: () => fetchPopularMovies(),
      staleTime: TEN_MINUTES,
    }),

  popularMoviesInfinite: () => createInfiniteListOptions('popular-movies', fetchPopularMovies),

  nowPlaying: () =>
    queryOptions({
      queryKey: tmdbKeys.list('now-playing'),
      queryFn: () => fetchNowPlayingMovies(),
      staleTime: TEN_MINUTES,
    }),
  nowPlayingInfinite: () => createInfiniteListOptions('now-playing', fetchNowPlayingMovies),

  upcoming: () =>
    queryOptions({
      queryKey: tmdbKeys.list('upcoming'),
      queryFn: () => fetchUpcomingMovies(),
      staleTime: TEN_MINUTES,
    }),
  upcomingInfinite: () => createInfiniteListOptions('upcoming', fetchUpcomingMovies),

  popularTv: () =>
    queryOptions({
      queryKey: tmdbKeys.list('popular-tv'),
      queryFn: () => fetchPopularTv(),
      staleTime: TEN_MINUTES,
    }),
  popularTvInfinite: () => createInfiniteListOptions('popular-tv', fetchPopularTv),

  topRatedTv: () =>
    queryOptions({
      queryKey: tmdbKeys.list('top-rated-tv'),
      queryFn: () => fetchTopRatedTv(),
      staleTime: TEN_MINUTES,
    }),
  topRatedTvInfinite: () => createInfiniteListOptions('top-rated-tv', fetchTopRatedTv),

  topRatedMovies: () =>
    queryOptions({
      queryKey: tmdbKeys.list('top-rated-movies'),
      queryFn: () => fetchTopRatedMovies(),
      staleTime: TEN_MINUTES,
    }),
  topRatedMoviesInfinite: () => createInfiniteListOptions('top-rated-movies', fetchTopRatedMovies),

  onTheAirTv: () =>
    queryOptions({
      queryKey: tmdbKeys.list('on-the-air-tv'),
      queryFn: () => fetchOnTheAirTv(),
      staleTime: TEN_MINUTES,
    }),
  onTheAirTvInfinite: () => createInfiniteListOptions('on-the-air-tv', fetchOnTheAirTv),

  airingTodayTv: () =>
    queryOptions({
      queryKey: tmdbKeys.list('airing-today-tv'),
      queryFn: () => fetchAiringTodayTv(),
      staleTime: TEN_MINUTES,
    }),
  airingTodayTvInfinite: () => createInfiniteListOptions('airing-today-tv', fetchAiringTodayTv),

  popularPeople: () =>
    queryOptions({
      queryKey: tmdbKeys.list('popular-people'),
      queryFn: () => fetchPopularPeople(),
      staleTime: TEN_MINUTES,
    }),
  popularPeopleInfinite: () => createInfiniteListOptions('popular-people', fetchPopularPeople),

  search: (query: string, page: number = 1) =>
    queryOptions({
      queryKey: [...tmdbKeys.search(query), 'paged', page],
      queryFn: () => searchMulti(query, page),
      staleTime: FIVE_MINUTES,
      enabled: query.trim().length >= 2,
    }),

  searchInfinite: (query: string) =>
    infiniteQueryOptions({
      queryKey: [...tmdbKeys.search(query), 'infinite'],
      queryFn: ({ pageParam }) => searchMulti(query, pageParam) as Promise<TmdbListResponse>,
      initialPageParam: 1 as number,
      getNextPageParam: (lastPage: TmdbListResponse, allPages: TmdbListResponse[]) => {
        if (lastPage.total_pages && allPages.length >= lastPage.total_pages) return undefined
        return allPages.length + 1
      },
      staleTime: FIVE_MINUTES,
      enabled: query.trim().length >= 2,
    }),


  movieDetail: (id: number) =>
    queryOptions({
      queryKey: tmdbKeys.detail('movie', id),
      queryFn: () => fetchMovieDetail(id),
      staleTime: FIVE_MINUTES,
    }),

  tvDetail: (id: number) =>
    queryOptions({
      queryKey: tmdbKeys.detail('tv', id),
      queryFn: () => fetchTvDetail(id),
      staleTime: FIVE_MINUTES,
    }),
}
