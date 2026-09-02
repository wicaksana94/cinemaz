/**
 * Static file server with TMDB gateway for production-like local testing.
 * Serves dist/ and handles /api/tmdb/* gateway requests.
 *
 * Usage: TMDB_ACCESS_TOKEN=your_token node serve.mjs
 */

import http from 'node:http'
import https from 'node:https'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, 'dist')
const PORT = 3000

// Load .env
try {
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
} catch {}

const TOKEN = process.env.TMDB_ACCESS_TOKEN || ''
const BASE = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org'
const LANG = process.env.VITE_TMDB_LANGUAGE || 'id-ID'
const REGION = process.env.VITE_TMDB_REGION || 'ID'

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
}

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

function fetchUpstream(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 8000 }, (res) => {
      const chunks = []
      res.on('data', (c) => chunks.push(c))
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString() }))
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
  })
}

function isApiKey(token) {
  return /^[a-f0-9]{32}$/i.test(token)
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback
      fs.readFile(path.join(DIST, 'index.html'), (err2, html) => {
        if (err2) { res.writeHead(404); res.end('Not found'); return }
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(html)
      })
      return
    }
    const ext = path.extname(filePath)
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
    res.end(data)
  })
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)

  // Gateway
  if (url.pathname.startsWith('/api/tmdb')) {
    if (!ALLOWED.some((re) => re.test(url.pathname))) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      return res.end('{"error":"Not found"}')
    }
    if (!TOKEN) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      return res.end('{"error":"Token not set"}')
    }

    const params = {}
    for (const [k, v] of url.searchParams) {
      if (!ALLOWED_PARAMS.has(k)) continue
      if (k === 'page') params[k] = String(Math.max(1, Math.min(parseInt(v) || 1, 500)))
      else if (k === 'query') { const t = v.trim().slice(0, 100); if (t.length >= 2) params[k] = t }
      else if (k === 'include_adult') params[k] = 'false'
      else params[k] = v
    }
    if (!params.language) params.language = LANG
    if (!params.region) params.region = REGION

    const searchParams = new URLSearchParams(params)
    if (isApiKey(TOKEN)) searchParams.set('api_key', TOKEN)
    const qs = searchParams.toString()
    const upstream = url.pathname.replace('/api/tmdb', '')
    try {
      const { status, body } = await fetchUpstream(`${BASE}${upstream}?${qs}`)
      res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=300' })
      res.end(body)
    } catch (err) {
      console.error(`[gateway] ${url.pathname} → ${err.message}`)
      res.writeHead(502, { 'Content-Type': 'application/json' })
      res.end('{"error":"Unable to load content"}')
    }
    return
  }

  // Static files
  const filePath = path.join(DIST, url.pathname === '/' ? 'index.html' : url.pathname)
  serveFile(res, filePath)
})

server.listen(PORT, () => {
  console.log(`\n  🎬 cinemaZ running on http://localhost:${PORT}`)
  console.log(`  📡 TMDB gateway integrated`)
})
