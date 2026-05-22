# Workflows

Cookbook for the tasks that come up most often. Follow these recipes instead of improvising — each one is minimal and battle-tested.

## Add a new guide

Three ways. Pick whichever fits — they all converge on a GitHub PR.

### Via the `/draft` in-browser editor (recommended for non-devs)

1. Open `https://wiki.divineskins.gg/en/draft?new=<category>` (or just `/en/draft` and pick a category).
2. Write the MDX in the left pane; live preview on the right.
3. Click **Submit** — it authorizes via GitHub device flow, forks the repo if needed, commits the file at `content/docs/en/lol/<category>/<slug>.mdx`, and opens a PR.

### Via Fumadocs "Edit on GitHub"

Every page has an Edit link at the bottom that drops you into GitHub's web editor.

### Via local clone

1. Pick the category. Categories live under `content/docs/en/lol/`.
2. Create `content/docs/en/lol/<category>/<kebab-slug>.mdx`.
3. Frontmatter — `title` is required; `description` strongly recommended:

   ```yaml
   ---
   title: "Repath a fantome with LMR"
   description: "Move a skin to a different champion slot without rebuilding it."
   ---
   ```

4. Content starts at `##`. (H1 comes from `title`.)
5. Add the slug to the category's `meta.json` in the position you want it:

   ```json
   {
     "title": "{meta.tools.title}",
     "icon": "Wrench",
     "pages": ["index", "flint", "jade", "ltmao", "ritobin", "..."]
   }
   ```

6. `npm run dev` → `/en/docs/lol/<category>/<slug>` should render.
7. Check voice: no banned terms (see [`voice.md`](./voice.md)); every `<img>` has `alt`; safety callout near the top if the guide touches install.
8. Commit. CI runs Prettier in check mode; a reviewer handles voice and link checks.

## Add a new category

Rare. Creator-scope is deliberately capped at eight content categories plus `contributing`.

1. `mkdir content/docs/en/lol/<category>`.
2. Create `content/docs/en/lol/<category>/index.mdx` (the landing page):

   ```mdx
   ---
   title: "Category Name"
   description: "One-sentence description."
   ---

   ## What's here

   - [Guide A](./guide-a)
   - [Guide B](./guide-b)
   ```

3. Create `content/docs/en/lol/<category>/meta.json`:

   ```json
   { "title": "Category Name", "icon": "IconName", "pages": ["index", "..."] }
   ```

   `icon` **must** be a lucide-react icon name resolved by `lucideIconsPlugin`. Unknown names 500 the docs layout (known gotcha).

4. Add the category slug to `content/docs/en/lol/meta.json`'s `pages` array, in the order you want it.
5. Make sure Crowdin picks up the folder — no config change needed; `crowdin.yml` globs `content/docs/en/**/*.mdx`.

## Add a new game segment

Today the only segment is `lol/`. To add another (e.g. Valorant):

1. `mkdir content/docs/en/valorant`.
2. Create `content/docs/en/valorant/meta.json` with `root: true`, an icon, and a `pages` array.
3. Add `"valorant"` to `content/docs/en/meta.json`'s `pages` array.
4. Add a `meta.valorant.title` key (and any category title interpolations) to `messages/en.json`.

## Add a new locale

1. Pick the BCP-47 code (e.g. `de-DE`).
2. Add it to `src/lib/i18n.ts`:

   ```ts
   languages: ["en", "fr-FR", "tr-TR", "pt-BR", "de-DE"],
   ```

3. Add a target in `crowdin.yml` (see existing entries).
4. Copy `messages/en.json` to `messages/de-DE.json` (Crowdin will overwrite).
5. Commit an empty `content/docs/de-DE/` folder (or leave it to the first Crowdin sync).
6. Ship. Untranslated pages serve English silently.

## Add a new MDX component

See [`components.md`](./components.md) → "Adding a new component". Short version:

1. `src/components/mdx/MyThing.tsx`.
2. Register in `src/mdx-components.tsx`.
3. Document it in `components.md`.

## Debug `npm run dev` failures

Most frequent causes:

