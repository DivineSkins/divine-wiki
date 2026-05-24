# Architecture

How the wiki is wired. Read this before editing anything outside `content/`.

## Runtime shape

- **Next.js 16** (App Router, Turbopack dev, React 19.2 stable).
- **Fumadocs 16** renders docs pages from MDX; the rest of the app is plain Next.
- **Cloudflare Pages** runs the build as an SSR Next app; `public/_redirects` + `public/_headers` handle edge rules without a Function invocation.
- **No database.** All content is MDX in the repo. No server-side session, no user store.
- **No backend submission flow.** Contributors edit guides via GitHub (browser or local fork) and open a PR.

## Request map

| Route                               | Handler                                    | Notes                                                                         |
| ----------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------- |
| `/`                                 | redirect → `/en`                           | `next.config.mjs` redirect (permanent)                                        |
| `/en`, `/fr-FR`, `/tr-TR`, `/pt-BR` | `src/app/[lang]/(home)/page.tsx`           | Landing (icon-tile grid)                                                      |
| `/{lang}/docs/{...slug}`            | `src/app/[lang]/docs/[[...slug]]/page.tsx` | Fumadocs `DocsPage` + MDX. Slugs start with the game segment (e.g. `lol/...`) |
| `/{lang}/docs/lol/contributing`     | MDX guide                                  | How to contribute via GitHub (browser or local fork)                          |
| `/{lang}/draft`                     | `src/app/[lang]/draft/page.tsx`            | In-browser MDX editor. `?edit=<path>` or `?new=<category>`. `noindex`         |
| `/contribute`, `/{lang}/contribute` | redirect → `/{lang}/docs/lol/contributing` | `next.config.mjs` redirect (permanent)                                        |
| `/api/og/docs/[lang]/[...slug]`     | Dynamic OG image                           | Fumadocs' built-in generator                                                  |
| `/api/search`                       | Orama search index                         | Fumadocs built-in                                                             |
| `/api/health`                       | Liveness probe                             | Returns `{ok: true}`                                                          |
| `/api/preview`                      | Renders draft MDX                          | Used by the `/draft` editor's live preview pane                               |
| `/llms.txt`                         | LLM-friendly index                         | Page list with descriptions, hand-tuned header/footer                         |
| `/llms-full.txt`                    | Full-text dump                             | Every English page concatenated for LLM ingest                                |
| `/sitemap*.xml`, `/robots.txt`      | Next metadata routes                       | Auto-generated per locale                                                     |

