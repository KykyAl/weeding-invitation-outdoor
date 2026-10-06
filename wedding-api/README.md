# wedding-api

REST API for the Premium Cinematic Indoor Wedding Invitation. It supports many
weddings: one row per wedding, each with its own events, story, gallery and RSVPs.

Express 5 + TypeScript (strict) + PostgreSQL via `pg` with plain, parameterized SQL.
There is no ORM.

```
React frontend ──REST──▶ Express (this app) ──pg.Pool──▶ PostgreSQL
```

## 1. Requirements

- Node.js 20+ (developed on Node 24) and npm
- PostgreSQL 13+ (`gen_random_uuid()` is built in from 13; developed on 18)

## 2. Installation

```bash
npm install
cp .env.example .env   # then edit the values
```

## 3. Environment variables

| Variable | Example | Notes |
|---|---|---|
| `NODE_ENV` | `development` | `development` \| `test` \| `production` |
| `PORT` | `8080` | |
| `DATABASE_URL` | `postgresql://wedding:secret@localhost:5432/wedding` | required |
| `JWT_SECRET` | output of `openssl rand -hex 32` | required; must be at least 32 characters in production |
| `JWT_EXPIRES_IN` | `7d` | token lifetime (`12h`, `7d`, …) |
| `CORS_ORIGIN` | `http://localhost:5173` | comma-separated frontend origins; nothing is hardcoded |
| `TRUST_PROXY` | `0` | set to `1` behind one reverse proxy so rate limits see real IPs |
| `FRONTEND_DIST` | `../dist` | optional; serve the built frontend + link previews (see below) |
| `TEST_DATABASE_URL` | `postgresql://wedding:secret@localhost:5432/wedding_test` | only for `npm test` |
| `SEED_ADMIN_PASSWORD` | | optional; admin password for `npm run seed` (default `admin12345`, dev only) |

The server refuses to start when a required variable is missing. `.env` is git-ignored.

## 4. PostgreSQL setup

```bash
sudo -u postgres psql -c "CREATE ROLE wedding WITH LOGIN PASSWORD 'change-me';"
sudo -u postgres createdb -O wedding wedding
sudo -u postgres createdb -O wedding wedding_test   # for npm test
```

Then set `DATABASE_URL` (and `TEST_DATABASE_URL`) in `.env`.

## 5. Migration

```bash
npm run migrate
```

This runs `migrations/*.sql` in filename order (`001_…` → `006_…`). Each file runs
in its own transaction, and applied files are recorded in `schema_migrations`, so
re-running only applies new files. To add a change, create `007_something.sql`.

## 6. Seed

```bash
npm run seed
```

This creates the placeholder wedding `example-wedding` (Mempelai Pria & Mempelai
Wanita at Gedung Pernikahan, with 2 events, 4 stories and 3 gallery URLs) and the
admin user `admin` / `admin12345`. It is safe to re-run: the example wedding is
recreated, including its RSVPs. An existing admin is left untouched, so a changed
password is never reset; use `npm run create-admin` to change it. In production,
seeding requires `SEED_ADMIN_PASSWORD`.

## 7. Run development

```bash
npm run dev          # tsx watch → http://localhost:8080
npm test             # Vitest + supertest against TEST_DATABASE_URL (resets that database)
npm run typecheck
```

## 8. Build production

```bash
npm run build        # tsc → dist/
npm start            # node dist/server.js
```

`npm run migrate` and `npm run seed` use `tsx`, a dev dependency, so run them where
dev dependencies are installed, or apply the SQL files with `psql -f`.

