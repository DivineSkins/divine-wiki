# CLAUDE.md

Project-level guidance for Claude Code. Read on every turn, so keep it tight.

## What this is

The Divine Skins community wiki — guides for making custom skins for **League of Legends**. Next.js 16 + Fumadocs + MDX, hosted on Cloudflare Pages. Live at `https://wiki.divineskins.gg`.

Audience is **creators** (people building skins with Maya, Blender, VFX tools). End-users who only install skins are served by the Celestial launcher and Discord — not the wiki.

## Commands

```bash
npm install               # install (uses package-lock.json, no Bun here)
npm run dev               # prebuild + next dev → http://localhost:3000
npm run build             # prebuild + next build
npm run lint              # ESLint (next-core-web-vitals)
npm run format            # Prettier write
npm run format:check      # Prettier check (same as CI)
npm run types:check       # fumadocs-mdx + tsc --noEmit

node scripts/migrate-content.mjs   # one-shot content migration; idempotent
node scripts/prebuild.mjs          # regenerates src/git-info.json
```

CI runs on every PR: `.github/workflows/format-check.yml` (Prettier). Content checks (markdownlint, link check, spell check, alt-text guard) were removed in favor of trust + review — failing CI on legitimate champion names or third-party link flakes scared off Edit-on-GitHub contributors. Image `alt` and the banned-term list are still enforced by reviewers per `docs/voice.md`.

## Directory layout

```
content/docs/en/lol/      Creator guides for League of Legends. `lol/` is a
                          "game segment" — future games (Valorant, etc.) get
                          their own sibling segment. Nine categories live
                          under it (eight content + `contributing`), each with
                          its own meta.json. The top-level content/docs/en/meta.json
                          just lists ["index", "lol"].
content/docs/<locale>/lol/  Crowdin-populated translations. Never hand-edit.
docs/                     AI-context pack (product, voice, playbook, this file).
                          product.md, voice.md, playbook.md are load-bearing.
messages/<locale>.json    UI strings. en.json is source of truth; others via Crowdin.
public/                   Static assets. /wiki-images/* are legacy migrated images.
                          /_redirects and /_headers are Cloudflare Pages edge config.
scripts/                  prebuild.mjs (git-info + entity index) and one-shot
                          migrate-content.mjs.
src/app/                  App Router. Root layout passes children through; [lang]/
                          layout.tsx sets html, body, fonts, RootProvider.
src/app/[lang]/docs/      Docs pages (DocsLayout + MDX renderer).
src/app/[lang]/draft/     In-browser MDX draft editor (CodeMirror + live preview).
                          ?edit=<path> edits an existing page; ?new=<category>
                          starts a fresh one. Opens a PR via src/lib/draft/github.ts.
src/app/api/              health, og, search, preview — read-only, no secrets.
                          /api/preview renders draft MDX server-side for the editor.
src/app/llms.txt/         /llms.txt + /llms-full.txt routes for LLM crawlers.
src/app/proxy.ts          Fumadocs i18n middleware (this is Next's middleware —
                          named proxy.ts in this project, not middleware.ts).
src/components/ui/        shadcn primitives (copied once, don't rely on CLI).
src/components/mdx/       Components exposed to MDX authors. Current roster:
                          Callout, ParameterList, YouTube, PremiumCard, GlowCTA,
                          LevelPill, ToolCard. Plus Accordions/Accordion from
                          fumadocs-ui. `img` is remapped to ImageZoom.
src/lib/source.ts         Fumadocs source loader + getLLMIndex / getLLMFullText.
src/lib/draft/            Draft-editor internals: GitHub PR flow, MDX preview
                          config, entity mention extension, IndexedDB persistence,
                          link scanner, slug helpers.
src/lib/remark-youtube.ts Rewrites bare YouTube URLs on their own line into <YouTube/>.
src/lib/layout.shared.tsx Nav config used by both home and docs layouts.
src/lib/i18n.ts           Fumadocs i18n (en, fr-FR, tr-TR, pt-BR — top markets).
Reference/                Legacy codebases (Hytale + Divine Academy). IGNORE.
```

The nine categories under `lol/` are: `guided-walkthrough`, `tools`, `maya`, `blender`, `animations`, `vfx-bins`, `assets-library`, `errors`, `contributing`. Sidebar order is set in `content/docs/en/lol/meta.json`.

## Stack

| Layer         | Pick                                                                            |
| ------------- | ------------------------------------------------------------------------------- |
| Framework     | Next.js 16 (App Router, Turbopack dev)                                          |
| MDX engine    | Fumadocs 16.2.3 (core, mdx, ui) — sidebar from meta.json, Orama search, OG API  |
| UI            | Tailwind v4 + shadcn (new-york) + Radix primitives                              |
| Auth          | None — site is fully static                                                     |
| Contributions | GitHub-native: in-browser /draft editor (opens PR), Fumadocs "Edit on GitHub" link, or local fork + PR |
| i18n          | Fumadocs i18n + Crowdin. Scope: en, fr-FR, tr-TR, pt-BR                         |
| Hosting       | Cloudflare Pages (Next.js SSR mode). \_redirects + \_headers at edge            |
| Analytics     | PostHog (cookieless, currently disabled pending key)                            |

## Conventions

