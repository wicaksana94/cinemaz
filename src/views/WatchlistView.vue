<template>
  <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    <h1 class="text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
      My Watchlist
    </h1>
    <p class="mt-1 text-sm text-[var(--color-text-muted)]">
      {{ items.length > 0 ? `${items.length} saved titles` : 'Titles you save will appear here.' }}
    </p>

    <!-- Storage warning -->
    <div
      v-if="storageWarning"
      class="mt-4 rounded-lg border border-[var(--color-error-soft)] bg-[var(--color-error-soft)] px-4 py-3 text-sm text-[var(--color-text-secondary)]"
      role="alert"
    >
      Watchlist changes cannot be saved because your browser does not support local storage.
    </div>

    <!-- Empty state -->
    <div
      v-if="items.length === 0"
      class="flex flex-col items-center justify-center gap-4 py-16 text-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-text-muted)]" aria-hidden="true">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
      <p class="text-sm text-[var(--color-text-muted)]">Your watchlist is still empty.</p>
      <RouterLink
        to="/"
        class="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <polygon points="10 8 16 12 10 16 10 8"/>
        </svg>
        Browse Movies & TV
      </RouterLink>
    </div>

    <!-- Watchlist grid -->
    <div
      v-else
      class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      role="list"
      aria-label="Watchlist items"
    >
      <article
        v-for="item in items"
        :key="`${item.mediaType}-${item.id}`"
        class="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-bg-card)] transition-all duration-[var(--transition-base)] hover:bg-[var(--color-bg-card-hover)]"
        role="listitem"
      >
        <!-- Poster link -->
        <RouterLink
          :to="`/${item.mediaType}/${item.id}`"
          class="block focus-visible:outline-none"
          :aria-label="`View ${item.title} details`"
        >
          <div class="relative aspect-[2/3] overflow-hidden bg-[var(--color-bg-surface)]">
            <img
              v-if="getItemImage(item)"
              :src="getItemImage(item)!.src"
              :alt="getPosterAlt(item.title)"
              :width="getItemImage(item)!.width"
              :height="getItemImage(item)!.height"
              loading="lazy"
              decoding="async"
              class="h-full w-full object-cover"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
            </div>
            <!-- Rating badge -->
            <span
              v-if="item.rating && item.rating > 0"
              class="absolute top-2 right-2 inline-flex items-center gap-0.5 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-yellow-400 backdrop-blur-sm"
              :aria-label="`Rating ${item.rating.toFixed(1)}`"
            >
              ★ {{ item.rating.toFixed(1) }}
            </span>
          </div>
        </RouterLink>

        <!-- Info -->
        <div class="flex flex-1 flex-col gap-1 p-3">
          <RouterLink
            :to="`/${item.mediaType}/${item.id}`"
            class="text-sm font-semibold text-[var(--color-text-primary)] line-clamp-2 hover:text-[var(--color-accent)] transition-colors leading-tight"
          >
            {{ item.title }}
          </RouterLink>
          <p class="text-xs text-[var(--color-text-muted)]">
            {{ item.date ? item.date : '—' }}
            <span class="mx-1 opacity-40">&middot;</span>
            {{ item.mediaType === 'tv' ? 'TV Series' : 'Movie' }}
          </p>

          <!-- Remove button -->
          <button
            type="button"
            class="mt-auto inline-flex items-center gap-1 self-start rounded-md bg-[var(--color-error-soft)] px-2 py-1 text-xs font-medium text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white transition-colors"
            :aria-label="`Remove ${item.title} from watchlist`"
            @click.stop.prevent="removeItem(item)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
            Remove
          </button>
        </div>

        <!-- Live region for screen readers -->
        <span class="sr-only" role="status" aria-live="polite">{{ feedbackMessage }}</span>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { WatchlistItem } from '@/lib/tmdb/schemas'
import { getImageUrl, getPosterAlt } from '@/lib/tmdb/images'
import { useWatchlist } from '@/lib/watchlist/useWatchlist'

const { items, toggle, storageWarning } = useWatchlist()
const feedbackMessage = ref('')

function getItemImage(item: WatchlistItem) {
  return getImageUrl(item.posterPath, 'card')
}

function removeItem(item: WatchlistItem) {
  toggle({
    id: item.id,
    mediaType: item.mediaType,
    title: item.title,
    posterPath: item.posterPath,
    rating: item.rating,
    date: item.date,
  })
  feedbackMessage.value = `${item.title} removed from watchlist`
}
</script>
