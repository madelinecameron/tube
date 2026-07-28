# Tube

A deliberately small YouTube front end. A search box, four endless stations, and a
player. No feed, no recommendations, no sidebar, nothing to fall into.

Not affiliated with, sponsored by, or endorsed by YouTube or Google.

The whole client is **~10 KB gzipped**, runtime included.

```
dist/assets/index.js   24.13 kB │ gzip: 9.74 kB
dist/assets/style.css   3.05 kB │ gzip: 1.12 kB
```

## Running it

```sh
npm install
cp .env.example .env      # then put a YouTube Data API v3 key in it
npm run dev               # vite on :3005, api on :3003
```

`npm run preview` builds and serves the real thing on :3003.

You need a [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com)
key. Restrict it to the YouTube Data API, and use a key dedicated to this app.
Search costs 100 quota units per query against a 10,000/day default, so roughly
100 searches a day before you get throttled — hence the caching below.

Without a key the site still loads; search and stations return a readable error.

## How it fits together

| | |
|---|---|
| `src/` | Preact, written as ordinary React (`@preact/preset-vite` aliases `react` → `preact/compat`). Swap the plugin out and `npm i react react-dom` to use real React; nothing in `src/` changes. |
| `server/` | Express 5. Holds the API key, talks to YouTube, serves `dist/`. |
| `static/` | Copied verbatim into `dist/`. |
| `Dockerfile` | Three stages: build the client, resolve prod deps, assemble a runtime with neither toolchain in it. |
| `Caddyfile` | TLS, headers, reverse proxy. |

**Stations resolve at request time.** A station is a *query*, not an ID. The server
looks for a live stream matching it first — a live stream is endless by definition
and can never run out — and falls back to a playlist. No video or playlist IDs are
hardcoded anywhere, so nothing breaks when a channel restarts a stream.

**Caching** is in-memory only, 30 min for searches and 6 h for stations. There is no
database and nothing is written to disk, on purpose (see below).

## Terms of Service

v1 of this project was flagged. The most likely reason, and what changed:

- **The API was wide open.** `server/app.js` sent `Access-Control-Allow-Origin: *`
  on `/api/search`, which made this a free public YouTube search API sitting in
  front of a private key. The Developer Policies prohibit offering "an API service
  that allows users to access any data or functionality directly or indirectly
  provided by the YouTube API Services." **Now:** no CORS headers at all,
  same-origin only, plus a 30 req/min per-IP rate limit. There is a comment in
  `app.js` telling future-you not to add CORS back.
- **No attribution.** Results and playback now carry a "Powered by YouTube" link.
- **The privacy policy was a joke** (it literally said "so have fun ✌️"). It is now
  a real one linking the YouTube ToS and Google Privacy Policy, disclosing
  retention and stating there is no tracking.
- **Google Analytics ran on pages showing API data.** Removed entirely; the site
  now sets no cookies of its own and the player is loaded from
  `youtube-nocookie.com`.
- **Player integrity.** Nothing is drawn over the player, its controls are never
  covered, and it is never sized below the required 200×200. `modestbranding` is
  not used — it has been a no-op since Aug 2023, and stripping YouTube branding
  would be a violation anyway.
- **Retention.** Policies cap storage of API data at 30 days. Nothing here outlives
  6 hours or a process restart.

The one thing still worth your judgement: the policies require an API client to add
"significant independent value" rather than act as a substitute for YouTube. A
stripped-down YouTube is inherently close to that line. Keeping this personal and
low-traffic is the pragmatic mitigation — if you want it truly safe, run it on
localhost and don't expose it.

## Deploying

Docker Compose, two containers: the app, and Caddy in front of it for TLS.

```sh
cp .env.example .env      # set YOUTUBE_API_KEY, DOMAIN, ACME_EMAIL
chmod 600 .env
docker compose up -d --build
```

Updating is `git pull && docker compose up -d --build`. That is the whole deploy
process — no rsync, no supervisor, no certbot, no renewal cron. Caddy obtains and
renews certificates by itself, which removes the entire class of TLS breakage this
project used to have.

Point `DOMAIN`'s DNS at the box **before** first start, or the certificate request
fails. Ports 80 and 443 need to be open; nothing else does.

Some deliberate choices in `docker-compose.yml`:

- The app container uses `expose`, not `ports`. It is reachable only by Caddy on
  the internal network, never bound to a host interface. The API key lives in that
  process, so it must not be directly addressable.
- It runs `read_only` as an unprivileged user with `no-new-privileges`.
- `caddy_data` holds the certificates. Deleting that volume forces re-issuance
  from Let's Encrypt, which is rate limited — leave it alone.

### It is unlisted, not gated

Anyone with the URL can use it. `robots.txt` and an `X-Robots-Tag` header ask
crawlers not to index it, and `/api` is rate limited to 30 req/min per IP, but
neither of those is access control.

To actually put a password in front of it, uncomment the `basic_auth` block at the
bottom of the `Caddyfile`, generate a hash with
`docker compose run --rm caddy caddy hash-password`, and restart. That is the
single biggest thing you can do to keep this off Google's radar, since a gated
personal instance is not plausibly a public substitute for YouTube.

### Running without Docker

Still works: `npm ci && npm run build && npm start`, with `YOUTUBE_API_KEY` set and
something terminating TLS in front. The server binds `127.0.0.1` by default.
