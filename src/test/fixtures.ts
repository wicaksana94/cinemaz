import type { MediaSummary, MediaDetail, WatchlistItem } from '@/lib/tmdb/schemas'

// ─── TMDB Raw API Response Fixtures ──────────────────────────────────────────

export const tmdbMovieListResponse = {
  page: 1,
  results: [
    {
      id: 550,
      title: 'Fight Club',
      original_title: 'Fight Club',
      overview: 'An insomniac office worker and a devil-may-care soap maker...',
      poster_path: '/pB8BM7pdSp6B6Ih7QI4S2t0POoT.jpg',
      backdrop_path: '/hZkgoQYus5dXo3H8T7Uef6DNknx.jpg',
      vote_average: 8.4,
      release_date: '1999-10-15',
      media_type: 'movie',
      genre_ids: [18, 53],
      adult: false,
    },
    {
      id: 680,
      title: 'Pulp Fiction',
      original_title: 'Pulp Fiction',
      overview: 'The lives of two mob hitmen, a boxer...',
      poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
      backdrop_path: '/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
      vote_average: 8.5,
      release_date: '1994-10-14',
      media_type: 'movie',
      genre_ids: [80, 18],
      adult: false,
    },
    {
      id: 99999,
      title: 'No Poster Movie',
      original_title: 'No Poster Movie',
      overview: '',
      poster_path: null,
      backdrop_path: null,
      vote_average: 0,
      release_date: '',
      media_type: 'movie',
    },
  ],
  total_pages: 500,
  total_results: 10000,
}

export const tmdbTvListResponse = {
  page: 1,
  results: [
    {
      id: 1399,
      name: 'Game of Thrones',
      original_name: 'Game of Thrones',
      overview: 'Seven noble families fight for control...',
      poster_path: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
      backdrop_path: '/suopoADq0k8YZr4dQXcU6pToj6s.jpg',
      vote_average: 8.4,
      first_air_date: '2011-04-17',
      media_type: 'tv',
      genre_ids: [18, 10759, 10765],
    },
    {
      id: 82856,
      name: 'The Mandalorian',
      original_name: 'The Mandalorian',
      overview: 'The travels of a lone bounty hunter...',
      poster_path: '/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg',
      backdrop_path: '/o0s4XsEDfDlvit5pDRKjzXR4pp2.jpg',
      vote_average: 8.2,
      first_air_date: '2019-11-12',
      media_type: 'tv',
      genre_ids: [10765, 18, 10759],
    },
  ],
  total_pages: 100,
  total_results: 2000,
}

export const tmdbSearchResponse = {
  page: 1,
  results: [
    {
      id: 550,
      title: 'Fight Club',
      original_title: 'Fight Club',
      overview: 'An insomniac office worker...',
      poster_path: '/pB8BM7pdSp6B6Ih7QI4S2t0POoT.jpg',
      backdrop_path: null,
      vote_average: 8.4,
      release_date: '1999-10-15',
      media_type: 'movie',
    },
    {
      id: 1399,
      name: 'Game of Thrones',
      original_name: 'Game of Thrones',
      overview: 'Seven noble families...',
      poster_path: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
      backdrop_path: null,
      vote_average: 8.4,
      first_air_date: '2011-04-17',
      media_type: 'tv',
    },
    {
      id: 12345,
      name: 'Brad Pitt',
      known_for_department: 'Acting',
      media_type: 'person',
    },
  ],
  total_pages: 3,
  total_results: 20,
}

export const tmdbSearchPage2Response = {
  page: 2,
  results: [
    {
      id: 27205,
      title: 'Inception',
      original_title: 'Inception',
      overview: 'A thief who steals corporate secrets through dream-sharing technology...',
      poster_path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
      backdrop_path: null,
      vote_average: 8.8,
      release_date: '2010-07-16',
      media_type: 'movie',
    },
    {
      id: 1396,
      name: 'Breaking Bad',
      original_name: 'Breaking Bad',
      overview: 'A high school chemistry teacher turned meth producer...',
      poster_path: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
      backdrop_path: null,
      vote_average: 9.5,
      first_air_date: '2008-01-20',
      media_type: 'tv',
    },
  ],
  total_pages: 3,
  total_results: 20,
}

export const tmdbMovieDetailResponse = {
  id: 550,
  title: 'Fight Club',
  original_title: 'Fight Club',
  overview: 'A ticking-time-bomb insomniac and a slippery soap salesman...',
  poster_path: '/pB8BM7pdSp6B6Ih7QI4S2t0POoT.jpg',
  backdrop_path: '/hZkgoQYus5dXo3H8T7Uef6DNknx.jpg',
  vote_average: 8.4,
  release_date: '1999-10-15',
  media_type: 'movie',
  genres: [
    { id: 18, name: 'Drama' },
    { id: 53, name: 'Thriller' },
  ],
  runtime: 139,
  status: 'Released',
  tagline: 'Mischief. Mayhem. Soap.',
}

export const tmdbTvDetailResponse = {
  id: 1399,
  name: 'Game of Thrones',
  original_name: 'Game of Thrones',
  overview: 'Seven noble families fight for control...',
  poster_path: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
  backdrop_path: '/suopoADq0k8YZr4dQXcU6pToj6s.jpg',
  vote_average: 8.4,
  first_air_date: '2011-04-17',
  media_type: 'tv',
  genres: [
    { id: 18, name: 'Drama' },
    { id: 10759, name: 'Action & Adventure' },
    { id: 10765, name: 'Sci-Fi & Fantasy' },
  ],
  number_of_seasons: 8,
  number_of_episodes: 73,
  status: 'Ended',
  tagline: 'Winter Is Coming',
}

// ─── Domain Type Fixtures ────────────────────────────────────────────────────

export const mediaSummaryMovie: MediaSummary = {
  id: 550,
  mediaType: 'movie',
  title: 'Fight Club',
  originalTitle: 'Fight Club',
  overview: 'An insomniac office worker...',
  posterPath: '/pB8BM7pdSp6B6Ih7QI4S2t0POoT.jpg',
  backdropPath: '/hZkgoQYus5dXo3H8T7Uef6DNknx.jpg',
  rating: 8.4,
  date: '1999',
}

export const mediaSummaryTv: MediaSummary = {
  id: 1399,
  mediaType: 'tv',
  title: 'Game of Thrones',
  originalTitle: 'Game of Thrones',
  overview: 'Seven noble families...',
  posterPath: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
  backdropPath: '/suopoADq0k8YZr4dQXcU6pToj6s.jpg',
  rating: 8.4,
  date: '2011',
}

export const mediaDetailMovie: MediaDetail = {
  ...mediaSummaryMovie,
  genres: [{ id: 18, name: 'Drama' }, { id: 53, name: 'Thriller' }],
  runtimeMinutes: 139,
  tagline: 'Mischief. Mayhem. Soap.',
}

export const mediaSummaryNoPoster: MediaSummary = {
  id: 99999,
  mediaType: 'movie',
  title: 'No Poster Movie',
  overview: '',
  posterPath: null,
  backdropPath: null,
  rating: null,
  date: null,
}

export const watchlistFixture: WatchlistItem = {
  id: 550,
  mediaType: 'movie',
  title: 'Fight Club',
  posterPath: '/pB8BM7pdSp6B6Ih7QI4S2t0POoT.jpg',
  rating: 8.4,
  date: '1999',
  savedAt: '2024-01-15T10:00:00.000Z',
}
