<template>
  <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    <!-- Search form -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
        Search Movies &amp; TV Shows
      </h1>
      <p class="mt-1 text-sm text-[var(--color-text-muted)]">
        Type a movie or TV show title to find it.
      </p>

      <form class="mt-4 flex gap-2" role="search" @submit.prevent="handleSubmit">
        <label for="search-input" class="sr-only">Search movies or TV shows</label>
        <div class="relative flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            id="search-input"
            ref="inputRef"
            v-model="searchInput"
            type="text"
            placeholder="e.g. Avengers, Squid Game..."
            class="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] py-2.5 pl-10 pr-10 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none transition-colors"
            :aria-describedby="hasQuery && searchInput.length < 2 ? 'search-hint' : undefined"
          />
          <button
            v-if="searchInput"
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            aria-label="Clear search"
            @click="clearSearch"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" x2="6" y1="6" y2="18"/>
              <line x1="6" x2="18" y1="6" y2="18"/>
            </svg>
          </button>
        </div>
      </form>
      <p
        v-if="hasQuery && searchInput.length < 2"
        id="search-hint"
        class="mt-1 text-xs text-[var(--color-text-muted)]"
      >
        Type at least 2 characters to start searching.
      </p>
    </div>

    <!-- Loading state (initial) -->
    <div
      v-if="isSearching && debouncedQuery.length >= 2 && isLoading && items.length === 0"
      class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      role="status"
      aria-label="Loading search results"
    >
      <div v-for="i in 10" :key="`skeleton-${i}`" aria-hidden="true">
        <div class="aspect-[2/3] animate-pulse rounded-[var(--radius-card)] bg-[var(--color-bg-elevated)]" />
        <div class="mt-2 h-3 w-3/4 animate-pulse rounded bg-[var(--color-bg-elevated)]" />
      </div>
      <span class="sr-only">Searching "{{ searchInput }}"...</span>
    </div>

    <!-- Error state -->
    <div
      v-else-if="isError && items.length === 0"
      class="flex flex-col items-center gap-3 rounded-lg border border-[var(--color-error-soft)] bg-[var(--color-error-soft)] px-4 py-12 text-center"
      role="alert"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-error)]" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" x2="12" y1="8" y2="12"/>
        <line x1="12" x2="12.01" y1="16" y2="16"/>
      </svg>
      <p class="text-sm text-[var(--color-text-secondary)]">Unable to load search results.</p>
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-md bg-[var(--color-bg-elevated)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card-hover)] transition-colors"
        @click="handleRetry"
      >
        Try Again
      </button>
    </div>

    <!-- Results -->
    <template v-else-if="hasQuery && debouncedQuery.length >= 2 && !initialLoading">
      <section
        v-if="items.length > 0"
        aria-label="Search results"
      >
        <!-- Results header with count and mode toggle -->
        <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p
            class="text-sm text-[var(--color-text-muted)]"
            role="status"
            aria-live="polite"
          >
            {{ totalResults }} results for "<span class="text-[var(--color-text-primary)]">{{ debouncedQuery }}</span>"
            <template v-if="paginationMode === 'paged' && totalPages > 1">
              · Page {{ currentPage }} of {{ totalPages }}
            </template>
            <template v-else-if="paginationMode === 'infinite' && items.length > 0">
              · Showing {{ items.length }} of {{ totalResults }}
            </template>
          </p>
          <SearchModeToggle v-model="paginationMode" />
        </div>

        <!-- Results grid -->
        <div
          class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          :class="{ 'opacity-60 pointer-events-none': isFetching && items.length > 0 }"
        >
          <div
            v-for="item in items"
            :key="`${item.mediaType}-${item.id}`"
          >
            <MediaCard :item="item" />
          </div>
        </div>

        <!-- Paged: Pagination bar -->
        <div v-if="paginationMode === 'paged'" class="mt-8">
          <PaginationBar
            :current-page="currentPage"
            :total-pages="totalPages"
            :is-fetching="isFetching"
            @go-to="handleGoToPage"
          />
        </div>

        <!-- Infinite: Load more spinner + sentinel -->
        <div v-else class="mt-8 flex flex-col items-center gap-4">
          <!-- Loading more indicator -->
          <div
            v-if="isFetchingNextPage"
            class="flex items-center gap-2 text-sm text-[var(--color-text-muted)]"
            role="status"
          >
            <div class="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
            Loading more results...
          </div>

          <!-- No more results -->
          <p
            v-else-if="!hasNextPage"
            class="text-sm text-[var(--color-text-muted)]"
          >
            You've reached the end of the results.
          </p>

          <!-- Scroll sentinel for IntersectionObserver -->
          <div
            ref="sentinelRef"
            class="h-px w-full"
            aria-hidden="true"
          />
        </div>
      </section>

      <!-- No results -->
      <div v-else class="py-12 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3 text-[var(--color-text-muted)]" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.3-4.3"/>
        </svg>
        <p class="text-sm text-[var(--color-text-muted)]">
          No results for "<span class="text-[var(--color-text-secondary)]">{{ debouncedQuery }}</span>".
        </p>
        <p class="mt-1 text-xs text-[var(--color-text-muted)]">
          Try a different keyword or check the spelling.
        </p>
      </div>
    </template>

    <!-- Empty state (no query yet) -->
    <div
      v-else-if="!hasQuery || searchInput.length < 2"
      class="py-12 text-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3 text-[var(--color-text-muted)]" aria-hidden="true">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.3-4.3"/>
      </svg>
      <p class="text-sm text-[var(--color-text-muted)]">
        Type a movie or TV show title to start searching.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MediaCard from '@/components/MediaCard.vue'
