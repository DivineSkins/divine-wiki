# Architecture

How the wiki is wired. Read this before editing anything outside `content/`.

## Runtime shape

- **Next.js 16** (App Router, Turbopack dev, React 19.2 stable).
- **Fumadocs 16** renders docs pages from MDX; the rest of the app is plain Next.
- **Cloudflare Pages** runs the build as an SSR Next app; `public/_redirects` + `public/_headers` handle edge rules without a Function invocation.
- **No database.** All content is MDX in the repo. No server-side session, no user store.
- **One external data path at runtime**: GitHub API, from `/api/submit` (PR creation) and `/api/oauth/github` (login). Both cookie-scoped, 8h TTL.

## Request map

| Route | Handler | Notes |
|---|---|---|
| `/` | redirect → `/en` | `next.config.mjs` redirect (permanent) |
| `/en`, `/fr-FR`, `/tr-TR`, `/pt-BR` | `src/app/[lang]/(home)/page.tsx` | Landing (icon-tile grid) |
| `/{lang}/docs/{...slug}` | `src/app/[lang]/docs/[[...slug]]/page.tsx` | Fumadocs `DocsPage` + MDX |
| `/{lang}/contribute` | `src/app/[lang]/contribute/page.tsx` | MDXEditor (client-only, dynamic import, `ssr:false`) |
| `/api/oauth/github` | GitHub OAuth kickoff + callback | State CSRF cookie, sets `divine_gh_token` + `divine_gh_user` |
| `/api/submit` | POST contribute payload | Zod validates, 7-day account check, opens fork-based PR via `@octokit/rest`. Optional forward to `workers/submit-pr` if `CLOUDFLARE_SUBMIT_WORKER_URL` is set |
| `/api/upload-image` | POST image | Returns URL for the editor to inline. Today stubbed; future = R2 signed URL |
| `/api/og/docs/[lang]/[...slug]` | Dynamic OG image | Fumadocs' built-in generator |
| `/api/search` | Orama search index | Fumadocs built-in |
| `/api/health` | Liveness probe | Returns `{ok: true}` |
| `/sitemap*.xml`, `/robots.txt` | Next metadata routes | Auto-generated per locale |

## The MDX pipeline

