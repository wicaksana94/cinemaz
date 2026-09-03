import { computed, watch, ref, type Ref } from 'vue'
import { useQuery, useInfiniteQuery } from '@tanstack/vue-query'
import { tmdbQueries } from './client'
import {
  tmdbListResponseSchema,
  tmdbSearchResponseSchema,
  tmdbMovieDetailSchema,
  tmdbTvDetailSchema,
} from './schemas'
import { toMediaSummary, toMediaDetail, toPersonSummary } from './mappers'
import type { MediaSummary, MediaDetail, MediaType, PersonSummary } from './schemas'
import { tmdbPersonListResponseSchema } from './schemas'

// ─── Infinite List Queries ───────────────────────────────────────────────────

interface InfiniteListResult {
  items: Ref<MediaSummary[]>
  isLoading: Ref<boolean>
  isError: Ref<boolean>
  isFetchingNextPage: Ref<boolean>
  hasNextPage: Ref<boolean>
  loadMore: () => void
  refetch: () => void
}

function useInfiniteMediaList(queryOptions: ReturnType<typeof tmdbQueries.popularMoviesInfinite>): InfiniteListResult {
  const query = useInfiniteQuery(queryOptions)

  const items = computed<MediaSummary[]>(() => {
    if (!query.data.value) return []
    return query.data.value.pages.flatMap((page) => {
      const parsed = tmdbListResponseSchema.safeParse(page)
      if (!parsed.success) return []
      return parsed.data.results.map(toMediaSummary)
    })
  })

  return {
    items,
    isLoading: computed(() => query.status.value === 'pending'),
    isError: computed(() => query.status.value === 'error'),
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    loadMore: () => {
      if (query.hasNextPage.value && !query.isFetchingNextPage.value) {
        query.fetchNextPage()
      }
    },
    refetch: () => { query.refetch() },
  }
}

export function usePopularMovies() {
  return useInfiniteMediaList(tmdbQueries.popularMoviesInfinite())
}

export function useNowPlayingMovies() {
  return useInfiniteMediaList(tmdbQueries.nowPlayingInfinite())
}

export function useUpcomingMovies() {
  return useInfiniteMediaList(tmdbQueries.upcomingInfinite())
}

export function usePopularTv() {
  return useInfiniteMediaList(tmdbQueries.popularTvInfinite())
}

export function useTopRatedTv() {
  return useInfiniteMediaList(tmdbQueries.topRatedTvInfinite())
}

export function useTopRatedMovies() {
  return useInfiniteMediaList(tmdbQueries.topRatedMoviesInfinite())
}

export function useOnTheAirTv() {
  return useInfiniteMediaList(tmdbQueries.onTheAirTvInfinite())
}

export function useAiringTodayTv() {
  return useInfiniteMediaList(tmdbQueries.airingTodayTvInfinite())
}

// ─── People Query (infinite) ─────────────────────────────────────────────────

interface InfinitePeopleResult {
  people: Ref<PersonSummary[]>
  isLoading: Ref<boolean>
  isError: Ref<boolean>
  isFetchingNextPage: Ref<boolean>
  hasNextPage: Ref<boolean>
  loadMore: () => void
  refetch: () => void
}

export function usePopularPeople(): InfinitePeopleResult {
  const query = useInfiniteQuery(tmdbQueries.popularPeopleInfinite())

  const people = computed<PersonSummary[]>(() => {
    if (!query.data.value) return []
    return query.data.value.pages.flatMap((page) => {
      const parsed = tmdbPersonListResponseSchema.safeParse(page)
      if (!parsed.success) return []
      return parsed.data.results.map(toPersonSummary)
    })
  })

  return {
    people,
    isLoading: computed(() => query.status.value === 'pending'),
    isError: computed(() => query.status.value === 'error'),
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    loadMore: () => {
      if (query.hasNextPage.value && !query.isFetchingNextPage.value) {
        query.fetchNextPage()
      }
    },
    refetch: () => { query.refetch() },
  }
}

// ─── Search Query ────────────────────────────────────────────────────────────

export interface SearchResult {
  items: Ref<MediaSummary[]>
  isLoading: Ref<boolean>
  isError: Ref<boolean>
  isFetching: Ref<boolean>
  debouncedQuery: Ref<string>
  enabled: Ref<boolean>
  currentPage: Ref<number>
  totalPages: Ref<number>
  totalResults: Ref<number>
  goToPage: (page: number) => void
  refetch: () => void
}

