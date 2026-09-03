const TMDB_BASE = "https://api.themoviedb.org";
const DEFAULT_LANG = "id-ID";
const DEFAULT_REGION = "ID";

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
];

const PARAMS = new Set(["language", "region", "page", "query", "include_adult"]);

function isApiKey(token) {
  return /^[a-f0-9]{32}$/i.test(token);
}

export default async (request, context) => {
  const url = new URL(request.url);
  const apiPath = url.pathname.replace("/api/tmdb", "");

  if (!ALLOWED.some((re) => re.test(apiPath))) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const token = Deno.env.get("TMDB_ACCESS_TOKEN");
  if (!token) {
    return new Response(JSON.stringify({ error: "Token not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const params = new URLSearchParams({ language: DEFAULT_LANG, region: DEFAULT_REGION });
  for (const [k, v] of url.searchParams) {
    if (!PARAMS.has(k)) continue;
    if (k === "page") {
      const n = parseInt(v) || 1;
      params.set(k, String(Math.max(1, Math.min(n, 500))));
    } else if (k === "query") {
      const t = v.trim().slice(0, 100);
      if (t.length >= 2) params.set(k, t);
    } else if (k === "include_adult") {
      params.set(k, "false");
    } else {
      params.set(k, v);
    }
  }

  if (isApiKey(token)) {
    params.set("api_key", token);
  }

  const upstream = `${TMDB_BASE}${apiPath}?${params.toString()}`;

  const headers = { Accept: "application/json" };
  if (!isApiKey(token)) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const resp = await fetch(upstream, { headers });
    const data = await resp.json();

    return new Response(JSON.stringify(data), {
      status: resp.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300, s-maxage=300",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Unable to load content" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = { path: "/api/tmdb/*" };
