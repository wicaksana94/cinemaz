import type { MediaType } from './schemas'

/**
 * Query key factory — single source of truth for all cache keys.
 * Usage: tmdbKeys.list('popular-movies') or tmdbKeys.detail('movie', 550)
 */
export const tmdbKeys = {
  all: ['media'] as const,

  lists: () => [...tmdbKeys.all, 'list'] as const,
  list: (kind: string) => [...tmdbKeys.lists(), kind] as const,
  listPage: (kind: string, page: number) => [...tmdbKeys.list(kind), page] as const,

  details: () => [...tmdbKeys.all, 'detail'] as const,
  detail: (type: MediaType, id: number) => [...tmdbKeys.details(), type, id] as const,

  search: (query: string) => [...tmdbKeys.all, 'search', query] as const,
} as const
