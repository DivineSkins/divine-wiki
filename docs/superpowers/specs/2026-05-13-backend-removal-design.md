# Backend Removal + GitHub-Native Contributions

**Date:** 2026-05-13
**Status:** Approved (ready for implementation plan)
**Scope:** Delete the in-site contribution backend (OAuth, submit API, MDXEditor, optional Cloudflare Worker) and replace it with a static "How to Contribute" docs page that walks creators through the GitHub fork-and-PR flow. The wiki collapses to a pure Cloudflare Pages static deploy, mirroring the upstream Hytale Modding scaffold.

## Motivation

The current `/contribute` flow (visual editor + GitHub OAuth + Octokit PR creation, optionally proxied through a Cloudflare Worker) adds meaningful surface area: secrets to rotate, rate-limit logic, account-age checks, spam vectors, and a non-trivial editor dependency tree. The wiki content itself is already effectively static — Fumadocs renders MDX at build time and Cloudflare Pages serves it.

The upstream scaffold (`HytaleModding/site`) demonstrates a clean alternative: pure GitHub-native contributions via `CONTRIBUTING.md` plus the per-page "Edit on GitHub" link Fumadocs already renders. Their `src/app/api/` keeps only `health`, `og`, `search` — no submit, no OAuth, no uploads.

We accept the tradeoff: the contribution funnel narrows to creators willing to use GitHub's web UI. Skin-artist contributors who don't know git get a clearly-written walkthrough; those who can't follow it can ask in Discord. This first spec covers only the cleanup. Follow-up brainstorms will cover (in order):

1. Dead-code / unused-dependency audit across `src/components` and `src/lib`
2. Content-gap audit (which creator workflows are missing guides)
3. Voice/copy pass on existing guides against `docs/voice.md`

## What gets deleted

**API routes** (`src/app/api/`):
- `oauth/` — GitHub OAuth start + callback handlers
- `submit/` — Zod validation + Octokit fork/branch/commit/PR
- `upload-image/` — image upload endpoint used by the editor

**Pages and UI**:
- `src/app/[lang]/contribute/page.tsx`
- `src/app/[lang]/contribute/ContributeClient.tsx`
- `src/components/editor/GuideEditor.tsx`
- `src/components/editor/SubmitDialog.tsx`
- `src/components/editor/autosave.ts`

**Libs and workers**:
- `src/lib/github-oauth.ts`
- `workers/submit-pr/` — entire optional Cloudflare Worker directory

**Dependencies** (removed from `package.json`):
- `@mdxeditor/editor` and any companion plugins (`@mdxeditor/*`)
- `@octokit/rest`
- Any cookie or JWT helper that is OAuth-only — verify during execution by `grep` before removal

**Environment variables** (stripped from `.env.example` and the production Cloudflare Pages environment):
- `GITHUB_OAUTH_CLIENT_ID`
- `GITHUB_OAUTH_CLIENT_SECRET`
- `CLOUDFLARE_SUBMIT_WORKER_URL`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

## What stays

These match the Hytale scaffold exactly and carry no secrets or user data:

- `src/app/api/health/` — uptime ping
- `src/app/api/og/` — Fumadocs dynamic OpenGraph cards
- `src/app/api/search/` — Orama search index endpoint

The per-page **"Edit on GitHub"** affordance at `src/app/[lang]/docs/[[...slug]]/page.tsx:38` (Fumadocs `editOnGithub` prop) is already wired and stays untouched. It is the primary contribution affordance after this change.

## New contribution entry-point

### Docs page

Create `content/docs/en/contributing/index.mdx` (plus `content/docs/en/contributing/meta.json` for the new category, and add `"contributing"` to the top-level `content/docs/en/meta.json` so it shows in the sidebar). Written in plain English per `docs/voice.md`. Outline:

1. **Two ways to contribute**
   - *Edit in browser* — GitHub's web editor, no install, recommended for typos, fixes, single-page edits.
   - *Edit locally* — fork + clone + `npm run dev`, for larger changes or new categories.
2. **Editing an existing guide (in browser)**
   - On the guide, click "Edit on GitHub" at the bottom.
   - On GitHub, click the pencil icon.
   - Make changes in the editor.
   - Click "Propose changes" → "Create pull request".
   - Include screenshots at each step.
3. **Adding a new guide**
   - Open the repo, navigate to `content/docs/en/<category>/`.
   - Click "Add file" → name it `<slug>.mdx`.
   - Paste the frontmatter template (`title`, `description`) and start the body at `##`.
   - Update the sibling `meta.json` to include the new slug in the desired position.
   - Commit on a branch and open a PR.
