<template>
  <div
    class="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-0.5"
    role="radiogroup"
    aria-label="Pagination mode"
  >
    <!-- Numbered pagination mode -->
    <button
      type="button"
      role="radio"
      class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors"
      :class="modelValue === 'paged'
        ? 'bg-[var(--color-accent)] text-white shadow-sm'
        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'"
      :aria-checked="modelValue === 'paged'"
      @click="$emit('update:modelValue', 'paged')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect width="7" height="7" x="3" y="3" rx="1"/>
        <rect width="7" height="7" x="14" y="3" rx="1"/>
        <rect width="7" height="7" x="14" y="14" rx="1"/>
        <rect width="7" height="7" x="3" y="14" rx="1"/>
      </svg>
      <span class="hidden sm:inline">Pages</span>
    </button>

    <!-- Infinite scroll mode -->
    <button
      type="button"
      role="radio"
      class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors"
      :class="modelValue === 'infinite'
        ? 'bg-[var(--color-accent)] text-white shadow-sm'
        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'"
      :aria-checked="modelValue === 'infinite'"
      @click="$emit('update:modelValue', 'infinite')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 2v4"/>
        <path d="m16.2 7.8 2.9-2.9"/>
        <path d="M18 12h4"/>
        <path d="m16.2 16.2 2.9 2.9"/>
        <path d="M12 18v4"/>
        <path d="m4.9 19.1 2.9-2.9"/>
        <path d="M2 12h4"/>
        <path d="m4.9 4.9 2.9 2.9"/>
      </svg>
      <span class="hidden sm:inline">Load More</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: 'paged' | 'infinite'
}>()

defineEmits<{
  'update:modelValue': [value: 'paged' | 'infinite']
}>()
</script>
