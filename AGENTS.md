# AGENTS.md — Lucifer Database X Replica

## 1. What this project is

A rebuild of `../Lucifer Database X` with the same four routes and the same verified scan datasets,
but a completely different interface. React 19, TypeScript 5.7 strict, Vite 6, hash routing, no
visual dependencies beyond React.

## 2. Hard boundary

* `../Lucifer Database X` is **read-only provenance**. Never edit, format, build or commit inside it
  from this project. Copy from it if a dataset is missing; do not "fix" it.
* This folder owns its own `src/data/` copies. Keep them byte-identical to the source datasets: they
  are the audit record, not application styling. If the source dataset is intentionally refreshed,
  copy it wholesale rather than hand-editing rows.

## 3. Design language

* Neutral surfaces, hairline borders, one blue accent, generous spacing. No gradients, no glass, no
  glows, no icon dependency beyond the hand-drawn set in `src/components/Icons.tsx`.
* Two modes only: `data-theme="dark"` and `data-theme="light"` on `<html>`, resolved before first
  paint by the boot script in `index.html`, persisted as `lx-theme`.
* Accent palettes live on `data-accent` (`blue` default, plus `emerald`, `violet`, `amber`, `rose`,
  `graphite`) and display faces on `data-font` (`grotesk` default, `editorial`, `technical`),
  persisted as `lx-accent` and `lx-font`. The drawer is `src/components/Settings.tsx`.
* Every palette needs a **light and a dark block** in `src/styles/tokens.css` with AA-contrast
  values, and an `ACCENTS` entry in `src/lib/theme.ts`. Never colour a component directly — use
  `var(--accent)` and friends.
* Typefaces change the display font only. Body copy and numbers stay on Inter and JetBrains Mono so
  tables never reflow or overlap.
* Typography: Space Grotesk (display), Inter (body), JetBrains Mono (numbers, IDs, labels).
* Never reintroduce the source's gold-and-obsidian palette, glass panels or emoji navigation tabs.

## 4. Motion policy

The cursor layer (`src/components/Cursor.tsx`) is the **only** animation. Do not add CSS
transitions, `@keyframes`, `smooth` scrolling, canvas or WebGL. Theme and hover states must change
instantly.

`backdrop-filter` is allowed in exactly one place — `src/styles/glass.css`, scoped to
`:root[data-glass='on']` — because liquid glass is a user-facing setting. Never add it to a
component directly, and never apply a second blur to a control nested inside a glass panel: tint
only, or the effect turns muddy and the compositor budget dies.

## 5. Data honesty invariants

* Zero fabricated records. `CATALOG_ENTRIES` stays empty until a verified query populates it, and the
  empty state must render as empty.
* Both archives are currently `isPublic: false` in `src/data/archiveRegistry.ts`: the datasets stay in the
  file, but the channels are hidden from every surface until their replacement pages exist. Never delete the
  datasets to hide a channel — flip `isPublic`. An empty registry must still render every page without errors
  (it is covered by unit and smoke tests).
* Every displayed figure must come from `src/data/` derivation. No hard-coded totals; scan duration
  is summed from the two channel durations, not pasted.
* The integrity matrix is computed from the aggregate. Never hard-code it to verified.

## 6. Verification

* `npm run build` (`tsc --noEmit && vite build`) must pass with no TypeScript errors.
* Verify visually in a browser at 390, 768, 1024 and 1440 px in both themes; a passing build does not
  prove rendering.
* Check that the sidebar collapses to the two-row pill navigation below 1080 px and that no page
  produces horizontal body overflow.
* Sweep all six accents in both modes and all three typefaces before shipping a UI change: body
  `scrollWidth` must equal `clientWidth`, and long mono strings must wrap inside their own cell.
* Liquid glass has to be checked at both extremes (5 % and 100 %) in both modes, with the settings
  drawer open and closed, and the result must stay readable — a blurred backdrop that swallows the
  table text is a bug, not a style.

## 7. Git

Local repository on branch `main`. Commit only finished, verified work. `.gitignore` keeps
`node_modules/`, `dist/` and `.vite/` out of history.

## Routing and links (added 2026-11-17)

* Pages are real paths served by the SPA fallback: `/`, `/total-database`, `/compare`, `/search`, `/sources`.
  Anything else renders `NotFound`. Never reintroduce `#/` routing; legacy fragments are migrated once
  in `src/lib/url.ts`.
* The Backup 01 / Backup 02 report pages are retired pending new channel pages. Their datasets and
  registry entries remain in `src/data/` on purpose — do not delete them, and do not re-add the routes
  until the replacement pages exist.
* Every page-to-page link uses `PageLink` so it opens in a new tab. In-page controls stay buttons.
* New filters or tabs must be addressable through the query string (`replacePath`) — if a view cannot
  be linked, it is not finished.
* Adding a route means updating **four** places: `Route` in `src/lib/router.ts`, `NAV` and
  `PAGE_TITLES` in `Shell.tsx`, the switch in `App.tsx`, and `ROUTES` in `scripts/prerender.mjs`.
* The sidebar preference (`lx-sidebar`, `data-sidebar`) is desktop-only on purpose: below 1080 px the
  sidebar is the horizontal nav and must stay visible.
* Appearance also carries `data-radius` (`lx-radius`) and custom accent tokens written inline on `<html>`
  from `lx-accent-hex`. Uploaded wallpapers live in IndexedDB (`lx-appearance` / `wallpaper`), never in
  localStorage — the 5 MB budget is shared with every other preference.

## Build scripts

* `npm run build` runs `postbuild` → `scripts/prerender.mjs`, which needs `dist/route-meta.json`
  (emitted by the `route-meta` Vite plugin from the datasets). Never hand-write those numbers.
* Fonts are self-hosted (`public/fonts` + `src/styles/fonts.css`). Run
  `node scripts/fetch-fonts.mjs` only when the family/weight list changes; it touches the network,
  the normal build never does.
* The service worker (`public/sw.js`) is cache-first for assets and network-first for navigation.
  Bump `CACHE_VERSION` whenever the shell changes materially.

## Accessibility rules

* `prefers-reduced-motion` disables the cursor layer; `prefers-reduced-transparency` and
  `forced-colors` disable glass. Test all three before shipping.
* Dialogs use `useFocusTrap`; Esc must close, and focus must return to the trigger.
* `?` opens shortcuts — ignore it while an input, textarea, select or contenteditable has focus.
* Print styles are part of the contract: run a print preview on a report page after layout changes.
* `?embed=1` removes the shell for iframes; keep it free of chrome and test it after shell changes.
* Unit tests live beside the code as `*.test.ts(x)` (`npm test`); the Playwright smoke suite lives in `e2e/`.
  Run both before shipping anything that touches routing, data derivation or appearance.
