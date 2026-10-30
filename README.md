# Divine Skins Wiki

Community-written modding guides for every game Divine Skins supports. Live at https://wiki.divineskins.gg.

## Who this is for

Creators who build mods. Players who only want to install mods should ask in [Discord](https://discord.gg/divineskins). The wiki is for makers.

## Contribute

Three ways, pick what fits you:

- **In-browser editor**: go to [wiki.divineskins.gg/en/draft](https://wiki.divineskins.gg/en/draft). Write your guide with a live preview, then hit **Contribute**. The editor walks you through forking the repo and opening a PR.
- **Edit on GitHub**: on any guide, click **Edit on GitHub** at the bottom. GitHub's web editor opens. Make a change, open a PR. No clone, no install.
- **Fork and PR**: for developers. See [CONTRIBUTING.md](./docs/CONTRIBUTING.md).

Full walkthrough: [wiki.divineskins.gg/contribute](https://wiki.divineskins.gg/contribute).

Found a security issue? See [SECURITY.md](./docs/SECURITY.md).

## Local dev

Prerequisites: Node 22+, npm, Git.

```bash
git clone https://github.com/DivineSkins/divine-wiki.git
cd divine-wiki
npm install
npm run dev
```

Open http://localhost:3000.

## Production builds and media

`npm run cf:build` prerenders the guides and packages the Cloudflare Worker.
OpenNext serves those prerendered responses from its static-assets cache;
guide updates require a new deployment. This configuration does not support
runtime cache writes or on-demand revalidation.

Worker source-map uploads are disabled in `wrangler.toml`. The generated MDX
source maps exceed Cloudflare's 60 MiB encoded limit. Runtime stack traces
therefore refer to compiled code until the maps can be reduced and re-enabled.

The build exports one search index per locale and game to
`public/search/<content-hash>/<locale>/<game>.json`. Search covers one game
at a time: it starts in the game of the page being read, downloads that
game's static file, and runs queries in the browser. The dialog footer
switches games. The hash includes content and search configuration, so
changed inputs produce a new URL. These generated files are ignored by Git.
Development uses `/api/search/<locale>/<game>`.

The `IMAGES` binding in `wrangler.toml` enables Next.js image resizing on
Cloudflare. Prebuild scans local media and supplies missing dimensions to
literal MDX images, preserving author-specified sizes and aspect ratios.
Animated WebP images bypass resizing to preserve animation.

Use WebP for guide screenshots (lossless for small text and UI details).
Use the shared `<Video>` component for silent WebM demonstrations:

```mdx
<Video
  src="/wiki-videos/demo.webm"
  poster="/wiki-images/demo-poster.webp"
  width={600}
  height={400}
  alt="Describe what the demonstration shows"
  original="/wiki-images/demo.webp"
/>
```

Videos defer downloading until playback, play near the viewport, pause
offscreen, and respect reduced-motion preferences. Keep animations with
transparency as animated WebP unless the replacement preserves alpha.
Check dimensions, timing, and visual quality before replacing media, and
update references in every locale. Keep app icons in their required formats.

## Content layout

Guides live in `content/docs/en/<game>/<category>/*.mdx`, one folder per game:

- `lol/`: League of Legends
- `deadlock/`: Deadlock

A folder counts as a game only if it is listed in `GAMES` (`src/lib/games.ts`). Each game and each category has a `meta.json` that controls sidebar order.

The contributing guides are written once in `content/docs/en/contributing/` and appear in every game's sidebar.

Translations in `content/docs/<locale>/` come from Crowdin. Don't edit them by hand.

## Stack

- Next.js 16 (App Router)
- Fumadocs (MDX engine, sidebar, search)
- Tailwind v4
- shadcn/ui
- Cloudflare Workers hosting (via @opennextjs/cloudflare)
- Crowdin i18n

## Links

- Divine Skins: https://divineskins.gg
- Celestial launcher: download from divineskins.gg
- Discord: https://discord.gg/divineskins

## License

Everything in this repository, code and guide content, is licensed under
[CC BY-NC-SA 4.0](./LICENSE): you may share and adapt it with credit, but
not for commercial use. Re-hosting the wiki on a monetized site is not
allowed. Contributor terms for guide content are in
[content/LICENSE](./content/LICENSE). By contributing you agree to these
terms.

## Disclaimer

This is an unofficial community project. It is not affiliated with or
endorsed by Riot Games, Valve, or any other game publisher. All game names,
trademarks, and game content are property of their respective owners.
