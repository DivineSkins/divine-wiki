---
name: divine-ui-design-system
description: "Divine Skins design system reference for the wiki — colors, typography, spacing, gradients, glow effects, MDX/Tailwind v4 component patterns, and the five Design DNA identity markers. Use whenever doing UI work on the wiki: building or styling MDX components, custom React components in src/components/, the docs shell, the homepage, or any surface meant to feel like part of the Divine Skins brand. Mirrors the prod design system (DivineSkinsWEB-PROD) so wiki UI reads as one product."
---

# Divine Skins UI Design System (Wiki)

## When to Use

Load this skill whenever doing UI work on the **Divine Skins wiki**:

- Building or styling MDX components in `src/components/mdx/`
- Building or styling shadcn primitives in `src/components/ui/`
- Designing the docs shell, homepage, or marketing surfaces
- Reviewing a page or component for design system compliance
- Picking a color, font, radius, gradient, or glow value
- Auditing a Crowdin-localized page for visual regressions

The wiki shares the brand language with the prod app (`DivineSkinsWEB-PROD`). Use the same tokens — they're already mirrored into `src/app/global.css` as `--color-divine-*` Tailwind v4 theme variables.

## References

### Design System — `references/design-system.md`

Read for the complete visual identity: brand philosophy, color system, typography scale, spacing, gradients, glow effects, component patterns adapted for Fumadocs/MDX, and the five Design DNA identity markers. **Use exact token values, never approximations.**

## Quick Reference — Core Tokens

```
SURFACES                BRAND                 TEXT                STATUS
#0B0A0F  void           #783CB5  purple      #E4E4E7  primary    #22C55E  success
#15141C  surface        #ECB96A  gold        #8B8D98  muted      #EF4444  error
#363242  border         #B472FF  lilac*                          #FACC15  warning
#1C1C1C  elevated       #C084FC  soft*                           #5865F2  info
#111016  popover

* gradient endpoints, not standalone tokens

FONTS                   RADII                 KEY GRADIENTS
Manrope  hero           6px   md              #B472FF → #783CB5  buttons
Poppins  section        8px   lg (cards)      #ECB96A → #C084FC  premium borders
Inter    UI             12px  xl (buttons)    #C084FC → #783CB5  accent text
JetBrains Mono  code    999px full (pills)    #ECB96A → #783CB5  decorative dividers
```

## Tailwind v4 Theme Tokens — Prefer These

The wiki's `src/app/global.css` exposes the design system as `divine-*` tokens via `@theme`. Pick them first:

```
SURFACES                       TEXT                       BRAND
bg-divine-void                 text-divine-text           bg-divine-primary
bg-divine-surface              text-divine-text-muted     bg-divine-primary-light
bg-divine-elevated                                        bg-divine-primary-lilac
bg-divine-border                                          bg-divine-secondary
bg-divine-popover

STATUS                         RADII                      FONTS
bg-divine-success              rounded-divine-md          font-[family-name:var(--font-hero)]
bg-divine-error                rounded-divine-lg          font-[family-name:var(--font-section)]
bg-divine-warning              rounded-divine-xl          font-[family-name:var(--font-ui)]
bg-divine-info                                            font-mono
```

**Rule:** use `divine-*` tokens first; fall back to `bg-[#hex]` only when no token covers the case. Never use generic Tailwind palette colors (`bg-zinc-900`, `text-white`) for branded surfaces — they drift from the system over time.

## Workflow

1. **Determine the task type:**
   - **New UI?** → Read `references/design-system.md`, then build using the tokens above.
   - **Fix or review existing UI?** → Read `references/design-system.md`, then audit against tokens and the five DNA markers.

2. **Check existing components first.** The wiki uses shadcn (new-york) primitives in `src/components/ui/` and Fumadocs UI components throughout `src/app/[lang]/docs/`. Compose with what exists — don't re-skin Fumadocs from scratch unless the task explicitly asks for it.

3. **Apply tokens, not approximations.** Use exact hex values from the table above. If you find yourself eyeballing a color (`#7c3bb6`?), stop and look up the right token.

4. **Verify against the Five DNA Rules** before delivering:
   - Purple glow on dark void — atmosphere present?
   - Gold-to-purple gradient borders on premium elements — signature motif used where it belongs?
   - Three-tier depth layering (void → surface → border) — elements float in 3D?
   - Vibrant content on muted stage — UI recedes, mod artwork / guide screenshots shine?
   - Gaming glow, restrained — glow on interactive elements only, not everywhere?

## Wiki Tech Stack — Constraints

- **Next.js 16 App Router** with Turbopack dev. No Pages router.
- **Fumadocs 16.2.3** (core, mdx, ui) — sidebar from `meta.json`, Orama search, OG API. Don't fight Fumadocs' own classes; extend with `divine-*` tokens.
- **TypeScript strict.** Path alias `@/*` → `src/*`.
- **Tailwind v4** with `@theme` blocks in `src/app/global.css`. No `tailwind.config.js`.
- **shadcn (new-york)** primitives copied into `src/components/ui/` — don't rely on the CLI to add more; copy by hand.
- **MDX components** exposed to authors live in `src/components/mdx/`. Register new components in `src/mdx-components.tsx` so they're available in `.mdx`. If the component should also work in the `/draft` editor preview, mirror the import in `src/lib/draft/mdx-config.ts`. Current roster: `Callout`, `ParameterList`, `YouTube`, `PremiumCard`, `GlowCTA`, `LevelPill`, `ToolCard`, plus `Accordions`/`Accordion` from fumadocs-ui.
- **Images:** drop into `public/wiki-images/` and reference as `<img src="/wiki-images/..." alt="...">`. The wiki does not yet use R2 or `next/image` for content images — ship matching alt text every time.
- **Icons:** `lucide-react` (already a dep). Use `size-4` / `size-5` / `size-6` — never raw `w-* h-*`.
- **Animations:** Framer Motion is fine for shell transitions; respect `prefers-reduced-motion`. For MDX, prefer no motion — the docs are the focal point.
- **No ViewTransition.** React 19.2 stable does not export it. Don't import `ViewTransition` from React.

## Casing — UI Copy

- **Buttons / CTAs:** sentence case. Real wiki examples: "Get started", "Open in GitHub", "Edit this page". 1–3 words. Action-first verbs.
- **UPPERCASE** is reserved for tiny meta labels (10–12px eyebrows) paired with `tracking-[0.10em]`+. Never on primary CTAs.
- **Headlines:** Title Case. Real: "Install Celestial", "Make a custom skin".
- **Subtitles:** sentence case, one plain sentence.

For long-form copy (guide bodies, tutorial steps), defer to the **`divine-wiki-voice`** skill — it owns the writing voice. This skill owns the visuals.
