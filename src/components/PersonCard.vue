<template>
  <article
    class="group relative flex flex-col items-center overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-bg-card)] transition-all duration-[var(--transition-base)] hover:bg-[var(--color-bg-card-hover)] hover:scale-[1.02] hover:shadow-lg hover:shadow-black/30"
  >
    <!-- Profile photo -->
    <div class="relative aspect-[2/3] w-full overflow-hidden bg-[var(--color-bg-surface)]">
      <img
        v-if="imageInfo"
        :src="imageInfo.src"
        :alt="`Photo of ${person.name}`"
        :width="imageInfo.width"
        :height="imageInfo.height"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover transition-transform duration-[var(--transition-base)] group-hover:scale-105"
      />
      <!-- Fallback for missing photo -->
      <div
        v-else
        class="flex h-full w-full items-center justify-center bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]"
        role="img"
        :aria-label="`Photo of ${person.name}`"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <!-- Popularity badge -->
      <span
        v-if="person.popularity && person.popularity > 0"
        class="absolute top-2 right-2 inline-flex items-center gap-0.5 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-yellow-400 backdrop-blur-sm"
        :aria-label="`Popularity ${person.popularity.toFixed(0)}`"
      >
        🔥 {{ person.popularity.toFixed(0) }}
      </span>
    </div>

    <!-- Info section -->
    <div class="flex flex-1 flex-col gap-1 p-3 text-center">
      <h3 class="text-sm font-semibold text-[var(--color-text-primary)] line-clamp-1">
        {{ person.name }}
      </h3>
      <p
        v-if="person.knownFor"
        class="text-xs text-[var(--color-text-muted)] line-clamp-1"
      >
        {{ person.knownFor }}
      </p>
      <p
        v-else-if="person.department"
        class="text-xs text-[var(--color-text-muted)]"
      >
        {{ person.department }}
      </p>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PersonSummary } from '@/lib/tmdb/schemas'
import { getImageUrl } from '@/lib/tmdb/images'

const props = defineProps<{ person: PersonSummary }>()

const imageInfo = computed(() => getImageUrl(props.person.profilePath, 'card'))
</script>
