# Add Game Segment to Docs Tree — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reshape the content tree from `content/docs/{lang}/{category}/...` to `content/docs/{lang}/{game}/{category}/...` so the wiki can host more than one game without per-game deploys. League of Legends is the only game today; the `lol/` segment goes in now while content is small (~40 pages) and Crowdin has no translations to fight.

**Architecture:**

- Keep locale at the top level so Fumadocs' `dir` i18n parser and `crowdin.yml` glob stay untouched.
- Add `lol/` as a single nested folder under each locale and move all nine categories into it.
- Use Fumadocs' `"root": true` flag on `content/docs/en/lol/meta.json` so the sidebar inside `/docs/lol/**` shows just LoL categories — same UX as today.
- Root `content/docs/en/index.mdx` becomes a thin "Pick a game" landing (one card for LoL) so `/docs` stays routable and ready for a second game.
- Cloudflare `_redirects` adds 9 category-level forwards so external links to old paths (`/en/docs/maya/...`) keep working.

**Tech Stack:** Next.js 16 (App Router), Fumadocs 16.2.3 (mdx + core + ui), Tailwind v4, Crowdin (source dir glob), Cloudflare Pages edge `_redirects`.

---

## File Structure (target)

```
content/docs/en/
├── meta.json                    # NEW SHAPE — root meta listing games
├── index.mdx                    # NEW thin "Pick a game" landing (LoL card)
└── lol/                         # NEW folder — all League content lives under this
    ├── meta.json                # MOVED from en/meta.json + "root": true added
    ├── index.mdx                # MOVED from en/index.mdx, links rewritten
    ├── guided-walkthrough/      # MOVED unchanged
    ├── tools/                   # MOVED unchanged
    ├── maya/                    # MOVED unchanged
    ├── blender/                 # MOVED unchanged
    ├── animations/              # MOVED unchanged
    ├── vfx-bins/                # MOVED unchanged
    ├── assets-library/          # MOVED unchanged
    ├── errors/                  # MOVED unchanged
    └── contributing/            # MOVED unchanged (revisit when game #2 lands)
```

Files modified outside `content/`:

- `messages/en.json` — add `meta.lol.title` key
- `src/app/[lang]/(home)/page.tsx` — three `/${lang}/docs/<cat>` href updates
- `src/lib/layout.shared.tsx` — one contribute href update
- `public/_redirects` — nine new category-level forwards + two contribute updates

Files NOT touched (deliberate):

- `src/lib/source.ts`, `src/lib/i18n.ts`, `source.config.ts` — Fumadocs walks the tree from `baseUrl: "/docs"` so adding a `lol/` folder is picked up automatically.
- `src/lib/tree-localization.ts` — already handles arbitrary depth.
- `src/app/api/og/docs/[lang]/[[...slug]]/route.tsx` — slug array passes through `source.getPage(slug, lang)`, depth-agnostic.
- `crowdin.yml` — source glob `content/docs/en/**/*.mdx` already matches nested paths; `preserve_hierarchy: true` mirrors the new structure.
- Locale folders (`content/docs/fr-FR/**`, etc.) — none exist yet; Crowdin will produce them with the new shape on next sync.

---

## Setup

### Task 0: Create a feature branch

**Files:** none (git only)

- [ ] **Step 1: Create branch off main**

```bash
git checkout -b chore/docs-game-segment
```

- [ ] **Step 2: Confirm clean working tree for files this plan touches**

Run:

```bash
git status --short content/docs messages public src
```

Expected: no `M`/`A`/`D` lines for `content/docs/**`, `messages/en.json`, `public/_redirects`, `src/app/[lang]/(home)/page.tsx`, `src/lib/layout.shared.tsx`. (Other unrelated dirty files in the repo — `.claude/agents/*`, `src/app/global.css`, screenshot PNGs — are fine to leave alone.)

If any of the target files are dirty, stop and ask the user how to handle them before proceeding.

---

## Task 1: Add the `meta.lol.title` translation key

**Files:**

- Modify: `messages/en.json`

- [ ] **Step 1: Add the new key under `meta`**

Edit `messages/en.json`. Inside the `"meta"` object, add a `"lol"` entry. The whole `meta` block should read:

