# Divine Skins Wiki

Community-written guides for making custom skins for League of Legends. Live at https://wiki.divineskins.gg.

## Who this is for

Creators who use Maya, Blender, and VFX tools to build custom LoL skins. End-users who only install skins should ask in Discord — the wiki is for makers.

## Contribute

Three ways, pick what fits you:

- **In-browser editor** — go to [wiki.divineskins.gg/en/draft](https://wiki.divineskins.gg/en/draft). Write your guide with a live preview, hit submit, the editor forks the repo and opens a PR for you.
- **Edit on GitHub** — on any guide, click "Edit on GitHub" at the bottom. GitHub's web editor opens. Make a change, open a PR. No clone, no install.
- **Fork and PR** on GitHub. For devs. See [CONTRIBUTING.md](./CONTRIBUTING.md).

Full walkthrough: [wiki.divineskins.gg/en/docs/lol/contributing](https://wiki.divineskins.gg/en/docs/lol/contributing).

## Local dev

Prerequisites: Node 22+, npm, Git.

```bash
git clone https://github.com/DivineSkins/divine-wiki.git
cd divine-wiki
npm install
npm run dev
```

Open http://localhost:3000.

## Content layout

Guides live in `content/docs/en/lol/<category>/*.mdx`. `lol/` is a "game segment" so future games (Valorant, etc.) can sit alongside it. Each category has a `meta.json` that controls sidebar order.

The nine LoL categories:

- `guided-walkthrough`
- `tools`
- `maya`
- `blender`
- `animations`
- `vfx-bins`
- `assets-library`
- `errors`
- `contributing`

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
endorsed by Riot Games. League of Legends and all related trademarks and
game content are property of Riot Games, Inc.
