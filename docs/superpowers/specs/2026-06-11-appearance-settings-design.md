# Appearance Settings + Minimal Style

Date: 2026-06-11
Status: Approved (design review with Mike)
Branch: `feat/appearance-settings`

## Goal

Add a site-wide appearance settings popover (gear icon) that lets readers
customize how the wiki looks, and a new **Minimal** style: a neutral,
distraction-free grayscale theme modeled on the reference Fumadocs site at
`Reference/site` (stock shadcn neutral palette, no brand decoration). All
preferences persist in localStorage and apply before first paint.

## Settings model

One popover, four settings:

| Setting | Values                                            | Mechanism                                | Persistence              |
| ------- | ------------------------------------------------- | ---------------------------------------- | ------------------------ |
| Mode    | light / dark / system                              | next-themes via Fumadocs RootProvider    | next-themes built-in     |
| Style   | divine (default) / minimal                         | `minimal` class on `<html>`              | `divine-style` key       |
| Font    | inter (default) / geist / lora / atkinson / system | `data-font="..."` attribute on `<html>`  | `divine-font` key        |
| Width   | wide (default) / centered                          | `centered-reading` class on `<html>`     | `divine-reading-width`   |

Style and Mode compose freely: Divine dark, Divine light, Minimal dark,
Minimal light are all valid combinations.

## Components

### `src/components/appearance-settings.tsx` (new, client)

- Gear button that opens a popover (shadcn popover primitives from
  `src/components/ui/`).
- Four rows: Mode (3-way segmented), Style (2-way segmented), Font (5-option
  radio list, each label rendered in its own typeface), Width (2-way
  segmented).
- Mode row calls `useTheme()` from next-themes. The other rows toggle the
  html class/attribute and write localStorage, following the exact pattern of
  the current `reading-width-toggle.tsx` (post-hydration sync from the html
  element, try/catch around storage).
- Labels come from `messages/en.json` under new `settings.*` keys; other
  locales fall back to English via the existing `getMessages` fallback.

### Removed / replaced

- `src/components/reading-width-toggle.tsx` is deleted; its logic moves into
  the settings popover.
- Fumadocs' built-in ThemeToggle is disabled in the docs layout
  (`themeSwitch: { enabled: false }`); the popover's Mode row replaces it.

### Placement

- Docs: sidebar footer (where the reading-width toggle is today).
- Home: nav bar (via `src/lib/layout.shared.tsx`), so settings are reachable
  site-wide.

## No-flash persistence

The inline pre-paint script in `src/app/[lang]/layout.tsx` (currently applying
the reading-width class) grows to also read `divine-style` and `divine-font`
and apply the `minimal` class / `data-font` attribute before first paint. One
script, no new dependency, same pattern next-themes uses.

## Minimal palette (CSS)

Two new token blocks in `src/app/global.css`, values copied from the
reference site's neutral shadcn palette
(`Reference/site/src/app/global.css`):

- `.minimal.light` — reference `:root` values (white bg, near-black text,
  gray borders).
- `.minimal.dark` — reference `.dark` values (near-black bg, off-white text).

Each block redefines three token groups so the swap reaches everything:

1. shadcn vars (`--background`, `--primary`, `--border`, ...)
2. Fumadocs vars (`--color-fd-*`)
3. Divine tokens (`--color-divine-*`) mapped to neutral grays — most wiki
   styling consumes these, so branding collapses automatically (code rails,
   blockquote rails, table tints, links, list markers).

Explicit neutralizing on top (small `.minimal` reset block):

- `divine-glow`, `divine-glow-hover`, `divine-card-hover` → flat/no shadow.
- `divine-gradient-text` → solid foreground color.
- Branded sidebar / search-dialog / TOC overrides: their selectors change
  from `.dark #nd-sidebar` (etc.) to `.dark:not(.minimal) #nd-sidebar`, so
  Minimal falls back to Fumadocs' stock neutral look — which is the
  reference site's look.
- Literal `#783cb5` hexes in `global.css` are converted to
  `var(--color-divine-primary)` first so the token swap reaches them.

## Fonts

- Three new Google fonts via `next/font/google` with `preload: false`:
  Geist, Lora, Atkinson Hyperlegible. With `preload: false` the @font-face
  CSS is emitted but the browser downloads a font only when the selected
  setting actually uses it — visitors who never touch the picker pay ~0.
- `html[data-font="..."]` CSS overrides the body/prose font family.
- In Minimal style, headings also follow the selected font (single-typeface,
  reference-like). In Divine style, headings keep Manrope/Poppins.
- "System" uses `system-ui` stack, no download.

## Out of scope / unchanged

- `/draft` editor stays forced Divine-dark. Its `.dark` subtree re-declares
  the Divine tokens locally, so html-level Minimal vars do not leak in.
- No changes to content, search, routing. No new npm dependencies.
- Crowdin translations for the new labels (locales are frozen; English
  fallback is fine).

## Verification

- `npm run lint`, `npm run types:check`, `npm run format:check`.
- Dev-server visual pass: all four Style × Mode combos, font switching, on
  the homepage and a docs page; confirm persistence across reload; confirm
  `/draft` still renders Divine dark.
