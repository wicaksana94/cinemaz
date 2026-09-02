<template>
  <section
    :aria-labelledby="`rail-title-${kind}`"
    class="py-4"
  >
    <!-- Section title -->
    <h2
      :id="`rail-title-${kind}`"
      class="mb-3 px-4 text-lg font-bold text-[var(--color-text-primary)] sm:text-xl"
    >
      {{ title }}
    </h2>

    <!-- Loading state: skeleton cards -->
    <div
      v-if="isLoading"
      class="flex gap-3 overflow-hidden px-4"
      role="status"
      aria-label="Loading content"
    >
      <div
        v-for="i in 6"
        :key="`skeleton-${i}`"
        class="flex-shrink-0 w-[150px] sm:w-[175px]"
        aria-hidden="true"
      >
        <div class="aspect-[2/3] animate-pulse rounded-[var(--radius-card)] bg-[var(--color-bg-elevated)]" />
        <div class="mt-2 h-3 w-3/4 animate-pulse rounded bg-[var(--color-bg-elevated)]" />
        <div class="mt-1 h-2 w-1/2 animate-pulse rounded bg-[var(--color-bg-elevated)]" />
      </div>
      <span class="sr-only">Loading {{ title }}...</span>
    </div>

    <!-- Error state -->
    <div
      v-else-if="isError"
      class="flex flex-col items-center gap-3 rounded-lg border border-[var(--color-error-soft)] bg-[var(--color-error-soft)] px-4 py-8 text-center"
      role="alert"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-error)]" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" x2="12" y1="8" y2="12"/>
        <line x1="12" x2="12.01" y1="16" y2="16"/>
      </svg>
      <p class="text-sm text-[var(--color-text-secondary)]">Unable to load content at this time.</p>
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-md bg-[var(--color-bg-elevated)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card-hover)] transition-colors"
        @click="refetch"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
          <path d="M16 16h5v5"/>
        </svg>
        Try Again
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="items.length === 0"
      class="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]"
    >
      No titles available yet.
    </div>

    <!-- Scrollable cards -->
    <div
      v-else
      class="relative group/rail"
    >
      <!-- Prev button -->
      <button
        ref="prevBtn"
        type="button"
        class="absolute left-1 top-1/2 z-10 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-black/60 text-white opacity-0 group-hover/rail:opacity-100 backdrop-blur-sm transition-opacity hover:bg-black/80 focus-visible:opacity-100"
        :aria-label="`Scroll ${title} left`"
        @click="scrollLeft"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>

      <!-- Cards container -->
      <div
        ref="scrollContainer"
        class="flex gap-3 overflow-x-auto scroll-smooth px-4 pb-2 rail-scroll"
        role="list"
        :aria-label="`List of ${title}`"
        @scroll="onScroll"
      >
        <div
          v-for="item in items"
          :key="`${item.mediaType}-${item.id}`"
          class="flex-shrink-0 w-[150px] sm:w-[175px]"
          role="listitem"
        >
          <MediaCard :item="item" />
        </div>

        <!-- Loading more indicator -->
        <div
          v-if="isFetchingNextPage"
          class="flex flex-shrink-0 items-center justify-center w-[150px] sm:w-[175px]"
          role="status"
        >
          <div class="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
          <span class="sr-only">Loading more...</span>
        </div>
      </div>

      <!-- Next button -->
      <button
        ref="nextBtn"
        type="button"
        class="absolute right-1 top-1/2 z-10 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-black/60 text-white opacity-0 group-hover/rail:opacity-100 backdrop-blur-sm transition-opacity hover:bg-black/80 focus-visible:opacity-100"
        :aria-label="`Scroll ${title} right`"
        @click="scrollRight"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MediaCard from './MediaCard.vue'

import type { MediaSummary } from '@/lib/tmdb/schemas'

const props = defineProps<{
  title: string
  kind: string
  items: MediaSummary[]
  isLoading?: boolean
  isError?: boolean
  isFetchingNextPage?: boolean
  hasNextPage?: boolean
  loadMore?: () => void
  refetch?: () => void
}>()

const scrollContainer = ref<HTMLDivElement | null>(null)
const prevBtn = ref<HTMLButtonElement | null>(null)
const nextBtn = ref<HTMLButtonElement | null>(null)

const SCROLL_STEP = 300

function scrollLeft() {
  scrollContainer.value?.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' })
}

function scrollRight() {
  scrollContainer.value?.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' })
}

function onScroll() {
  const el = scrollContainer.value
  if (!el || !props.hasNextPage || props.isFetchingNextPage) return

  // Trigger load more when within 200px of the end
  const threshold = 200
  if (el.scrollLeft + el.clientWidth >= el.scrollWidth - threshold) {
    props.loadMore?.()
  }
}
</script>
