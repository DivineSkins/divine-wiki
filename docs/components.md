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
2. Register it in `src/mdx-components.tsx`:

   ```ts
   import { MyThing } from "@/components/mdx/MyThing";

   export function getMDXComponents(components?: MDXComponents): MDXComponents {
     return {
       ...defaultMdxComponents,
       ...components,
       ...TabsComponents,
       Callout,
       ParameterList,
       MyThing,
       img: ImageZoom,
     };
   }
   ```

3. If the component takes unusual prop shapes that authors will set from MDX, document them here.
4. If it needs client interactivity, add `"use client"` at the top. Fumadocs handles island hydration.

Keep the roster tight — every new component is a new thing authors (and AI) must remember. Reject components that are just styled variants of existing ones.

## What's deliberately missing

- **`<ChampionCard>` / `<SkinEmbed>`** — planned but not yet wired. Would hit `api.divineskins.gg` at build time. Don't use them until the fetch + caching story is done.
- **`<Cards>` / `<Card>`** — Fumadocs ships them but we haven't styled them for Divine yet. If you need a hub layout today, use a plain Markdown list.
- **Video embeds** — link out to the source (YouTube, Twitch) instead of embedding. Keeps the page fast and cookie-clean.