```json
"meta": {
  "guided-walkthrough": {
    "title": "Quick Start"
  },
  "tools": {
    "title": "Tools"
  },
  "maya": {
    "title": "Maya"
  },
  "blender": {
    "title": "Blender"
  },
  "contributing": {
    "title": "Contributing"
  },
  "animations": {
    "title": "Animations"
  },
  "vfx-bins": {
    "title": "VFX & bins"
  },
  "assets-library": {
    "title": "Assets library"
  },
  "errors": {
    "title": "Errors & fixes"
  },
  "lol": {
    "title": "League of Legends"
  }
}
```

- [ ] **Step 2: Verify JSON parses**

Run:

```bash
node -e "console.log(Object.keys(require('./messages/en.json').meta))"
```

Expected output includes `lol`:

```
[ 'guided-walkthrough', 'tools', 'maya', 'blender', 'contributing', 'animations', 'vfx-bins', 'assets-library', 'errors', 'lol' ]
```

- [ ] **Step 3: Commit**

```bash
git add messages/en.json
git commit -m "feat(i18n): add League of Legends game-segment title key"
```

---

## Task 2: Move content into `lol/` and write the new meta.json files

This task is one logical unit (the tree only makes sense after all four moves land together), but each step is small.

**Files:**

- Move: `content/docs/en/{guided-walkthrough,tools,maya,blender,animations,vfx-bins,assets-library,errors,contributing}/` → `content/docs/en/lol/<same>/`
- Move: `content/docs/en/index.mdx` → `content/docs/en/lol/index.mdx`
- Move: `content/docs/en/meta.json` → `content/docs/en/lol/meta.json` (with `"root": true` added)
- Create: `content/docs/en/index.mdx` (new "Pick a game" landing)
- Create: `content/docs/en/meta.json` (new root meta listing games)

- [ ] **Step 1: Create `content/docs/en/lol/` and move the nine category folders into it**

Run from repo root:

```bash
mkdir -p content/docs/en/lol
git mv content/docs/en/guided-walkthrough content/docs/en/lol/guided-walkthrough
git mv content/docs/en/tools             content/docs/en/lol/tools
git mv content/docs/en/maya              content/docs/en/lol/maya
git mv content/docs/en/blender           content/docs/en/lol/blender
git mv content/docs/en/animations        content/docs/en/lol/animations
git mv content/docs/en/vfx-bins          content/docs/en/lol/vfx-bins
git mv content/docs/en/assets-library    content/docs/en/lol/assets-library
git mv content/docs/en/errors            content/docs/en/lol/errors
git mv content/docs/en/contributing      content/docs/en/lol/contributing
```

- [ ] **Step 2: Move the root index.mdx into the game folder**

```bash
git mv content/docs/en/index.mdx content/docs/en/lol/index.mdx
```

- [ ] **Step 3: Move the root meta.json into the game folder**

```bash
git mv content/docs/en/meta.json content/docs/en/lol/meta.json
```

- [ ] **Step 4: Add `"root": true` to the moved meta.json**

Edit `content/docs/en/lol/meta.json` so it reads exactly:

```json
{
  "title": "{meta.lol.title}",
  "icon": "Crown",
  "root": true,
  "pages": [
    "index",
    "guided-walkthrough",
    "tools",
    "maya",
    "blender",
    "animations",
    "vfx-bins",
    "assets-library",
    "errors",
    "contributing"
  ]
}
```

Notes for the engineer:

- `"root": true` is the Fumadocs flag that tells the docs sidebar to treat this folder as a self-contained root — readers inside `/docs/lol/**` see the LoL category sidebar, not a `lol/` wrapper.
- `"title": "{meta.lol.title}"` follows the same `{meta.<slug>.title}` pattern as every other category, resolved by `src/lib/tree-localization.ts:62`.
- `"icon": "Crown"` is a Lucide icon name (loaded via the `lucideIconsPlugin` in `src/lib/source.ts:11`). Crown is a stand-in — the user can pick a different one later.
- `"index"` must appear first in `pages` so the LoL landing renders at `/docs/lol`.

- [ ] **Step 5: Create the new root meta.json**

Create `content/docs/en/meta.json` with:

```json
{
  "title": "Divine Skins Wiki",
  "pages": ["index", "lol"]
}
```

