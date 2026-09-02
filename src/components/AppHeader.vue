<template>
  <header class="sticky top-0 z-50 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-base)]/95 backdrop-blur-md">
    <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <!-- Brand -->
      <RouterLink
        to="/"
        class="flex items-center gap-1.5 font-display text-xl font-bold tracking-tight text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors"
        aria-label="cinemaZ - Home"
      >
        <span class="text-[var(--color-accent)]">cinema</span><span>Z</span>
      </RouterLink>

      <!-- Desktop Nav -->
      <nav class="hidden sm:flex items-center gap-6" aria-label="Main navigation">
        <RouterLink
          to="/"
          class="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          active-class="text-[var(--color-accent)]"
          :aria-current="$route.name === 'home' ? 'page' : undefined"
        >
          Home
        </RouterLink>
        <RouterLink
          to="/watchlist"
          class="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          active-class="text-[var(--color-accent)]"
          :aria-current="$route.name === 'watchlist' ? 'page' : undefined"
        >
          <span class="flex items-center gap-1.5">
            Watchlist
            <span
              v-if="watchlistCount > 0"
              class="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-1.5 py-0.5 text-xs font-bold text-white leading-none"
              :aria-label="`${watchlistCount} items in watchlist`"
            >
              {{ watchlistCount > 99 ? '99+' : watchlistCount }}
            </span>
          </span>
        </RouterLink>
      </nav>

      <!-- Search + Mobile nav -->
      <div class="flex items-center gap-3">
        <RouterLink
          to="/search"
          class="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1.5 text-sm text-[var(--color-text-muted)] hover:border-[var(--color-accent-border)] hover:text-[var(--color-text-secondary)] transition-colors"
          aria-label="Search movies or TV shows"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <span class="hidden md:inline">Search movies, TV shows...</span>
        </RouterLink>

        <!-- Mobile watchlist link -->
        <RouterLink
          to="/watchlist"
          class="sm:hidden relative flex items-center justify-center w-9 h-9 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          aria-label="Watchlist"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <span
            v-if="watchlistCount > 0"
            class="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-[var(--color-accent)] text-[9px] font-bold text-white leading-none"
          >
            {{ watchlistCount > 9 ? '9+' : watchlistCount }}
          </span>
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { useWatchlist } from '@/lib/watchlist/useWatchlist'

const route = useRoute()
const { count: watchlistCount } = useWatchlist()
</script>