- **Files**: kebab-case `.mdx`, one file per guide. Don't reuse slugs.
- **Frontmatter**: `title` required. `description` (~160 char) strongly recommended. `category` auto-set by path. Optional: `authors`, `patch`, `icon`, `full`.
- **Headings**: H1 is set by `title` frontmatter — start content at `##`.
- **Images**: drop new files into `public/wiki-images/` and reference as `<img src="/wiki-images/..." alt="...">` (legacy migrated images live there too; future: R2 CDN URL).
- **Links**: relative paths preferred. `/docs/...` absolute paths work. Never `/wiki/...` — that's legacy.
- **MDX quirks**:
  - `<` before a digit (e.g. `<3`, `<60k`) must be escaped as `\<3`.
  - Every `<Tabs>` needs a matching `</Tabs>`. Every `<Tab value="x">` needs `</Tab>`. Blank lines between JSX and Markdown content.
  - Code fences must balance. Don't nest them.
- **Voice**: read `docs/voice.md` before writing anything user-facing. **Banned terms**: `skin hack`, `skin changer`, `unlock skins`, `undetectable`, `free-to-play skins`, `exploit`. Use: `custom skin`, `safe`, `customize`, `download`.
- **Never recommend custom skins on Korean or Chinese servers.** Anti-cheat blocks all mods there; accounts get banned.
- **TypeScript**: strict; path alias `@/*` → `src/*`.
- **Commits**: Conventional Commits preferred, not required. No Claude co-author trailers, no emoji.

## Environment variables

See `.env.example` for the full list. None are required for local dev or for production builds — the site is fully static. The runtime API routes (`health`, `og`, `search`) need no secrets. `NEXT_PUBLIC_POSTHOG_*` and `NEXT_PUBLIC_DIVINE_API_URL` are optional. `CROWDIN_PROJECT_ID` + `CROWDIN_PERSONAL_TOKEN` are CI-only for translation sync.

## Known gotchas — save yourself time

1. **Fumadocs ships a nested Zod v4.** Don't `.extend()` the re-exported `frontmatterSchema` — it crosses Zod-instance boundaries and throws `Invalid element at key "X": expected a Zod schema`. Declare the schema fresh in `source.config.ts` (we already do).
2. **React 19.2 stable does NOT export `ViewTransition`.** Only React 19 Canary does. Don't `import { ViewTransition } from "react"` — it's `undefined` at runtime and collapses the page with `Element type is invalid`.
3. **External images in MDX timeout the build.** Legacy content links to `postimg.cc` and YouTube thumbnails; Fumadocs' remark-image plugin prefetches dimensions by default. `source.config.ts` sets `remarkImageOptions: { external: false, onError: "ignore" }` — keep it that way.
4. **Turbopack caches `source.config.ts` compiled output in `.source/`.** If a config edit doesn't seem to take effect, `rm -rf .next .source` and restart `npm run dev`.
5. **`z.looseObject` is not exposed** by the top-level zod install. Don't use it; plain `z.object({})` is fine.
6. **`scripts/prebuild.mjs`** reads `.git/HEAD` and refs directly (pure Node, no shell). It also walks `content/docs/en/<game>/<category>/` levels to write `src/lib/draft/entity-index.json` — the index the /draft editor's @-mention dropdown uses. Safe to run anywhere; if `.git` is missing it writes `branch: "unknown"` and continues.
7. **Localized pages** (fr-FR, tr-TR, pt-BR) are **Crowdin-managed**. Never hand-edit `content/docs/fr-FR/**` or similar — they get overwritten by the weekly sync.
8. **`.prettierignore` excludes non-English MDX** from format so Crowdin-managed content doesn't churn.
9. **`Reference/` is git-ignored and read-only for our purposes.** Two big reference codebases live there (Hytale Modding's Fumadocs site we scaffolded from, and the legacy Divine Academy site). Do not modify or import from them.
10. **`/draft` editor uses two MDX pipelines.** Build-time uses `source.config.ts` (fumadocs-mdx). Runtime preview uses `src/lib/draft/mdx-config.ts` via `/api/preview`. If you add a remark/rehype plugin to one, mirror it in the other or the editor preview will diverge from the published page.
11. **Middleware file is `src/app/proxy.ts`, not `middleware.ts`.** Fumadocs' i18n middleware factory is what's exported. Don't rename it; Next still picks it up via the `proxy.ts` convention used here.

## When adding a new guide (sanity checklist)

- [ ] File at `content/docs/en/lol/<category>/<slug>.mdx`, kebab-case
- [ ] Frontmatter has `title` + `description`
- [ ] `meta.json` in that category updated with the slug in the right order
- [ ] No banned terms (see `docs/voice.md`)
- [ ] All `<img>` have `alt="..."`
- [ ] Images ≤ 500 KB (more = slow Pages build)
- [ ] Safety callout near the top if the guide touches install or regions
- [ ] `npm run dev` boots and the new page renders at `/en/docs/lol/<category>/<slug>`

## What NOT to do

- Don't hand-edit non-English MDX (Crowdin overwrites it).
- Don't import from `Reference/` — those are legacy reference-only codebases.
- Don't add dependencies for one-off utilities — check `src/lib/` first.
- Don't put business logic in `src/app/api/` routes; they're thin wrappers.
- Don't use `<ViewTransition>` from React (Canary-only) — we're on stable.
- Don't re-enable `experimental.viewTransition` in `next.config.mjs` without upgrading React first.
- Don't commit `bun.lock` — this project uses npm locally.
- Don't `git push --force` to `main`. Feature branches only.
