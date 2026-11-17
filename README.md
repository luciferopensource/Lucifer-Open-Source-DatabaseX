# Lucifer Database X — Replica

A same-to-same rebuild of **Lucifer Database X**: the same four routes, the same verified scan
datasets and the same numbers — with an entirely new interface, light and dark themes, and no
animation beyond the cursor.

Source project (read-only): `../Lucifer Database X`. Nothing in this folder is imported from it at
runtime; the data modules were copied verbatim and everything visual was written from scratch.

---

## What is different from the original

| Original | This replica |
|---|---|
| Obsidian-and-gold glass UI, 30+ `backdrop-filter` panels | Flat neutral surfaces, hairline rules, one blue accent |
| Fixed 1600 × 880 WebGL hero inside an iframe | Editorial split hero: copy on the left, live snapshot card on the right |
| Three.js moss root, pollen, liquid-metal shader buttons | None — a static composition, no canvas, no `three` |
| Snow canvas, drifting pumpkins, cursor stardust | Nothing seasonal |
| Horizontal top navigation with badge tabs | Left sidebar workspace (two-row pills on mobile) |
| Gold cursor dot, ring and stardust trail | Accent dot, inertial ring and a seven-dot trail — the **only** motion |
| Dark only | Light and dark, six accent palettes and three typefaces, all persisted per device |

Layout, typography, spacing, component shapes, navigation and colour system are all new. Every
figure, table row and section order matches the source.

---

## Routes

| Hash | Page |
|---|---|
| `#/` | Overview — hero, system snapshot, archive registry, catalogue state |
| `#total-database` | Aggregate report: channel analysis, resolution, storage, extension ledger |
| `#stream-backup-1` | Channel 1 report |
| `#stream-backup-2` | Channel 2 report |

Hash routing, no router dependency. `📺`-style emoji from the original are gone.

---

## Commands

```bash
npm install
npm run dev       # Vite dev server
npm run build     # tsc --noEmit && vite build → dist/
npm run preview   # serve the production build
```

Last verified build: `tsc --noEmit` clean, 46 modules, CSS 31.4 kB (6.4 kB gzip),
JS 347.7 kB (94.6 kB gzip — the two datasets dominate it), zero console errors on all four routes.

---

## Structure

```
src/
├── App.tsx                     # shell, hash route switch, theme + unit providers
├── main.tsx
├── components/
│   ├── Shell.tsx               # sidebar, top bar, footer
│   ├── Cursor.tsx              # the only animation: dot, ring, trail
│   ├── Settings.tsx            # appearance drawer: mode, accent, typeface
│   ├── Reports.tsx             # scan strip, category matrix, contributions,
│   │                           # resolution, storage, extension ledger
│   ├── Icons.tsx               # hand-drawn SVG set, no icon dependency
│   └── ui.tsx                  # pill, KPI, panel, tabs, bar, section head
├── pages/
│   ├── Home.tsx
│   ├── TotalDatabase.tsx
│   └── Backup.tsx              # shared by both backups
├── lib/
│   ├── router.ts               # hash route hook
│   ├── theme.ts                # appearance state + palette metadata
│   └── view.ts                 # dataset → view rows, duration arithmetic
├── data/                       # copied verbatim from the source project
│   ├── channelIntelligenceData.ts
│   ├── channelIntelligenceDataBackup2.ts
│   ├── archiveRegistry.ts
│   ├── archiveSchemas.ts
│   ├── aggregateDatabase.ts
│   ├── storageUnitContext.tsx
│   └── catalog.ts              # empty by design
│   ├── styles/                     # tokens, base, shell, pages, reports, cursor, settings
└── types/media.ts

functions/api/                  # six read-only Pages Functions, copied verbatim
public/                         # _headers, _routes.json, favicon
```

---

## Data and honesty rules

* All telemetry comes from the two audit reports in the source project's `docs/reports/`. No figure
  was retyped or rounded by hand: `aggregateDatabase.ts` and the two dataset files are byte-identical
  copies, and the pages render whatever they derive.
* `CATALOG_ENTRIES` is empty. The catalogue panel renders an explicit empty state; nothing is seeded
  to look complete.
* The data-integrity matrix is computed from the aggregate, not hard-coded to "verified".
* Scan duration on the Total Database page is added from the two channel durations (`2h 52m 25s` +
  `2h 43m 48s` = `5h 36m 13s`) rather than pasted in.
* TypeScript is strict; there is no `any` in the application code.

---

## Appearance settings

