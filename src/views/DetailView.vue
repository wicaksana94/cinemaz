<template>
  <div>
    <!-- Loading state -->
    <div
      v-if="isLoading"
      class="animate-pulse"
      role="status"
      aria-label="Loading details"
    >
      <div class="h-[50vh] bg-[var(--color-bg-elevated)]" />
      <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div class="h-8 w-1/2 rounded bg-[var(--color-bg-elevated)]" />
        <div class="mt-3 h-4 w-1/3 rounded bg-[var(--color-bg-elevated)]" />
        <div class="mt-6 space-y-3">
          <div class="h-3 w-full rounded bg-[var(--color-bg-elevated)]" />
          <div class="h-3 w-5/6 rounded bg-[var(--color-bg-elevated)]" />
          <div class="h-3 w-4/6 rounded bg-[var(--color-bg-elevated)]" />
        </div>
      </div>
      <span class="sr-only">Loading details...</span>
    </div>

    <!-- Error / 404 -->
    <div
      v-else-if="isError || !detail"
      class="flex flex-col items-center justify-center gap-4 py-20 text-center"
      role="alert"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-text-muted)]" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" x2="12" y1="8" y2="12"/>
        <line x1="12" x2="12.01" y1="16" y2="16"/>
      </svg>
      <h1 class="text-xl font-bold text-[var(--color-text-primary)]">Title not available</h1>
      <p class="text-sm text-[var(--color-text-muted)]">
        The movie or TV show you are looking for was not found or is no longer available.
      </p>
      <RouterLink
        to="/"
        class="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back to Home
      </RouterLink>
    </div>

    <!-- Detail content -->
    <article v-else>
      <!-- Backdrop -->
      <div class="relative h-[50vh] overflow-hidden">
        <img
          v-if="backdropInfo"
          :src="backdropInfo.src"
          alt=""
          aria-hidden="true"
          class="h-full w-full object-cover"
          :width="backdropInfo.width"
          :height="backdropInfo.height"
          decoding="async"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-base)] via-[var(--color-bg-base)]/60 to-transparent" />
      </div>

      <!-- Content -->
      <div class="relative mx-auto -mt-24 max-w-4xl px-4 pb-12 sm:px-6">
        <!-- Back link (not a fake button) -->
        <RouterLink
          to="/"
          class="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to Home
        </RouterLink>

        <div class="flex gap-6">
          <!-- Poster (desktop) -->
          <div class="hidden flex-shrink-0 sm:block">
            <img
              v-if="posterInfo"
              :src="posterInfo.src"
              :alt="getPosterAlt(detail.title)"
              :width="posterInfo.width"
              :height="posterInfo.height"
              class="w-[200px] rounded-lg shadow-lg shadow-black/40 object-cover"
              loading="eager"
              decoding="async"
            />
            <div
              v-else
              class="flex h-[300px] w-[200px] items-center justify-center rounded-lg bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
              {{ detail.title }}
            </h1>

            <!-- Metadata line -->
            <div class="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <span v-if="detail.date" class="text-[var(--color-text-secondary)]">{{ detail.date }}</span>
              <span v-if="detail.rating" class="inline-flex items-center gap-1 text-yellow-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                {{ detail.rating.toFixed(1) }}
              </span>
              <span v-if="detail.mediaType === 'tv'" class="rounded bg-[var(--color-accent-soft)] px-1.5 py-0.5 text-xs font-medium text-[var(--color-accent)]">
                TV Series
              </span>
              <span v-else class="rounded bg-[var(--color-accent-soft)] px-1.5 py-0.5 text-xs font-medium text-[var(--color-accent)]">
                Movie
              </span>
              <span v-if="detail.runtimeMinutes">
                {{ detail.runtimeMinutes }} min
              </span>
              <span v-if="detail.numberOfSeasons">
                {{ detail.numberOfSeasons }} season
              </span>
            </div>

            <!-- Tagline -->
            <p
              v-if="detail.tagline"
              class="mt-2 text-sm italic text-[var(--color-text-muted)]"
            >
              "{{ detail.tagline }}"
            </p>

            <!-- Genres -->
            <div v-if="detail.genres.length > 0" class="mt-3 flex flex-wrap gap-1.5">
              <span
                v-for="genre in detail.genres"
                :key="genre.id"
                class="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-2.5 py-0.5 text-xs text-[var(--color-text-secondary)]"
              >
                {{ genre.name }}
              </span>
            </div>

            <!-- Overview -->
            <div class="mt-5">
              <h2 class="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Overview
              </h2>
              <p class="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {{ detail.overview || 'Overview not available.' }}
              </p>
            </div>

            <!-- Watchlist button -->
            <div class="mt-6">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors"
                :class="
                  isSaved
                    ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white'
                    : 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]'
                "
                :aria-label="
                  isSaved
                    ? `Remove ${detail.title} from watchlist`
                    : `Add ${detail.title} to watchlist`
                "
                :aria-pressed="isSaved"
                @click="toggleItem"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  :fill="isSaved ? 'currentColor' : 'none'"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                {{ isSaved ? 'Remove from Watchlist' : 'Add to Watchlist' }}
              </button>
              <span class="sr-only" role="status" aria-live="polite">{{ feedbackMessage }}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import type { MediaType } from '@/lib/tmdb/schemas'
import { useMediaDetail } from '@/lib/tmdb/useMediaQueries'
import { getImageUrl, getPosterAlt } from '@/lib/tmdb/images'
import { useWatchlist } from '@/lib/watchlist/useWatchlist'

const route = useRoute()
const { toggle, isIn } = useWatchlist()

const mediaType = computed(() => route.name === 'tv-detail' ? 'tv' : 'movie' as MediaType)
const id = computed(() => Number(route.params.id))

const { detail, isLoading, isError } = useMediaDetail(mediaType.value, id.value)

const backdropInfo = computed(() =>
  detail.value ? getImageUrl(detail.value.backdropPath, 'backdrop') : null,
)

const posterInfo = computed(() =>
  detail.value ? getImageUrl(detail.value.posterPath, 'poster') : null,
)

const isSaved = computed(() =>
  detail.value ? isIn(detail.value.mediaType, detail.value.id).value : false,
)

const feedbackMessage = ref('')

function toggleItem() {
  if (!detail.value) return
  toggle({
    id: detail.value.id,
    mediaType: detail.value.mediaType,
    title: detail.value.title,
    posterPath: detail.value.posterPath,
    rating: detail.value.rating,
    date: detail.value.date,
  })
  feedbackMessage.value = isSaved.value
    ? `${detail.value.title} removed from watchlist`
    : `${detail.value.title} added to watchlist`
}
</script>