1. `content/docs/**/*.mdx` sits on disk.
2. `source.config.ts` declares:
   - `frontmatterSchema` — one Zod v4 object, declared fresh (do not `.extend()` Fumadocs' re-export; crosses Zod instance boundary).
   - `remarkImageOptions: { external: false, onError: "ignore" }` — skip prefetching dimensions of third-party images (postimg.cc, YouTube). Local `/public/wiki-images/*` still get dimensions.
   - `rehypeCodeOptions` — highlight themes + enabled langs.
3. `fumadocs-mdx` compiles every `.mdx` at build; output lands in `.source/` (git-ignored).
4. `src/lib/source.ts` wraps it with `loader()`, exposing:
   - `source.getPage(slug, lang)` — page lookup used by the docs route
   - `source.getPages()` — iteration (sitemap, LLM index)
   - `source.pageTree` — sidebar tree (per locale, Fumadocs-built)
   - `source.generateParams()` — static params for prerender (prod only; dev skips for speed)
   - `getLLMIndex()` / `getLLMFullText()` — helpers for future `/llms.txt` endpoints
5. `src/mdx-components.tsx` injects the components MDX authors can call: `Callout`, `ParameterList`, `Tabs`/`Tab` (from `fumadocs-ui/components/tabs`), `img` overridden to `ImageZoom`.

## Sidebar + nav

- **Top-level order** comes from `content/docs/en/meta.json` (`pages: [...]`).
- **Each category** has its own `meta.json` with `title`, `icon` (a **lucide-react** icon name — must exist in `lucide-react/dynamicIconImports`), and `pages` array (entries in the order you want them shown).
- Non-English locales inherit structure; translated titles come from Crowdin into `content/docs/<locale>/**/meta.json`.
- `src/lib/layout.shared.tsx` declares the top nav (Guides / Contribute / Discord) and feeds both `HomeLayout` and `DocsLayout`.

## Submission flow (internals)

Start: `src/components/editor/GuideEditor.tsx` holds editor state + draft autosave (`useDraft` → localStorage + IndexedDB via `idb-keyval`, 400 ms debounce).

```
[creator types]
  → useDraft writes to localStorage + IndexedDB
  → hits Submit → <SubmitDialog> opens
  → if no divine_gh_user cookie, shows "Sign in with GitHub"
      → /api/oauth/github?start=1&return=... (state cookie set)
      → GitHub OAuth
      → /api/oauth/github?code=... (state verified, token exchanged)
      → sets divine_gh_token (httpOnly, 8h) + divine_gh_user (readable, 8h)
      → redirects back to return URL
  → POST /api/submit { frontmatter, slug, mdx, discord? }
      → Zod validation
      → Account-age check (reject < 7 days)
      → Ensures fork exists (POST /repos/{owner}/{repo}/forks; idempotent)
      → Syncs the fork's main to upstream main
      → Creates branch `contrib/<user>/<slug>-<timestamp>` from main
      → PUT file at `content/docs/en/<category>/<slug>.mdx`
      → Opens PR `<user>:<branch>` → `DivineSkins:main`
  → Response: { prUrl, prNumber, branch }
  → SubmitDialog shows "View PR on GitHub"
[CF Pages deploys a preview per PR]
[Reviewers check preview + comment on GitHub]
[Merge → main = live at wiki.divineskins.gg]
```

The Worker path (`workers/submit-pr/`) is a drop-in mirror for edge execution with KV rate-limit counters and Turnstile verification; set `CLOUDFLARE_SUBMIT_WORKER_URL` to route through it.

## Build pipeline

```
npm run build
  → scripts/prebuild.mjs       # writes src/git-info.json (branch, sha)
  → next build
      → fumadocs-mdx compiles content to .source/
      → Next compiles routes
      → source.generateParams() prerenders docs pages per locale
      → sitemap + robots generated
```

`scripts/prebuild.mjs` reads `.git/HEAD` and refs with plain `node:fs` — no shell, no Bun. If `.git` is missing it writes `branch: "unknown"` and keeps going.

## CI / content gates

`.github/workflows/content-lint.yml` runs on every PR:
- **markdownlint** — structure
- **lychee** — broken links (accepts 429; excludes wiki/api divineskins domains)
- **Vale** (`styles/Divine/`) — `BannedTerms.yml` (errors), `FancyWords.yml` (warnings)
- **cSpell** — with Divine dictionary (champion names, skin lines, LoL jargon)
- **Inline alt-text diff check** — fails if the PR adds `<img>` with no `alt`

`.github/workflows/format-check.yml` runs Prettier in check mode.

Both are required before merge.

## i18n + translation

- `src/lib/i18n.ts` declares four locales: `en`, `fr-FR`, `tr-TR`, `pt-BR`.
- `crowdin.yml` maps `content/docs/en/**/*.mdx` → `content/docs/<locale>/**/*.mdx` and `messages/en.json` → `messages/<locale>.json`.
- Crowdin weekly sync pushes translations back in; `.prettierignore` excludes non-English MDX so CI doesn't churn them.
- Missing translation: Fumadocs falls back to English silently (never 404).

## What lives outside `src/`

- `content/` — the MDX content itself (this is the product).
- `public/wiki-images/` — legacy migrated images. New images flow through `/api/upload-image` → R2 (future).
- `messages/` — i18n UI strings. Edit `en.json`; others are Crowdin-owned.
- `scripts/` — `prebuild.mjs` (always runs) + `migrate-content.mjs` (one-shot, idempotent).
- `workers/submit-pr/` — optional Cloudflare Worker mirror of `/api/submit`.
- `styles/Divine/` — Vale rules (source of truth for banned terms + fancy-word warnings).
- `.github/` — workflows, CODEOWNERS, PR/issue templates.
- `Reference/` — legacy Hytale + Divine Academy codebases. **Git-ignored. Never import from. Never modify.**

## Key file index

| File | What to remember |
|---|---|
| `next.config.mjs` | Image remotePatterns, redirects. **Don't** re-enable `experimental.viewTransition` (React 19.2 stable lacks `ViewTransition`). |
| `source.config.ts` | Frontmatter schema. Fresh Zod object, not `.extend()`. External-image prefetch disabled. |
| `src/mdx-components.tsx` | Register new MDX components here so authors can use them. |
| `src/lib/source.ts` | Fumadocs loader. Also exposes LLM helpers. |
| `src/lib/i18n.ts` | Locale list. Add new locales here + in `crowdin.yml`. |
| `src/lib/layout.shared.tsx` | Top nav links. |
| `src/app/[lang]/docs/[[...slug]]/page.tsx` | The MDX page renderer. Don't put logic here — add it to `mdx-components.tsx` or a component. |
| `src/app/api/submit/route.ts` | PR creation. Change Zod schema here if submission payload changes. |
| `src/app/api/oauth/github/route.ts` | OAuth. Kickoff vs callback branch by `start=1` query flag. |
| `src/components/editor/GuideEditor.tsx` | Editor wrapper. Dynamic import with `ssr:false` because MDXEditor hits `window`. |
| `scripts/prebuild.mjs` | Runs before dev + build. Writes `src/git-info.json`. |
| `scripts/migrate-content.mjs` | One-shot migration. Idempotent. Only rerun if reorganising categories wholesale. |
