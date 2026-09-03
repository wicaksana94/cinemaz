# cinemaZ 🎬

> Discover your favorite movies & TV shows — a cinema catalog for everyone.

cinemaZ is a Vue 3 web application for browsing movies and TV shows using data from [The Movie Database (TMDB)](https://www.themoviedb.org/). It helps users discover, search, and save their favorite titles.

## 🚀 Tech Stack

| Concern | Choice |
| --- | --- |
| Framework | Vue 3 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v4 |
| Routing | Vue Router 4 |
| Server state | TanStack Vue Query |
| Validation | Zod |
| Linting | oxLint |
| Testing | Vitest |
| Hosting | Netlify (SPA + Edge Function gateway) |

## 📋 Prerequisites

- Node.js 18+ (recommended: 20+)
- npm 9+
- TMDB API v3 access token ([get one here](https://www.themoviedb.org/settings/api))

## 🛠️ Setup & Installation

```bash
# 1. Clone the repository
git clone https://github.com/wicaksana94/cinemaz.git
cd cinemaz

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env

# 4. Edit .env with your TMDB credentials
# ⚠️ NEVER commit .env or expose TMDB_ACCESS_TOKEN to the browser

# 5. Start development server
npm run dev
```

For local production testing with the integrated gateway:

```bash
# Build and start the production server
npm run build
node serve.mjs
# → cinemaZ running on http://localhost:3000
```

## 📜 Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run oxLint |
| `npm run typecheck` | Run vue-tsc type checking |
| `npm run test` | Run Vitest tests (139 tests) |
| `npm run test:watch` | Run tests in watch mode |

## 🔐 Environment Variables

```dotenv
# Server only — set in Netlify dashboard, never prefix with VITE_
TMDB_ACCESS_TOKEN=    # Your TMDB API v3 bearer token
TMDB_BASE_URL=https://api.themoviedb.org

# Browser-visible configuration
VITE_TMDB_LANGUAGE=id-ID
VITE_TMDB_REGION=ID
```

**Security:** `TMDB_ACCESS_TOKEN` is only used in the serverless gateway. It is never exposed to the browser, committed to Git, or logged.

## 🏗️ Architecture

```
cinemaz/
├── api/
│   └── tmdb/
│   └── edge-functions/
│       └── tmdb-gateway.js   # Netlify Edge Function TMDB gateway
├── public/
│   ├── favicon.svg           # cinemaZ branded favicon
│   ├── placeholder-movie.svg # Movie poster placeholder
│   └── placeholder-tv.svg    # TV show poster placeholder
├── src/
│   ├── assets/
│   │   └── main.css          # Global styles + Tailwind + design tokens
│   ├── components/
│   │   ├── AppHeader.vue     # Sticky header with nav, search, watchlist
│   │   ├── AppFooter.vue     # Footer with copyright
│   │   ├── ErrorBoundary.vue # Component-level error isolation
│   │   ├── HeroSection.vue   # Decorative backdrop hero with CTA
│   │   ├── MediaCard.vue     # Individual media card with poster + action
│   │   ├── MediaRail.vue     # Horizontal scrollable rail with infinite scroll
│   │   ├── PaginationBar.vue # Numbered pagination with page numbers + ellipsis
│   │   ├── PersonCard.vue    # Person card with profile photo + popularity
│   │   ├── PersonRail.vue    # Horizontal scrollable person rail
│   │   └── SearchModeToggle.vue # Toggle between paged and infinite scroll
│   ├── lib/
│   │   ├── tmdb/
│   │   │   ├── client.ts     # Typed TMDB client + query definitions
│   │   │   ├── gateway-plugin.ts # Vite dev server TMDB gateway
│   │   │   ├── images.ts     # Image URL helper with slot sizes
│   │   │   ├── keys.ts       # Query key factory
│   │   │   ├── mappers.ts    # TMDB → domain type mappers
│   │   │   ├── schemas.ts    # Zod schemas + domain types
│   │   │   └── useMediaQueries.ts # Vue composables for queries + search
│   │   └── watchlist/
│   │       ├── storage.ts    # localStorage adapter with validation
│   │       └── useWatchlist.ts # Vue composable for reactive watchlist
│   ├── views/
│   │   ├── HomeView.vue      # Hero + 9 catalog rails
│   │   ├── SearchView.vue    # Search with toggle pagination/infinite scroll
│   │   ├── DetailView.vue    # Movie/TV detail with metadata
│   │   ├── WatchlistView.vue  # Saved titles with remove
│   │   └── NotFoundView.vue  # 404 recovery page
│   ├── App.vue               # Root component
│   ├── main.ts               # Entry point
│   └── router/
│       └── index.ts          # Vue Router configuration
├── serve.mjs                 # Local production server with gateway
├── netlify.toml               # Netlify build + redirect config
└── vite.config.ts            # Vite config with Tailwind + gateway
```

### Key Design Decisions

1. **Zod at trust boundaries** — API responses, localStorage data, and URL params are validated at runtime with Zod schemas, from which all TypeScript types are derived.

2. **Component-level ErrorBoundary** — Each catalog rail is wrapped in its own `<ErrorBoundary>` so a render failure in one rail doesn't break the entire Home page.

3. **Serverless TMDB gateway** — The browser calls `/api/tmdb/<allowed-path>`. The gateway validates paths against a strict allowlist, adds authentication, and maps errors to safe payloads. The token never reaches the client.

4. **Watchlist via localStorage** — Identity is `mediaType:id`. Data is validated on read, capped at 100 items, and degrades gracefully if storage is unavailable.

5. **Infinite scroll rails** — Each rail uses `useInfiniteQuery` with scroll-to-end detection, loading 20 items per page until no more data is available.

6. **Dual-mode search pagination** — Search results support both numbered pagination (`useQuery` with page parameter) and infinite scroll (`useInfiniteQuery`), switchable via a toggle. User preference persists to `localStorage` and page state syncs with URL.

## 🎬 TMDB API Endpoints

### List Endpoints (9)

| UI Section | Upstream Path |
| --- | --- |
| Popular Movies | `/3/movie/popular` |
| Top Rated Movies | `/3/movie/top_rated` |
| Now Playing | `/3/movie/now_playing` |
| Upcoming Movies | `/3/movie/upcoming` |
| Popular TV Shows | `/3/tv/popular` |
| Top Rated TV Shows | `/3/tv/top_rated` |
| TV Shows On The Air | `/3/tv/on_the_air` |
| TV Shows Airing Today | `/3/tv/airing_today` |
| Popular People | `/3/person/popular` |

### Other Endpoints (3)

| Flow | Upstream Path |
| --- | --- |
| Search | `/3/search/multi` |
| Movie Detail | `/3/movie/:id` |
| TV Detail | `/3/tv/:id` |

## ♿ Accessibility

- Semantic HTML landmarks (`<header>`, `<main>`, `<footer>`, `<nav>`, `<section>`, `<article>`)
- Skip link to main content (`#main-content`)
- `aria-current="page"` on active navigation
- Visible focus rings on all interactive elements (`focus-visible:ring-2` or `focus-visible:opacity-100`)
- All controls have accessible names (no icon-only buttons without labels)
- Search input has associated `<label>` and `role="search"`
- Loading states announced with `role="status"` and `aria-live="polite"`
- Error states use `role="alert"`
- Skeletons use `aria-hidden="true"`
- Poster images have descriptive `alt` text
- Watchlist toggle uses `aria-pressed` for toggle state
- Scroll buttons have `focus-visible:opacity-100` for keyboard visibility
- Respects `prefers-reduced-motion` media query
- Pagination uses `aria-label="Pagination"` and `aria-current="page"` on active page
- Search mode toggle uses `role="radiogroup"` with `aria-checked`

### Keyboard Navigation

1. Tab: Skip link → Header nav → Search → Main content → Footer
2. Enter on search link navigates to `/search`
3. Search input supports Enter to submit
4. Rail prev/next buttons are keyboard accessible (visible on focus)
5. Card links are navigable via Tab
6. Watchlist toggle is a native `<button>` with `aria-pressed`
7. Pagination buttons are keyboard accessible with focus ring
8. Search mode toggle uses arrow keys via `role="radiogroup"`

## 📱 Responsive Design

| Breakpoint | Behavior |
| --- | --- |
| 360–639px | Single-column, compact header, horizontal rails |
| 640–1023px | 3-4 column grid, wider gutters |
| 1024px+ | Centered max-width, 5-6 column grid, full nav |

- No horizontal page overflow at any width
- Rails scroll horizontally within their region
- 44×44px minimum touch target for icon controls
- Pagination labels hidden on mobile (`hidden sm:inline`)

## 🎨 Design Tokens

| Token | Value |
| --- | --- |
| Background | `#0f0a1a` (deep navy) |
| Surface | `#1a1428` |
| Accent | `#a855f7` (electric violet) |
| Text primary | `#f0eef5` |
| Text secondary | `#a09ab0` |

## 🧪 Testing

139 tests across 7 test files:

| File | Tests | Coverage |
| --- | --- | --- |
| `schemas.test.ts` | 17 | Zod validation: list/search/detail/domain schemas, edge cases |
| `mappers.test.ts` | 29 | Media type inference, date extraction, movie/TV mapping, null handling |
| `images.test.ts` | 15 | All 4 image slots, null paths, alt text, unicode titles |
| `storage.test.ts` | 26 | localStorage CRUD, dedupe, cap 100, corrupted data, unavailable storage |
| `MediaCard.test.ts` | 21 | Rendering, poster/fallback, links, watchlist toggle, accessibility |
| `MediaRail.test.ts` | 17 | Loading skeletons, error+retry, empty, scroll buttons, semantics |
| `client.integration.test.ts` | 14 | All TMDB endpoints, search with pagination, detail 404, partial failure isolation (MSW) |

## 🚢 Deployment

### Netlify Setup

1. Connect repository to Netlify
2. Set environment variables:
   - `TMDB_ACCESS_TOKEN` (Production + Preview, **server-only**)
   - `TMDB_BASE_URL` = `https://api.themoviedb.org`
   - `VITE_TMDB_LANGUAGE` = `id-ID`
   - `VITE_TMDB_REGION` = `ID`
3. Deploy

### Deployment Checklist

- [x] `npm run lint` passes (0 warnings, 0 errors)
- [x] `npm run typecheck` passes
- [x] `npm run test` passes (139/139)
- [x] `npm run build` passes
- [x] No committed tokens; `.env` in `.gitignore`
- [x] Direct navigation to `/search?q=...`, `/movie/:id`, `/tv/:id`, `/watchlist` works
- [x] All 9 rails load independently with error isolation
- [x] Hero, cards, skeleton states visually verified
- [x] Keyboard navigation verified
- [x] Search pagination (paged + infinite scroll) works
- [x] Pagination mode toggle persists to localStorage
- [x] All UI text in English

## 📄 License

This project is for educational and assessment purposes.

---

Repository: [github.com/wicaksana94/cinemaz](https://github.com/wicaksana94/cinemaz)

Built with ❤️ using Vue 3, Vite, and TMDB API