4. **Adding images**
   - Drop into `public/wiki-images/` in the same PR.
   - Reference as `<img src="/wiki-images/your-file.png" alt="...">`.
   - Keep under 500 KB (CLAUDE.md gotcha #6).
5. **What happens next**
   - Cloudflare Pages comments a preview URL on the PR.
   - A maintainer reviews; merge to `main` = live.
6. **Voice and safety**
   - Short callout pointing to `docs/voice.md` banned terms.
   - Reiterate the no-Korean / no-Chinese-server rule from CLAUDE.md.

### Navigation rewiring

- `src/lib/layout.shared.tsx` — change the `nav.contribute` entry from `/${locale}/contribute` to `/${locale}/docs/contributing`.
- `src/app/[lang]/(home)/page.tsx` — change the homepage `ctaContribute` button href the same way.
- Translation keys (`nav.contribute`, `ctaContribute`) are retained as-is. Only URLs change; localized labels remain valid and Crowdin sync is undisturbed.

### Root `CONTRIBUTING.md`

Rewrite the existing root `CONTRIBUTING.md` to be short and point at `/docs/contributing` as the source of truth. The root file remains because GitHub auto-surfaces it on the repo home and in the PR template.

## Cross-cutting cleanup

- **`CLAUDE.md`** — delete the "Submission flow (end-to-end)" section entirely. Update the "Environment variables" section to drop OAuth, Worker, and Turnstile keys. Update the "Stack" table's "PR backend" and "Auth" rows to reflect the static model. Trim "Known gotchas" of any OAuth- or submit-specific items.
- **`docs/playbook.md`** and **`docs/product.md`** — grep for `/contribute`, `MDXEditor`, `OAuth`, `Octokit`, `Turnstile`, and update or remove references.
- **`messages/en.json`** — keep existing `nav.contribute` and `ctaContribute` label strings (they remain accurate). Localized files in `messages/<locale>.json` are Crowdin-managed and need no manual edits.
- **`public/_redirects`** — add explicit 301 redirects so existing inbound links and bookmarks don't 404:
  ```
  /en/contribute     /en/docs/contributing    301
  /fr-FR/contribute  /fr-FR/docs/contributing 301
  /tr-TR/contribute  /tr-TR/docs/contributing 301
  /pt-BR/contribute  /pt-BR/docs/contributing 301
  ```
- **Cloudflare Pages deploy environment** — the four deleted env vars should be removed from the production environment. This is a manual dashboard action that the implementation plan will call out but not execute.

## Verification

Before declaring the cleanup done, all of the following must hold:

1. `npm run build` succeeds with no module-not-found errors.
2. `npm run lint` passes.
3. `npm run types:check` passes.
4. `npm run dev` boots cleanly.
5. `/en/docs/contributing` renders.
6. The "Contribute" nav button navigates to `/en/docs/contributing`.
7. The homepage "Contribute" CTA navigates to `/en/docs/contributing`.
8. The per-page "Edit on GitHub" link still works on at least one sampled guide.
9. Visiting `/en/contribute` 301-redirects to `/en/docs/contributing`.
10. The following grep returns no matches:
    ```bash
    grep -rEn "octokit|mdxeditor|GITHUB_OAUTH|CLOUDFLARE_SUBMIT_WORKER|TURNSTILE" \
      src/ workers/ docs/ .env.example CLAUDE.md package.json
    ```
    (Excluding this spec file and the git history.)

## Out of scope

- Dead-code / unused-dep audit beyond what the deletion directly removes — separate follow-up.
- Content-gap audit — separate follow-up.
- Voice/copy pass on existing guides — separate follow-up.
- Rewriting the per-page "Edit on GitHub" link's UI; the Fumadocs default is acceptable.
- Migrating `public/wiki-images/*` off-repo to an R2 CDN.
- Any change to the Crowdin / i18n pipeline.

## Risks and mitigations

- **Risk:** Cloudflare Pages still has the deleted env vars in its production environment, and a future code change accidentally re-introduces a reference. *Mitigation:* implementation plan ends with a checklist item to remove them from the dashboard; CLAUDE.md drops them from the documented surface.
- **Risk:** A returning contributor bookmarked `/contribute` and lands on a 404. *Mitigation:* `_redirects` covers all four locales.
- **Risk:** A localized `messages/<locale>.json` references something that no longer exists. *Mitigation:* we only change URLs, not keys, so Crowdin-managed labels remain valid.
- **Risk:** Removing `@octokit/rest` or `@mdxeditor/editor` leaves transitive dependencies that are now unused but still installed. *Mitigation:* run `npm prune` after removal; a deeper dep audit is part of the follow-up brainstorm, not this one.
