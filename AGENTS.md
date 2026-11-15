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
* Two themes only: `data-theme="dark"` and `data-theme="light"` on `<html>`, resolved before first
  paint by the boot script in `index.html`, persisted as `lx-theme`.
* Typography: Space Grotesk (display), Inter (body), JetBrains Mono (numbers, IDs, labels).
* Never reintroduce the source's gold-and-obsidian palette, glass panels or emoji navigation tabs.

## 4. Motion policy

The cursor layer (`src/components/Cursor.tsx`) is the **only** animation. Do not add CSS
transitions, `@keyframes`, `backdrop-filter`, `smooth` scrolling, canvas or WebGL. Theme and hover
states must change instantly.

## 5. Data honesty invariants

* Zero fabricated records. `CATALOG_ENTRIES` stays empty until a verified query populates it, and the
  empty state must render as empty.
* Every displayed figure must come from `src/data/` derivation. No hard-coded totals; scan duration
  is summed from the two channel durations, not pasted.
* The integrity matrix is computed from the aggregate. Never hard-code it to verified.

## 6. Verification

* `npm run build` (`tsc --noEmit && vite build`) must pass with no TypeScript errors.
* Verify visually in a browser at 390, 768, 1024 and 1440 px in both themes; a passing build does not
  prove rendering.
* Check that the sidebar collapses to the two-row pill navigation below 1080 px and that no page
  produces horizontal body overflow.

## 7. Git

Local repository on branch `main`. Commit only finished, verified work. `.gitignore` keeps
`node_modules/`, `dist/` and `.vite/` out of history.
