import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getWatchlist,
  saveWatchlist,
  toggleWatchlistItem,
  isInWatchlist,
  watchlistKey,
} from './storage'
import type { WatchlistItem } from '../tmdb/schemas'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (i: number) => Object.keys(store)[i] ?? null,
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// ─── watchlistKey ────────────────────────────────────────────────────────────

describe('watchlistKey', () => {
  it('creates correct key from type and id', () => {
    expect(watchlistKey('movie', 550)).toBe('movie:550')
  })

  it('creates different keys for different types with same id', () => {
    expect(watchlistKey('movie', 550)).not.toBe(watchlistKey('tv', 550))
  })

  it('creates different keys for different ids with same type', () => {
    expect(watchlistKey('movie', 550)).not.toBe(watchlistKey('movie', 680))
  })

  it('handles zero id', () => {
    expect(watchlistKey('movie', 0)).toBe('movie:0')
  })

  it('handles large id', () => {
    expect(watchlistKey('tv', 999999)).toBe('tv:999999')
  })
})

// ─── getWatchlist / saveWatchlist ─────────────────────────────────────────────

describe('getWatchlist', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns empty array when nothing stored', () => {
    expect(getWatchlist()).toEqual([])
  })

  it('saves and retrieves valid items', () => {
    const items: WatchlistItem[] = [
      {
        id: 1,
        mediaType: 'movie',
        title: 'Test',
        posterPath: null,
        rating: 8.0,
        date: '2024',
        savedAt: new Date().toISOString(),
      },
    ]

    saveWatchlist(items)
    expect(getWatchlist()).toEqual(items)
  })

  it('saves and retrieves multiple items', () => {
    const items: WatchlistItem[] = [
      { id: 1, mediaType: 'movie', title: 'Movie 1', posterPath: null, rating: 8.0, date: '2024', savedAt: '' },
      { id: 2, mediaType: 'tv', title: 'Show 1', posterPath: null, rating: 7.0, date: '2023', savedAt: '' },
      { id: 3, mediaType: 'movie', title: 'Movie 2', posterPath: '/p.jpg', rating: null, date: null, savedAt: '' },
    ]

    saveWatchlist(items)
    const retrieved = getWatchlist()
    expect(retrieved).toHaveLength(3)
    expect(retrieved[0].title).toBe('Movie 1')
    expect(retrieved[1].mediaType).toBe('tv')
  })

  it('filters out corrupted items while keeping valid ones', () => {
    // Manually set invalid JSON that has some valid and some invalid items
    const mixed = JSON.stringify([
      { id: 1, mediaType: 'movie', title: 'Valid', posterPath: null, rating: null, date: null, savedAt: '' },
      { id: 2 },  // missing required fields
      'not an object', // invalid type
    ])
    localStorageMock.setItem('cinemaz:watchlist:v1', mixed)
    const result = getWatchlist()
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Valid')
  })

  it('returns empty array for non-array JSON', () => {
    localStorageMock.setItem('cinemaz:watchlist:v1', '{"not": "array"}')
    expect(getWatchlist()).toEqual([])
  })

  it('returns empty array for invalid JSON string', () => {
    localStorageMock.setItem('cinemaz:watchlist:v1', 'not json at all {{{')
    expect(getWatchlist()).toEqual([])
  })

  it('returns empty array for empty array', () => {
    localStorageMock.setItem('cinemaz:watchlist:v1', '[]')
    expect(getWatchlist()).toEqual([])
  })
})

describe('saveWatchlist', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true on success', () => {
    const items: WatchlistItem[] = []
    expect(saveWatchlist(items)).toBe(true)
  })

  it('returns false when localStorage throws', () => {
    const originalSetItem = localStorageMock.setItem
    localStorageMock.setItem = () => { throw new Error('QuotaExceededError') }

    const result = saveWatchlist([{ id: 1, mediaType: 'movie', title: 'T', posterPath: null, rating: null, date: null, savedAt: '' }])
    expect(result).toBe(false)

    localStorageMock.setItem = originalSetItem
  })
})

// ─── toggleWatchlistItem ─────────────────────────────────────────────────────

