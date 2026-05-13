# Content model

How `.mdx` files, frontmatter, and `meta.json` fit together. This is the contract between authors and the build.

## Frontmatter

Defined in `source.config.ts`. Extra keys are **rejected** by Fumadocs — add them to the schema first.

| Key | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | Shown as the H1 and in search. Keep under ~60 chars. |
| `description` | string | no (strongly advised) | SEO description + OG card. 120–160 chars ideal. |
| `icon` | string | no | Lucide icon name (e.g. `"Wrench"`). Must exist in `lucide-react/dynamicIconImports` or the page 500s. |
| `full` | boolean | no | `true` hides the right-side TOC (use for hub pages). |
| `category` | string | no | Usually redundant — Fumadocs infers it from the folder path. Keep only if the folder can't. |
| `authors` | array | no | `[{ name: "handle", url?: "https://..." }]`. Shown under the title. |
| `patch` | string | no | e.g. `"14.23"`. Reserved for future "last tested on patch" badge. |

Example:

```yaml
---
title: "Install a skin with Celestial"
description: "Three-step install for any .fantome file — safe outside KR and CN."
icon: "Download"
authors:
  - name: "yukix"
    url: "https://github.com/yukix"
---
```

**H1 comes from `title`.** Start your content at `##`. Adding `# Foo` inside the body produces two H1s.

## File structure & slugs

```
content/docs/
├── en/                         # source of truth
│   ├── meta.json               # top-level sidebar order
│   ├── guided-walkthrough/
│   │   ├── meta.json
│   │   ├── index.mdx           # "/docs/guided-walkthrough"
│   │   └── step-one.mdx        # "/docs/guided-walkthrough/step-one"
│   ├── tools/
│   ├── maya/
│   ├── blender/
│   ├── animations/
│   ├── vfx-bins/
│   ├── assets-library/
│   └── errors/
├── fr-FR/                      # Crowdin-managed, do not hand-edit
├── tr-TR/                      # Crowdin-managed, do not hand-edit
└── pt-BR/                      # Crowdin-managed, do not hand-edit
```

- **Filenames**: lowercase kebab-case `.mdx`. Slug = filename.
- **`index.mdx`**: the category landing page (`/docs/<category>`).
- **No nesting beyond one folder deep.** If you need a third level, make a sibling category first — flatter beats clever.
- **Unique slugs globally.** Two pages with the same slug under different categories is legal, but still avoid it — confuses search and cross-links.

## `meta.json` (the sidebar controller)

One per folder. Two shapes:

**Top level** (`content/docs/en/meta.json`) — just the ordering of category folders:

```json
{
  "title": "Divine Skins Wiki",
  "pages": ["guided-walkthrough", "tools", "maya", "blender", "animations", "vfx-bins", "assets-library", "errors"]
}
```

**Category level** (`content/docs/en/tools/meta.json`) — ordered list of page slugs in that folder:

```json
{
  "title": "{meta.tools.title}",
  "icon": "Wrench",
  "pages": ["index", "cs-lol-manager", "ltmao", "ritobin"]
}
```

- `title`: shown as the sidebar section header. `{meta.<key>}` interpolations pull from `messages/<locale>.json` so the header translates.
- `icon`: **must be a lucide-react icon name present in `icons`**. See `memory/project_lucide_icon_map_gotcha.md` — unknown names 500 the whole docs layout.
- `pages`: order matters. Entries that aren't listed are appended alphabetically after the listed ones.

Supported `meta.json` directives (Fumadocs):

| Directive | Purpose |
|---|---|
| `"---<name>---"` | Separator with a heading label in the sidebar. |
| `"..."` | Rest marker — "insert remaining pages here in alphabetical order". |
| `"!<slug>"` | Hide `<slug>` from the sidebar (still reachable by URL). |

Example with a separator and a hidden draft:

```json
{
  "title": "Tools",
  "icon": "Wrench",
  "pages": [
    "---DCC---",
    "maya",
    "blender",
    "---Helpers---",
    "ritobin",
    "!draft-new-tool"
  ]
}
```

## Images

Two supported origins:

1. **`/public/wiki-images/<hash>.<ext>`** — committed alongside the MDX guide. Referenced via `<img src="/wiki-images/abc.png" alt="...">`. Local disk, fast build.
2. **External (third-party CDN, YouTube thumbnails)** — allowed but **dimensions are not prefetched** (see `remarkImageOptions` in `source.config.ts`). Add `width` and `height` manually if you care about CLS.

Rules:

- `alt=""` is **required** for every `<img>`. CI fails the PR otherwise.
- Images over ~500 KB slow every Cloudflare Pages build. Compress before commit.
- Use `<img>` (HTML), not `![](...)` (Markdown), when you need `alt` plus styling — the Markdown shorthand's alt-detection is CI-checked but the HTML form is explicit.

## MDX quirks (things that break builds)

1. `<` immediately before a digit is parsed as JSX. Escape: `\<3`, `\<60k`.
2. Every `<Tabs>` needs a matching `</Tabs>`; every `<Tab value="x">` needs `</Tab>`.
3. Blank line required between JSX blocks and Markdown (`<Callout>\n\nMarkdown here\n\n</Callout>` — not inline).
4. Unclosed code fences silently swallow the rest of the file. Always balance ` ``` `.
5. Don't nest code fences. If you need to show a fence inside a fence, use `~~~` for the outer one.
6. Do **not** import React components at the top of `.mdx`. Anything the author needs is auto-injected from `src/mdx-components.tsx`.

## Voice rules (enforced in CI)

Banned terms are errors (the PR fails):

- `skin hack` / `skin changer` → **custom skin** / **mod**
- `unlock skins` → **customize** / **change the look**
- `undetectable` → **safe** / **client-side**
- `buy` / `purchase` → **download** / **get**
- `free-to-play skins` → **custom skins**
- `exploit` / `cheat` → **mod** / **custom skin**

Warnings are non-blocking but please fix them: `utilize`, `initiate`, `navigate to`, `terminate`, `subsequently`, `in order to`, `ensure that`, `prior to`, `execute`, `select`, `simply`, `just`, `basically`, `easily`, `please`.

Full rules in [`voice.md`](./voice.md).

## Safety wording (non-negotiable)

Every install guide gets this callout near the top:

```mdx
<Callout type="danger" title="Don't use custom skins in Korea or China">
  The anti-cheat there blocks all mods. Accounts get banned.
</Callout>
```

Rest of the canonical phrasings are in [`voice.md`](./voice.md). Say it the same way every time.

## i18n

- `content/docs/en/**` is the source of truth. Crowdin pushes translations into `content/docs/<locale>/**` on a weekly cron.
- **Never hand-edit non-English MDX** — it gets clobbered. `.prettierignore` excludes them to prevent accidental local edits from creating PR churn.
- `messages/en.json` is the source for UI strings. `messages/<locale>.json` is Crowdin-managed.
- Adding a new locale: (1) add to `src/lib/i18n.ts`, (2) add to `crowdin.yml`, (3) commit empty `content/docs/<locale>/` placeholder (Crowdin fills it).

## When content is wrong for the model

Fumadocs will log and often 500 if:

- Frontmatter fails the Zod schema.
- `meta.json` references a slug that doesn't exist.
- `icon` is not in `lucide-react`'s map.
- MDX has an unbalanced JSX tag.

When `npm run build` fails mid-page, the page's path is in the error. Start there.
