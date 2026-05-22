# Contributing

Thanks for helping out.

The full guide lives on the wiki: **[wiki.divineskins.gg/en/docs/lol/contributing](https://wiki.divineskins.gg/en/docs/lol/contributing)**.

## Quick version

- **In-browser editor** → go to [wiki.divineskins.gg/en/draft](https://wiki.divineskins.gg/en/draft). Write the guide, hit submit, the editor opens a PR for you.
- **Small fix or typo** → on any guide, scroll to the bottom and click **Edit on GitHub**. GitHub's web editor opens. Make your change, open a pull request.
- **New page or bigger change** → fork this repo, clone, `npm install`, `npm run dev`, edit MDX under `content/docs/en/lol/<category>/`, push, open a PR.

A maintainer reviews. Once merged, your change is live within a few minutes.

## Style and safety

Read [`docs/voice.md`](./docs/voice.md) before writing. A few rules block merges:

- No banned terms. The full list is in `docs/voice.md`.
- Never recommend custom skins on Korean or Chinese League servers.
- Every `<img>` needs `alt="..."`.
- Images go in `public/wiki-images/` and stay under 500 KB.

## Before big changes

For new categories, mass renames, or structural rewrites — start a thread in `#wiki-proposals` on Discord first. Saves wasted work.
