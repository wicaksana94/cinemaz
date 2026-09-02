import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: 'cinemaZ - Discover Your Favorite Movies & TV Shows' },
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchView.vue'),
      meta: { title: 'cinemaZ - Search Movies & TV Shows' },
    },
    {
      path: '/movie/:id',
      name: 'movie-detail',
      component: () => import('@/views/DetailView.vue'),
      meta: { title: 'cinemaZ - Movie Details' },
    },
    {
      path: '/tv/:id',
      name: 'tv-detail',
      component: () => import('@/views/DetailView.vue'),
      meta: { title: 'cinemaZ - TV Show Details' },
    },
    {
      path: '/watchlist',
      name: 'watchlist',
      component: () => import('@/views/WatchlistView.vue'),
      meta: { title: 'cinemaZ - My Watchlist' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'cinemaZ - Page Not Found' },
    },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
})

router.afterEach((to) => {
  const title = (to.meta.title as string) || 'cinemaZ'
  document.title = title
})

export default router
