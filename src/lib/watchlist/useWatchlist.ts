import { ref, computed, watchEffect } from 'vue'
import type { WatchlistItem, MediaType } from '../tmdb/schemas'
import {
  getWatchlist,
  saveWatchlist,
  isInWatchlist,
  toggleWatchlistItem,
} from './storage'

const items = ref<WatchlistItem[]>(getWatchlist())
const storageWarning = ref(false)

// Sync to localStorage whenever items change
watchEffect(() => {
  const success = saveWatchlist(items.value)
  if (!success) {
    storageWarning.value = true
  }
})

export function useWatchlist() {
  const isIn = (mediaType: MediaType, id: number) =>
    computed(() => isInWatchlist(items.value, mediaType, id))

  const toggle = (item: Omit<WatchlistItem, 'savedAt'>) => {
    items.value = toggleWatchlistItem(items.value, item)
  }

  const count = computed(() => items.value.length)

  return {
    items: computed(() => items.value),
    count,
    isIn,
    toggle,
    storageWarning: computed(() => storageWarning.value),
  }
}