Open **Appearance** in the sidebar footer (gear icon). The drawer holds three independent
preferences; all of them apply instantly and are stored in `localStorage`.

| Setting | Options | Notes |
|---|---|---|
| Mode | Light, Dark | Defaults to the operating-system preference |
| Colour | Original blue, Emerald, Violet, Amber, Rose, Graphite | Original blue is the default; every palette is defined separately for light and dark so contrast holds in both |
| Typeface | Grotesk, Editorial, Technical, Sora, Manrope, Playfair, Fraunces, Syne, Instrument | Display face only — body copy stays on Inter and numbers on JetBrains Mono, so tables never reflow |
| Glass | On / Off, blur 5–100 % in 5 % steps | iOS-style backdrop blur on every card, panel, bar and control; off by default |

Persistence keys: `lx-theme`, `lx-accent`, `lx-font`, `lx-glass`, `lx-glass-pct`. The boot script in
`index.html` applies all five before the first paint, so there is no flash. **Reset to original**
returns to the system mode, blue accent, Grotesk type and glass off.

Adding a palette means adding one CSS block per mode in `src/styles/tokens.css`, one entry in
`ACCENTS` (`src/lib/theme.ts`) and that is all — no component touches colour directly.

### Liquid glass

`src/styles/glass.css` is the whole feature. It is scoped to `:root[data-glass='on']`, so with glass
off not a single `backdrop-filter` is declared. Strength maps linearly to pixels:

```
--glass-blur: calc(var(--glass-pct) * 0.24px)   /* 5 % → 1.2 px, 40 % → 9.6 px, 100 % → 24 px */
```

One blur per container: `backdrop-filter` is applied to the panel, KPI row, scan strip, archive
card, sidebar, top bar, footer and the settings drawer. Nested controls (chips, buttons, table
headers, inner strips) only receive a tint — stacking backdrop filters is expensive and looks
muddy. Panels that blur also get a top sheen (`--glass-sheen`) and a 1 px inner highlight
(`--glass-edge`) so the surface reads as glass rather than a faded rectangle.

The backdrop itself is a themed SVG mesh — `public/backgrounds/mesh-dark.svg` and
`mesh-light.svg` — pinned behind the app as `body::before`, with an accent-tinted radial on top.
The mesh contains soft bokeh circles on purpose: without defined light shapes there is nothing for
the blur to diffuse and the effect looks flat. Preferences in `localStorage` are read by the boot
script (`lx-glass`, `lx-glass-pct`), so the chosen frost survives a reload without a flash.

## Motion policy

There is exactly one `requestAnimationFrame` loop in the whole project: the cursor layer. No CSS
transitions, no `@keyframes`, no canvas, no smooth scrolling, no hover animation. Theme changes and
hovers are instant by design. The cursor layer is disabled on coarse pointers.

`backdrop-filter` appears in exactly one file — `src/styles/glass.css` — and only while liquid
glass is switched on. It is a static property, not an animation.

---

## Deployment

Cloudflare Pages compatible: `wrangler.jsonc` declares assets only (`./dist`, SPA fallback) and the
`functions/api/` handlers deploy alongside the build. No database binding, no secrets.

---

## Notes

* The source project is never modified by this repository; treat it as read-only provenance.
* The 490-row extension ledger is data, not markup: filtering, sorting and pagination all run over
  the derived records, so the table can never show a row that is absent from the datasets.

## Routing and links

Pages live on real paths, not fragments:

| Path | Page |
|---|---|
| `/` | Overview |
| `/total-database` | Aggregate report |
| `/compare` | Channel head to head |
| `/search` | Index-wide search across extensions, categories and pages |
| `/sources` | Provenance, method, converter, glossary |

## Sharing and output

* **Copy view link** on every report head and in the extension ledger — the query string travels with it.
* **Download PDF** opens the print dialog, where the browser saves the report as a PDF with the print stylesheet.
* **Share** uses the native sheet on mobile and falls back to copying the address.
* **Embed mode** — `?embed=1` drops the sidebar, top bar and footer so a report can live in an iframe.
* **Social cards** — the build writes `dist/og/<route>.svg` and injects per-route `og:image` / `twitter:image`
  tags. SVG keeps the build dependency-free; add a rasteriser if a target network insists on PNG.

## Quality gates

```
npm test          # 23 Vitest + Testing Library checks (aggregate maths, URL state, router, insight, accent maths, copy)
npm run test:e2e  # Playwright smoke: routes, retired URLs, theme persistence, palette, sidebar, embed
npm run lighthouse  # Lighthouse CI budget from lighthouserc.json
```

