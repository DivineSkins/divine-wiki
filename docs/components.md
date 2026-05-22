# MDX components

Components available inside any `.mdx` file. No import needed — they're auto-injected via `src/mdx-components.tsx`.

## `<Callout>`

Colored box for warnings, info, safety notes, and difficulty markers.

```mdx
<Callout type="danger" title="Don't use custom skins in Korea or China">
  The anti-cheat there blocks all mods. Accounts get banned.
</Callout>
```

Props:

| Prop       | Type                                                                                                                 | Default                    | Purpose                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------- | --------------------------- |
| `type`     | `"info"` \| `"warning"` \| `"danger"` \| `"success"` \| `"lvl_beginner"` \| `"lvl_intermediate"` \| `"lvl_advanced"` | `"info"`                   | Visual + icon               |
| `title`    | string                                                                                                               | Localised default per type | Bold heading inside the box |
| `children` | MDX                                                                                                                  | required                   | Body                        |

When to use which:

| Type                                                 | Use for                                                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `info`                                               | Neutral tips. "Good to know" asides.                                                        |
| `success`                                            | Confirming a step worked.                                                                   |
| `warning`                                            | Something can go wrong but isn't dangerous.                                                 |
| `danger`                                             | Real risk — bans, data loss, irreversible steps. Always use this for the KR/CN safety note. |
| `lvl_beginner` / `lvl_intermediate` / `lvl_advanced` | Difficulty markers at the top of a guide.                                                   |

Defaults titles come from `messages/<locale>.json` (`callout.defaultTitles.*`).

## `<Tabs>` / `<Tab>`

Fumadocs-provided. Use for alternative install paths, OS-specific steps, or tool-specific workflows.

```mdx
<Tabs items={["Windows", "macOS"]}>
  <Tab value="Windows">Open Celestial from the Start menu.</Tab>
  <Tab value="macOS">
    Celestial doesn't run on macOS today. See [Install on
    Mac](./install-on-mac).
  </Tab>
</Tabs>
```

Rules:

- Every `<Tabs>` **must** be closed with `</Tabs>`. Same for each `<Tab>`.
- `items={[...]}` defines the tab labels and their order.
- Each `<Tab value="...">` must match an entry in `items`.
- Put a blank line between the opening tag and Markdown content. Inline MDX-inside-JSX often mis-parses.
- Don't nest `<Tabs>`. Pull the nested flow out into its own section.

## `<Accordions>` / `<Accordion>`

Fumadocs-provided. Collapsible sections for FAQs, "common errors" lists, and anything that would otherwise spill into a wall of `<details>` tags.

```mdx
<Accordions>
  <Accordion title="Why is Celestial flagged by Defender?">
    Windows Defender sometimes flags unsigned modding tools. Add Celestial to
    your allow list.
  </Accordion>
  <Accordion title="My skin doesn't show in game">
    See [Skin doesn't show in game](./errors/skin-not-showing).
  </Accordion>
</Accordions>
```

## `<ParameterList>`

Two-column table for listing arguments, flags, API parameters. Used inside reference pages.

```mdx
<ParameterList
  parameters={[
    { name: "name", description: "Champion the skin belongs to. e.g. Ahri." },
    {
      name: "skinline",
      description: "Marketing theme, if any. e.g. Spirit Blossom.",
    },
  ]}
/>
```

Props:

| Prop         | Type                                           | Notes             |
| ------------ | ---------------------------------------------- | ----------------- |
| `parameters` | `Array<{ name: string; description: string }>` | Rendered in order |

## `<YouTube>`

Embeds a `youtube-nocookie.com` iframe. Also rendered automatically when a bare YouTube URL appears on its own line (handled by the `remarkYouTube` plugin in `source.config.ts`).

```mdx
<YouTube id="dQw4w9WgXcQ" title="Importing a rig in Maya" />
```

Props:

| Prop    | Type             | Notes                                                                                          |
| ------- | ---------------- | ---------------------------------------------------------------------------------------------- |
| `id`    | string           | The YouTube video ID (the part after `v=`).                                                    |
| `title` | string           | Required-ish — used for the iframe `title` attribute. Defaults to `"YouTube video"` if absent. |
| `start` | number \| string | Optional start time in seconds.                                                                |
| `list`  | string           | Optional playlist ID.                                                                          |

## `<LevelPill>`

Tiny pill for marking guide difficulty. Drop it at the top of a guide, near the intro.

```mdx
<LevelPill level="beginner" />
<LevelPill level="intermediate" label="Some Maya experience" />
```

Props:

| Prop    | Type                                          | Notes                          |
| ------- | --------------------------------------------- | ------------------------------ |
| `level` | `"beginner" \| "intermediate" \| "advanced"`  | Controls color.                |
| `label` | string                                        | Optional override of the text. |