This is the top-level meta listing the games. No `"root": true` — root-level meta is already the root.

- [ ] **Step 6: Create the new root index.mdx ("Pick a game" landing)**

Create `content/docs/en/index.mdx` with:

```mdx
---
title: "Divine Skins Wiki"
description: "Community-written guides for making custom skins. Pick a game to get started."
---

Divine Skins is a creator community building custom skins for live-service games. The wiki collects the guides, tools, and workflows that the community actually uses.

## Games

- [**League of Legends**](/docs/lol) — modeling, animations, VFX & bins, the full toolchain.

More games will land here as creator communities form around them. Want to start one? Open an issue on [GitHub](https://github.com/DivineSkins/divine-wiki) or come hang out in [Discord](https://discord.gg/divine).
```

Voice notes for the engineer (from `docs/voice.md`):

- Sentences short, plain words.
- Banned terms: `skin hack`, `skin changer`, `unlock skins`, `undetectable`, `free-to-play skins`, `exploit`. None appear above; keep it that way if you tweak the copy.
- Use `custom skins` (not `skin mods`), `safe`, `customize`.

- [ ] **Step 7: Verify the tree looks right**

Run:

```bash
find content/docs/en -maxdepth 2 -type d | sort
```

Expected output:

```
content/docs/en
content/docs/en/lol
content/docs/en/lol/animations
content/docs/en/lol/assets-library
content/docs/en/lol/blender
content/docs/en/lol/contributing
content/docs/en/lol/errors
content/docs/en/lol/guided-walkthrough
content/docs/en/lol/maya
content/docs/en/lol/tools
content/docs/en/lol/vfx-bins
```

Then:

```bash
ls content/docs/en
```

Expected: `index.mdx  lol  meta.json`.

- [ ] **Step 8: Commit**

```bash
git add content/docs/en
git commit -m "refactor(content): move League of Legends guides under lol/ game segment"
```

---

## Task 3: Rewrite absolute `/docs/...` links in MDX → `/docs/lol/...`

Every internal absolute link inside `content/docs/en/lol/**/*.mdx` currently starts with `/docs/`. We need to insert `lol/` after `/docs/`. Relative links (`./foo`, `../bar`) don't need touching — they resolve under the new tree automatically.

The new root `content/docs/en/index.mdx` from Task 2 already uses the new shape, so it's excluded.

**Files:**

- Modify: ~25 `.mdx` files under `content/docs/en/lol/` (72 link replacements total)

- [ ] **Step 1: Preview the rewrite (dry run)**

Run from repo root:

```bash
grep -rEl '\]\(/docs/' content/docs/en/lol --include='*.mdx' | sort
```

Expected output: a list of `.mdx` files that contain absolute `/docs/...` links (around 25 files based on the migration audit).

Then count the link occurrences:

```bash
grep -rE '\]\(/docs/[^)]+\)' content/docs/en/lol --include='*.mdx' | wc -l
```

