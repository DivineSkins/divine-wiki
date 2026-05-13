# Workflows

Cookbook for the tasks that come up most often. Follow these recipes instead of improvising — each one is minimal and battle-tested.

## Add a new guide

1. Pick the category. Categories live under `content/docs/en/`.
2. Create `content/docs/en/<category>/<kebab-slug>.mdx`.
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
   { "title": "Tools", "icon": "Wrench", "pages": ["index", "cs-lol-manager", "league-mod-repather", "..."] }
   ```

6. `npm run dev` → `/en/docs/<category>/<slug>` should render.
7. Check voice: no banned terms (see [`voice.md`](./voice.md)); every `<img>` has `alt`; safety callout near the top if the guide touches install.
8. Commit. CI will run markdownlint + lychee + cSpell on the PR.

## Add a new category

Rare. Creator-scope is deliberately capped at eight categories.

1. `mkdir content/docs/en/<category>`.
2. Create `content/docs/en/<category>/index.mdx` (the landing page):

   ```mdx
   ---
   title: "Category Name"
   description: "One-sentence description."
   ---

   ## What's here

   - [Guide A](./guide-a)
   - [Guide B](./guide-b)
   ```

3. Create `content/docs/en/<category>/meta.json`:

   ```json
   { "title": "Category Name", "icon": "IconName", "pages": ["index", "..."] }
   ```

   `icon` **must** be a lucide-react icon name from `lucide-react/dynamicIconImports`. Unknown names 500 the docs layout (known gotcha).
4. Add the category to the top-level `content/docs/en/meta.json` `pages` array.
5. Make sure Crowdin picks up the folder — no config change needed; `crowdin.yml` globs `content/docs/en/**/*.mdx`.

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

## Fix a broken link (from CI)

lychee CI lists the failing URLs in the PR check. Three typical fixes:

- **Legacy `/wiki/3d-modelling/...` path** → map to `/docs/maya/...` or `/docs/blender/...`.
- **Third-party URL is 404** → replace or remove. If the resource is gone, say so in the guide instead of linking a dead URL.
- **Flaky external site** → if lychee returns 429, it already ignores it. If something else, add the host to the ignore list in `.github/workflows/content-lint.yml` (only as a last resort).

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

Only do this if you're reorganising categories wholesale. The script is idempotent.

```bash
node scripts/migrate-content.mjs
```

It:

- Moves `content/<cat>/` → `content/docs/en/<cat>/`
- Backfills `description` (first non-heading sentence) and `category` (folder name)
- Converts legacy `:::tabs`/`::tab` directives to `<Tabs>`/`<Tab>` JSX
- Remaps legacy `/wiki/3d-modelling/*` paths
- Replaces `YOUR_LINK_HERE` with `#`
- Generates per-category `meta.json` (Lucide icon auto-picked from a lookup table)

Inspect the diff after running; a human pass almost always finds 2–3 things that need tightening.

## Bring up a local dev session

```bash
npm install --legacy-peer-deps   # yes, legacy peer deps is expected
npm run dev                       # boots at http://localhost:3000 (will redirect → /en)
```

No env vars needed — the site is fully static. Contributors edit guides via GitHub (browser or local fork) and open a PR; there's no in-site editor to wire up locally.

## When working as AI on this repo

- **Read `CLAUDE.md` first every turn** — it's the tight source of truth; these `docs/` files are the deep dive.
- **Check `docs/playbook.md` before proposing structural changes** — page types, sidebar shape, and contribution tiers are already settled.
- **Check `docs/voice.md` before writing any user-facing copy** — voice is enforced in CI.
- **Don't touch non-English MDX** — Crowdin overwrites it.
- **Don't import from `Reference/`** — it's legacy reference material, not project code.
- **Trust but verify recalled memory** — memories about specific file paths / flags / components can go stale. Grep before recommending.
