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
| Typeface | Grotesk, Editorial, Technical | Display face only — body copy stays on Inter and numbers on JetBrains Mono, so tables never reflow |
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