I18n routing lives in `src/app/proxy.ts` (Fumadocs' i18n middleware — Next picks it up via the `proxy.ts` filename convention this project uses).

## The MDX pipeline

1. `content/docs/**/*.mdx` sits on disk. Paths are `content/docs/<locale>/<game>/<category>/<slug>.mdx` (today `<game>` is always `lol`).
2. `source.config.ts` declares:
   - `frontmatterSchema` — one Zod v4 object, declared fresh (do not `.extend()` Fumadocs' re-export; crosses Zod instance boundary).
   - `defineDocs({ docs: { async: true, postprocess: { includeProcessedMarkdown: true } } })` — async MDX compile and a serialized processed-markdown copy on every page (used by `/llms-full.txt`).
   - `remarkImageOptions: { external: false, onError: "ignore" }` — skip prefetching dimensions of third-party images (postimg.cc, YouTube). Local `/public/wiki-images/*` still get dimensions.
   - `remarkPlugins: [remarkYouTube]` — rewrites bare YouTube URLs on their own line into `<YouTube/>` embeds. **Keep this list in sync with `previewRemarkPlugins` in `src/lib/draft/mdx-config.ts`** — the `/api/preview` route uses that copy.
   - `rehypeCodeOptions` — highlight themes + enabled langs (`bash`, `json`, `python`, `javascript`, `typescript`).
3. `fumadocs-mdx` compiles every `.mdx` at build; output lands in `.source/` (git-ignored).
4. `src/lib/source.ts` wraps it with `loader()` + `lucideIconsPlugin`, exposing:
   - `source.getPage(slug, lang)` — page lookup used by the docs route
   - `source.getPages()` — iteration (sitemap, LLM index)
   - `source.pageTree` — sidebar tree (per locale, Fumadocs-built; localized via `src/lib/tree-localization.ts`)
   - `source.generateParams()` — static params for prerender (prod only; dev skips for speed)
   - `getLLMIndex()` / `getLLMFullText()` — power `/llms.txt` and `/llms-full.txt`
5. `src/mdx-components.tsx` injects the components MDX authors can call. Current roster: `Callout`, `ParameterList`, `YouTube`, `PremiumCard`, `GlowCTA`, `LevelPill`, `ToolCard`, plus `Tabs`/`Tab` and `Accordions`/`Accordion` from Fumadocs UI. `img` is remapped to `ImageZoom`.

## Sidebar + nav

- **Top-level `content/docs/en/meta.json`** lists `["index", "lol"]`. The game segment (`lol`) is what shows up first in the sidebar.
- **Game-segment `content/docs/en/lol/meta.json`** has `root: true` (Fumadocs sidebar root) and orders the nine categories. Title pulls `{meta.lol.title}` from `messages/<locale>.json`.
- **Each category** has its own `meta.json` with `title`, `icon` (a **lucide-react** icon name — must exist in `lucide-react/dynamicIconImports`), and `pages` array (entries in the order you want them shown).
- Non-English locales inherit structure; translated titles come from Crowdin into `content/docs/<locale>/lol/**/meta.json`.
- `src/lib/layout.shared.tsx` declares the top nav (Docs / Contribute → /draft / Discord) and feeds both `HomeLayout` and `DocsLayout`.

## Submission flow

Three paths, all converging on a GitHub PR:

1. **`/draft` editor** — CodeMirror + live preview. Drafts persist to IndexedDB (`src/lib/draft/persistence.ts`). On submit, the editor forks the repo (if needed) and opens a PR via the GitHub REST API (`src/lib/draft/github.ts`). No backend, no Anthropic-style server — the OAuth happens client-side via GitHub device flow.
2. **Fumadocs "Edit on GitHub"** link on every page → GitHub's web editor → PR.
3. **Local fork + PR** for power users.

```
[creator opens /draft or clicks "Edit on GitHub"]
  → edits content/docs/en/lol/<category>/<slug>.mdx
  → opens PR <user>:<branch> → DivineSkins:main
[CF Pages deploys a preview per PR]
[Reviewers check preview + comment on GitHub]
[Merge → main = live at wiki.divineskins.gg]
```

`/docs/lol/contributing` walks creators through all three flows.

## Build pipeline

```
npm run build
  → scripts/prebuild.mjs       # writes src/git-info.json (branch, sha)
                               # also walks content/docs/en/<game>/<category>/
                               # and writes src/lib/draft/entity-index.json
                               # (the @-mention dataset the /draft editor uses)
  → next build
      → fumadocs-mdx compiles content to .source/
      → Next compiles routes
      → source.generateParams() prerenders docs pages per locale
      → sitemap + robots generated
```

`scripts/prebuild.mjs` reads `.git/HEAD` and refs with plain `node:fs` — no shell, no Bun. If `.git` is missing it writes `branch: "unknown"` and keeps going.

## CI

One required check: `.github/workflows/format-check.yml` runs Prettier in check mode against everything not covered by `.prettierignore` (which excludes non-English MDX so Crowdin-managed content doesn't churn).

The previous content-lint suite (markdownlint, lychee, cSpell, alt-text diff) was removed because it failed PRs on legitimate champion names and flaky third-party links, which discouraged drive-by "Edit on GitHub" contributions. Image `alt`, banned terms, and link hygiene are now enforced by reviewers using `docs/voice.md` and the new-guide checklist in `CLAUDE.md`.

## i18n + translation

- `src/lib/i18n.ts` declares four locales via `defineI18n`: `en`, `fr-FR`, `tr-TR`, `pt-BR`. Parser is `"dir"`.
- The i18n middleware lives in `src/app/proxy.ts` (Next's middleware entrypoint, named `proxy.ts` per the convention used in this project).
- `crowdin.yml` maps `content/docs/en/**/*.mdx` → `content/docs/<locale>/**/*.mdx` and `messages/en.json` → `messages/<locale>.json`.
- Crowdin weekly sync pushes translations back in; `.prettierignore` excludes non-English MDX so CI doesn't churn them.
- Sidebar tree is localized via `src/lib/tree-localization.ts` — translates `{meta.<key>}` interpolations against `messages/<locale>.json`.
- Missing translation: Fumadocs falls back to English silently (never 404).

## What lives outside `src/`

- `content/` — the MDX content itself (this is the product).
- `public/wiki-images/` — legacy migrated images. Add new images here and reference them as `/wiki-images/<file>`.
- `messages/` — i18n UI strings. Edit `en.json`; others are Crowdin-owned.
- `scripts/` — `prebuild.mjs` (always runs) + `migrate-content.mjs` (one-shot, idempotent).
- `.github/` — workflows, CODEOWNERS, PR/issue templates.
- `Reference/` — legacy Hytale + Divine Academy codebases. **Git-ignored. Never import from. Never modify.**

## Key file index

| File                                       | What to remember                                                                                                                                                |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next.config.mjs`                          | Image remotePatterns, redirects (`/contribute` → `/docs/lol/contributing`). **Don't** re-enable `experimental.viewTransition` (React 19.2 stable lacks it).     |
| `source.config.ts`                         | Frontmatter schema (fresh Zod object, not `.extend()`). `remarkYouTube` plugin. External-image prefetch disabled. Sync changes with `src/lib/draft/mdx-config.ts`. |
| `src/mdx-components.tsx`                   | Register new MDX components here so authors can use them.                                                                                                       |
| `src/lib/source.ts`                        | Fumadocs loader + lucide-icons plugin. Also exposes `getLLMIndex` / `getLLMFullText`.                                                                           |
| `src/lib/i18n.ts`                          | Locale list. Add new locales here + in `crowdin.yml` + `messages/<locale>.json`.                                                                                |
| `src/lib/layout.shared.tsx`                | Top nav links (Docs, Contribute → /draft, Discord).                                                                                                             |
| `src/lib/draft/mdx-config.ts`              | Runtime MDX pipeline used by `/api/preview`. Keep `previewRemarkPlugins` in sync with `source.config.ts` `remarkPlugins`.                                       |
| `src/lib/draft/github.ts`                  | GitHub device-flow auth + REST calls that fork the repo, commit the draft, and open the PR.                                                                     |
| `src/lib/draft/entity-index.json`          | Generated by prebuild. Lookups for the @-mention dropdown in the editor.                                                                                        |
| `src/app/proxy.ts`                         | i18n middleware (this is Next's middleware, named `proxy.ts` here).                                                                                             |
| `src/app/[lang]/docs/[[...slug]]/page.tsx` | The MDX page renderer. Don't put logic here — add it to `mdx-components.tsx` or a component.                                                                    |
| `src/app/[lang]/draft/`                    | The draft editor — CodeMirror, preview pane, toolbar, handoff (PR submit).                                                                                      |
| `src/app/llms.txt/route.ts`                | LLM-friendly page index. Pair with `/llms-full.txt` for the concatenated full text.                                                                             |
| `scripts/prebuild.mjs`                     | Runs before dev + build. Writes `src/git-info.json` and `src/lib/draft/entity-index.json`.                                                                      |
| `scripts/migrate-content.mjs`              | One-shot migration. Idempotent. Only rerun if reorganising categories wholesale.                                                                                |
