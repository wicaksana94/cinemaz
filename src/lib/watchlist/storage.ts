import { watchlistItemSchema, type WatchlistItem } from '../tmdb/schemas'

const STORAGE_KEY = 'cinemaz:watchlist:v1'
const MAX_ITEMS = 100

/**
 * Get the watchlist from localStorage with validation.
 */
export function getWatchlist(): WatchlistItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    const validated = parsed.map((item: unknown) => {
      const result = watchlistItemSchema.safeParse(item)
      return result.success ? result.data : null
    })

    return validated.filter((item): item is WatchlistItem => item !== null)
  } catch {
    // Storage unavailable or corrupted — fail gracefully
    console.warn('Watchlist: Unable to read from localStorage')
    return []
  }
}

/**
 * Save the watchlist to localStorage.
 * Returns true on success, false on failure.
 */
export function saveWatchlist(items: WatchlistItem[]): boolean {
  try {
    const serialized = JSON.stringify(items)
    localStorage.setItem(STORAGE_KEY, serialized)
    return true
  } catch {
    console.warn('Watchlist: Unable to write to localStorage')
    return false
  }
}

/**
 * Build a unique identity key for a watchlist item.
 */
export function watchlistKey(mediaType: string, id: number): string {
  return `${mediaType}:${id}`
}

/**
 * Check if an item is in the watchlist.
 */
export function isInWatchlist(
  items: WatchlistItem[],
  mediaType: string,
  id: number,
): boolean {
  const key = watchlistKey(mediaType, id)
  return items.some((item) => watchlistKey(item.mediaType, item.id) === key)
}

/**
 * Toggle an item in the watchlist. Returns the updated list.
 */
export function toggleWatchlistItem(
  items: WatchlistItem[],
  newItem: Omit<WatchlistItem, 'savedAt'>,
): WatchlistItem[] {
  const key = watchlistKey(newItem.mediaType, newItem.id)
  const exists = items.some((item) => watchlistKey(item.mediaType, item.id) === key)

  if (exists) {
    return items.filter((item) => watchlistKey(item.mediaType, item.id) !== key)
  }

  const item: WatchlistItem = {
    ...newItem,
    savedAt: new Date().toISOString(),
  }

  const updated = [item, ...items]
  // Enforce cap
  return updated.slice(0, MAX_ITEMS)
}
