# Next coding session — TODO

Punch list of what's queued up. Group in logical order so the work builds on itself: **structure first, then polish**.

---

## 1. Subcategories for sidebar categories

Right now every category (`tools/`, `maya/`, `vfx-bins/`, etc.) is a flat list of pages. As pages pile up the sidebar gets noisy.

### Tasks

- [ ] Audit each category in `content/docs/en/*/meta.json` and decide which ones need grouping.
  - Likely candidates: **tools/** (extract, BIN, textures, audio, packaging), **vfx-bins/**, **maya/**.
- [ ] Pick a grouping pattern. Two options to pick from:
  - **Nested folders** — move pages into subfolders, each with its own `meta.json`. Renders as nested sidebar groups.
  - **Inline groups** — Fumadocs supports headings/separators inside `meta.json` `pages` (e.g. `"---"` or `"### Group name"`). Lighter lift, no URL changes.
- [ ] Start with `tools/` since it has the most entries. Proposed groups: **Extract**, **BIN editing**, **All-in-one**, **3D**, **Textures**, **VFX**, **Audio**, **Packaging**, **Code**.
- [ ] If going with nested folders: update any cross-page links that hardcode `/docs/tools/<slug>`.
- [ ] Verify the Crowdin sync still works after reshuffling paths (non-English folders mirror `en/`).

### Gotchas

- Moving an MDX file changes its URL. Either set up redirects in `public/_redirects`, or change paths before we send out a lot of external links.
- Contributors edit via GitHub (browser or local fork) and open a PR. If we add a subfolder layer, update `/docs/contributing` so the documented paths match.

---

## 2. Tools page — layout + gradient lines

### Tasks

- [ ] Review `content/docs/en/tools/index.mdx` layout against the design DNA. `<ToolCard>` rows can feel dense on wide screens — try a 2-column grid for cards inside `<Tabs>`.
- [ ] Fix the gradient `<hr>` component in `src/app/global.css` (`.prose hr`). It's currently a flat 1px gold→purple bar. Options:
  - Soften it (lower opacity, taller, fade to transparent on the edges).
  - Replace with a subtle centered ornament instead of a full-width bar.
  - Keep it but trim the places it's used — it repeats a lot on the tools index and visually chops the page.
- [ ] Consider a "featured trio" at the top (Flint, Jade, LtMAO) using `PremiumCard` instead of plain `ToolCard` so the recommended picks stand out.
- [ ] Tighten the tab labels on narrow viewports (they wrap awkwardly around 500px wide).
- [ ] Run Chrome DevTools MCP: check for a11y issues on the tools page and performance of the gradient-heavy sections.

### Files to touch

- `content/docs/en/tools/index.mdx`
- `src/components/mdx/ToolCard.tsx` (maybe add `size="sm|md"` or a `grid` wrapper)
- `src/app/global.css` — `.prose hr` styling

---

## 3. Quick Start page — spacing, text, look

The FAQ page (`content/docs/en/guided-walkthrough/index.mdx`) still feels bland. Collapsibles render fine but the page lacks visual rhythm.

### Tasks

- [ ] Tighten spacing between the callout, the heading, and the FAQ list. Too much vertical air.
- [ ] Typography pass: check font sizes on mobile, make sure the summary text doesn't feel heavier than the answer.
- [ ] Add a small visual flourish to the **Frequently asked questions** heading — maybe a one-line subheading ("Answers from the community") or a tiny count badge ("10 answers").
- [ ] Try a subtle numbering or icon on each summary row so the list scans faster. Keep it minimal — no boxes.
- [ ] Revisit answer copy: some answers have nested numbered lists that expand tall — see if bullets + short paragraphs read better.
- [ ] Add a **"Still stuck?"** CTA block at the bottom of the page linking to `#modding-help` on Discord — it's the natural next action after reading the FAQ.
- [ ] Review against `docs/voice.md` — no em dashes, no filler, under 20 words per sentence.

### Files to touch

- `content/docs/en/guided-walkthrough/index.mdx`
- `src/app/global.css` — the `.prose details` block, possibly add a `.faq-heading` variant
- Maybe a new `<FaqItem>` MDX component if plain `<details>` can't be styled the way we want

---

## Suggested order

1. **Gradient `hr` fix** — smallest, unblocks the tools layout work.
2. **Tools page layout + featured trio** — visible payoff.
3. **Quick Start spacing/polish** — ties into the global.css pass from step 1.
4. **Subcategories** — biggest change, do last so links settle on the final layout.

---

## Out of scope (not this session)

- Translations / Crowdin re-sync.
- R2 image CDN migration.
- PostHog re-enable.
- `/docs/contributing` polish.
