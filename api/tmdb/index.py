"""
TMDB Serverless Gateway for cinemaZ (Vercel Python Runtime).

Proxies requests to the TMDB API with:
- Strict path allowlist
- Input validation
- Bearer authentication
- Error mapping to safe payloads
- Short cache headers
"""

import json
import os
import re
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

# ─── Configuration ────────────────────────────────────────────────────────────

TMDB_BASE_URL = os.environ.get("TMDB_BASE_URL", "https://api.themoviedb.org")
TMDB_TOKEN = os.environ.get("TMDB_ACCESS_TOKEN", "")
DEFAULT_LANGUAGE = "id-ID"
DEFAULT_REGION = "ID"
REQUEST_TIMEOUT = 8
MAX_RETRIES = 1

# Allowed path patterns (regex)
ALLOWED_PATHS = [
    r"^/3/movie/popular$",
    r"^/3/movie/now_playing$",
    r"^/3/movie/upcoming$",
    r"^/3/movie/top_rated$",
    r"^/3/tv/popular$",
    r"^/3/tv/top_rated$",
    r"^/3/tv/on_the_air$",
    r"^/3/tv/airing_today$",
    r"^/3/person/popular$",
    r"^/3/search/multi$",
    r"^/3/movie/\d+$",
    r"^/3/tv/\d+$",
]

ALLOWED_QUERY_PARAMS = {"language", "region", "page", "query", "include_adult"}


def is_allowed_path(path: str) -> bool:
    return any(re.match(pattern, path) for pattern in ALLOWED_PATHS)


def sanitize_params(query_params: dict) -> dict:
    sanitized = {}
    for key, value in query_params.items():
        if key not in ALLOWED_QUERY_PARAMS:
            continue
        val = value[0] if isinstance(value, list) else value
        if key == "page":
            try:
                sanitized[key] = str(max(1, min(int(val), 500)))
            except (ValueError, TypeError):
                sanitized[key] = "1"
        elif key == "query":
            trimmed = str(val).strip()[:100]
            if len(trimmed) >= 2:
                sanitized[key] = trimmed
        elif key == "include_adult":
            sanitized[key] = "false"
        elif key in ("language", "region"):
            sanitized[key] = str(val)
    return sanitized


def make_upstream_request(path: str, params: dict):
    qs_parts = [f"{k}={v}" for k, v in params.items()]
    qs = "&".join(qs_parts)
    url = f"{TMDB_BASE_URL}{path}" + (f"?{qs}" if qs else "")

    headers = {
        "Accept": "application/json",
        "Authorization": f"Bearer {TMDB_TOKEN}",
    }

    last_error = None
    for _ in range(1 + MAX_RETRIES):
        try:
            req = Request(url, headers=headers, method="GET")
            with urlopen(req, timeout=REQUEST_TIMEOUT) as response:
                return json.loads(response.read().decode("utf-8"))
        except HTTPError as e:
            if e.code in (400, 401, 403, 404):
                raise
            last_error = e
        except (URLError, TimeoutError, OSError) as e:
            last_error = e

    raise last_error


class TMDBGatewayHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query_params = parse_qs(parsed.query)

        if not is_allowed_path(path):
            self._send_error(404, "Endpoint not found")
            return

        if not TMDB_TOKEN:
            self._send_error(500, "Server configuration error")
            return

        params = sanitize_params(query_params)
        if "language" not in params:
            params["language"] = DEFAULT_LANGUAGE
        if "region" not in params:
            params["region"] = DEFAULT_REGION

        try:
            data = make_upstream_request(path, params)
            self._send_json(data, cache_ttl=300)
        except HTTPError as e:
            code = e.code
            if code == 404:
                self._send_error(404, "Title not available")
            elif code in (400, 401, 403):
                self._send_error(code, "Request denied")
            else:
                self._send_error(502, "Unable to load content")
        except Exception:
            self._send_error(502, "Unable to load content")

    def _send_json(self, data, cache_ttl=0):
        body = json.dumps(data).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        if cache_ttl > 0:
            self.send_header("Cache-Control", f"public, max-age={cache_ttl}, s-maxage={cache_ttl}")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _send_error(self, status, message):
        body = json.dumps({"error": message}).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        pass  # Suppress logging to avoid leaking request details


def handler(request, response):
    h = TMDBGatewayHandler.__new__(TMDBGatewayHandler)
    h.rfile = request.rfile
    h.wfile = response.wfile
    h.requestline = f"{request.method} {request.path} HTTP/1.1"
    h.request_version = "HTTP/1.1"
    h.headers = request.headers
    h.command = request.method
    h.path = request.path

    if request.method == "GET":
        h.do_GET()