## 9. API endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | – | process is up |
| GET | `/ready` | – | database reachable (`503` if not) |
| GET | `/wedding/:slug` | – | invitation page with link-preview tags (only with `FRONTEND_DIST`) |
| GET | `/api/v1/weddings/:slug` | – | **everything the invitation page needs** |
| POST | `/api/v1/weddings/:slug/rsvp` | – | submit RSVP (rate limited: 10 / 15 min / IP) |
| POST | `/api/v1/auth/login` | – | admin login → JWT (rate limited: 10 / 15 min / IP) |
| GET | `/api/v1/admin/weddings` | Bearer | list weddings with RSVP counts |
| POST | `/api/v1/admin/weddings` | Bearer | create wedding |
| GET | `/api/v1/admin/weddings/:id` | Bearer | wedding + events/stories/gallery + RSVPs |
| PUT | `/api/v1/admin/weddings/:id` | Bearer | replace wedding fields |
| DELETE | `/api/v1/admin/weddings/:id` | Bearer | delete (cascades to children and RSVPs) |
| POST | `/api/v1/admin/weddings/:id/events` | Bearer | add event |
| PUT / DELETE | `/api/v1/admin/events/:eventId` | Bearer | update / delete event |
| POST | `/api/v1/admin/weddings/:id/stories` | Bearer | add story |
| PUT / DELETE | `/api/v1/admin/stories/:storyId` | Bearer | update / delete story |
| POST | `/api/v1/admin/weddings/:id/gallery` | Bearer | add photo (URL only) |
| PUT / DELETE | `/api/v1/admin/gallery/:galleryId` | Bearer | update / delete photo |

**Illustrated couple.** On weddings, `brideHijab` (boolean, default `false`),
`groomSkinTone` and `brideSkinTone` set how the couple is drawn. Skin tones are
`light` | `langsat` (kuning langsat, the default) | `medium` | `tan` | `deep`.

**Couple photo.** `couplePhotoUrl` (optional, http(s)) is a cut-out photo of
the couple: a transparent PNG/WebP with the background removed, full body, feet
at the bottom edge. When it is set, the invitation shows the photo on the stage
instead of the illustration, sized to its proportions. If the photo is hosted
on another domain, that host must allow CORS for the WebGL renderer, otherwise
the CSS renderer is used. The public API returns it as `couplePhoto: { url }`.

`PUT` replaces the whole record: send every field you want to keep, and omitted
optional fields become `null`. URLs must be `http(s)`. Dates use `YYYY-MM-DD`
and times use `HH:MM`.

### Link previews (WhatsApp)

Crawlers from WhatsApp, Telegram and Facebook don't run JavaScript. When
`FRONTEND_DIST` points at the built frontend, this server also serves the app,
and `GET /wedding/:slug` gets Open Graph tags filled in on the server:

| Tag | Value |
|---|---|
| `og:title` | `Pernikahan {groom.name} & {bride.name}` |
| `og:description` | `Kepada Yth. {to} · {tanggal} · {venue}` (the guest part only when `?to=` is present) |
| `og:image` | the first gallery photo that is **JPEG/PNG** (WebP is unreliable in WhatsApp), otherwise the illustrated `og-image.jpg` (1200×630, ~100 kB) |

- All values are HTML-escaped.
- An unknown slug returns `404` with the app, which shows its own "not found" screen.
- Files in `assets/` are cached for a year (they are fingerprinted), and the page itself uses `no-cache`.

One server then serves both the API and the invitation. If the frontend is
hosted elsewhere instead, route `/wedding/*` to this server through your proxy,
or previews will show only the generic title.

**Guest personalization** (`/wedding/:slug?to=Andi`) is handled entirely in the
frontend. The backend never sees or stores `to`.

### Errors

Every error has the same shape, and stack traces are never sent to the client:

```json
{ "error": { "code": "WEDDING_NOT_FOUND", "message": "Wedding tidak ditemukan" } }
```

Validation errors (`422`) include per-field messages:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Data tidak valid",
             "details": { "guestName": ["Nama minimal 2 karakter"] } } }
