import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MediaCard from './MediaCard.vue'
import { mediaSummaryMovie, mediaSummaryTv, mediaSummaryNoPoster } from '@/test/fixtures'
import type { MediaSummary } from '@/lib/tmdb/schemas'

// Mock the watchlist composable
import { ref } from 'vue'

const mockToggle = vi.fn()
const savedState = ref(false)

vi.mock('@/lib/watchlist/useWatchlist', () => ({
  useWatchlist: () => ({
    toggle: mockToggle,
    isIn: () => savedState,
  }),
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

function mountCard(item: MediaSummary) {
  return mount(MediaCard, {
    props: { item },
    global: {
      stubs: {
        RouterLink: {
          template: '<a :href="to"><slot /></a>',
          props: ['to'],
        },
      },
    },
  })
}

describe('MediaCard', () => {
  beforeEach(() => {
    localStorageMock.clear()
    mockToggle.mockClear()
    savedState.value = false
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ─── Rendering ──────────────────────────────────────────────────────────

  it('renders the title', () => {
    const wrapper = mountCard(mediaSummaryMovie)
    expect(wrapper.text()).toContain('Fight Club')
  })

  it('renders the year', () => {
    const wrapper = mountCard(mediaSummaryMovie)
    expect(wrapper.text()).toContain('1999')
  })

  it('renders media type label for movie', () => {
    const wrapper = mountCard(mediaSummaryMovie)
    expect(wrapper.text()).toContain('Movie')
  })

  it('renders media type label for TV', () => {
    const wrapper = mountCard(mediaSummaryTv)
    expect(wrapper.text()).toContain('TV Series')
  })

  it('renders rating when present', () => {
    const wrapper = mountCard(mediaSummaryMovie)
    expect(wrapper.text()).toContain('8.4')
  })

  it('renders rating badge with aria-label', () => {
    const wrapper = mountCard(mediaSummaryMovie)
    const badge = wrapper.find('[aria-label="Rating 8.4 out of 10"]')
    expect(badge.exists()).toBe(true)
  })

  it('does not render rating when null', () => {
    const wrapper = mountCard(mediaSummaryNoPoster)
    expect(wrapper.find('[aria-label^="Rating"]').exists()).toBe(false)
  })

  it('renders em dash for missing date', () => {
    const wrapper = mountCard(mediaSummaryNoPoster)
    expect(wrapper.text()).toContain('—')
  })

  // ─── Poster / Images ────────────────────────────────────────────────────

  it('renders poster image when path exists', () => {
    const wrapper = mountCard(mediaSummaryMovie)
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toContain('/pB8BM7pdSp6B6Ih7QI4S2t0POoT.jpg')
  })

  it('renders alt text with poster prefix', () => {
    const wrapper = mountCard(mediaSummaryMovie)
    const img = wrapper.find('img')
    expect(img.attributes('alt')).toBe('Poster Fight Club')
  })

  it('sets lazy loading on poster', () => {
    const wrapper = mountCard(mediaSummaryMovie)
    const img = wrapper.find('img')
    expect(img.attributes('loading')).toBe('lazy')
  })

  it('renders fallback when poster is null', () => {
    const wrapper = mountCard(mediaSummaryNoPoster)
    const img = wrapper.find('img')
    expect(img.exists()).toBe(false)
    const fallback = wrapper.find('[role="img"]')
    expect(fallback.exists()).toBe(true)
  })

  // ─── Links ──────────────────────────────────────────────────────────────

  it('renders poster link to detail route', () => {
    const wrapper = mountCard(mediaSummaryMovie)
    const links = wrapper.findAll('a')
    const posterLink = links.find((l) => l.attributes('href') === '/movie/550')
    expect(posterLink).toBeTruthy()
  })

  it('renders title link to detail route', () => {
    const wrapper = mountCard(mediaSummaryMovie)
    const links = wrapper.findAll('a')
    const titleLink = links.find((l) => l.attributes('href') === '/movie/550' && l.text().includes('Fight Club'))
    expect(titleLink).toBeTruthy()
  })

  it('links to /tv/:id for TV shows', () => {
    const wrapper = mountCard(mediaSummaryTv)
    const links = wrapper.findAll('a')
    const link = links.find((l) => l.attributes('href') === '/tv/1399')
    expect(link).toBeTruthy()
  })

  // ─── Watchlist Button ───────────────────────────────────────────────────

  it('renders watchlist button with correct label when not saved', () => {
    const wrapper = mountCard(mediaSummaryMovie)
    const btn = wrapper.find('button')
    expect(btn.attributes('aria-label')).toContain('Add')
    expect(btn.attributes('aria-label')).toContain('to watchlist')
  })

  it('renders aria-pressed=false when not saved', () => {
    const wrapper = mountCard(mediaSummaryMovie)
    const btn = wrapper.find('button')
    expect(btn.attributes('aria-pressed')).toBe('false')
  })

  it('calls toggle when watchlist button clicked', async () => {
    const wrapper = mountCard(mediaSummaryMovie)
    const btn = wrapper.find('button')
    await btn.trigger('click')
    expect(mockToggle).toHaveBeenCalledWith({
      id: 550,
      mediaType: 'movie',
      title: 'Fight Club',
      posterPath: mediaSummaryMovie.posterPath,
      rating: mediaSummaryMovie.rating,
      date: mediaSummaryMovie.date,
    })
  })

  // ─── Accessibility ──────────────────────────────────────────────────────

  it('renders as article element', () => {
    const wrapper = mountCard(mediaSummaryMovie)
    expect(wrapper.find('article').exists()).toBe(true)
  })

  it('has status role for screen reader feedback', () => {
    const wrapper = mountCard(mediaSummaryMovie)
    const status = wrapper.find('[role="status"]')
    expect(status.exists()).toBe(true)
    expect(status.attributes('aria-live')).toBe('polite')
  })

  it('poster link has descriptive aria-label', () => {
    const wrapper = mountCard(mediaSummaryMovie)
    const posterLink = wrapper.find('a')
    expect(posterLink.attributes('aria-label')).toContain('View')
  })
})
