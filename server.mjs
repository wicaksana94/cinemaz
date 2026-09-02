/**
 * Local dev gateway server for cinemaZ.
 *
 * Runs alongside Vite dev server on port 3000.
 * Proxies /api/tmdb/* requests to the real TMDB API.
 * Only used in development — Vercel uses api/tmdb/index.py instead.
 *
 * Usage:
 *   TMDB_ACCESS_TOKEN=your_token node server.mjs
 */

import http from 'node:http'
import https from 'node:https'
import fs from 'node:fs'

// Load .env file manually
try {
  const envContent = fs.readFileSync(new URL('.env', import.meta.url), 'utf8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
} catch { /* .env is optional */ }

const PORT = 3000
const TMDB_BASE = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org'
const TMDB_TOKEN = process.env.TMDB_ACCESS_TOKEN || ''
const DEFAULT_LANGUAGE = process.env.VITE_TMDB_LANGUAGE || 'id-ID'
const DEFAULT_REGION = process.env.VITE_TMDB_REGION || 'ID'
const TIMEOUT_MS = 8000

// Allowed path patterns
const ALLOWED = [
  /^\/api\/tmdb\/3\/movie\/popular$/,
  /^\/api\/tmdb\/3\/movie\/now_playing$/,
  /^\/api\/tmdb\/3\/movie\/upcoming$/,
  /^\/api\/tmdb\/3\/movie\/top_rated$/,
  /^\/api\/tmdb\/3\/tv\/popular$/,
  /^\/api\/tmdb\/3\/tv\/top_rated$/,
  /^\/api\/tmdb\/3\/tv\/on_the_air$/,
  /^\/api\/tmdb\/3\/tv\/airing_today$/,
  /^\/api\/tmdb\/3\/person\/popular$/,
  /^\/api\/tmdb\/3\/search\/multi$/,
  /^\/api\/tmdb\/3\/movie\/\d+$/,
  /^\/api\/tmdb\/3\/tv\/\d+$/,
]

const ALLOWED_PARAMS = new Set(['language', 'region', 'page', 'query', 'include_adult'])

function isAllowed(path) {
  return ALLOWED.some((re) => re.test(path))
}

function sanitizeParams(searchParams) {
  const out = {}
  for (const [key, val] of searchParams) {
    if (!ALLOWED_PARAMS.has(key)) continue
    if (key === 'page') {
      out[key] = String(Math.max(1, Math.min(parseInt(val) || 1, 500)))
    } else if (key === 'query') {
      const trimmed = val.trim().slice(0, 100)
      if (trimmed.length >= 2) out[key] = trimmed
    } else if (key === 'include_adult') {
      out[key] = 'false'
    } else {
      out[key] = val
    }
  }
  return out
}

function fetchUpstream(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http
    const req = mod.get(url, { timeout: TIMEOUT_MS }, (res) => {
      const chunks = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => {
        resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString() })
      })
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
  })
}

function isApiKey(token) {
  return /^[a-f0-9]{32}$/i.test(token)
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const path = url.pathname

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    })
    res.end()
    return
  }

  if (req.method !== 'GET' || !isAllowed(path)) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not found' }))
    return
  }

  if (!TMDB_TOKEN) {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'TMDB_ACCESS_TOKEN not set in .env' }))
    return
  }

  const params = sanitizeParams(url.searchParams)
  if (!params.language) params.language = DEFAULT_LANGUAGE
  if (!params.region) params.region = DEFAULT_REGION

  const searchParams = new URLSearchParams(params)
  if (isApiKey(TMDB_TOKEN)) searchParams.set('api_key', TMDB_TOKEN)
  const qs = searchParams.toString()
  const upstreamPath = path.replace('/api/tmdb', '')
  const upstreamUrl = `${TMDB_BASE}${upstreamPath}?${qs}`

  try {
    const { status, body } = await fetchUpstream(upstreamUrl)
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300',
    })
    res.end(body)
  } catch (err) {
    console.error(`[gateway] ${path} → ${err.message}`)
    res.writeHead(502, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Unable to load content' }))
  }
})

server.listen(PORT, () => {
  console.log(`\n  🎬 cinemaZ dev gateway running on http://localhost:${PORT}`)
  console.log(`  📡 Proxying to ${TMDB_BASE}`)
  if (!TMDB_TOKEN) {
    console.log(`  ⚠️  TMDB_ACCESS_TOKEN not set! Add it to .env\n`)
  } else {
    console.log(`  ✅ Token loaded (${TMDB_TOKEN.slice(0, 8)}...)\n`)
  }
})
