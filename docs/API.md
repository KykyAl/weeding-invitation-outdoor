# Wedding Invitation API contract

The frontend is a static single-page app. It needs two endpoints. All fields
are camelCase, all responses are JSON wrapped in a `data` envelope, and all
dates are ISO-8601 strings **with an offset** (e.g. `2026-12-12T08:00:00+07:00`).

Base path: `/api/v1`. The frontend calls it relative to `VITE_API_BASE_URL`
(empty = same origin). If the API is on another origin, allow CORS for the
invitation domain (`GET`, `POST`, header `Content-Type`).

---

## `GET /api/v1/weddings/:slug`

Returns one invitation. `404` when the slug does not exist.

```json
{
  "data": {
    "slug": "nadia-arga",
    "groom": {
      "fullName": "Arga Pratama Wijaya",
      "nickname": "Arga",
      "childOrder": "Putra pertama dari",
      "father": "Bapak Wijaya",
      "mother": "Ibu Ratna",
      "instagram": "argapratama",
      "photo": { "url": "https://cdn.example.com/arga.webp", "alt": "Arga" },
      "appearance": { "skinTone": "medium" }
    },
    "bride": {
      "fullName": "Nadia Kusuma Putri",
      "nickname": "Nadia",
      "childOrder": "Putri kedua dari",
      "father": "Bapak Kusuma",
      "mother": "Ibu Sari",
      "appearance": { "hijab": true, "skinTone": "medium" }
    },
    "date": "2026-12-12T08:00:00+07:00",
    "timeZone": "Asia/Jakarta",
    "nameOrder": "groom-first",
    "venue": {
      "name": "Gedung Serbaguna",
      "address": "Jl. Contoh No. 1, Bandung",
      "mapUrl": "https://maps.google.com/?q=-6.9,107.6",
      "coordinates": { "lat": -6.9, "lng": 107.6 },
      "image": { "url": "https://cdn.example.com/venue.webp", "alt": "Gedung Serbaguna" }
    },
    "quote": { "text": "Dan di antara tanda-tanda kebesaran-Nya…", "source": "QS. Ar-Rum: 21" },
    "story": [
      {
        "id": "s1",
        "period": "2019",
        "title": "Awal Bertemu",
        "description": "…",
        "image": { "url": "https://cdn.example.com/2019.webp", "alt": "Pertemuan pertama" }
      }
    ],
    "events": [
      {
        "id": "akad",
        "type": "akad",
        "title": "Akad Nikah",
        "startAt": "2026-12-12T08:00:00+07:00",
        "endAt": "2026-12-12T10:00:00+07:00",
        "timeZone": "Asia/Jakarta",
        "timeZoneLabel": "WIB",
        "venue": { "name": "Masjid Contoh", "address": "…", "mapUrl": "https://maps.google.com/?q=…" }
      }
    ],
    "gallery": [
      {
        "url": "https://cdn.example.com/g1.webp",
        "thumbnailUrl": "https://cdn.example.com/g1-800.webp",
        "alt": "Prewedding di taman",
        "caption": "Bandung, 2025",
        "width": 1600,
        "height": 2000
      }
    ],
    "music": { "url": "https://cdn.example.com/song.mp3", "title": "…", "artist": "…", "autoplay": true, "loop": true, "volume": 0.6 },
    "rsvp": { "enabled": true, "maxGuests": 4, "deadline": "2026-12-05T23:59:00+07:00" }
  }
}
```

### Required vs optional

| Field | Required | Notes |
|---|---|---|
| `groom.fullName` or `groom.nickname` | yes | Missing nickname → first word of `fullName`. |
| `bride.fullName` or `bride.nickname` | yes | Same as groom. |
| `date` | yes* | *Falls back to the earliest `events[].startAt`. |
| `venue.name` | yes* | *Falls back to the first event's venue. |
| everything else | no | `null` and missing are both fine. Lists default to `[]`. |

The frontend drops invalid list items instead of failing, but the rest of the
invitation still renders:
- an event without a valid `startAt`, or without a venue when there is no main venue either;
- a story chapter with neither `title` nor `period`;
- a gallery item without `url`.

If a required field is missing, the page shows "Data undangan belum lengkap".

### Enumerations

- `events[].type`: `akad` | `reception` | `other`. When `title` is missing, the frontend uses Akad Nikah, Resepsi or Acara.
- `appearance.skinTone`: `light` | `medium` | `tan` | `deep`. This only affects the illustrated couple.
- `appearance.hijab` (bride): boolean.
- `nameOrder`: `groom-first` (default) | `bride-first`.

### Images & music

- Serve images as **WebP**.
- Include `width`/`height` so the layout does not jump while images load.
- Provide a `thumbnailUrl` of about 800px for the gallery. The full `url` is only loaded in the lightbox.
- Music starts only after the guest taps "Buka Undangan", and only when `autoplay` is true. The guest can always toggle it.

---

## `POST /api/v1/weddings/:slug/rsvp`

Request:

```json
{ "name": "Andi Pratama", "attendance": "attending", "guestCount": 2, "message": "Selamat menempuh hidup baru!" }
```

- `attendance`: `attending` | `not_attending`.
- `guestCount`: from 1 to `rsvp.maxGuests` when attending, and always `0` when not attending.
- `message`: optional, at most 500 characters.

Success: `201` (or `200`). The frontend shows `name` in the thank-you message, and falls back to what it sent for any missing field.

```json
{ "data": { "id": "r_123", "name": "Andi Pratama", "attendance": "attending", "guestCount": 2, "message": "…", "createdAt": "2026-10-01T09:30:00+07:00" } }
```

Validation error: `422`. Field messages appear under the matching input, so write them in Indonesian.

```json
{ "message": "Data tidak valid.", "errors": { "name": ["Nama wajib diisi."] } }
```

Other errors: return any non-2xx status with an optional `message`. The frontend
never retries a POST automatically, to avoid duplicate RSVPs. Deduplicating by
`name` per wedding on the backend is recommended.

---

## Error & retry behaviour (frontend)

| Situation | Frontend behaviour |
|---|---|
| `404` on GET | Shows "Undangan tidak ditemukan". |
| Network error, timeout (15 s), `408`, `429`, `5xx` on GET | Retries twice with backoff (0.7 s, 1.4 s). Then shows an error screen with "Coba Lagi". When the device was offline, it retries automatically once it is back online. |
| Response without a `data` envelope | Shows "Respons server tidak valid". |
