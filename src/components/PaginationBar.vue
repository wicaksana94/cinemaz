<template>
  <nav
    class="flex items-center justify-center gap-1"
    aria-label="Pagination"
  >
    <!-- Previous button -->
    <button
      type="button"
      class="inline-flex h-9 min-w-[36px] items-center justify-center gap-1 rounded-md px-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
      :class="currentPage <= 1
        ? 'text-[var(--color-text-muted)]'
        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]'"
      :disabled="currentPage <= 1 || isFetching"
      @click="$emit('goTo', currentPage - 1)"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m15 18-6-6 6-6"/>
      </svg>
      <span class="hidden sm:inline">Previous</span>
    </button>

    <!-- Page numbers -->
    <template v-for="page in visiblePages" :key="page">
      <span
        v-if="page === '...'"
        class="inline-flex h-9 min-w-[36px] items-center justify-center text-sm text-[var(--color-text-muted)]"
        aria-hidden="true"
      >
        …
      </span>
      <button
        v-else
        type="button"
        class="inline-flex h-9 min-w-[36px] items-center justify-center rounded-md px-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        :class="page === currentPage
          ? 'bg-[var(--color-accent)] text-white'
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]'"
        :disabled="isFetching"
        :aria-label="`Page ${page}`"
        :aria-current="page === currentPage ? 'page' : undefined"
        @click="$emit('goTo', page as number)"
      >
        {{ page }}
      </button>
    </template>

    <!-- Next button -->
    <button
      type="button"
      class="inline-flex h-9 min-w-[36px] items-center justify-center gap-1 rounded-md px-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
      :class="currentPage >= totalPages
        ? 'text-[var(--color-text-muted)]'
        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]'"
      :disabled="currentPage >= totalPages || isFetching"
      @click="$emit('goTo', currentPage + 1)"
    >
      <span class="hidden sm:inline">Next</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m9 18 6-6-6-6"/>
      </svg>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  totalPages: number
  isFetching?: boolean
}>()

defineEmits<{
  goTo: [page: number]
}>()

/**
 * Generate visible page numbers with ellipsis.
 * Shows first, last, current, and neighbors with "..." gaps.
 */
const visiblePages = computed(() => {
  const total = props.totalPages
  const current = props.currentPage

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | string)[] = []

  // Always show page 1
  pages.push(1)

  // Calculate range around current page
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  // Add ellipsis before range if needed
  if (start > 2) {
    pages.push('...')
  }

  // Add pages in range
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  // Add ellipsis after range if needed
  if (end < total - 1) {
    pages.push('...')
  }

  // Always show last page
  if (total > 1) {
    pages.push(total)
  }

  return pages
})
</script>
