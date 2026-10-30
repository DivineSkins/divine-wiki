# Contributing

Thanks for helping out.

The full guide lives on the wiki: **[wiki.divineskins.gg/contribute](https://wiki.divineskins.gg/contribute)**.

## Quick version

- **In-browser editor** → go to [wiki.divineskins.gg/en/draft](https://wiki.divineskins.gg/en/draft). Write the guide, hit **Contribute**, follow the three steps: fork the wiki, create the prefilled file on your fork, open the pull request.
- **Small fix or typo** → on any guide, scroll to the bottom and click **Edit on GitHub**. GitHub's web editor opens. Make your change, open a pull request.
- **New page or bigger change** → fork this repo, clone, `npm install`, `npm run dev`, edit MDX under `content/docs/en/<game>/<category>/`, push, open a PR.

A maintainer reviews. Once merged, your change is live within a few minutes.

By contributing you agree that your contribution, guide content and code
alike, is licensed under [CC BY-NC-SA 4.0](../LICENSE). You keep your
copyright; the license just lets the wiki publish your work.

## Style

Write so a 12-year-old can follow every step. Most readers are not native English speakers: short sentences, one action per step, start each step with a verb, talk to the reader as "you". Skip filler like "simply", "just", and "please".

A few rules block merges:

- Every `<img>` needs `alt="..."`.
- Images are `.webp`, go in `public/wiki-images/`, and stay under 500 KB.
- Videos are `.webm` and go in `public/wiki-videos/`.

## Before big changes

Planning a new category, mass renames, or a big rewrite? [Contact us on Discord](https://discord.gg/divineskins) or [open an issue](https://github.com/DivineSkins/divine-wiki/issues/new/choose) first. It saves wasted work.
