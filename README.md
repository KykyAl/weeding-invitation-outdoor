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

The invitation loads its data from [`wedding-api/`](wedding-api/README.md)
(Express + PostgreSQL). Start it first (`npm run dev` inside `wedding-api/`),
then open e.g. `/wedding/example-wedding?to=Andi`.

- `VITE_API_PROXY_TARGET`: the dev server proxies `/api` to it (`http://localhost:8080`).
- `VITE_API_BASE_URL`: the API origin in production (empty = same origin).
- `VITE_USE_SAMPLE_DATA=true`: dev only; uses the local sample in `src/data/`
  instead of the backend, e.g. `/wedding/sample-wedding`.

**Link previews (WhatsApp):** serve the build through `wedding-api`
(`FRONTEND_DIST=../dist`) so `/wedding/:slug` gets per-invitation Open Graph tags.
`public/og-image.jpg` is the generic preview image, composed from the hall
illustration. See [wedding-api/README.md](wedding-api/README.md#link-previews-whatsapp).

How the frontend maps backend fields, handles errors and retries is described
in [docs/API.md](docs/API.md).

## Deploy

One command builds, migrates and (re)starts everything as a systemd user service:
`./deploy/deploy.sh`. Operations, admin, backups and moving to a VPS with a domain
and HTTPS are covered in [deploy/README.md](deploy/README.md).

## Structure

```
src/
  components/cinematic/  stage, WebGL canvas (lazy), camera rig, CSS fallback, SceneSection
  components/wedding/    CinematicWeddingScene (reusable for any wedding), InvitationCover
  components/ui/         InviteButton, MusicToggle, StatusScreen
  scenes/                one folder per scene + timeline.ts (scroll → camera keyframes)
  hooks/                 useWedding, useRsvp, useCinematicDirector, useSceneTimeline, ...
  services/              httpClient, weddingApi, rsvpApi, normalize (backend → Wedding)
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

## Performance

- **Two renderers, one composition.** The hall is drawn with WebGL (three.js +
  sparkles) only on devices with hardware-accelerated WebGL, at least 4 GB RAM and
  4 cores, and with Data Saver and reduced motion off. Everyone else gets the
  CSS/DOM renderer, which shows the same layers with the same camera maths.
  Append `?renderer=css` or `?renderer=webgl` to the URL to force one when
  testing on a device.
- **Nothing heavy before the cover.** three.js (about 240 kB gzip) and the GPU probe
  load only after "Buka Undangan", when the browser is idle. Until then the
  CSS hall is shown.
- **Progressive layers.** Only the opening veil is painted at first. The other
  hall layers are added one per idle slot (CSS renderer) or uploaded as textures
  one per frame (WebGL), so SVG rasterisation never blocks the page.
- **On-demand frames.** The WebGL canvas renders every tick while the camera
  moves and at 30 fps while idle. DPR is capped at 1.75.
- **Fonts.** Only the weights in use are loaded, and they don't block the first paint.

Measured with mobile Lighthouse (production build, simulated slow 4G + 4× CPU):

| | Score | TBT | Main thread |
|---|---|---|---|
| Before | 38–46 | 4.1–7.7 s | 9.6–16.8 s |
| After | 78–81 | 0.28–0.33 s | 1.3–1.6 s |

## Accessibility

Checked with axe-core (WCAG 2.2 AA) on the cover, every scene, the lightbox and
the RSVP form with errors: 0 violations. Also tested with the keyboard and the
browser's accessibility tree.

- **Content stays accessible while animating.** Scene and shot animations only
  change `opacity`, never `visibility`, so screen readers can read every story
  chapter and event, not just the one on screen. When focus lands on faded
  content (via keyboard or screen reader), the page scrolls to that scene, shot
  or gallery photo.
- **Keyboard flow.** "Buka Undangan" is focused on load. After opening, focus
  moves to the opening title. The tab order is: skip link "Langsung ke
  Konfirmasi Kehadiran" → map → photos → RSVP form. The lightbox is a native
  modal `<dialog>` (focus trap, Esc) and returns focus to the photo that opened it.
- **Visible focus.** A 2px cocoa ring (8.8:1). Form fields use a 2px cocoa underline.
- **Contrast.** Small text uses `cocoa-soft #6b5949` (≥ 4.5:1). Large gold text
  uses `gold-deep #8c6d3a` (≥ 3:1). The lighter gold is used only for lines and
  ornaments.
- **Semantics.** Each scene is a labelled region with a heading hierarchy, and
  dates are `<time>`. Decorative art is `aria-hidden`. The music toggle is
  `aria-pressed`. Form errors are linked with `aria-describedby`. The RSVP
  confirmation is a `role="status"`.
- **Reduced motion.** `prefers-reduced-motion` gives a shallow camera, no
  parallax, sway or sparkles, quick fades, the CSS renderer and instant (not
  smooth) focus scrolling.

## Roadmap

1. ✅ Setup & architecture
2. ✅ Opening + illustrated indoor hall (layered 2.5D planes, camera, parallax)
3. ✅ Couple (illustrated bride & groom, hijab / skin tone from data), Story, Event
4. ✅ Venue (illustrated ballroom / photo + map), Gallery (layered filmstrip + lightbox), RSVP
5. ✅ Backend integration with `wedding-api` (validated payloads, retries, offline recovery)
6. ✅ Performance (adaptive renderer, deferred WebGL, progressive layers)
7. ✅ Accessibility (WCAG 2.2 AA audit, keyboard, screen readers)
8. ✅ Final polish (cinematic closing, event map fallback, photo placeholders, no white flash)
