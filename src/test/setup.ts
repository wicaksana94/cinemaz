import { config } from '@vue/test-utils'
import { createRouter, createMemoryHistory, type RouteRecordRaw } from 'vue-router'

// Stub the router-link and router-view for component tests
config.global.stubs = {
  RouterLink: {
    template: '<a :href="to" v-bind="$attrs"><slot /></a>',
    props: ['to'],
  },
  RouterView: true,
}

// Create a real router for tests that need routing
export function createTestRouter(routes: RouteRecordRaw[] = []) {
  return createRouter({
    history: createMemoryHistory(),
    routes: routes.length > 0 ? routes : [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/search', name: 'search', component: { template: '<div />' } },
      { path: '/movie/:id', name: 'movie-detail', component: { template: '<div />' } },
      { path: '/tv/:id', name: 'tv-detail', component: { template: '<div />' } },
      { path: '/watchlist', name: 'watchlist', component: { template: '<div />' } },
    ],
  })
}

// Mount wrapper with router
export function mountWithRouter(component: unknown, options: Record<string, unknown> = {}) {
  const router = createTestRouter()
  return {
    router,
    ...options,
  }
}
