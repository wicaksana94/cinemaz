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

export function useSearch(queryRef: Ref<string>) {
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

  // Make query options reactive so useQuery re-fires when debounced value changes
  const queryOptions = computed(() => tmdbQueries.search(debouncedQuery.value))
  const query = useQuery(queryOptions)

  const enabled = computed(() => debouncedQuery.value.trim().length >= 2)

  const items = computed<MediaSummary[]>(() => {
    if (!enabled.value) return []
    const data = query.data.value
    if (!data) return []
    const parsed = tmdbSearchResponseSchema.safeParse(data)
    if (!parsed.success) return []
    // Filter out people — only movies and TV shows
    return parsed.data.results
      .filter((r): r is typeof r & { media_type: 'movie' | 'tv' } =>
        r.media_type === 'movie' || r.media_type === 'tv',
      )
      .map(toMediaSummary)
  })

  return {
    ...query,
    items,
    debouncedQuery: computed(() => debouncedQuery.value),
    enabled,
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