## `<PremiumCard>`

Gold-to-purple gradient-bordered card for the "highlighted" links on hub pages (featured tool, recommended starting point).

```mdx
<PremiumCard
  title="Flint"
  href="/docs/lol/tools/flint"
  icon={<Download className="size-4" />}
>
  All-in-one packager and installer. Start here.
</PremiumCard>
```

Props:

| Prop       | Type      | Notes                                                                       |
| ---------- | --------- | --------------------------------------------------------------------------- |
| `title`    | string    | Card heading.                                                               |
| `href`     | string    | Internal path (`/docs/lol/...`) or external URL — external opens new tab.   |
| `icon`     | ReactNode | Optional. A `lucide-react` icon sized with `size-4`.                        |
| `children` | MDX       | Card description.                                                           |

## `<ToolCard>`

Compact horizontal row card for tool indexes. Less visual weight than `<PremiumCard>` — use these for full lists, `<PremiumCard>` for "featured" picks.

```mdx
<ToolCard name="LtMAO" href="/docs/lol/tools/ltmao" badge="Recommended">
  Mesh + texture extractor used by most VFX-focused creators.
</ToolCard>
```

Props:

| Prop       | Type   | Notes                                                                       |
| ---------- | ------ | --------------------------------------------------------------------------- |
| `name`     | string | Tool name (the link).                                                       |
| `href`     | string | Internal path or external URL.                                              |
| `badge`    | string | Optional small label (e.g. "Recommended", "Beta").                          |
| `children` | MDX    | One-line description.                                                       |

## `<GlowCTA>`

Branded call-to-action button. Use sparingly — usually only on landing / hub pages.

```mdx
<GlowCTA href="/en/draft" variant="primary" size="lg">
  Write a guide
</GlowCTA>
```

Props:

| Prop       | Type                                  | Notes                                                       |
| ---------- | ------------------------------------- | ----------------------------------------------------------- |
| `href`     | string                                | Internal path or external URL.                              |
| `variant`  | `"primary" \| "secondary" \| "ghost"` | Default `primary` (purple fill + glow on hover).            |
| `size`     | `"md" \| "lg"`                        | Default `md`.                                               |
| `children` | ReactNode                             | Button label. Sentence case, 1–3 words, action-first verb.  |

## `<img>` (auto-zoom)

Standard `<img>` is remapped to `ImageZoom` — clicking the image opens a lightbox.

```mdx
<img
  src="/wiki-images/celestial-install-button.png"
  alt="The Install button, highlighted in purple"
/>
```

Rules:

- **`alt` is required** on every image. CI blocks the PR otherwise.
- Prefer local `/wiki-images/*` URLs; external URLs aren't dimension-prefetched at build.
- Markdown shorthand `![alt](url)` also works but the HTML form is more explicit.

## Adding a new component

1. Create `src/components/mdx/MyThing.tsx` — plain React, client or server is fine.
2. Register it in `src/mdx-components.tsx` (already imports `Callout`, `ParameterList`, `YouTube`, `PremiumCard`, `GlowCTA`, `LevelPill`, `ToolCard`, plus `Accordions`/`Accordion` and `TabsComponents`):

   ```ts
   import { MyThing } from "@/components/mdx/MyThing";

   export function getMDXComponents(components?: MDXComponents): MDXComponents {
     return {
       ...defaultMdxComponents,
       ...components,
       ...TabsComponents,
       Accordions,
       Accordion,
       Callout,
       ParameterList,
       YouTube,
       PremiumCard,
       GlowCTA,
       LevelPill,
       ToolCard,
       MyThing,
       img: ImageZoom,
     };
   }
   ```

3. If the component takes unusual prop shapes that authors will set from MDX, document them here.
4. If it needs client interactivity, add `"use client"` at the top. Fumadocs handles island hydration.
5. If the component should also work inside the `/draft` editor preview, make sure `src/lib/draft/mdx-config.ts` registers it too. The build-time and preview pipelines are separate; both need the import to render the same MDX identically.

Keep the roster tight — every new component is a new thing authors (and AI) must remember. Reject components that are just styled variants of existing ones.

## What's deliberately missing

- **`<ChampionCard>` / `<SkinEmbed>`** — planned but not yet wired. Would hit `api.divineskins.gg` at build time. Don't use them until the fetch + caching story is done.
- **`<Cards>` / `<Card>`** — Fumadocs ships them but we haven't styled them for Divine yet. `<PremiumCard>` and `<ToolCard>` cover the cases we need today.
- **Twitch / Vimeo embeds** — only YouTube has a first-class component. Link out to the source for other video hosts. Keeps the page fast and cookie-clean.