export function useSearch(queryRef: Ref<string>): SearchResult {
  const debouncedQuery = ref(queryRef.value)
  const currentPage = ref(1)

  watch(
    queryRef,
    (val) => {
      const timer = setTimeout(() => {
        debouncedQuery.value = val
      }, 350)
      return () => clearTimeout(timer)
    },
    { immediate: true },
  )

  const enabled = computed(() => debouncedQuery.value.trim().length >= 2)

  // Make query options reactive — includes page in key for per-page caching
  const queryOptions = computed(() =>
    tmdbQueries.search(debouncedQuery.value, currentPage.value),
  )
  const query = useQuery(queryOptions)

  // When query changes, reset to page 1. When page changes, fetch that page.
  watch(
    [debouncedQuery, currentPage],
    ([q, page]) => {
      if (typeof q !== 'string') return
      if (q.trim().length < 2) return
      if (page === 1) {
        // queryOptions already reactive → watcher triggers fetch
      } else {
        query.refetch()
      }
    },
    { immediate: true },
  )

  // When debounced query changes, reset page to 1
  watch(debouncedQuery, (val) => {
    if (val.trim().length >= 2) {
      currentPage.value = 1
    }
  })

  const parsedResponse = computed(() => {
    if (!enabled.value) return null
    const data = query.data.value
    if (!data) return null
    const parsed = tmdbSearchResponseSchema.safeParse(data)
    if (!parsed.success) return null
    return parsed.data
  })

  const items = computed<MediaSummary[]>(() => {
    if (!parsedResponse.value) return []
    // Filter out people — only movies and TV shows
    return parsedResponse.value.results
      .filter((r): r is typeof r & { media_type: 'movie' | 'tv' } =>
        r.media_type === 'movie' || r.media_type === 'tv',
      )
      .map(toMediaSummary)
  })

  const totalPages = computed(() => parsedResponse.value?.total_pages ?? 0)
  const totalResults = computed(() => parsedResponse.value?.total_results ?? 0)

  function goToPage(page: number) {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
  }

  return {
    items,
    isLoading: computed(() => query.status.value === 'pending' && query.fetchStatus.value !== 'idle'),
    isError: computed(() => query.status.value === 'error'),
    isFetching: computed(() => query.isFetching.value),
    debouncedQuery: computed(() => debouncedQuery.value),
    enabled,
    currentPage,
    totalPages,
    totalResults,
    goToPage,
    refetch: () => { query.refetch() },
  }
}

// ─── Search Infinite Query ───────────────────────────────────────────────────

export interface SearchInfiniteResult {
  items: Ref<MediaSummary[]>
  isLoading: Ref<boolean>
  isError: Ref<boolean>
  isFetchingNextPage: Ref<boolean>
  hasNextPage: Ref<boolean>
  debouncedQuery: Ref<string>
  enabled: Ref<boolean>
  totalPages: Ref<number>
  totalResults: Ref<number>
  loadMore: () => void
  refetch: () => void
}

export function useSearchInfinite(queryRef: Ref<string>): SearchInfiniteResult {
  const debouncedQuery = ref(queryRef.value)

  watch(
    queryRef,
    (val) => {
      const timer = setTimeout(() => {
        debouncedQuery.value = val
      }, 350)
      return () => clearTimeout(timer)
    },
    { immediate: true },
  )

  const enabled = computed(() => debouncedQuery.value.trim().length >= 2)

  const queryOptions = computed(() => tmdbQueries.searchInfinite(debouncedQuery.value))
  const query = useInfiniteQuery(queryOptions)

  const parsedPages = computed(() => {
    if (!enabled.value || !query.data.value) return []
    return query.data.value.pages.map((page) => {
      const parsed = tmdbSearchResponseSchema.safeParse(page)
      if (!parsed.success) return null
      return parsed.data
    }).filter(Boolean)
  })

  const items = computed<MediaSummary[]>(() => {
    return parsedPages.value.flatMap((page) => {
      if (!page) return []
      return page.results
        .filter((r): r is typeof r & { media_type: 'movie' | 'tv' } =>
          r.media_type === 'movie' || r.media_type === 'tv',
        )
        .map(toMediaSummary)
    })
  })

  const lastPage = computed(() => {
    const pages = parsedPages.value
    return pages.length > 0 ? pages[pages.length - 1] : null
  })

  const totalPages = computed(() => lastPage.value?.total_pages ?? 0)
  const totalResults = computed(() => lastPage.value?.total_results ?? 0)

  return {
    items,
    isLoading: computed(() => query.status.value === 'pending'),
    isError: computed(() => query.status.value === 'error'),
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    debouncedQuery: computed(() => debouncedQuery.value),
    enabled,
    totalPages,
    totalResults,
    loadMore: () => {
      if (query.hasNextPage.value && !query.isFetchingNextPage.value) {
        query.fetchNextPage()
      }
    },
    refetch: () => { query.refetch() },
  }
}

// ─── Detail Queries ──────────────────────────────────────────────────────────

export function useMediaDetail(type: MediaType, id: number) {
  const options = type === 'movie' ? tmdbQueries.movieDetail(id) : tmdbQueries.tvDetail(id)
  const query = useQuery(options)

  const detail = computed<MediaDetail | null>(() => {
    const data = query.data.value
    if (!data) return null
    const schema = type === 'movie' ? tmdbMovieDetailSchema : tmdbTvDetailSchema
    const parsed = schema.safeParse(data)
    if (!parsed.success) return null
    return toMediaDetail(parsed.data, type)
  })

  return {
    ...query,
    detail,
  }
}
