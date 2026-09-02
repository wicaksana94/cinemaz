<template>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <div class="min-h-dvh flex flex-col bg-[var(--color-bg-base)]">
    <AppHeader />
    <main id="main-content" class="flex-1">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { RouterView } from 'vue-router'
</script>
