# Draft Editor — in-browser contribution flow

**Date:** 2026-05-14
**Status:** Approved design, ready for implementation plan
**Builds on the idea note:** `docs/superpowers/plans/2026-05-13-in-browser-draft-flow.md`

## Motivation

The wiki moved to GitHub-native contributions in the 2026-05-13 backend removal. The per-page "Edit on GitHub" link works for typo fixes but drops creators into GitHub's raw editor — no frontmatter scaffolding, no guidance on where a new file goes, no preview. The old Divine Academy wiki had auth plus a built-in editor that made new categories and guides easy; the open concern is that creators find the GitHub flow worse and stop contributing.

`/draft` is the bridge. Drafting feels like the old editor — write, see a live preview, hit submit — but the actual commit happens through GitHub. It recovers the first-time-contributor experience without giving up the platform's scale: PR review, CI previews, fork-and-PR, and no maintained auth or database backend.

## Decisions (from brainstorming)

| Question           | Decision                                                                                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MVP scope          | The full feature: editor, live preview, smart-linking, click-to-insert toolbar, creator-facing component docs. Built in layers so it ships incrementally. |
| "No backend" line  | A stateless `/api/preview` route (no auth, no secrets, no DB) is acceptable — same risk class as the kept `/api/og` and `/api/search` routes.             |
| New vs edit        | `/draft` is the single entry point for all contributions. It replaces the raw per-page "Edit on GitHub" link.                                             |
| Edit handoff       | New guides get automatic GitHub URL prefill. Edits use a copy-paste handoff — GitHub has no URL-prefill for existing files.                               |
| meta.json          | "Instructions + copy block" — a "one more step" panel after the main handoff, with the exact snippet and a link to the file.                              |
| Editor surface     | CodeMirror 6 — enables real inline autocomplete for smart-linking and clean snippet insertion.                                                            |
| Layout             | Two columns (editor \| preview) with the component cheatsheet as a compact toolbar above the editor.                                                      |
| Component tooltips | Each toolbar chip's tooltip shows: name, "when to use this", a live rendered preview, the snippet, and an insert button.                                  |
| Smart-link trigger | `@` character opens an autocomplete dropdown. Plus an optional on-demand "Scan for links" button. No passive "underline every known word" behavior.       |
| Testing            | Lightweight — pure logic lives as testable functions in `src/lib/draft/`, covered by TypeScript and a written manual test plan. No new test runner.       |

## Architecture

### Routes

**`/[lang]/draft`** — a mostly-client page. Two modes, selected by query param:

- no param, or `?new=<category>` → blank new-guide mode
- `?edit=<path>` → edit mode; loads an existing guide's raw source

**`/api/preview`** — stateless `POST { mdx }` → returns a serialized MDX payload. Implemented with `next-mdx-remote` (already a dependency), configured with the **same remark/rehype plugin set as `source.config.ts`**. No secrets, no auth, no DB — the same risk class as `/api/og`.

### New files

- `src/app/[lang]/draft/page.tsx` — server shell. Reads query params, renders the client editor.
- `src/app/[lang]/draft/draft-editor.tsx` — main client component. Owns editor state, hosts CodeMirror + the toolbar + the preview pane.
- `src/app/[lang]/draft/preview-pane.tsx` — debounced POST to `/api/preview`, renders the result with `getMDXComponents()`.
- `src/app/[lang]/draft/toolbar.tsx` — the click-to-insert component toolbar and its preview tooltips.
- `src/app/[lang]/draft/handoff.tsx` — the "Contribute" result screens; builds GitHub URLs, owns the copy-paste and meta.json panels.
- `src/app/api/preview/route.ts` — the stateless MDX compile route.
- `src/lib/draft/` — shared pure logic: GitHub URL builders, slug derivation, frontmatter assembly, snippet definitions, the smart-link entity index loader, and the shared MDX plugin config.

### Modified files

- `src/app/[lang]/docs/[[...slug]]/page.tsx` — the per-page "Edit on GitHub" affordance now links to `/draft?edit=<path>` instead of GitHub's raw editor.
- `src/lib/layout.shared.tsx` — the "Contribute" nav entry points to `/draft`.
- `scripts/prebuild.mjs` — additionally emits a smart-link entity index (page slugs, titles, categories, URLs) by scanning `content/docs/en/**`.
- `source.config.ts` — extract its remark/rehype plugin config into a shared module so `/api/preview` can reuse the exact same pipeline.
- `messages/en.json` — editor UI strings.

## Design detail

### 1. Layout

A top header bar holds the frontmatter inputs — title, category dropdown (populated from `content/docs/en/meta.json`), description — and the "Contribute" button. Below it, a compact horizontal toolbar of component chips. Below that, a two-column split: CodeMirror editor on the left, live preview on the right.

### 2. Component toolbar

Chips: Callout, Tabs, Accordion, Image (with alt), Code block, Table, ToolCard, LevelPill, plus a "More" overflow for the rarer components (ParameterList, PremiumCard, GlowCTA, YouTube).

- **Click** a chip → inserts the component's snippet at the cursor.
- **Hover** a chip → tooltip showing the component name, a one-line "when to use this", a **live rendered preview** (using the real Divine components, so it is accurate), the snippet, and an "Insert at cursor" button plus a "full docs →" link.

The fuller creator-facing component reference — every prop, screenshots, examples — lives at a new docs page `/docs/contributing/components`. The tooltip "full docs →" links jump there.

### 3. Smart-linking / @-mentions

