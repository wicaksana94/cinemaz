<template>
  <article
    class="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-bg-card)] transition-all duration-[var(--transition-base)] hover:bg-[var(--color-bg-card-hover)] hover:scale-[1.02] hover:shadow-lg hover:shadow-black/30"
  >
    <!-- Poster link -->
    <RouterLink
      :to="`/${item.mediaType}/${item.id}`"
      class="block focus-visible:outline-none"
      :aria-label="`View ${item.title} details`"
    >
      <div class="relative aspect-[2/3] overflow-hidden bg-[var(--color-bg-surface)]">
        <img
          v-if="imageInfo"
          :src="imageInfo.src"
          :alt="getPosterAlt(item.title)"
          :width="imageInfo.width"
          :height="imageInfo.height"
          loading="lazy"
          decoding="async"
          class="h-full w-full object-cover transition-transform duration-[var(--transition-base)] group-hover:scale-105"
        />
        <!-- Fallback for missing poster -->
        <div
          v-else
          class="flex h-full w-full items-center justify-center bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]"
          role="img"
          :aria-label="getPosterAlt(item.title)"
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
          :aria-label="`Rating ${item.rating.toFixed(1)} out of 10`"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          {{ item.rating.toFixed(1) }}
        </span>
      </div>
    </RouterLink>

    <!-- Info section (fixed height for uniform cards) -->
    <div class="flex h-[88px] flex-col gap-1 p-3">
      <RouterLink
        :to="`/${item.mediaType}/${item.id}`"
        class="text-sm font-semibold text-[var(--color-text-primary)] line-clamp-1 hover:text-[var(--color-accent)] transition-colors leading-tight overflow-hidden text-ellipsis whitespace-nowrap"
        :title="item.title"
      >
        {{ item.title }}
      </RouterLink>
      <p class="text-xs text-[var(--color-text-muted)] line-clamp-1">
        {{ item.date ? item.date : '—' }}
        <span class="mx-1 opacity-40">&middot;</span>
        {{ item.mediaType === 'tv' ? 'TV Series' : 'Movie' }}
      </p>

      <!-- Watchlist button — outside the <a> link for proper semantics -->
      <button
        type="button"
        class="mt-auto inline-flex items-center gap-1 self-start rounded-md px-2 py-1 text-xs font-medium transition-colors"
        :class="
          isSaved
            ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white'
            : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-secondary)]'
        "
        :aria-label="
          isSaved
            ? `Remove ${item.title} from watchlist`
            : `Add ${item.title} to watchlist`
        "
        :aria-pressed="isSaved"
        @click.stop.prevent="toggleItem"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
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
        {{ isSaved ? 'In watchlist' : 'Add to watchlist' }}
      </button>
    </div>

    <!-- Live region for screen readers -->
    <span class="sr-only" role="status" aria-live="polite">{{ feedbackMessage }}</span>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { MediaSummary } from '@/lib/tmdb/schemas'
import { getImageUrl, getPosterAlt } from '@/lib/tmdb/images'
import { useWatchlist } from '@/lib/watchlist/useWatchlist'

const props = defineProps<{ item: MediaSummary }>()

const { isIn, toggle } = useWatchlist()
const feedbackMessage = ref('')

const isSaved = computed(() => isIn(props.item.mediaType, props.item.id).value)
const imageInfo = computed(() => getImageUrl(props.item.posterPath, 'card'))

function toggleItem() {
  toggle({
    id: props.item.id,
    mediaType: props.item.mediaType,
    title: props.item.title,
    posterPath: props.item.posterPath,
    rating: props.item.rating,
    date: props.item.date,
  })
  feedbackMessage.value = isSaved.value
    ? `${props.item.title} removed from watchlist`
    : `${props.item.title} added to watchlist`
}
</script>