import PaginationBar from '@/components/PaginationBar.vue'
import SearchModeToggle from '@/components/SearchModeToggle.vue'
import { useSearch, useSearchInfinite } from '@/lib/tmdb/useMediaQueries'

const STORAGE_KEY = 'cinemaz-search-pagination-mode'

const route = useRoute()
const router = useRouter()

const inputRef = ref<HTMLInputElement | null>(null)
const searchInput = ref((route.query.q as string) || '')
const hasQuery = ref(searchInput.value.length > 0)

// Pagination mode: 'paged' or 'infinite', persisted to localStorage
const paginationMode = ref<'paged' | 'infinite'>(
  (localStorage.getItem(STORAGE_KEY) as 'paged' | 'infinite') || 'paged',
)

watch(paginationMode, (mode) => {
  localStorage.setItem(STORAGE_KEY, mode)
})

// Use the appropriate composable based on mode
const paged = useSearch(searchInput)
const infinite = useSearchInfinite(searchInput)

// Create unified reactive references that switch based on mode
const items = computed(() =>
  paginationMode.value === 'paged' ? paged.items.value : infinite.items.value,
)
const isLoading = computed(() =>
  paginationMode.value === 'paged' ? paged.isLoading.value : infinite.isLoading.value,
)
const isError = computed(() =>
  paginationMode.value === 'paged' ? paged.isError.value : infinite.isError.value,
)
const isFetching = computed(() =>
  paginationMode.value === 'paged' ? paged.isFetching.value : infinite.isFetchingNextPage.value,
)
const debouncedQuery = computed(() =>
  paginationMode.value === 'paged' ? paged.debouncedQuery.value : infinite.debouncedQuery.value,
)
const totalResults = computed(() =>
  paginationMode.value === 'paged' ? paged.totalResults.value : infinite.totalResults.value,
)
const totalPages = computed(() =>
  paginationMode.value === 'paged' ? paged.totalPages.value : infinite.totalPages.value,
)
const currentPage = computed(() =>
  paginationMode.value === 'paged' ? paged.currentPage.value : 1,
)
const isFetchingNextPage = computed(() =>
  paginationMode.value === 'infinite' ? infinite.isFetchingNextPage.value : false,
)
const hasNextPage = computed(() =>
  paginationMode.value === 'infinite' ? infinite.hasNextPage.value : false,
)

// True loading = first page hasn't arrived yet (no items to show)
const initialLoading = computed(() => isLoading.value && items.value.length === 0)

function handleRetry() {
  if (paginationMode.value === 'paged') {
    paged.refetch()
  } else {
    infinite.refetch()
  }
}

watch(
  () => searchInput.value,
  (val) => {
    hasQuery.value = val.length > 0
  },
)

const isSearching = computed(() => hasQuery.value && searchInput.value.length >= 2)

// Sync page with URL (only for paged mode)
watch(
  () => paginationMode.value === 'paged' ? paged.currentPage.value : 0,
  (page) => {
    if (paginationMode.value !== 'paged') return
    const q = searchInput.value.trim()
    if (q && page > 0) {
      router.replace({
        query: { q, ...(page > 1 ? { page: String(page) } : {}) },
      })
    }
  },
)

// Initialize page from URL
const initialPage = Number(route.query.page) || 1
if (initialPage > 1 && paginationMode.value === 'paged') {
  paged.goToPage(initialPage)
}

function handleSubmit() {
  const q = searchInput.value.trim()
  if (q) {
    if (paginationMode.value === 'paged') {
      paged.goToPage(1)
    }
    router.replace({ query: { q } })
  }
}

function clearSearch() {
  searchInput.value = ''
  router.replace({ query: {} })
  inputRef.value?.focus()
}

function handleGoToPage(page: number) {
  paged.goToPage(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ─── Infinite scroll: IntersectionObserver ─────────────────────────────────

const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function setupObserver() {
  if (observer) observer.disconnect()

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry && entry.isIntersecting && paginationMode.value === 'infinite') {
        infinite.loadMore()
      }
    },
    { rootMargin: '200px' },
  )

  if (sentinelRef.value) {
    observer.observe(sentinelRef.value)
  }
}

// Re-observe sentinel when it changes (e.g. after DOM update)
watch(
  sentinelRef,
  (el) => {
    if (observer) observer.disconnect()
    if (el) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]
          if (entry && entry.isIntersecting && paginationMode.value === 'infinite') {
            infinite.loadMore()
          }
        },
        { rootMargin: '200px' },
      )
      observer.observe(el)
    }
  },
)

onMounted(() => {
  if (!route.query.q) {
    inputRef.value?.focus()
  }
  setupObserver()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>
