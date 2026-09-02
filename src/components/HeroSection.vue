<template>
  <section
    v-if="item"
    class="relative overflow-hidden"
    aria-labelledby="hero-title"
  >
    <!-- Background image (decorative) -->
    <div class="absolute inset-0">
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
      <!-- Gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-base)] via-[var(--color-bg-base)]/70 to-transparent" />
      <div class="absolute inset-0 bg-gradient-to-r from-[var(--color-bg-base)]/80 to-transparent" />
    </div>

    <!-- Content -->
    <div class="relative mx-auto flex min-h-[60vh] max-w-7xl flex-col justify-end px-4 pb-10 pt-24 sm:px-6 lg:px-8">
      <div class="max-w-xl">
        <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
          {{ item.mediaType === 'tv' ? 'Popular TV Series' : 'Popular Movie' }}
        </p>
        <h1
          id="hero-title"
          class="text-3xl font-bold leading-tight text-[var(--color-text-primary)] sm:text-4xl lg:text-5xl"
        >
          {{ item.title }}
        </h1>
        <p
          v-if="item.rating"
          class="mt-2 inline-flex items-center gap-1 text-sm text-yellow-400"
          :aria-label="`Rating ${item.rating.toFixed(1)} out of 10`"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          {{ item.rating.toFixed(1) }}
        </p>
        <p class="mt-3 line-clamp-3 text-sm text-[var(--color-text-secondary)] sm:text-base">
          {{ item.overview || 'Synopsis not available.' }}
        </p>
        <div class="mt-5 flex flex-wrap gap-3">
          <RouterLink
            :to="`/${item.mediaType}/${item.id}`"
            class="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]"
            :aria-label="`View ${item.title} details`"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="10 8 16 12 10 16 10 8"/>
            </svg>
            View Details
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { MediaSummary } from '@/lib/tmdb/schemas'
import { getImageUrl } from '@/lib/tmdb/images'

const props = defineProps<{ item: MediaSummary | null }>()

const backdropInfo = computed(() =>
  props.item ? getImageUrl(props.item.backdropPath, 'hero') : null,
)
</script>
