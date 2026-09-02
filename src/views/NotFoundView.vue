<template>
  <div class="flex flex-col items-center justify-center gap-4 px-4 py-20 text-center">
    <h1 class="text-6xl font-bold text-[var(--color-accent)]">404</h1>
    <h2 class="text-xl font-bold text-[var(--color-text-primary)]">Page not found</h2>
    <p class="max-w-sm text-sm text-[var(--color-text-muted)]">
      The page you are looking for does not exist or has been moved.
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
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
