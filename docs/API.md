# Frontend ↔ wedding-api

The invitation talks to [`wedding-api`](../wedding-api/README.md). That README
is the source of truth for endpoints, request/response examples and error
codes. This page only covers how the frontend reads those responses.

| Frontend call | Backend endpoint |
|---|---|
| Load invitation (`services/weddingApi.ts`) | `GET /api/v1/weddings/:slug` |
| Submit RSVP (`services/rsvpApi.ts`) | `POST /api/v1/weddings/:slug/rsvp` |

In development, Vite proxies `/api` to `VITE_API_PROXY_TARGET`
(`http://localhost:8080`). In production, set `VITE_API_BASE_URL` to the API
origin, or leave it empty when the API is served on the same domain. The API's
`CORS_ORIGIN` must include the invitation domain.

## Field mapping (`src/services/normalize.ts`)

| wedding-api | Frontend `Wedding` | Notes |
|---|---|---|
| `groom.name` / `groom.fullName` | `groom.nickname` / `groom.fullName` | same for `bride` |
| `groom.appearance.skinTone`, `bride.appearance.{hijab, skinTone}` | same | illustrated couple; default no hijab, `langsat` |
| `weddingDate` (`YYYY-MM-DD`) | `date` | read as local noon so no time zone shifts the day |
| `quote.text` / `quote.source` | `quote` | `null` → no quote |
| `venue.mapsUrl` | `venue.mapUrl` | |
| `events[].date` + `startTime` / `endTime` | `events[].startAt` / `endAt` | wall-clock time; sorted by start |
| `events[].type` / `title` | `type` / `title` | missing title → Akad Nikah / Resepsi / Acara |
| `events[].venue: null` | the main venue | |
| `stories[].year` | `story[].period` | |
| `gallery[].imageUrl` / `caption` | `gallery[].url` / `caption` (also the alt text) | unreachable images leave an empty frame |
| `music.url` | `music.url` | plays only after "Buka Undangan" |
| `couplePhoto.url` | `couplePhoto.url` | transparent cut-out shown instead of the illustrated couple; illustration if it fails to load |

Invalid items are dropped instead of breaking the page:
- an event without a date;
- a story with neither year nor title;
- a photo without a URL.

If a name or the date is missing, the page shows "Data undangan belum lengkap".

**Optional extras** that wedding-api does not send yet are accepted if they are
added later, and default sensibly otherwise:
- `timeZone`;
- `nameOrder`;
- `rsvp.{enabled, maxGuests, deadline}`: default enabled, 5 guests, no deadline;
- `venue.image`;
- `gallery[].width/height/thumbnailUrl`.

## RSVP

The form sends:

```json
{ "guestName": "Andi", "attendance": "attending", "guestCount": 2, "message": "…" }
```

- `guestCount` is only sent when attending, so the backend default of 1 applies otherwise.
- `message` is omitted when empty.
- A `422` response's `error.details.guestName` (and the other fields) is shown under the matching input.
- The guest's name in the thank-you message comes from `data.guestName` in the `201` response.

## Errors

The frontend reads `{ "error": { "code", "message", "details" } }`.

| Situation | Frontend behaviour |
|---|---|
| `404` | "Undangan tidak ditemukan" |
| Network error, timeout (15 s), `408`, `429` or `5xx` on GET | Retries twice (0.7 s, then 1.4 s), then shows an error screen with "Coba Lagi". Retries automatically when the device comes back online. |
| POST | Never retried automatically. |