**Entity index:** generated at build by `scripts/prebuild.mjs`, scanning `content/docs/en/**`. Each guide becomes an entry with title, slug, category, and URL. A small hand-maintained alias map in `src/lib/draft/` resolves abbreviations (e.g. `LMR` → league-mod-repather, `CSLOL` → cs-lol-manager).

**Trigger:** the `@` character opens a CodeMirror autocomplete dropdown filtered against the entity index. Selecting an entry inserts `[Visible Text](/docs/<category>/<slug>)`. If nothing matches, no suggestion appears and the creator types normally.

**Optional "Scan for links" button:** an on-demand pass over the whole draft that _suggests_ (never auto-applies) wrapping unlinked entity names. On-demand, so it is never in the way.

### 4. The GitHub handoff

On "Contribute", `/draft` assembles the full MDX (frontmatter from the header inputs + body) and branches:

**New guide:**

1. If the assembled MDX is under a safe URL limit (~6 KB, conservative against GitHub's ~8 KB cap), open `github.com/DivineSkins/divine-wiki/new/main?filename=content/docs/en/<category>/<slug>.mdx&value=<urlencoded>` in a new tab — GitHub's editor opens pre-filled.
2. If it is over the limit, fall back to the copy-paste panel (same as edits).
3. Show a "one more step" panel: the meta.json snippet to paste and a link to the category's `meta.json` on GitHub.
4. Show an images reminder: upload any referenced images to `public/wiki-images/` in the same PR, with a link to GitHub's upload UI.

**Edit existing:**

1. Show a copy-paste panel: the edited MDX with a prominent "Copy MDX" button.
2. A "then" step: an "Open guide on GitHub" button → `github.com/DivineSkins/divine-wiki/edit/main/content/docs/en/<path>`. The creator selects all, pastes, commits.
3. Images reminder shows. No meta.json step — the page already exists.

### 5. Data flow & edit-mode loading

**New-guide mode:** blank editor. Slug auto-derived as kebab-case from the title, editable.

**Edit mode:** the client fetches raw source from `raw.githubusercontent.com/DivineSkins/divine-wiki/main/content/docs/en/<path>.mdx`, parses it with `gray-matter` (already a dependency) — frontmatter fills the header inputs, body fills CodeMirror. On fetch failure (offline, file moved, rate-limited), show an error state with a fallback link to GitHub's raw editor.

**Preview loop (both modes):** on edit, debounced ~400 ms → POST the assembled MDX to `/api/preview` → render the serialized payload in the preview pane with `getMDXComponents()`.

**Draft persistence:** localStorage auto-save, keyed by mode + slug/path. A refresh or accidental tab-close does not lose work — restore with an "unsaved draft" prompt on load. This doubles as the URL-length fallback safety net.

**State ownership:**

- `draft-editor.tsx` owns `{ title, category, slug, description, body, mode }`.
- `preview-pane.tsx` owns the fetch-to-`/api/preview` and render.
- `toolbar.tsx` calls back into the editor to insert at the cursor.
- `handoff.tsx` receives the assembled MDX + mode, owns URL building and the result screens.

### 6. Error handling

- **Malformed MDX:** `/api/preview` catches compile errors (unbalanced `<Tabs>`, `<` before a digit, bad frontmatter) and returns a structured `{ error, line }` instead of a 500. The preview pane shows it inline with the line number; the editor stays usable.
- **GitHub raw fetch fails (edit mode):** error state with an "open the raw editor on GitHub instead" fallback link.
- **URL too long (new guide):** detected before handoff, auto-falls back to the copy-paste panel.
- **Slug collision:** a file already exists at that path → warn clearly, suggest a different slug, do not hard-block.
- **`/api/preview` unreachable:** the preview pane shows "preview unavailable, your draft is safe"; editing and handoff still work.
- **Required fields:** the "Contribute" button is disabled until title, category, and body are non-empty.

### 7. Testing

Lightweight, matching the project's deliberately thin toolchain. The pure logic — GitHub URL builders, slug derivation, frontmatter assembly, entity-index matching — lives in `src/lib/draft/` as pure functions, covered by TypeScript types. No new test runner is added.

Manual test plan:

- New-guide happy path: fill inputs, write body, preview renders, Contribute opens a pre-filled GitHub editor.
- Edit happy path: open `?edit=<path>`, source loads, edit, Contribute shows the copy-paste panel.
- Oversized-draft fallback: a long new-guide draft falls back to copy-paste.
- Malformed MDX: an unbalanced tag shows an inline error, not a crash.
- Offline edit-mode: raw fetch failure shows the fallback link.
- localStorage restore: refresh mid-draft restores the work.

## Open questions / risks

- **Preview parity is the key implementation risk.** `/api/preview` must use the exact remark/rehype plugin set as the Fumadocs build, or the preview will quietly diverge from production. Mitigation: extract `source.config.ts`'s plugin config into a shared module consumed by both.
- **CodeMirror 6 bundle weight.** It is a real dependency. Acceptable given it is what makes smart-linking and snippet insertion good, and the `/draft` route is the only place it loads (code-split).
- **GitHub raw availability** for edit mode. The fallback link covers outages, but heavy use could hit rate limits — monitor; a static build-time source manifest is a future option if it becomes a problem.

## Out of scope

- Bringing back any commit/PR API — the handoff stays URL-based and copy-paste.
- Image upload from within `/draft` — images are handled by the post-handoff reminder, uploaded through GitHub.
- Editing non-English (Crowdin-managed) content — `/draft` targets `content/docs/en/**` only.
- Auth, accounts, or any contributor identity in the wiki itself — GitHub remains the identity layer.