describe('toggleWatchlistItem', () => {
  it('adds a new item at the beginning', () => {
    const items: WatchlistItem[] = [
      { id: 2, mediaType: 'movie', title: 'Existing', posterPath: null, rating: null, date: null, savedAt: '' },
    ]
    const new_item = { id: 1, mediaType: 'movie' as const, title: 'New', posterPath: null, rating: 8.0, date: '2024' }
    const result = toggleWatchlistItem(items, new_item)
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe(1)
    expect(result[0].savedAt).toBeTruthy()
    expect(result[1].id).toBe(2)
  })

  it('removes an existing item', () => {
    const existing: WatchlistItem[] = [
      { id: 1, mediaType: 'movie', title: 'Test', posterPath: null, rating: 8.0, date: '2024', savedAt: '' },
    ]
    const result = toggleWatchlistItem(existing, { id: 1, mediaType: 'movie', title: 'Test', posterPath: null, rating: 8.0, date: '2024' })
    expect(result).toHaveLength(0)
  })

  it('does not remove different type with same id', () => {
    const existing: WatchlistItem[] = [
      { id: 1, mediaType: 'movie', title: 'Movie', posterPath: null, rating: 8.0, date: '2024', savedAt: '' },
    ]
    const result = toggleWatchlistItem(existing, { id: 1, mediaType: 'tv', title: 'TV Show', posterPath: null, rating: null, date: null })
    expect(result).toHaveLength(2)
  })

  it('prevents duplicate records', () => {
    const items: WatchlistItem[] = [
      { id: 1, mediaType: 'movie', title: 'Test', posterPath: null, rating: 8.0, date: '2024', savedAt: '' },
    ]
    // Toggle twice = add then remove
    const afterFirst = toggleWatchlistItem(items, { id: 1, mediaType: 'movie', title: 'Test', posterPath: null, rating: 8.0, date: '2024' })
    expect(afterFirst).toHaveLength(0)
  })

  it('caps at 100 items', () => {
    const items: WatchlistItem[] = Array.from({ length: 100 }, (_, i) => ({
      id: i, mediaType: 'movie' as const, title: `Item ${i}`, posterPath: null, rating: 0, date: null, savedAt: '',
    }))
    const result = toggleWatchlistItem(items, { id: 200, mediaType: 'movie', title: 'New', posterPath: null, rating: 0, date: null })
    expect(result).toHaveLength(100)
    // New item should be first (since we add at beginning)
    expect(result[0].id).toBe(200)
  })

  it('adds savedAt timestamp', () => {
    const before = Date.now()
    const result = toggleWatchlistItem([], { id: 1, mediaType: 'movie', title: 'T', posterPath: null, rating: null, date: null })
    const after = Date.now()
    const savedAt = new Date(result[0].savedAt).getTime()
    expect(savedAt).toBeGreaterThanOrEqual(before)
    expect(savedAt).toBeLessThanOrEqual(after)
  })

  it('works with empty list', () => {
    const result = toggleWatchlistItem([], { id: 1, mediaType: 'movie', title: 'T', posterPath: null, rating: null, date: null })
    expect(result).toHaveLength(1)
  })
})

// ─── isInWatchlist ───────────────────────────────────────────────────────────

describe('isInWatchlist', () => {
  it('returns true when item exists', () => {
    const items: WatchlistItem[] = [
      { id: 1, mediaType: 'movie', title: 'Test', posterPath: null, rating: 8.0, date: '2024', savedAt: '' },
    ]
    expect(isInWatchlist(items, 'movie', 1)).toBe(true)
  })

  it('returns false when item does not exist', () => {
    expect(isInWatchlist([], 'movie', 1)).toBe(false)
  })

  it('distinguishes between movie and tv with same id', () => {
    const items: WatchlistItem[] = [
      { id: 1, mediaType: 'movie', title: 'Test', posterPath: null, rating: 8.0, date: '2024', savedAt: '' },
    ]
    expect(isInWatchlist(items, 'tv', 1)).toBe(false)
  })

  it('returns true for TV item when TV item exists', () => {
    const items: WatchlistItem[] = [
      { id: 1, mediaType: 'tv', title: 'Show', posterPath: null, rating: 7.0, date: '2023', savedAt: '' },
    ]
    expect(isInWatchlist(items, 'tv', 1)).toBe(true)
  })

  it('checks against multiple items', () => {
    const items: WatchlistItem[] = [
      { id: 1, mediaType: 'movie', title: 'M1', posterPath: null, rating: null, date: null, savedAt: '' },
      { id: 2, mediaType: 'tv', title: 'T1', posterPath: null, rating: null, date: null, savedAt: '' },
      { id: 3, mediaType: 'movie', title: 'M2', posterPath: null, rating: null, date: null, savedAt: '' },
    ]
    expect(isInWatchlist(items, 'movie', 1)).toBe(true)
    expect(isInWatchlist(items, 'tv', 2)).toBe(true)
    expect(isInWatchlist(items, 'movie', 2)).toBe(false)
    expect(isInWatchlist(items, 'tv', 3)).toBe(false)
  })
})