The GitHub Actions workflow runs build (with `tsc --noEmit`), unit tests and the Chromium smoke suite, then
deploys `dist` to Cloudflare Pages when the Cloudflare secrets are configured.

## Retired pages

Backup 01 / Backup 02 report pages were retired pending the next channel drop. Their routes now return an
honest 404 (`NotFound`), the telemetry on the home page and Total Database stays live, and the archived
`src/data` modules are untouched so the new pages can be wired in without re-importing anything.

* Tab, filter, sort, page and view state live in the query string:
  `/stream-backup-1/extensions?q=mkv&page=2&sort=storage&view=chart`. Every view is shareable and
  survives a reload.
* Every **page-to-page** link is a `PageLink` and opens in a new tab (`target="_blank"`,
  `rel="noopener noreferrer"`). In-page controls — tabs, filters, pagination, sort — stay in the
  current tab.
* Old `#/route` fragments are rewritten to their path on boot, so older bookmarks still work.
* `history.replaceState` is used for filter writes (no back-stack flooding); `navigateTo` pushes a
  real history entry for palette navigation.

## New surfaces

* **Command palette** — `⌘K` / `Ctrl K` or the sidebar search field. Indexes pages, every report tab
  and the 200 largest extensions; arrow keys, Enter, Esc. No animation.
* **Compare** — storage, file, message, average, largest-file and extension counts side by side,
  plus category and resolution splits. The leader in each row is derived, ties stay neutral.
* **Extension ledger** — sortable columns, category chips, search, 25-per-page pagination, a Top 20
  bar view, and CSV/JSON export of exactly the filtered rows (client-side Blob download).
* **Sources & method** — the two audit reports (HTTPS links to the copied `.txt` files), derivation
  rules, a unit converter built on the reports' parser, and the full glossary.
* **Glossary dialog** — footer trigger, searchable, same `GLOSSARY` data as the Sources page.
* **Shortcuts sheet** — press `?` or use the footer link.

## Accessibility

* `prefers-reduced-motion: reduce` stops the cursor layer entirely — no rAF loop is created.
* `prefers-reduced-transparency: reduce` and `forced-colors: active` force glass off (opaque
  surfaces, no `backdrop-filter`).
* Dialogs (settings, palette, glossary, shortcuts) trap focus, restore it on close, and close on
  `Esc`. `?` is ignored while typing in a field.
* Copy buttons on channel and scan IDs announce `Copied` through `aria-live`.
* Print stylesheet: shell, glass and interactive chrome are removed; tables unclip, headers repeat,
  and only the open report tab prints.

## Build pipeline

```bash
npm run build     # tsc --noEmit && vite build
                  # postbuild: node scripts/prerender.mjs
```

* **Code splitting** — `react` and the two datasets get their own chunks; each page is a lazy chunk
  loaded on demand (`React.lazy` + `Suspense`).
* **Prerendered route shells** — `scripts/prerender.mjs` writes `dist/<route>.html` **and**
  `dist/<route>/index.html` with the right title, description, canonical, Open Graph tags, a
  `Dataset` JSON-LD block and a `<noscript>` summary containing the verified totals. The numbers come
  from `dist/route-meta.json`, emitted from the live datasets by the `route-meta` Vite plugin — never
  typed into the script.
* **Self-hosted fonts** — eighteen latin woff2 files in `public/fonts`, generated by
  `node scripts/fetch-fonts.mjs`; only the six default files load, the rest arrive when selected. No runtime request leaves the origin. Newsreader only downloads
  when the Editorial typeface is selected.
* **PWA** — `manifest.webmanifest` + `sw.js`: navigation is network-first with a cached shell
  fallback, assets cache-first, so the reports open offline after the first visit.

## Appearance additions

| Setting | Options |
|---|---|
| Density | Comfortable, Compact |
| Text size | Small, Default, Large (scales the root font size) |
| Background | Mesh (default), Glow, Grid, Plain — the layer behind the glass |
| Sidebar | Shown / Hidden — also toggled from the top bar; hidden only applies above 1080 px |
| Sidebar | Shown / Compact / Hidden — compact keeps icons only; hidden only applies above 1080 px |
| Corner radius | Sharp / Default / Soft — swaps the `--r-*` scale |
| Custom accent | Any hex; light and dark variants are derived, with an automated `--on-accent` |
| Glass presets | Soft 20%, Medium 45%, Strong 75% above the free slider |
| Uploaded wallpaper | PNG/JPEG/WebP up to 2 MB, stored in IndexedDB (not localStorage) |
