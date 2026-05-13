# Backend Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Delete the in-site contribution backend (OAuth, `/api/submit`, MDXEditor, Cloudflare Worker) and replace it with a static "How to Contribute" docs page that explains the GitHub fork-and-PR flow. Site collapses to a pure Cloudflare Pages static deploy.

**Architecture:** Build the replacement docs page first, rewire nav and homepage CTA to it, add 301 redirects from the old `/contribute` URL, then delete the backend in dependency order: page → API routes → workers → libs → deps → env → docs. Each commit leaves the site in a working state.

**Tech Stack:** Next.js 16 (App Router) + Fumadocs 16.2.3 (MDX, sidebar via `meta.json`, Orama search, OG API) + Tailwind v4 + Cloudflare Pages. Icons are lucide-react names referenced as strings in `meta.json` (resolved by `fumadocs-core/source/lucide-icons` in `src/lib/source.ts`).

**Spec:** [`docs/superpowers/specs/2026-05-13-backend-removal-design.md`](../specs/2026-05-13-backend-removal-design.md)

---

## Task 1: Create the new "Contributing" docs category

**Files:**
- Create: `content/docs/en/contributing/meta.json`
- Create: `content/docs/en/contributing/index.mdx`
- Modify: `content/docs/en/meta.json`
- Modify: `messages/en.json` (add `meta.contributing.title`)

- [ ] **Step 1: Verify the new route currently 404s**

Run: `npm run dev` in one terminal; in another, `curl -sI http://localhost:3000/en/docs/contributing | head -1`
Expected: `HTTP/1.1 404 Not Found`. Stop the dev server before proceeding.

- [ ] **Step 2: Create `content/docs/en/contributing/meta.json`**

```json
{
  "title": "{meta.contributing.title}",
  "icon": "GitPullRequest",
  "pages": ["index"]
}
```

- [ ] **Step 3: Add the meta key in `messages/en.json`**

Find the `"meta": { ... }` block (around line 50) and add this key alphabetically near the others (after `"blender"`, before `"errors"`):

```json
    "contributing": {
      "title": "Contributing"
    },
```

- [ ] **Step 4: Add `"contributing"` to the top-level sidebar order**

In `content/docs/en/meta.json`, append `"contributing"` to the `pages` array:

```json
{
  "title": "Divine Skins Wiki",
  "pages": [
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

- [ ] **Step 5: Create `content/docs/en/contributing/index.mdx`**

Write this file. Stay in plain English per `docs/voice.md`: short sentences, verb-first instructions, no banned terms (`skin hack`, `skin changer`, `unlock skins`, `undetectable`, `free-to-play skins`, `exploit`).

```mdx
---
title: How to Contribute
description: Edit guides or write new ones. Two paths — one in the browser, one local. Both end with a pull request a maintainer reviews and merges.
---

The Divine Skins Wiki is a public GitHub repo. Every guide is a Markdown file. To change a guide or add one, open a pull request. A maintainer reviews it, then merges. The merge ships the change live within minutes.

## Two ways to contribute

| Path | Best for | What you need |
|---|---|---|
| **Edit in browser** | Fixes, typos, single-page changes | A GitHub account |
| **Edit locally** | New categories, big rewrites, image-heavy guides | Node 22+, Git, an editor |

If you only want to fix a typo, use **Edit in browser**. It takes one minute.

## Edit in browser

1. Open the guide you want to fix.
2. Scroll to the bottom. Click **Edit on GitHub**.
3. On GitHub, click the pencil icon (top right of the file).
4. Make your changes.
5. Scroll down. Pick "Create a new branch for this commit and start a pull request".
6. Click **Propose changes**, then **Create pull request**.

That's it. A maintainer will see it, review it, and merge it.

## Edit locally

Use this path for new pages, new categories, or anything image-heavy.