1. **Stale Turbopack cache**: `rm -rf .next .source && npm run dev`.
2. **Bad frontmatter**: Zod error includes the offending `.mdx` path. Check the schema in `source.config.ts`.
3. **Unknown lucide icon in `meta.json`**: search `lucide-react/dynamicIconImports` or pick from [lucide.dev](https://lucide.dev). The error is usually "Cannot read properties of undefined" inside the docs layout.
4. **Unclosed JSX** (`<Tabs>` without `</Tabs>`, code fence without closing ` ``` `): the MDX compiler points to the line.
5. **`<` followed by a digit**: escape as `\<3`, `\<60k`.
6. **External image timeout**: `source.config.ts` already sets `external: false, onError: "ignore"`. If a URL still blocks, replace it with a local copy in `/public/wiki-images/`.

## Update voice rules

1. Change [`voice.md`](./voice.md) (human-readable source of truth).
2. Mirror any banned-term changes in the "Conventions" section of `CLAUDE.md` so humans + AI see the same rules.
3. Mirror in `.claude/skills/divine-wiki-voice/SKILL.md` and `.claude/skills/divine-wiki-voice/references/wiki-voice-guide.md` so the voice skill stays accurate.

## Add a new Lucide icon to a category

Icon name → capitalized PascalCase (`"Wrench"`, `"Download"`, `"BookOpen"`). Verify it exists:

```bash
node -e "const m=require('lucide-react/dynamicIconImports').default;console.log(Object.keys(m).sort().filter(k=>k.startsWith('b')).join('\n'))"
```

If the build later says an icon is missing, it's a typo or a name that only exists in a newer `lucide-react`. Bump the dep or pick a different icon.

## Add / change an env var

1. Add it to `.env.example` with a one-line comment.
2. Document the minimum dev / prod sets in `CLAUDE.md` → "Environment variables".
3. For a client-visible value, prefix with `NEXT_PUBLIC_`. Otherwise keep it server-side only.
4. Secrets go in the Cloudflare Pages project settings (never commit). For CI-only values, add as a GitHub repo secret.

## Run the content migration script

Only do this if you're reorganising categories wholesale. The script is idempotent and historical — it was written for the original migration from the legacy Divine Academy wiki.

```bash
node scripts/migrate-content.mjs
```

It:

- Moves `content/<cat>/` → `content/docs/en/<cat>/` (predates the `lol/` game-segment refactor)
- Backfills `description` (first non-heading sentence) and `category` (folder name)
- Converts legacy `:::tabs`/`::tab` directives to `<Tabs>`/`<Tab>` JSX
- Remaps legacy `/wiki/3d-modelling/*` paths
- Replaces `YOUR_LINK_HERE` with `#`
- Generates per-category `meta.json` (Lucide icon auto-picked from a lookup table)

Inspect the diff after running; a human pass almost always finds 2–3 things that need tightening. If you rerun this on the current tree, you'll likely need to move the result back under `lol/` by hand afterwards.

## Bring up a local dev session

```bash
npm install
npm run dev   # boots at http://localhost:3000 (will redirect → /en)
```

No env vars needed — the site is fully static. Contributors edit guides via GitHub (browser or local fork) and open a PR; there's no in-site editor to wire up locally.

## Debug `/draft` editor preview vs published divergence

The editor's preview pane renders MDX through `src/lib/draft/mdx-config.ts` (via `/api/preview`). The published site uses `source.config.ts`. If a guide looks right in `/draft` but wrong once merged (or vice versa), the two pipelines have drifted.

1. Open `source.config.ts` and note `mdxOptions.remarkPlugins` and `rehypeCodeOptions`.
2. Open `src/lib/draft/mdx-config.ts` and confirm `previewRemarkPlugins` matches.
3. Add any missing plugin to the lagging side. They must stay in lockstep.

## When working as AI on this repo

- **Read `CLAUDE.md` first every turn** — it's the tight source of truth; these `docs/` files are the deep dive.
- **Check `docs/playbook.md` before proposing structural changes** — page types, sidebar shape, and contribution tiers are already settled.
- **Check `docs/voice.md` before writing any user-facing copy.**
- **Don't touch non-English MDX** — Crowdin overwrites it.
- **Don't import from `Reference/`** — it's legacy reference material, not project code.
- **Trust but verify recalled memory** — memories about specific file paths / flags / components can go stale. Grep before recommending.
