import { describe, it, expect } from 'vitest'
import { getImageUrl, getPosterAlt, getPlaceholderImage } from './images'

describe('getImageUrl', () => {
  it('builds correct URL for card slot', () => {
    const result = getImageUrl('/abc123.jpg', 'card')
    expect(result).toEqual({
      src: 'https://image.tmdb.org/t/p/w342/abc123.jpg',
      width: 342,
      height: 513,
    })
  })

  it('builds correct URL for hero slot', () => {
    const result = getImageUrl('/hero.jpg', 'hero')
    expect(result).toEqual({
      src: 'https://image.tmdb.org/t/p/w1280/hero.jpg',
      width: 1280,
      height: 720,
    })
  })

  it('builds correct URL for poster slot', () => {
    const result = getImageUrl('/poster.jpg', 'poster')
    expect(result).toEqual({
      src: 'https://image.tmdb.org/t/p/w342/poster.jpg',
      width: 342,
      height: 513,
    })
  })

  it('builds correct URL for backdrop slot', () => {
    const result = getImageUrl('/backdrop.jpg', 'backdrop')
    expect(result).toEqual({
      src: 'https://image.tmdb.org/t/p/w780/backdrop.jpg',
      width: 780,
      height: 439,
    })
  })

  it('returns null for null path', () => {
    expect(getImageUrl(null)).toBeNull()
  })

  it('returns null for undefined path', () => {
    expect(getImageUrl(undefined)).toBeNull()
  })

  it('defaults to card slot', () => {
    const result = getImageUrl('/test.jpg')
    expect(result?.src).toContain('w342')
    expect(result?.width).toBe(342)
    expect(result?.height).toBe(513)
  })

  it('handles paths with leading slash', () => {
    const result = getImageUrl('/path/to/image.jpg', 'hero')
    expect(result?.src).toBe('https://image.tmdb.org/t/p/w1280/path/to/image.jpg')
  })

  it('preserves exact path', () => {
    const result = getImageUrl('/abc123_def456.jpg', 'card')
    expect(result?.src).toContain('/abc123_def456.jpg')
  })
})

describe('getPosterAlt', () => {
  it('returns correct alt text', () => {
    expect(getPosterAlt('Avatar')).toBe('Poster Avatar')
  })

  it('handles special characters', () => {
    expect(getPosterAlt('Spider-Man: No Way Home')).toBe('Poster Spider-Man: No Way Home')
  })

  it('handles empty title', () => {
    expect(getPosterAlt('')).toBe('Poster ')
  })

  it('handles unicode title', () => {
    expect(getPosterAlt('名探偵コナン')).toBe('Poster 名探偵コナン')
  })
})

describe('getPlaceholderImage', () => {
  it('returns movie placeholder', () => {
    expect(getPlaceholderImage('movie')).toBe('/placeholder-movie.svg')
  })

  it('returns tv placeholder', () => {
    expect(getPlaceholderImage('tv')).toBe('/placeholder-tv.svg')
  })
})