1. Fork the repo at [github.com/DivineSkins/divine-wiki](https://github.com/DivineSkins/divine-wiki).
2. Clone your fork:
   ```bash
   git clone https://github.com/<your-username>/divine-wiki.git
   cd divine-wiki
   ```
3. Install:
   ```bash
   npm install
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000`. Confirm the site loads.
6. Make a branch:
   ```bash
   git checkout -b add-my-guide
   ```
7. Make your changes (see **Add a new guide** below).
8. Commit, push, open a pull request to `main`.

## Add a new guide

A guide is one `.mdx` file under `content/docs/en/<category>/`.

1. Pick a category (e.g. `tools`, `maya`, `blender`).
2. Create a file like `content/docs/en/tools/my-tool.mdx`. Use kebab-case for the filename.
3. Paste this template:

   ```mdx
   ---
   title: My Tool
   description: One sentence about what this is and who it's for. About 160 characters.
   ---

   ## What it is

   Write here.
   ```

4. Open `content/docs/en/<category>/meta.json`. Add your slug to the `pages` array in the position you want it to appear in the sidebar.
5. Run `npm run dev` and confirm your page renders at `/en/docs/<category>/<slug>`.
6. Commit and open a PR.

## Add images

Drop images into `public/wiki-images/` in the same pull request. Reference them in your guide like this:

```mdx
<img src="/wiki-images/your-screenshot.png" alt="Short description of the image" />
```

Rules:

- Filenames use lowercase and dashes (`my-screenshot.png`, not `My Screenshot.png`).
- Every image needs an `alt` attribute. The lint check blocks merges otherwise.
- Keep each file under **500 KB**. Bigger files slow the site build.
- PNG for screenshots, JPG for photos. WebP is fine too.

## What happens after you open a PR

1. Cloudflare Pages builds a preview. It posts a link as a comment on your PR — open it to see your changes live.
2. CI runs lint checks: spelling, dead links, Markdown style, alt-text. Fix anything it flags.
3. A maintainer reviews. They may ask for small changes.
4. Once approved, the PR gets merged. Within a few minutes, your change is live on `wiki.divineskins.gg`.

## Style and safety rules

Before you write, read [the voice guide](https://github.com/DivineSkins/divine-wiki/blob/main/docs/voice.md). Reviewers reject PRs that miss the voice.

A few rules that block merges:

- **Banned words.** Don't write `skin hack`, `skin changer`, `unlock skins`, `undetectable`, `free-to-play skins`, or `exploit`. Use `custom skin`, `safe`, `customize`, or `download` instead.
- **No KR / CN server advice.** Never tell readers to use custom skins on Korean or Chinese League servers. Anti-cheat there is strict. Accounts get banned.
- **Safety callouts.** Any guide that touches install or region settings needs a warning callout near the top.

## Need help?

- **Voice or style questions:** check [`docs/voice.md`](https://github.com/DivineSkins/divine-wiki/blob/main/docs/voice.md) and [`docs/playbook.md`](https://github.com/DivineSkins/divine-wiki/blob/main/docs/playbook.md).
- **Bigger changes (new category, restructure, mass rename):** start a thread in `#wiki-proposals` on Discord first. Saves you from doing work that gets rejected.
- **Stuck on Git or the editor:** ask in `#wiki-help` on Discord.
```

- [ ] **Step 6: Verify the new page renders**

Run: `npm run dev`. In a browser, open `http://localhost:3000/en/docs/contributing`.
Expected: the page renders with the title "How to Contribute" and the content above. The sidebar shows a "Contributing" entry at the bottom (with the GitPullRequest icon).
Stop the dev server before proceeding.

- [ ] **Step 7: Type-check and lint**

Run:
```bash
npm run types:check && npm run lint
```
Expected: both pass.

- [ ] **Step 8: Commit**

```bash
git add content/docs/en/contributing/ content/docs/en/meta.json messages/en.json
git commit -m "docs(contributing): add How to Contribute guide and sidebar entry"
```

---

## Task 2: Rewire navigation and homepage CTA to new page

**Files:**
- Modify: `src/lib/layout.shared.tsx` (the `nav.contribute` entry)
- Modify: `src/app/[lang]/(home)/page.tsx` (the homepage `ctaContribute` button)

- [ ] **Step 1: Locate the nav entry**

Open `src/lib/layout.shared.tsx`. Find the section that defines `nav.contribute` — currently around line 49 with `url: `/${locale}/contribute``.

- [ ] **Step 2: Change the nav URL**

Replace `url: \`/${locale}/contribute\`,` with `url: \`/${locale}/docs/contributing\`,`.

Exact change:
```diff
       {
         icon: <PencilIcon />,
         text: messages.nav.contribute,
-        url: `/${locale}/contribute`,
+        url: `/${locale}/docs/contributing`,
       },
```

- [ ] **Step 3: Update the homepage CTA**

Open `src/app/[lang]/(home)/page.tsx`. Find the `GlowCTA` with `href={\`/${lang}/contribute\`}` around line 42.

Exact change:
```diff
-          <GlowCTA href={`/${lang}/contribute`} size="lg" variant="ghost">
+          <GlowCTA href={`/${lang}/docs/contributing`} size="lg" variant="ghost">
             <PencilLineIcon className="size-4" aria-hidden />
             {t.ctaContribute}
           </GlowCTA>
```

- [ ] **Step 4: Verify in dev**

Run: `npm run dev`. In a browser:
1. Visit `http://localhost:3000/en` (homepage). Click "Write a guide" — should land on `/en/docs/contributing`.
2. Click "Contribute" in the top nav from any page — should land on `/en/docs/contributing`.

Stop the dev server.

- [ ] **Step 5: Lint and types**

Run:
```bash
npm run types:check && npm run lint
```
Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/layout.shared.tsx "src/app/[lang]/(home)/page.tsx"
git commit -m "feat(nav): point Contribute link to /docs/contributing"
```

---

## Task 3: Add `/contribute` → `/docs/contributing` redirects

**Files:**
- Modify: `public/_redirects` (Cloudflare Pages edge redirects)
- Modify: `next.config.mjs` (local dev fallback)

- [ ] **Step 1: Add redirects to `public/_redirects`**

Open `public/_redirects`. Append these lines at the end:

```
/en/contribute     /en/docs/contributing    301
/fr-FR/contribute  /fr-FR/docs/contributing 301
/tr-TR/contribute  /tr-TR/docs/contributing 301
/pt-BR/contribute  /pt-BR/docs/contributing 301
/contribute        /en/docs/contributing    301
```

Final file should look like:
```
# Cloudflare Pages `_redirects` — evaluated at the edge, zero Function cost.
# Next.js redirects() in next.config.mjs stay for local dev + as a fallback.

/ /en 301
/docs /en/docs 302
/docs/* /en/docs/:splat 302

/en/contribute     /en/docs/contributing    301
/fr-FR/contribute  /fr-FR/docs/contributing 301
/tr-TR/contribute  /tr-TR/docs/contributing 301
/pt-BR/contribute  /pt-BR/docs/contributing 301
/contribute        /en/docs/contributing    301
```

- [ ] **Step 2: Add fallback redirect in `next.config.mjs`**

Open `next.config.mjs`. Find the `async redirects() { return [ ... ] }` block (around line 28). Add a new entry to the array:

```diff
   async redirects() {
     return [
       {
         source: "/docs/:path*",
         destination: "/en/docs/:path*",
         permanent: false,
       },
       {
         source: "/docs",
         destination: "/en/docs",
         permanent: false,
       },
       {
         source: "/",
         destination: "/en",
         permanent: true,
       },
+      {
+        source: "/:lang/contribute",
+        destination: "/:lang/docs/contributing",
+        permanent: true,
+      },
+      {
+        source: "/contribute",
+        destination: "/en/docs/contributing",
+        permanent: true,
+      },
     ];
   },
```

- [ ] **Step 3: Verify the dev-mode redirect works**

Run: `npm run dev`. In a browser, visit `http://localhost:3000/en/contribute`.
Expected: redirects to `http://localhost:3000/en/docs/contributing`.

Also try `http://localhost:3000/contribute` → should land on `/en/docs/contributing`.

Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add public/_redirects next.config.mjs
git commit -m "feat(redirects): 301 old /contribute paths to /docs/contributing"
```

---

## Task 4: Delete the OAuth API route

**Files:**
- Delete: `src/app/api/oauth/` (entire directory)
- Delete: `src/lib/github-oauth.ts`

- [ ] **Step 1: Confirm what's about to be deleted**

Run:
```bash
ls -R src/app/api/oauth/
ls -la src/lib/github-oauth.ts
```
Expected: lists `github/route.ts` (or similar) and the `github-oauth.ts` helper file.

- [ ] **Step 2: Delete the OAuth route directory**

Run:
```bash
rm -rf src/app/api/oauth/
```

- [ ] **Step 3: Delete the OAuth helper lib**

Run:
```bash
rm src/lib/github-oauth.ts
```

- [ ] **Step 4: Confirm no remaining references**

Run:
```bash
grep -rEn "github-oauth|/api/oauth|GITHUB_OAUTH" src/ workers/ 2>/dev/null
```
Expected: matches only inside files that will be deleted in Tasks 5 and 6 (`src/app/[lang]/contribute/`, `src/components/editor/`, `workers/submit-pr/`). No matches elsewhere.

If anything else matches (e.g., something in `src/app/api/health/` or `src/lib/` outside the deleted file), STOP and investigate. Do not proceed to commit.

- [ ] **Step 5: Commit**

```bash
git add -A src/app/api/oauth/ src/lib/github-oauth.ts
git commit -m "chore: remove GitHub OAuth route and helper"
```

(Note: `git add -A` on a deleted directory stages the deletion. If the path no longer exists, that's correct — git tracks the removal from the index.)

---

## Task 5: Delete the submit and upload-image API routes

**Files:**
- Delete: `src/app/api/submit/`
- Delete: `src/app/api/upload-image/`

- [ ] **Step 1: Confirm what's about to be deleted**

Run:
```bash
ls -R src/app/api/submit/ src/app/api/upload-image/
```
Expected: each has at least `route.ts`.

- [ ] **Step 2: Delete both route directories**

Run:
```bash
rm -rf src/app/api/submit/ src/app/api/upload-image/
```

- [ ] **Step 3: Confirm what remains in `src/app/api/`**

Run:
```bash
ls src/app/api/
```
Expected: only `health`, `og`, `search`.

- [ ] **Step 4: Confirm no remaining references**

Run:
```bash
grep -rEn "/api/submit|/api/upload-image|octokit" src/ workers/ 2>/dev/null
```
Expected: matches only in `src/app/[lang]/contribute/`, `src/components/editor/`, or `workers/submit-pr/` (all of which get deleted in the next two tasks).

- [ ] **Step 5: Commit**

```bash
git add -A src/app/api/submit/ src/app/api/upload-image/
git commit -m "chore: remove submit and upload-image API routes"
```

---

## Task 6: Delete the `/contribute` page and editor components

**Files:**
- Delete: `src/app/[lang]/contribute/` (entire directory)
- Delete: `src/components/editor/` (entire directory)

- [ ] **Step 1: Confirm what's about to be deleted**

Run:
```bash
ls "src/app/[lang]/contribute/" src/components/editor/
```
Expected:
- `contribute/`: `ContributeClient.tsx`, `page.tsx`
- `editor/`: `GuideEditor.tsx`, `SubmitDialog.tsx`, `autosave.ts`

- [ ] **Step 2: Delete both directories**

Run:
```bash
rm -rf "src/app/[lang]/contribute/" src/components/editor/
```

- [ ] **Step 3: Confirm no stale imports anywhere in `src/`**

Run:
```bash
grep -rEn "components/editor|app/\[lang\]/contribute|GuideEditor|SubmitDialog|useDraft|autosave" src/ 2>/dev/null
```
Expected: no matches.

If any match exists, fix the import or delete the orphaned file before continuing.

- [ ] **Step 4: Verify the build still succeeds**

Run:
```bash
npm run build
```
Expected: build completes without `Module not found` errors.

- [ ] **Step 5: Commit**

```bash
git add -A "src/app/[lang]/contribute/" src/components/editor/
git commit -m "chore: remove /contribute page and MDXEditor components"
```

---

## Task 7: Delete the optional Cloudflare submit-pr Worker

**Files:**
- Delete: `workers/submit-pr/` (entire directory)

- [ ] **Step 1: Confirm what's about to be deleted**

Run:
```bash
ls -R workers/submit-pr/
```
Expected: lists files like `wrangler.toml`, `src/index.ts`, etc.

- [ ] **Step 2: Delete the directory**

Run:
```bash
rm -rf workers/submit-pr/
```

- [ ] **Step 3: Decide whether to delete the `workers/` parent**

Run:
```bash
ls workers/ 2>/dev/null
```

If `workers/` is now empty, remove it:
```bash
rmdir workers/
```

If anything else lives there, leave it.

- [ ] **Step 4: Commit**

```bash
git add -A workers/
git commit -m "chore: remove submit-pr Cloudflare Worker"
```

---

## Task 8: Remove backend dependencies from `package.json`

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json` (regenerated by `npm install`)

- [ ] **Step 1: Confirm current deps before removal**

Run:
```bash
grep -E '"(@mdxeditor|@octokit)/' package.json
```
Expected: at least `@mdxeditor/editor` and `@octokit/rest` appear.

- [ ] **Step 2: Search for any other `@mdxeditor/*` packages**

Run:
```bash
grep -E '"@mdxeditor/' package.json
```

If only `@mdxeditor/editor` shows, that's all. If others appear (e.g., plugins), list them all in step 3.

- [ ] **Step 3: Uninstall the packages**

Run:
```bash
npm uninstall @mdxeditor/editor @octokit/rest
```

(Append any extra `@mdxeditor/*` packages found in Step 2.)

This rewrites both `package.json` and `package-lock.json`.

- [ ] **Step 4: Confirm removal**

Run:
```bash
grep -E '"(@mdxeditor|@octokit)"' package.json
```
Expected: no matches.

Run:
```bash
grep -E '(@mdxeditor|@octokit)' package-lock.json | head -5
```
Expected: no matches (the lockfile is clean of these packages and their transitives).

- [ ] **Step 5: Verify the build still passes**

Run:
```bash
npm run build
```
Expected: build completes without `Module not found` errors.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): remove @mdxeditor/editor and @octokit/rest"
```

---

## Task 9: Strip OAuth/Worker/Turnstile env vars from `.env.example`

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Confirm current env block**

Run:
```bash
grep -E "(GITHUB_OAUTH|CLOUDFLARE_SUBMIT_WORKER|TURNSTILE)" .env.example
```
Expected: 4 matches.

- [ ] **Step 2: Rewrite `.env.example`**

Replace the file with this content (preserves the keys that are still in use):

```
# Base URL for the application (used for metadata links and OpenGraph images)
NEXT_PUBLIC_BASE_URL=https://wiki.divineskins.gg

# Divine Skins API (fetched at build time for <ChampionCard /> and <SkinEmbed /> components)
NEXT_PUBLIC_DIVINE_API_URL=https://api.divineskins.gg

# PostHog cookieless tracking (optional)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_API_HOST=
NEXT_PUBLIC_POSTHOG_UI_HOST=https://eu.posthog.com

# Crowdin (used in CI only, not at runtime)
CROWDIN_PROJECT_ID=
CROWDIN_PERSONAL_TOKEN=
```

- [ ] **Step 3: Confirm the unwanted keys are gone**

Run:
```bash
grep -E "(GITHUB_OAUTH|CLOUDFLARE_SUBMIT_WORKER|TURNSTILE)" .env.example
```
Expected: no matches.

- [ ] **Step 4: Commit**

```bash
git add .env.example
git commit -m "chore(env): remove OAuth, Worker, and Turnstile vars"
```

---

## Task 10: Remove unused `contribute` block from `messages/en.json`

**Files:**
- Modify: `messages/en.json`

The `messages.contribute` object (editor strings: `editorTab`, `signInGithub`, etc.) was only consumed by `src/app/[lang]/contribute/page.tsx`, which was deleted in Task 6. Keep `nav.contribute` and `home.ctaContribute` — those labels still appear in the rewired nav/CTA.

- [ ] **Step 1: Confirm nothing references the block**

Run:
```bash
grep -rEn "messages\.contribute\.|messages\[\"contribute\"\]" src/ 2>/dev/null
```
Expected: no matches.

- [ ] **Step 2: Remove the block**

Open `messages/en.json`. Find this block (around lines 29–39):

```json
  "contribute": {
    "title": "Write a guide",
    "subtitle": "Your guide ships as a pull request. Sign in with GitHub when you're ready to submit.",
    "editorTab": "Visual editor",
    "uploadTab": "Upload .mdx",
    "signInGithub": "Sign in with GitHub",
    "submit": "Submit for review",
    "draftSaved": "Draft saved",
    "draftRestored": "Draft restored from {ago}",
    "manualLink": "Prefer the manual fork + PR flow? See CONTRIBUTING.md"
  },
```

Delete the entire block, including the trailing comma. Make sure the JSON remains valid (no double commas, no trailing comma before `}`).

- [ ] **Step 3: Validate JSON**

Run:
```bash
node -e "JSON.parse(require('fs').readFileSync('messages/en.json','utf8')); console.log('valid')"
```
Expected: `valid`.

- [ ] **Step 4: Verify the site still boots**

Run: `npm run dev`. Confirm the homepage and `/en/docs/contributing` render. Click the "Contribute" nav button — should still work (uses `nav.contribute`, which we kept).
Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add messages/en.json
git commit -m "chore(i18n): remove unused contribute editor strings"
```

---

## Task 11: Rewrite the root `CONTRIBUTING.md`

**Files:**
- Modify: `CONTRIBUTING.md`

- [ ] **Step 1: Replace the file contents**

Overwrite `CONTRIBUTING.md` with this content:

```markdown
# Contributing

Thanks for helping out.

The full guide lives on the wiki: **[wiki.divineskins.gg/en/docs/contributing](https://wiki.divineskins.gg/en/docs/contributing)**.

## Quick version

- **Small fix or typo** → on any guide, scroll to the bottom and click **Edit on GitHub**. GitHub's web editor opens. Make your change, open a pull request.
- **New page or bigger change** → fork this repo, clone, `npm install`, `npm run dev`, edit MDX under `content/docs/en/<category>/`, push, open a PR.

A maintainer reviews. Once merged, your change is live within a few minutes.

## Style and safety

Read [`docs/voice.md`](./docs/voice.md) before writing. A few rules block merges:

- No banned terms (`skin hack`, `skin changer`, `unlock skins`, `undetectable`, `free-to-play skins`, `exploit`).
- Never recommend custom skins on Korean or Chinese League servers.
- Every `<img>` needs `alt="..."`.
- Images go in `public/wiki-images/` and stay under 500 KB.

## Before big changes

For new categories, mass renames, or structural rewrites — start a thread in `#wiki-proposals` on Discord first. Saves wasted work.
```

- [ ] **Step 2: Commit**

```bash
git add CONTRIBUTING.md
git commit -m "docs(contributing): rewrite root guide to point at the wiki page"
```

---

## Task 12: Update `CLAUDE.md` to reflect the static model

**Files:**
- Modify: `CLAUDE.md`

The current `CLAUDE.md` documents the deleted submission flow, OAuth env vars, and PR-backend stack. Strip those out.

- [ ] **Step 1: Delete the "Submission flow (end-to-end)" section**

Open `CLAUDE.md`. Find the heading `## Submission flow (end-to-end)` (around line 85). Delete that heading and its entire body (the 8 numbered steps) up to but not including the next `##` heading (`## Environment variables`).

- [ ] **Step 2: Update the "Environment variables" section**

Find `## Environment variables` (around line 96). Replace the body with:

```markdown
## Environment variables

See `.env.example` for the full list. None are required for local dev or for production builds — the site is fully static. The runtime API routes (`health`, `og`, `search`) need no secrets. `NEXT_PUBLIC_POSTHOG_*` and `NEXT_PUBLIC_DIVINE_API_URL` are optional. `CROWDIN_PROJECT_ID` + `CROWDIN_PERSONAL_TOKEN` are CI-only for translation sync.
```

- [ ] **Step 3: Update the "Stack" table**

In the `## Stack` table near the top of the file, replace these two rows:

```diff
-| Auth | GitHub OAuth, cookie-only, submission-scoped. **No site-wide auth.** |
-| PR backend | `@octokit/rest` via /api/submit, optionally forwarded to workers/submit-pr |
+| Auth | None — site is fully static |
+| Contributions | GitHub-native: edit-in-browser via Fumadocs "Edit on GitHub" link, or fork + PR |
```

- [ ] **Step 4: Trim the "Known gotchas" list**

Find `## Known gotchas — save yourself time` (around line 100). Read each numbered item. Delete any item that is specific to deleted code:

- Item 6 ("PRs use the contributor's own token...") — DELETE entirely.
- Any other item that mentions `@octokit`, OAuth, MDXEditor, Turnstile, or the submit Worker — DELETE entirely.

Renumber remaining items so they stay sequential.

- [ ] **Step 5: Update the "What NOT to do" list**

In the `## What NOT to do` section near the bottom, remove any bullet referencing `/contribute`, MDXEditor, OAuth, Octokit, or the Worker. Leave the rest untouched.

- [ ] **Step 6: Update the "Directory layout" section**

Find `## Directory layout`. Remove these lines (they describe deleted directories):

```
src/app/[lang]/contribute/ In-site visual editor.
src/app/api/              OAuth, submit, upload-image, search, og, health.
src/components/editor/    MDXEditor wrapper + autosave + submit dialog.
workers/submit-pr/        Optional Cloudflare Worker for edge PR creation.
```

Replace with:

```
src/app/api/              health, og, search — read-only, no secrets.
```

- [ ] **Step 7: Verify CLAUDE.md is still under reasonable length**

Run:
```bash
wc -l CLAUDE.md
```
Expected: file is shorter than before (was around 120 lines; should now be around 95–105).

- [ ] **Step 8: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(claude-md): drop submission flow and OAuth references"
```

---

## Task 13: Sweep `docs/` for stale references

**Files:**
- Modify: `docs/playbook.md` (if it references the editor)
- Modify: `docs/product.md` (if it references the editor)
- Modify: `docs/voice.md` (only if it references the editor — unlikely)

- [ ] **Step 1: Find all stale references**

Run:
```bash
grep -nEi "(/contribute|mdxeditor|octokit|github oauth|turnstile|submit-pr worker)" docs/*.md 2>/dev/null
```

Note every match.

- [ ] **Step 2: Update each file**

For each file that matched in Step 1, open it and rewrite the affected sentences. Replace mentions of the editor/OAuth with a reference to the new flow: "contributors edit guides via GitHub (web or local) and open a PR."

If a file has no matches, skip it.

- [ ] **Step 3: Re-verify no stale references remain**

Run:
```bash
grep -nEi "(/contribute[^a-z]|mdxeditor|octokit|github oauth|turnstile|submit-pr worker)" docs/*.md 2>/dev/null
```
Expected: no matches (the `[^a-z]` boundary avoids matching `contributing`, which is fine).

- [ ] **Step 4: Commit**

If files were changed:
```bash
git add docs/
git commit -m "docs: drop references to deleted submission flow"
```

If nothing changed, skip this commit.

---

## Task 14: Final verification

This task runs every check from the spec's verification section and confirms the cleanup is complete.

- [ ] **Step 1: Production build**

Run:
```bash
npm run build
```
Expected: build completes successfully. No `Module not found`, no missing env var errors.

- [ ] **Step 2: Lint**

Run:
```bash
npm run lint
```
Expected: passes.

- [ ] **Step 3: Type check**

Run:
```bash
npm run types:check
```
Expected: passes.

- [ ] **Step 4: Dev server boots**

Run: `npm run dev`. Wait for "Ready". Open `http://localhost:3000`.
Expected: homepage renders.

- [ ] **Step 5: Manual route checks**

With the dev server still running:

1. Visit `/en/docs/contributing` → renders the new "How to Contribute" guide.
2. Click "Contribute" in the top nav from any page → lands on `/en/docs/contributing`.
3. From `/en` homepage, click "Write a guide" → lands on `/en/docs/contributing`.
4. Visit `/en/contribute` → 301 redirects to `/en/docs/contributing`.
5. Visit any guide (e.g., `/en/docs/tools`). Scroll to the bottom. Confirm the "Edit on GitHub" link is present and goes to a `github.com/DivineSkins/divine-wiki/edit/...` URL.

Stop the dev server.

- [ ] **Step 6: Final grep — no orphaned references**

Run:
```bash
grep -rEn "octokit|mdxeditor|GITHUB_OAUTH|CLOUDFLARE_SUBMIT_WORKER|TURNSTILE" \
  src/ docs/ .env.example CLAUDE.md package.json package-lock.json \
  2>/dev/null | grep -v "docs/superpowers/"
```
Expected: no matches.

(The `grep -v docs/superpowers/` excludes this plan and the spec, which intentionally mention the deleted symbols.)

- [ ] **Step 7: Final grep — no orphaned `/contribute` page paths**

Run:
```bash
grep -rEn "/contribute[\"\` ]" src/ messages/ public/ 2>/dev/null | grep -v _redirects | grep -v next.config
```
Expected: no matches. (Allowed: `_redirects` and `next.config.mjs` which contain the redirect rules themselves.)

- [ ] **Step 8: Confirm `src/app/api/` is down to three routes**

Run:
```bash
ls src/app/api/
```
Expected exactly:
```
health
og
search
```

- [ ] **Step 9: Write the deploy-side note**

Add a one-line note to the bottom of the spec (or open an issue, depending on team flow) reminding the deploy operator to **remove these four secrets from the Cloudflare Pages production environment**:
- `GITHUB_OAUTH_CLIENT_ID`
- `GITHUB_OAUTH_CLIENT_SECRET`
- `CLOUDFLARE_SUBMIT_WORKER_URL`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

This is a manual Cloudflare dashboard action — the plan does not execute it.

Open `docs/superpowers/specs/2026-05-13-backend-removal-design.md` and append at the end:

```markdown

---

## Post-implementation TODO (manual, deploy operator)

Remove these four secrets from the Cloudflare Pages production environment dashboard:
- `GITHUB_OAUTH_CLIENT_ID`
- `GITHUB_OAUTH_CLIENT_SECRET`
- `CLOUDFLARE_SUBMIT_WORKER_URL`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
```

Commit:
```bash
git add docs/superpowers/specs/2026-05-13-backend-removal-design.md
git commit -m "docs(spec): note Cloudflare secret cleanup as post-merge TODO"
```

- [ ] **Step 10: Summarize for the user**

Report back to the user:
- Total commits made (should be 10–13 depending on whether docs/ needed changes).
- Confirmation all verification steps pass.
- Reminder that the Cloudflare Pages secrets still need manual removal in the dashboard.
- That the three follow-up brainstorms (dead-code audit, voice/copy pass, content-gap audit) are ready to start as separate sessions.
