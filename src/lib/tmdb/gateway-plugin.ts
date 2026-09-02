/**
 * Vite plugin that acts as the TMDB dev gateway.
 * Intercepts /api/tmdb/* requests and proxies to TMDB API.
 * No separate server needed — runs inside Vite's dev server.
 */

import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'
import { type Plugin } from 'vite'

function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env')
    const envContent = fs.readFileSync(envPath, 'utf8')
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim()
      if (!process.env[key]) process.env[key] = val
    }
  } catch { /* .env optional */ }
}

// Note: middleware is mounted at '/api/tmdb', so req.url has the prefix stripped.
// e.g. client fetches /api/tmdb/3/search/multi → req.url = /3/search/multi
const ALLOWED = [
  /^\/3\/movie\/popular$/,
  /^\/3\/movie\/now_playing$/,
  /^\/3\/movie\/upcoming$/,
  /^\/3\/movie\/top_rated$/,
  /^\/3\/tv\/popular$/,
  /^\/3\/tv\/top_rated$/,
  /^\/3\/tv\/on_the_air$/,
  /^\/3\/tv\/airing_today$/,
  /^\/3\/person\/popular$/,
  /^\/3\/search\/multi$/,
  /^\/3\/movie\/\d+$/,
  /^\/3\/tv\/\d+$/,
]

const ALLOWED_PARAMS = new Set(['language', 'region', 'page', 'query', 'include_adult'])

function fetchUpstream(url: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 8000 }, (res) => {
      const chunks: Buffer[] = []
      res.on('data', (chunk: Buffer) => chunks.push(chunk))
      res.on('end', () =>
        resolve({ status: res.statusCode ?? 500, body: Buffer.concat(chunks).toString() }),
      )
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
  })
}

// Detect token format: 32-char hex = API key, else = bearer token
function isApiKey(token: string): boolean {
  return /^[a-f0-9]{32}$/i.test(token)
}

export function tmdbGatewayPlugin(): Plugin {
  loadEnv()

  const token = process.env.TMDB_ACCESS_TOKEN || ''
  const base = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org'
  const lang = process.env.VITE_TMDB_LANGUAGE || 'id-ID'
  const region = process.env.VITE_TMDB_REGION || 'ID'

  if (!token) {
    console.warn('  ⚠️  TMDB_ACCESS_TOKEN not found in .env — gateway will return 500')
  }

  return {
    name: 'tmdb-gateway',
    configureServer(server) {
      server.middlewares.use('/api/tmdb', async (req, res) => {
        const url = new URL(req.url || '/', `http://${req.headers.host}`)
        const path = url.pathname

        if (!ALLOWED.some((re) => re.test(path))) {
          res.writeHead(404, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Endpoint not found' }))
          return
        }

        if (!token) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'TMDB_ACCESS_TOKEN not set' }))
          return
        }

        // Sanitize params
        const params: Record<string, string> = {}
        for (const [key, val] of url.searchParams) {
          if (!ALLOWED_PARAMS.has(key)) continue
          if (key === 'page') params[key] = String(Math.max(1, Math.min(parseInt(val) || 1, 500)))
          else if (key === 'query') { const t = val.trim().slice(0, 100); if (t.length >= 2) params[key] = t }
          else if (key === 'include_adult') params[key] = 'false'
          else params[key] = val
        }
        if (!params.language) params.language = lang
        if (!params.region) params.region = region

        // Add auth: API key as query param or Bearer header
        const searchParams = new URLSearchParams(params)
        if (isApiKey(token)) {
          searchParams.set('api_key', token)
        }
        const qs = searchParams.toString()
        const upstreamUrl = `${base}${path}?${qs}`

        try {
          const { status, body } = await fetchUpstream(upstreamUrl)
          res.writeHead(status, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=300',
          })
          res.end(body)
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'unknown'
          console.error(`  [gateway] ${path} → ${msg}`)
          res.writeHead(502, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Unable to load content' }))
        }
      })
    },
  }
}
