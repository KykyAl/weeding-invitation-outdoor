# Cinematic Indoor Wedding Invitation

Data-driven, mobile-first digital wedding invitation (React + TypeScript + Vite,
Three.js / React Three Fiber / Drei, GSAP + ScrollTrigger, Tailwind CSS v4).

## Run

```bash
npm install
cp .env.example .env.development.local   # adjust as needed
npm run dev        # http://localhost:5173/wedding/<slug>?to=<GuestName>
npm run build
npm run lint
```

With `VITE_USE_SAMPLE_DATA=true` (dev only) the placeholder record in
`src/data/sampleWedding.ts` is used, e.g. `/wedding/sample-wedding?to=Andi`.
Otherwise data comes from the backend:

- `GET  /api/v1/weddings/:slug`       → `{ data: Wedding }`
- `POST /api/v1/weddings/:slug/rsvp`  → `{ data: RsvpResponse }`

`VITE_API_BASE_URL` sets the backend origin (empty = same origin);
`VITE_API_PROXY_TARGET` proxies `/api` in the dev server. To develop against a
real backend, set `VITE_USE_SAMPLE_DATA=false` in `.env.development.local`.

The full request/response contract (required fields, fallbacks, errors,
retries) is in [docs/API.md](docs/API.md). Payloads are validated and
normalised in `src/services/normalize.ts`.

## Structure

```
src/
  components/cinematic/  stage, WebGL canvas (lazy), camera rig, CSS fallback, SceneSection
  components/wedding/    CinematicWeddingScene (reusable for any wedding), InvitationCover
  components/ui/         InviteButton, MusicToggle, StatusScreen
  scenes/                one folder per scene + timeline.ts (scroll → camera keyframes)
  hooks/                 useWedding, useGuestName, useScrollProgress, useSceneReveal, ...
  services/              httpClient, weddingApi, rsvpApi
  types/                 Wedding / RSVP / API types
  data/                  dev-only sample data
  utils/                 routing, formatting, WebGL detection, GSAP setup
  pages/                 WeddingPage, NotFoundPage
```

## Cinematic system

- `src/components/cinematic/hall/art/` — original procedural SVG illustration
  (wall, arch backdrop, stage & sofa, pedestals, curtains, greenery, veil).
- `src/components/cinematic/hall/layout.ts` — depth of every layer; shared by the
  WebGL renderer (`HallWebGL`) and the CSS fallback (`HallFallback`).
- `src/scenes/timeline.ts` — camera keyframe per scene; `useCinematicDirector`
  measures the scenes and scrubs a GSAP timeline between them.

## Roadmap

1. ✅ Setup & architecture
2. ✅ Opening + illustrated indoor hall (layered 2.5D planes, camera, parallax)
3. ✅ Couple (illustrated bride & groom, hijab / skin tone from data), Story, Event
4. ✅ Venue (illustrated ballroom / photo + map), Gallery (layered filmstrip + lightbox), RSVP
5. ✅ Backend integration (validated payloads, retries, offline recovery, API contract)
6. Performance
7. Accessibility
8. Final polish
