# In-browser draft → GitHub handoff

**Date:** 2026-05-13
**Status:** idea, not built. Reminder for later.

A faster "new guide" on-ramp than the current `/docs/contributing` walkthrough. No backend — pure static + a GitHub deep link.

## The flow

1. Creator opens `/draft` (or `/contribute/new`) on the wiki.
2. Picks a category, fills in title + description, writes the body in a textarea.
3. Right-side preview pane renders with the actual Fumadocs MDX pipeline + the same components the docs use (`Callout`, `Tabs`, `ParameterList`, `img`, code blocks). What they see is exactly what production will show.
4. Cheatsheet sidebar shows the available components, frontmatter shape, and a few copy-paste snippets (safety callout, tab block, parameter list).
5. "Contribute" button → deep-links to GitHub's new-file editor with the MDX body pre-filled:

   ```
   github.com/DivineSkins/divine-wiki/new/main
     ?filename=content/docs/en/<category>/<slug>.mdx
     &value=<urlencoded-mdx>
   ```

6. GitHub's web editor opens with the file already populated. Creator clicks "Commit" → PR opens automatically. Cloudflare Pages comments the preview URL.

## Gotchas to think about

- **URL length cap.** GitHub's `value=` query param breaks somewhere around 8 KB. Longer drafts need either a `localStorage` fallback (creator pastes into the GitHub editor after redirect) or a "Download `.mdx`" button as a backup.
- **Images.** Can't pre-stage them through a URL. After the GitHub redirect, prompt the creator to drop image files into `public/wiki-images/` using GitHub's "Add file → Upload files" button on the same branch the PR was opened from.
- **`meta.json`.** The new slug needs adding to the category's `meta.json` so it appears in the sidebar. Either auto-prefill a second deep link (one URL for the MDX, one for the meta.json change), or surface it as one explicit follow-up step on the redirect screen.
- **Preview parity.** The preview must compile through Fumadocs, not a generic markdown parser — otherwise what the creator sees won't match production output (and any subtle MDX quirks like `<` escaping or `<Tabs>` parsing will surprise them).

## Why no API

Everything is client-side until the GitHub redirect. The wiki stays a fully static Cloudflare Pages deploy. No OAuth, no secrets, no rate-limit logic, no spam-detection surface to maintain. The cost we accept: contributors need a GitHub account.

## More to think about

- **Borrow the layout from existing MDX previewers, restyle with Divine tokens.** mdxjs.com playground, mdxeditor.dev, Fumadocs' own example if there is one — pick whichever has the cleanest split-pane spacing/typography and rebuild it with our purple/black surface set, our components, and a GlowCTA-style "Contribute" button. Don't reinvent the layout; reinvent the look.
- **Smart linking / @-mentions.** Maintain a small lookup of known entities (tool names like `Flint`, `Jade`, `LtMAO`; champion names; common page slugs). Detect them as the creator types or pastes, and offer to wrap them as links to the canonical page. Same idea as Slack/Discord @-mentions or Obsidian `[[wikilinks]]`. Keeps cross-links consistent without making creators remember paths.
- **Component cheatsheet, click-to-insert.** Sidebar listing the available MDX components (`<Callout>`, `<Tabs>`, `<ParameterList>`, safety callout, code block, image with alt) with one-click insertion of a working snippet at the cursor. Each entry needs a one-line "when to use this" — not a wall of docs. Goal: a creator who's never seen MDX can ship a decent-looking guide in one sitting.
- **Creator-friendly component docs.** `docs/components.md` already exists as the AI-facing reference. Surface a slimmer creator-facing version (no React import talk, just usage + screenshots) under `/docs/contributing/components` or as a tab in the `/draft` page.

## The UX-vs-scale tradeoff (the small concern)

The old wiki had auth + a built-in editor + one-click new-category. Easier in the moment, especially for creators who don't live in GitHub. The new GitHub-PR flow has more friction up front, but it's the standard for open-source docs and scales better — PR review, CI previews, fork-and-PR, no maintained backend, no spam vector, no auth to rotate.

This `/draft` page is the bridge. Drafting feels like the old editor (write, see preview, hit submit), but the actual commit happens through GitHub. If it lands well, the first-time-UX regression mostly disappears without giving up the platform's scale.
