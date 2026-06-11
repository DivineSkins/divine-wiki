# Contributing

Thanks for helping out.

The full guide lives on the wiki: **[wiki.divineskins.gg/en/docs/lol/contributing](https://wiki.divineskins.gg/en/docs/lol/contributing)**.

## Quick version

- **In-browser editor** → go to [wiki.divineskins.gg/en/draft](https://wiki.divineskins.gg/en/draft). Write the guide, hit submit, the editor opens a PR for you.
- **Small fix or typo** → on any guide, scroll to the bottom and click **Edit on GitHub**. GitHub's web editor opens. Make your change, open a pull request.
- **New page or bigger change** → fork this repo, clone, `npm install`, `npm run dev`, edit MDX under `content/docs/en/lol/<category>/`, push, open a PR.

A maintainer reviews. Once merged, your change is live within a few minutes.

## Style and safety

Write so a 12-year-old can follow every step. Most readers are not native English speakers: short sentences, one action per step, start each step with a verb, talk to the reader as "you". Skip filler like "simply", "just", and "please".

A few rules block merges:

- No banned terms. Never write "skin hack", "skin changer", "unlock skins", "undetectable", "cheat", "exploit", "buy", or "free-to-play skins". Write "custom skin", "mod", "safe", "client-side", "customize", "download" instead. Custom skins don't break rules — the wrong word makes the whole wiki look shady.
- Never recommend custom skins on Korean or Chinese League servers. The anti-cheat there blocks all mods. Guides that touch installing or testing skins need that warning near the top.
- Every `<img>` needs `alt="..."`.
- Images go in `public/wiki-images/` and stay under 500 KB.

## Before big changes

For new categories, mass renames, or structural rewrites — start a thread in `#wiki-proposals` on Discord first. Saves wasted work.