```

| Status | Codes |
|---|---|
| 400 | `INVALID_JSON` |
| 401 | `UNAUTHORIZED`, `INVALID_TOKEN`, `TOKEN_EXPIRED`, `INVALID_CREDENTIALS` |
| 404 | `NOT_FOUND`, `WEDDING_NOT_FOUND`, `EVENT_NOT_FOUND`, `STORY_NOT_FOUND`, `GALLERY_NOT_FOUND` |
| 409 | `SLUG_TAKEN` |
| 422 | `VALIDATION_ERROR` |
| 429 | `TOO_MANY_REQUESTS` |
| 500 | `INTERNAL_ERROR` |
| 503 | `DATABASE_UNAVAILABLE` (from `/ready`) |

## 10. Example request / response

### Get an invitation

```bash
curl http://localhost:8080/api/v1/weddings/example-wedding
```

```json
{
  "data": {
    "id": "07b43587-…",
    "slug": "example-wedding",
    "groom": { "name": "Mempelai Pria", "fullName": "Nama Lengkap Mempelai Pria", "appearance": { "skinTone": "langsat" } },
    "bride": { "name": "Mempelai Wanita", "fullName": "Nama Lengkap Mempelai Wanita", "appearance": { "hijab": true, "skinTone": "langsat" } },
    "weddingDate": "2026-11-11",
    "quote": { "text": "Dan di antara tanda-tanda kebesaran-Nya…", "source": "QS. Ar-Rum: 21" },
    "venue": { "name": "Gedung Pernikahan", "address": "Jl. Contoh No. 1, Kota Contoh", "mapsUrl": "https://maps.google.com/?q=Gedung+Pernikahan" },
    "events": [
      { "id": "…", "type": "akad", "title": "Akad Nikah", "date": "2026-11-11", "startTime": "08:00", "endTime": "10:00",
        "venue": { "name": "Gedung Pernikahan", "address": "Jl. Contoh No. 1, Kota Contoh" }, "sortOrder": 1 }
    ],
    "stories": [ { "id": "…", "year": 2019, "title": "Awal Bertemu", "description": "…", "sortOrder": 1 } ],
    "gallery": [ { "id": "…", "imageUrl": "https://cdn.example.com/example-wedding/photo-1.webp", "caption": "Foto contoh 1", "sortOrder": 1 } ],
    "music": null
  }
}
```

`quote` and `music` are `null` when they are not set. An event's `venue` is `null`
when it has none; the frontend then uses the main venue.

### Submit an RSVP

```bash
curl -X POST http://localhost:8080/api/v1/weddings/example-wedding/rsvp \
  -H 'Content-Type: application/json' \
  -d '{"guestName":"Andi","attendance":"attending","guestCount":2,"message":"Selamat menempuh hidup baru"}'
```

```json
{ "message": "RSVP berhasil", "data": { "id": "…", "guestName": "Andi", "attendance": "attending", "guestCount": 2, "message": "Selamat menempuh hidup baru", "createdAt": "…" } }
```

Rules:
- `guestName`: 2–150 characters.
- `attendance`: `attending` or `not_attending`.
- `guestCount`: an integer from 1 to 10; defaults to 1.
- `message`: optional, at most 1000 characters.

### Admin

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' -d '{"username":"admin","password":"admin12345"}' | jq -r .data.token)

curl -X POST http://localhost:8080/api/v1/admin/weddings \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"slug":"nadia-arga","groomName":"Arga","brideName":"Nadia","weddingDate":"2027-01-20","venueName":"Gedung Serbaguna"}'
```

## Project structure

```
src/
  config/env.ts            validated environment
  db/pool.ts               the single pg.Pool
  middleware/              auth (JWT), errorHandler (AppError + one error format), notFound
  controllers/             wedding (public + admin CRUD), rsvp, auth, page (link previews)
  routes/                  public, auth, admin
  schemas/                 Zod schemas + validate()
  types/wedding.ts         DB rows and API shapes
  app.ts / server.ts       Express app / HTTP server with graceful shutdown
migrations/                001–008 SQL files
scripts/                   migrate.ts, seed.ts
tests/                     Vitest + supertest
```
