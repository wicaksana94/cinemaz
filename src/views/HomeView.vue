<template>
  <div>
    <!-- Hero section -->
    <HeroSection :item="heroItem" />

    <!-- Catalog rails -->
    <div class="mx-auto max-w-7xl space-y-2 pb-8">
      <ErrorBoundary>
        <MediaRail
          title="Popular Movies"
          kind="popular-movies"
          :items="popularMovies.items.value"
          :is-loading="popularMovies.isLoading.value"
          :is-error="popularMovies.isError.value"
          :is-fetching-next-page="popularMovies.isFetchingNextPage.value"
          :has-next-page="popularMovies.hasNextPage.value"
          :load-more="popularMovies.loadMore"
          :refetch="popularMovies.refetch"
        />
      </ErrorBoundary>

      <ErrorBoundary>
        <MediaRail
          title="Top Rated Movies"
          kind="top-rated-movies"
          :items="topRatedMovies.items.value"
          :is-loading="topRatedMovies.isLoading.value"
          :is-error="topRatedMovies.isError.value"
          :is-fetching-next-page="topRatedMovies.isFetchingNextPage.value"
          :has-next-page="topRatedMovies.hasNextPage.value"
          :load-more="topRatedMovies.loadMore"
          :refetch="topRatedMovies.refetch"
        />
      </ErrorBoundary>

      <ErrorBoundary>
        <MediaRail
          title="Now Playing"
          kind="now-playing"
          :items="nowPlaying.items.value"
          :is-loading="nowPlaying.isLoading.value"
          :is-error="nowPlaying.isError.value"
          :is-fetching-next-page="nowPlaying.isFetchingNextPage.value"
          :has-next-page="nowPlaying.hasNextPage.value"
          :load-more="nowPlaying.loadMore"
          :refetch="nowPlaying.refetch"
        />
      </ErrorBoundary>

      <ErrorBoundary>
        <MediaRail
          title="Upcoming"
          kind="upcoming"
          :items="upcoming.items.value"
          :is-loading="upcoming.isLoading.value"
          :is-error="upcoming.isError.value"
          :is-fetching-next-page="upcoming.isFetchingNextPage.value"
          :has-next-page="upcoming.hasNextPage.value"
          :load-more="upcoming.loadMore"
          :refetch="upcoming.refetch"
        />
      </ErrorBoundary>

      <ErrorBoundary>
        <MediaRail
          title="Popular TV Series"
          kind="popular-tv"
          :items="popularTv.items.value"
          :is-loading="popularTv.isLoading.value"
          :is-error="popularTv.isError.value"
          :is-fetching-next-page="popularTv.isFetchingNextPage.value"
          :has-next-page="popularTv.hasNextPage.value"
          :load-more="popularTv.loadMore"
          :refetch="popularTv.refetch"
        />
      </ErrorBoundary>

      <ErrorBoundary>
        <MediaRail
          title="Top Rated TV Series"
          kind="top-rated-tv"
          :items="topRatedTv.items.value"
          :is-loading="topRatedTv.isLoading.value"
          :is-error="topRatedTv.isError.value"
          :is-fetching-next-page="topRatedTv.isFetchingNextPage.value"
          :has-next-page="topRatedTv.hasNextPage.value"
          :load-more="topRatedTv.loadMore"
          :refetch="topRatedTv.refetch"
        />
      </ErrorBoundary>

      <ErrorBoundary>
        <MediaRail
          title="TV Series On The Air"
          kind="on-the-air-tv"
          :items="onTheAirTv.items.value"
          :is-loading="onTheAirTv.isLoading.value"
          :is-error="onTheAirTv.isError.value"
          :is-fetching-next-page="onTheAirTv.isFetchingNextPage.value"
          :has-next-page="onTheAirTv.hasNextPage.value"
          :load-more="onTheAirTv.loadMore"
          :refetch="onTheAirTv.refetch"
        />
      </ErrorBoundary>

      <ErrorBoundary>
        <MediaRail
          title="TV Series Airing Today"
          kind="airing-today-tv"
          :items="airingTodayTv.items.value"
          :is-loading="airingTodayTv.isLoading.value"
          :is-error="airingTodayTv.isError.value"
          :is-fetching-next-page="airingTodayTv.isFetchingNextPage.value"
          :has-next-page="airingTodayTv.hasNextPage.value"
          :load-more="airingTodayTv.loadMore"
          :refetch="airingTodayTv.refetch"
        />
      </ErrorBoundary>

      <ErrorBoundary>
        <PersonRail
          title="Popular People"
          kind="popular-people"
          :people="popularPeople.people.value"
          :is-loading="popularPeople.isLoading.value"
          :is-error="popularPeople.isError.value"
          :is-fetching-next-page="popularPeople.isFetchingNextPage.value"
          :has-next-page="popularPeople.hasNextPage.value"
          :load-more="popularPeople.loadMore"
          :refetch="popularPeople.refetch"
        />
      </ErrorBoundary>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import HeroSection from '@/components/HeroSection.vue'
import MediaRail from '@/components/MediaRail.vue'
import PersonRail from '@/components/PersonRail.vue'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import {
  usePopularMovies,
  useTopRatedMovies,
  useNowPlayingMovies,
  useUpcomingMovies,
  usePopularTv,
  useTopRatedTv,
  useOnTheAirTv,
  useAiringTodayTv,
  usePopularPeople,
} from '@/lib/tmdb/useMediaQueries'

const popularMovies = usePopularMovies()
const topRatedMovies = useTopRatedMovies()
const nowPlaying = useNowPlayingMovies()
const upcoming = useUpcomingMovies()
const popularTv = usePopularTv()
const topRatedTv = useTopRatedTv()
const onTheAirTv = useOnTheAirTv()
const airingTodayTv = useAiringTodayTv()
const popularPeople = usePopularPeople()

// Use first popular movie as hero
const heroItem = computed(() => {
  const items = popularMovies.items.value
  return items.length > 0 ? items[0] : null
})
</script>