Expected: `72` (this is the count taken from the pre-move audit; the migration didn't add or remove links, so it should match).

If the count differs, stop and surface the diff before touching files — something else changed the content.

- [ ] **Step 2: Perform the rewrite in-place**

Run from repo root:

```bash
grep -rEl '\]\(/docs/' content/docs/en/lol --include='*.mdx' \
  | xargs sed -i '' 's|](/docs/|](/docs/lol/|g'
```

Notes:

- macOS `sed` requires the empty `''` after `-i`. If running on Linux, drop it: `sed -i 's|...|...|g'`.
- The replacement uses `|` as the delimiter so `/` in paths doesn't need escaping.
- The pattern `](/docs/` is anchored to Markdown link openings, so we won't accidentally hit `/docs/` substrings inside code fences or inline backticks unless they appear inside a Markdown link, which doesn't happen in this corpus (audited above).

- [ ] **Step 3: Verify no stray old-shape links remain**

Run:

```bash
grep -rEn '\]\(/docs/(?!lol/)' content/docs/en/lol --include='*.mdx' 2>/dev/null \
  || grep -rEn '\]\(/docs/[a-z]' content/docs/en/lol --include='*.mdx' \
       | grep -v '/docs/lol/'
```

Expected: empty (the second form is the macOS-grep fallback since BSD grep lacks `-P`). If any line prints, it's an un-rewritten link — open the file and fix by hand.

- [ ] **Step 4: Spot-check a rewritten file**

Run:

```bash
grep -nE '\]\(/docs/' content/docs/en/lol/guided-walkthrough/index.mdx
```

Expected: every match shows `](/docs/lol/...`, none show `](/docs/<category>` directly.

- [ ] **Step 5: Commit**

```bash
git add content/docs/en/lol
git commit -m "refactor(content): rewrite absolute docs links to include lol/ segment"
```

---

## Task 4: Update React component links

Three call sites in TypeScript/TSX hard-code `/docs/<category>` paths and need the `lol/` segment.

**Files:**

- Modify: `src/app/[lang]/(home)/page.tsx` (lines 38, 78, 85, 92 — verify line numbers before editing; the file may have shifted)
- Modify: `src/lib/layout.shared.tsx` (line 49)

- [ ] **Step 1: Update the home page CTAs and track cards**

In `src/app/[lang]/(home)/page.tsx`, change every `/${lang}/docs/<category>` to `/${lang}/docs/lol/<category>`. Specifically:

| Before                                                          | After                                        |
| --------------------------------------------------------------- | -------------------------------------------- |
| `` `/${lang}/docs/guided-walkthrough` `` (hero CTA, ~line 38)   | `` `/${lang}/docs/lol/guided-walkthrough` `` |
| `` `/${lang}/docs/contributing` `` (~line 48)                   | `` `/${lang}/docs/lol/contributing` ``       |
| `` `/${lang}/docs/guided-walkthrough` `` (track card, ~line 78) | `` `/${lang}/docs/lol/guided-walkthrough` `` |
| `` `/${lang}/docs/maya` `` (~line 85)                           | `` `/${lang}/docs/lol/maya` ``               |
| `` `/${lang}/docs/vfx-bins` `` (~line 92)                       | `` `/${lang}/docs/lol/vfx-bins` ``           |

Locate them by running:

```bash
grep -nE '/\$\{lang\}/docs/' src/app/\[lang\]/\(home\)/page.tsx
```

- [ ] **Step 2: Update the layout shared nav link**

In `src/lib/layout.shared.tsx` (around line 49):

```tsx
// before
url: `/${locale}/docs/contributing`,
// after
url: `/${locale}/docs/lol/contributing`,
```

- [ ] **Step 3: Verify no stale references remain**

Run:

```bash
grep -rnE '/\$\{(lang|locale)\}/docs/[a-z]' src --include='*.tsx' --include='*.ts' \
  | grep -v '/docs/lol/'
```

Expected: empty. If anything matches, fix it the same way (insert `/lol/` after `/docs/`).

- [ ] **Step 4: Type-check passes**

```bash
npm run types:check
```

Expected: exits 0, no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/\[lang\]/\(home\)/page.tsx src/lib/layout.shared.tsx
git commit -m "refactor(routes): point home and shared nav links to lol/ docs paths"
```

---

## Task 5: Update Cloudflare `_redirects`

External backlinks to `/en/docs/maya/...` (or any old category path) should 301 to the new `/en/docs/lol/maya/...` URL. Same for the four locales.

**Files:**

- Modify: `public/_redirects`

- [ ] **Step 1: Replace the file contents**

Open `public/_redirects` and replace its contents with:

```
# Cloudflare Pages `_redirects` — evaluated at the edge, zero Function cost.
# Next.js redirects() in next.config.mjs stay for local dev + as a fallback.

/ /en 301
/docs /en/docs 302
/docs/* /en/docs/:splat 302

# Game-segment migration (2026-05-19): old per-category URLs now live under /lol/.
# Keep these redirects until external traffic to the old shape has decayed.
/:lang/docs/guided-walkthrough/* /:lang/docs/lol/guided-walkthrough/:splat 301
/:lang/docs/guided-walkthrough   /:lang/docs/lol/guided-walkthrough        301
/:lang/docs/tools/*              /:lang/docs/lol/tools/:splat              301
/:lang/docs/tools                /:lang/docs/lol/tools                     301
/:lang/docs/maya/*               /:lang/docs/lol/maya/:splat               301
/:lang/docs/maya                 /:lang/docs/lol/maya                      301
/:lang/docs/blender/*            /:lang/docs/lol/blender/:splat            301
/:lang/docs/blender              /:lang/docs/lol/blender                   301
/:lang/docs/animations/*         /:lang/docs/lol/animations/:splat         301
/:lang/docs/animations           /:lang/docs/lol/animations                301
/:lang/docs/vfx-bins/*           /:lang/docs/lol/vfx-bins/:splat           301
/:lang/docs/vfx-bins             /:lang/docs/lol/vfx-bins                  301
/:lang/docs/assets-library/*     /:lang/docs/lol/assets-library/:splat     301
/:lang/docs/assets-library       /:lang/docs/lol/assets-library            301
/:lang/docs/errors/*             /:lang/docs/lol/errors/:splat             301
/:lang/docs/errors               /:lang/docs/lol/errors                    301
/:lang/docs/contributing/*       /:lang/docs/lol/contributing/:splat       301
/:lang/docs/contributing         /:lang/docs/lol/contributing              301

/en/contribute     /en/docs/lol/contributing    301
/fr-FR/contribute  /fr-FR/docs/lol/contributing 301
/tr-TR/contribute  /tr-TR/docs/lol/contributing 301
/pt-BR/contribute  /pt-BR/docs/lol/contributing 301
/contribute        /en/docs/lol/contributing    301
```

Notes:

- Cloudflare Pages `_redirects` supports `:placeholder` for path segments and `:splat` for the catch-all tail. The `:lang` placeholder covers `en`, `fr-FR`, `tr-TR`, `pt-BR` — anything in the first segment.
- Order matters: the redirect file is evaluated top-to-bottom, first match wins. The new `/:lang/docs/<cat>` rules come **after** the broad `/docs/* → /en/docs/:splat` so the broad fallback still catches missing-locale traffic and feeds it into the new locale-aware rules on the next hop.
- The contribute redirects update their target — they previously pointed at `/en/docs/contributing`, which now 301s to `/en/docs/lol/contributing` anyway, but pointing them directly avoids the double-hop.

- [ ] **Step 2: Sanity check the file**

Run:

```bash
grep -c '^/' public/_redirects
```

Expected: `26` (3 generic + 18 game-segment + 5 contribute). If the count is wrong, recount the rules above and re-edit.

- [ ] **Step 3: Commit**

```bash
git add public/_redirects
git commit -m "feat(edge): redirect old per-category docs URLs to /docs/lol/* equivalents"
```

---

## Task 6: Boot the dev server and verify end-to-end

This is a content/route restructure with no unit tests — the verification is manual.

- [ ] **Step 1: Clear stale Fumadocs caches**

Per `CLAUDE.md` gotcha #4, Turbopack caches compiled `source.config.ts` output. Wipe before testing:

```bash
rm -rf .next .source
```

- [ ] **Step 2: Start the dev server**

```bash
npm run dev
```

Wait for the line `▲ Next.js ... Local: http://localhost:3000`.

- [ ] **Step 3: Verify each route loads with no console errors**

Open each URL in a browser tab. For each one, page renders 200 with no red errors in the terminal:

| URL                                                       | Expected page                                  |
| --------------------------------------------------------- | ---------------------------------------------- |
| `http://localhost:3000/`                                  | Redirects to `/en` (the home page)             |
| `http://localhost:3000/en/docs`                           | "Pick a game" landing with a LoL link          |
| `http://localhost:3000/en/docs/lol`                       | Existing landing (was `/docs`) — section cards |
| `http://localhost:3000/en/docs/lol/guided-walkthrough`    | Quick Start category page                      |
| `http://localhost:3000/en/docs/lol/tools/flint`           | Flint tool guide                               |
| `http://localhost:3000/en/docs/lol/maya/lol-maya-plugin`  | Maya plugin guide                              |
| `http://localhost:3000/en/docs/lol/vfx-bins/file-formats` | VFX file formats page                          |
| `http://localhost:3000/en/docs/lol/errors/maya-errors`    | Maya errors page                               |
| `http://localhost:3000/en/docs/lol/contributing`          | Contributing page                              |

For each docs page, also verify the **sidebar** shows the LoL categories (Quick Start, Tools, Maya, Blender, …) — not a `lol/` wrapper. If the sidebar shows `lol > <category>`, `"root": true` didn't take effect; restart the dev server (`Ctrl+C` then `npm run dev`) and clear `.next .source` again.

- [ ] **Step 4: Verify legacy URLs work (Next.js redirect fallback)**

Edge `_redirects` only runs on Cloudflare Pages, not in `next dev`. To prove the redirect file is well-formed:

```bash
node -e "
const lines = require('fs').readFileSync('public/_redirects','utf-8').split('\n');
const rules = lines.filter(l => l.startsWith('/') && !l.startsWith('#'));
for (const r of rules) {
  const parts = r.split(/\s+/).filter(Boolean);
  if (parts.length < 2) console.error('BAD:', r);
}
console.log(rules.length, 'rules parsed');
"
```

Expected: `26 rules parsed`, no `BAD:` lines.

- [ ] **Step 5: Spot-check the OG image route**

The OG handler reads from `source.getPage(slug, lang)` and doesn't care about depth, but verify:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/og/docs/en/lol/tools/flint
```

Expected: `200`.

- [ ] **Step 6: Run the production build**

```bash
npm run build
```

Expected: build succeeds. Watch the output for missing-page warnings or 404s during static generation. If the build complains about `meta.lol.title` not resolving, recheck Task 1 step 1.

- [ ] **Step 7: Run lint and format check**

```bash
npm run lint
npm run format:check
```

Expected: both exit 0. If `format:check` fails on the new files, run `npm run format` and amend the relevant Task 1/2/3/4/5 commits — or, simpler, add a follow-up commit `style: prettier-format game-segment refactor`.

- [ ] **Step 8: Final commit (only if format-check produced changes)**

```bash
git add -A
git commit -m "style: prettier-format game-segment refactor"
```

(Skip if `git status` is clean.)

---

## Out of scope (call out to user)

These are intentionally NOT in this plan:

1. **Crowdin re-anchoring.** Translators may need to re-link their working translations to the new source paths in the Crowdin dashboard. Source file paths change from `content/docs/en/maya/lol-maya-plugin.mdx` to `content/docs/en/lol/maya/lol-maya-plugin.mdx`. Since there are no checked-in translated MDX files yet, nothing in the repo breaks; the user should ping their Crowdin admin after merging.
2. **Per-locale UI strings beyond English.** `messages/en.json` gets `meta.lol.title`; the other locale message files (`messages/fr-FR.json`, etc.) are Crowdin-managed and will receive the key on next sync. Until then, `tree-localization.ts` falls back to English.
3. **A real "Pick a game" landing.** The new `content/docs/en/index.mdx` is intentionally thin — one game card. When game #2 is real, that file gets a proper grid and visual treatment. Not now.
4. **Renaming `contributing` to a cross-game `meta/` section.** Today contributing lives under `lol/` for simplicity. When game #2 lands and the page is genuinely cross-game, hoist it to `content/docs/en/contributing/` and add a top-level meta entry. Out of scope here.
5. **Search index.** Fumadocs' Orama search reindexes from the page tree on build, so the new paths get picked up automatically. No manual reindex needed.

---

## Self-Review

**Spec coverage:**

- Add `lol/` segment under each locale ✅ Task 2
- Keep Fumadocs i18n + Crowdin glob untouched ✅ Out-of-scope note 1, Task 0
- Sidebar UX same as today ✅ Task 2 step 4 (`"root": true`)
- Internal MDX links updated ✅ Task 3
- React component links updated ✅ Task 4
- External URL preservation ✅ Task 5
- Single deploy, no subdomains ✅ entire plan
- Verification ✅ Task 6

**Placeholder scan:** No TBDs, no "implement appropriately", no unspecified code. Every code/JSON block is complete. Every command shows expected output.

**Type/path consistency:**

- `meta.lol.title` referenced in Task 1 (write) and Task 2 step 4 (read) — matches.
- `"root": true` flag spelled identically in plan body and meta.json snippet.
- `/${lang}/docs/lol/...` shape consistent across Task 3, Task 4, Task 5, Task 6.
- Cloudflare `_redirects` placeholders (`:lang`, `:splat`) consistent across all 18 game-segment rules.
