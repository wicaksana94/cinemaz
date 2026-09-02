<template>
  <div v-if="error" class="rounded-lg border border-[var(--color-error-soft)] bg-[var(--color-error-soft)] p-6 text-center" role="alert">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-2 text-[var(--color-error)]" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" x2="12" y1="8" y2="12"/>
      <line x1="12" x2="12.01" y1="16" y2="16"/>
    </svg>
    <p class="text-sm text-[var(--color-text-secondary)]">
      An error occurred while loading this content.
    </p>
    <button
      type="button"
      class="mt-3 inline-flex items-center gap-1 rounded-md bg-[var(--color-bg-elevated)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card-hover)] transition-colors"
      @click="retry"
    >
      Try Again
    </button>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, type Ref } from 'vue'

const error = ref<Error | null>(null)

onErrorCaptured((err: Error) => {
  error.value = err
  return false // Stop propagation
})

function retry() {
  error.value = null
}
</script>
