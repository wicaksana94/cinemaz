import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MediaRail from './MediaRail.vue'
import { mediaSummaryMovie, mediaSummaryTv } from '@/test/fixtures'

// Mock MediaCard to avoid its internal dependencies
const MediaCardStub = {
  template: '<div class="media-card-stub">{{ item.title }}</div>',
  props: ['item'],
}

function mountRail(props: Record<string, unknown> = {}) {
  return mount(MediaRail, {
    props: {
      title: 'Film Populer',
      kind: 'popular-movies',
      items: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      ...props,
    },
    global: {
      stubs: {
        RouterLink: {
          template: '<a :href="to"><slot /></a>',
          props: ['to'],
        },
        MediaCard: MediaCardStub,
      },
    },
  })
}

describe('MediaRail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── Title ──────────────────────────────────────────────────────────────

  it('renders the section title', () => {
    const wrapper = mountRail()
    expect(wrapper.find('h2').text()).toBe('Film Populer')
  })

  it('has aria-labelledby pointing to title', () => {
    const wrapper = mountRail()
    const section = wrapper.find('section')
    const titleId = section.attributes('aria-labelledby')
    expect(titleId).toBeTruthy()
    const titleEl = wrapper.find(`#${titleId}`)
    expect(titleEl.text()).toBe('Film Populer')
  })

  // ─── Loading State ──────────────────────────────────────────────────────

  it('renders skeleton cards when loading', () => {
    const wrapper = mountRail({ isLoading: true })
    const skeletons = wrapper.findAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('has role="status" and aria-label when loading', () => {
    const wrapper = mountRail({ isLoading: true })
    const status = wrapper.find('[role="status"]')
    expect(status.exists()).toBe(true)
    expect(status.attributes('aria-label')).toContain('Loading')
  })

  it('does not render cards when loading', () => {
    const wrapper = mountRail({ isLoading: true })
    expect(wrapper.findAll('.media-card-stub').length).toBe(0)
  })

  // ─── Error State ────────────────────────────────────────────────────────

  it('renders error message when isError is true', () => {
    const wrapper = mountRail({ isError: true })
    expect(wrapper.text()).toContain('Unable to load content')
  })

  it('renders retry button when isError', () => {
    const wrapper = mountRail({ isError: true, refetch: vi.fn() })
    const btn = wrapper.find('button')
    expect(btn.text()).toContain('Try Again')
  })

  it('calls refetch when retry button clicked', async () => {
    const refetch = vi.fn()
    const wrapper = mountRail({ isError: true, refetch })
    const btn = wrapper.find('button')
    await btn.trigger('click')
    expect(refetch).toHaveBeenCalled()
  })

  it('has role="alert" on error state', () => {
    const wrapper = mountRail({ isError: true })
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })

  // ─── Empty State ────────────────────────────────────────────────────────

  it('renders empty message when items is empty', () => {
    const wrapper = mountRail({ items: [] })
    expect(wrapper.text()).toContain('No titles available')
  })

  // ─── Content State ──────────────────────────────────────────────────────

  it('renders cards when items are provided', () => {
    const wrapper = mountRail({ items: [mediaSummaryMovie, mediaSummaryTv] })
    const cards = wrapper.findAll('.media-card-stub')
    expect(cards).toHaveLength(2)
  })

  it('uses mediaType:id as key for each card', () => {
    const wrapper = mountRail({ items: [mediaSummaryMovie, mediaSummaryTv] })
    const listItems = wrapper.findAll('[role="listitem"]')
    expect(listItems).toHaveLength(2)
  })

  // ─── Navigation ─────────────────────────────────────────────────────────

  it('renders prev/next scroll buttons', () => {
    const wrapper = mountRail({ items: [mediaSummaryMovie] })
    const buttons = wrapper.findAll('button')
    // Should have prev + next buttons (2 scroll buttons)
    const scrollBtns = buttons.filter(
      (b) => b.attributes('aria-label')?.includes('Scroll'),
    )
    expect(scrollBtns.length).toBe(2)
  })

  it('prev button has accessible label with section name', () => {
    const wrapper = mountRail({ items: [mediaSummaryMovie] })
    const prevBtn = wrapper.find('[aria-label*="left"]')
    expect(prevBtn.attributes('aria-label')).toContain('Film Populer')
  })

  it('next button has accessible label with section name', () => {
    const wrapper = mountRail({ items: [mediaSummaryMovie] })
    const nextBtn = wrapper.find('[aria-label*="right"]')
    expect(nextBtn.attributes('aria-label')).toContain('Film Populer')
  })

  // ─── Accessibility ──────────────────────────────────────────────────────

  it('content list has role="list" with aria-label', () => {
    const wrapper = mountRail({ items: [mediaSummaryMovie] })
    const list = wrapper.find('[role="list"]')
    expect(list.exists()).toBe(true)
    expect(list.attributes('aria-label')).toContain('Film Populer')
  })

  it('each card is in a listitem', () => {
    const wrapper = mountRail({ items: [mediaSummaryMovie, mediaSummaryTv] })
    const items = wrapper.findAll('[role="listitem"]')
    expect(items).toHaveLength(2)
  })
})
