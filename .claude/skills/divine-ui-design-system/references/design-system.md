# Divine Skins — Design System & Visual Identity (Wiki Reference)

> Comprehensive reference for the visual language that defines Divine Skins. The wiki shares this system with the prod app — same tokens, same DNA — adapted for a Next.js 16 + Fumadocs + MDX + Tailwind v4 stack.

---

## 1. Brand Identity & Design Philosophy

Divine Skins is a custom-skins platform for League of Legends. The wiki is the **creator-facing** surface: long-form guides for people who model, texture, rig, and ship custom skins (Maya, Blender, VFX). The visual language is shared with the consumer app — **dark luxury meets gaming culture** — so the two products read as one brand.

The overall feeling: **a premium digital storefront, lit by purple neon in a dark room.** Immersive without being overwhelming, polished without being sterile. On the wiki, the same atmosphere wraps technical content — code blocks, screenshots, callouts — without ever stealing focus from them.

### Core Design Principles

- **Dark-first.** Every surface, every component begins from near-black. Light elements are exceptions, not defaults.
- **Purple as power.** The primary purple (`#783CB5`) is the signature energy source — it glows, it attracts, it signals interactivity.
- **Gold as prestige.** The secondary gold (`#ECB96A`) is used sparingly for premium / achievement / highlight moments — featured callouts, dividers, accent gradients.
- **Layered depth.** Three dark surface tiers (`#0B0A0F` → `#15141C` → `#363242`) create the sense of floating panels over a void.
- **Restrained glow.** Glow lives on interactive elements — buttons, focused inputs — never on body content.
- **Content-forward.** The UI recedes so guide content (screenshots, code, steps) is the visual star.

---

## 2. Color System

### 2.1 Background Layers (Three-Tier Depth)

The background system creates a "space → surface → interactive" depth hierarchy.

| Layer                                     | Hex       | Tailwind             | Role                                                                                                         |
| ----------------------------------------- | --------- | -------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Void** (page background)                | `#0B0A0F` | `bg-divine-void`     | Deepest layer. Almost pure black with a faint cool-purple undertone. The canvas.                             |
| **Surface** (cards, panels, callouts)     | `#15141C` | `bg-divine-surface`  | Primary card / panel color. Lifted just enough from the background to be distinguishable, still deeply dark. |
| **Elevated** (popovers, tooltips, raised) | `#1C1C1C` | `bg-divine-elevated` | A half-step above surface. Use for modals or content that should feel "in front of" a card.                  |
| **Border / Interactive**                  | `#363242` | `bg-divine-border`   | Inner borders, secondary buttons, dividers. The lightest "dark" layer.                                       |
| **Popover**                               | `#111016` | `bg-divine-popover`  | Dropdowns, command palettes, search popovers.                                                                |

Together: a page reads as content panels floating above the void, with interactive elements sitting on top of those panels.

### 2.2 Brand Colors

**Primary Purple — `#783CB5`** (`bg-divine-primary`)

Medium-saturated purple. Not neon, not muted. Energetic but sophisticated.

- Primary buttons (as a gradient, paired with `#B472FF`)
- Glow effects around CTAs and focused inputs
- Active states, focus rings, accent text
- Author / link highlights in MDX
- Featured callout left-borders

**Secondary Gold — `#ECB96A`** (`bg-divine-secondary`)

Warm, desaturated gold. The color of an in-game LoL currency icon, not pure yellow.

- "Featured" badges, premium callouts
- Gradient pairings with primary purple (the gold-to-purple gradient is **the** signature motif)
- Decorative HR accents
- Star ratings, achievement notes

**Gradient Endpoints (not standalone tokens):**

| Color       | Hex       | Tailwind                  | Role                                                  |
| ----------- | --------- | ------------------------- | ----------------------------------------------------- |
| Lilac       | `#B472FF` | `bg-divine-primary-lilac` | Left/top of primary button gradient                   |
| Soft purple | `#C084FC` | `bg-divine-primary-light` | Text gradients, hover states, premium border endpoint |

### 2.3 Text Colors

| Token        | Hex       | Tailwind                 | Usage                                                                      |
| ------------ | --------- | ------------------------ | -------------------------------------------------------------------------- |
| Primary text | `#E4E4E7` | `text-divine-text`       | Body, headings. Warm off-white — bright enough to read, never harsh white. |
| Muted text   | `#8B8D98` | `text-divine-text-muted` | Metadata, captions, table descriptions, footer links.                      |

Two tiers only. For emphasis, switch to purple (`text-divine-primary`) or gold (`text-divine-secondary`) — don't invent a third gray.

### 2.4 Status Colors

| State   | Hex       | Tailwind                                    | Where it shows up                                |
| ------- | --------- | ------------------------------------------- | ------------------------------------------------ |
| Success | `#22C55E` | `bg-divine-success` / `text-divine-success` | "Tested" / "Working" badges, confirmation toasts |
| Error   | `#EF4444` | `bg-divine-error` / `text-divine-error`     | Banned-region warnings, anti-cheat alerts        |
| Warning | `#FACC15` | `bg-divine-warning` / `text-divine-warning` | "Close LoL before installing" callouts           |
| Info    | `#5865F2` | `bg-divine-info` / `text-divine-info`       | Discord links, neutral notes                     |

Pair with reduced-opacity backgrounds for callouts: e.g. `bg-divine-warning/10 border-divine-warning/40 text-divine-warning`.

---

## 3. Typography

### 3.1 Font Stack (loaded in `src/app/[lang]/layout.tsx`)

| Font                  | Role    | CSS var               | Where to use                                            |
| --------------------- | ------- | --------------------- | ------------------------------------------------------- |
| **Manrope** (400–800) | Hero    | `var(--font-hero)`    | Marketing headlines, homepage hero, landing sections    |
| **Poppins** (400–700) | Section | `var(--font-section)` | Mid-page section titles in marketing surfaces           |
| **Inter** (400–600)   | UI      | `var(--font-ui)`      | Body, nav, buttons, metadata, MDX prose — the workhorse |
| **JetBrains Mono**    | Code    | `var(--font-mono)`    | Inline code, code blocks, file paths, identifiers       |

Apply via Tailwind v4: `className="font-[family-name:var(--font-hero)]"`. Inter is the default body font from Fumadocs' preset — usually you just inherit.

### 3.2 Type Scale

| Element       | Size    | Line height | Weight | Usage                                                 |
| ------------- | ------- | ----------- | ------ | ----------------------------------------------------- |
| Hero          | 79px    | 95px        | 800    | Homepage hero, large landing headlines                |
| Section title | 30px    | 29px        | 700    | Mid-page section breaks (marketing pages)             |
| Card title    | 22px    | 25px        | 600    | Featured cards, callout headings                      |
| Body large    | 20px    | 25–29px     | 400    | Intro paragraphs under hero/section titles            |
| Body          | 16px    | 24px        | 400    | Standard MDX prose, FAQ answers, blog content         |
| Body small    | 13px    | 16–20px     | 400    | Metadata — last-updated, file size, contributor names |
| Caption       | 10–12px | 12–16px     | 500    | Fine print, license info, status indicators           |

### 3.3 Weight Usage

| Weight    | Value | Usage              |
| --------- | ----- | ------------------ |
| Semi-bold | 600   | Buttons, CTAs      |
| Bold      | 700   | Headings, emphasis |
| Regular   | 400   | Body copy          |
| Medium    | 500   | Labels, metadata   |

### 3.4 Casing

- **Buttons / body CTAs:** sentence case — "Get started", "Open in GitHub", "Edit this page". 1–3 words, action-first.
- **UPPERCASE:** tiny meta labels only (10–12px eyebrows) with `tracking-[0.10em]`–`tracking-[0.12em]`. Never on primary CTAs.
- **Headlines:** Title Case for marketing — "Install Celestial", "Make a Custom Skin".
- **Guide titles (`title:` frontmatter):** Sentence case, one short phrase. The Fumadocs renderer turns it into the H1.

---

## 4. Spacing & Layout

### 4.1 Spacing Scale

`0, 2, 4, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 200` (px).

| Category   | Values           | Usage                                                   |
| ---------- | ---------------- | ------------------------------------------------------- |
| Micro      | 2px, 4px         | Internal padding within badges, icon-to-text gaps       |
| Component  | 8px, 16px        | Gaps within cards, input padding, MDX paragraph spacing |
| Section    | 24px, 32px, 40px | Gaps between cards, between content blocks              |
| Page       | 48px–96px+       | Vertical rhythm between major sections, hero padding    |
| Hero-level | 200px            | Dramatic section separation on marketing pages          |

Snap to the scale. No `13px` or `37px`.

### 4.2 Border Radius

Wiki tokens (defined in `src/app/global.css` `@theme`). The prod app overwhelmingly uses **pill-shaped buttons** (`rounded-full`) — match it on every interactive button.

| Context                    | Value | Tailwind            | Usage                                                                    |
| -------------------------- | ----- | ------------------- | ------------------------------------------------------------------------ |
| Inputs, small chips        | 6px   | `rounded-divine-md` | Form fields, dropdown menu items                                         |
| Inner panels, callouts     | 8px   | `rounded-divine-lg` | MDX callouts, popovers, tooltip surfaces                                 |
| Cards, dialogs, containers | 12px  | `rounded-divine-xl` | Mod cards, blog cards, modal dialogs                                     |
| **Buttons & badges**       | 999px | `rounded-full`      | **All buttons (primary, secondary, ghost, icon), all badges, all chips** |

The pill shape is the dominant Divine button silhouette. Reach for `rounded-full` first for any clickable button — primary CTA, secondary action, ghost, icon button, snippet chip. The 12px (`rounded-divine-xl`) value is for surfaces, not buttons.

### 4.3 Breakpoints (Desktop-First)

The wiki uses Tailwind v4 defaults plus the prod custom breakpoints where needed:

| Name  | Width  |
| ----- | ------ |
| `sm`  | 640px  |
| `md`  | 768px  |
| `lg`  | 1024px |
| `xl`  | 1280px |
| `2xl` | 1536px |

For pages that need to align with the prod app's wide-desktop treatments (homepage, landing), adopt the prod custom breakpoints inline via arbitrary values: `[@media(min-width:1920px)]:...`. The primary docs reading width is **~960px**, so most pages don't need wide-desktop work.

---

## 5. Gradients & Effects

### 5.1 Signature Gradients

**Primary Button Gradient**

```
linear-gradient(90deg, #B472FF 0%, #783CB5 100%)
Tailwind: bg-gradient-to-r from-[#B472FF] to-[#783CB5]
```

Lilac → purple, left-to-right. Makes buttons feel dimensional, lit from one side.

**Premium Card Border Gradient — THE signature motif**

```
linear-gradient(180deg, #ECB96A 0%, #C084FC 40%)
```

Top-to-bottom gold → soft purple. Creates the "glowing frame" on featured/premium cards. **The single most distinctive Divine Skins motif** — a card wearing this border is instantly on-brand. Use sparingly; it loses meaning if everything has it.

**Accent Text Gradient**

```
linear-gradient(90deg, #C084FC 0%, #783CB5 100%)
Tailwind: bg-gradient-to-r from-[#C084FC] to-[#783CB5] bg-clip-text text-transparent
```

For luminous emphasis on a single phrase or word.

**Decorative HR / Divider**

```
linear-gradient(90deg, #ECB96A 0%, #783CB5 100%)
Tailwind: bg-gradient-to-r from-[#ECB96A] to-[#783CB5]
```

Gold → purple horizontal accents between major sections on marketing surfaces.

### 5.2 Glow Effects

Glow turns "dark UI" into "gaming atmosphere." **Apply only to interactive elements — never to body content, prose, or callouts.**

**Button idle**

```css
box-shadow: 0 0 54px -7px #783cb5;
/* Tailwind: shadow-[0_0_54px_-7px_#783CB5] */
```

**Button hover (multi-layer bloom — "powering up")**

```css
box-shadow:
  0 0 5px #783cb5,
  0 0 25px #783cb5,
  0 0 25px #783cb5,
  0 0 100px #783cb5;
/* Tailwind: hover:shadow-[0_0_5px_#783CB5,0_0_25px_#783CB5,0_0_25px_#783CB5,0_0_100px_#783CB5] */
```

**Card idle**

```css
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
```

**Card hover**

```css
box-shadow: 0 8px 25px rgba(120, 60, 181, 0.15);
```

Faint purple glow on hover — a subtle brand fingerprint.

---

## 6. Component Patterns (Wiki-Specific)

### 6.1 Docs Page Shell (Fumadocs)

The Fumadocs docs layout drives most pages. Don't rebuild it. Style **inside** Fumadocs by:

- Setting CSS variables in `global.css` (`--color-divine-*`) — Fumadocs picks them up via the neutral preset
- Using `divine-*` Tailwind tokens in MDX components
- Letting the sidebar, breadcrumbs, TOC, and search inherit the brand palette

Don't override Fumadocs internals with custom CSS unless absolutely necessary; if you do, scope the override and comment why.

### 6.2 MDX Callouts (`Callout` from `src/components/mdx/`)

Use status colors at reduced opacity:

- **Note / info:** `bg-divine-info/10 border-divine-info/40 text-divine-text`
- **Tip / success:** `bg-divine-success/10 border-divine-success/40`
- **Warning:** `bg-divine-warning/10 border-divine-warning/40`
- **Danger / banned-region:** `bg-divine-error/10 border-divine-error/40`

All callouts: `rounded-divine-lg`, 16px padding, 4px left-border accent in the status color.

### 6.3 Code Blocks

JetBrains Mono. Background: `bg-divine-elevated` (`#1C1C1C`) so they sit slightly above surface. `rounded-divine-md`, 16px padding. Inline code: `bg-divine-border/50 text-divine-text-muted px-1 rounded`.

### 6.4 Cards (Marketing & Featured Content)

- **Default:** `bg-divine-surface` + `1px solid var(--color-divine-border)` + `rounded-divine-lg` + card-idle shadow
- **Featured:** wrap in a 1px gradient border using the signature gold-to-purple motif
- **Hover:** add the card-hover purple glow

### 6.5 Buttons

All buttons are **pill-shaped** (`rounded-full`). Prod uses `rounded-full` ~46× on the homepage alone — it's the dominant Divine silhouette. Sentence case label, 1–3 words, action-first verb.

**Primary (gradient)**

```
bg-gradient-to-r from-[#B472FF] to-[#783CB5]
rounded-full
text-white font-semibold
divine-glow hover:divine-glow-hover
```

The lead CTA. One per page-section, max.

**Primary (flat)**

```
bg-divine-primary hover:bg-divine-primary/85
rounded-full
text-white font-semibold
```

Used when a gradient would compete with nearby content (in toolbars, in tables).

**Secondary**

```
bg-white/10 hover:bg-white/20
rounded-full
text-divine-text font-semibold
```

**Ghost**

```
bg-transparent text-divine-text-muted
rounded-full
hover:bg-divine-primary/10 hover:text-divine-primary-light
```

**Outline**

```
border border-divine-border bg-transparent
rounded-full
hover:bg-divine-elevated hover:border-divine-primary/50
```

**Link / inline**
Inherit text color, underline on hover, primary purple for branded links. (`rounded-none` — links aren't pills.)

### 6.6 Inputs

`bg-divine-surface`, `border border-divine-border`, `rounded-divine-md`, focus ring in primary purple. Placeholder uses `text-divine-text-muted`.

### 6.7 Badges / Pills

Fully rounded (`rounded-full`), small text (12–13px), status color at reduced opacity for background.

### 6.8 Footer / Navigation

Multi-column layout on `bg-divine-void`. Body text `text-divine-text-muted`, link hover `text-divine-text`. Social icons in `lucide-react`.

---

## 7. Imagery & Illustration

### 7.1 Guide Screenshots

The bulk of wiki imagery. Live in `public/wiki-images/`. Always:

- Compress to ≤ 500 KB before committing (Cloudflare Pages build is sensitive to large blobs)
- Provide meaningful `alt=""` — review enforces this; the autotest was removed
- Reference as `<img src="/wiki-images/..." alt="...">` (legacy migrated images already use this pattern)

### 7.2 Decorative Illustrations

Reserved for marketing surfaces (homepage, landing). Same direction as prod — soft, friendly chibi/cute character art that contrasts with the sleek dark UI. Don't add decorative illustrations to docs pages; they pull focus from the content.

### 7.3 Atmospheric Background Elements

Soft, blurred blobs of color (purple/pink/warm tones) for hero sections only. Low opacity, large blur, no animation. Never on docs pages.

---

## 8. Design DNA — The Five Identity Markers

If you rebuilt Divine Skins from scratch, these five things make it unmistakable. **Every piece of UI you ship must pass these markers.**

1. **Purple glow on a dark void.** `#0B0A0F` + `#783CB5` glow = game launcher, not web marketplace.
2. **Gold-to-purple gradient border.** The single most distinctive motif. A card framed with top-gold-to-bottom-purple is instantly Divine Skins.
3. **Three-tier depth layering.** Void → surface → border. Nothing feels stuck to the page.
4. **Vibrant content on a muted stage.** UI is intentionally desaturated so screenshots, mod artwork, and code shine.
5. **Gaming glow, restrained.** Inspired by ability cooldowns and item shop highlights. Used surgically — never plastered everywhere.

---

## 9. Tailwind v4 Token Cheat Sheet

```
SURFACES                       BRAND
bg-divine-void                 bg-divine-primary         (#783CB5)
bg-divine-surface              bg-divine-primary-light   (#C084FC)
bg-divine-elevated             bg-divine-primary-lilac   (#B472FF)
bg-divine-border               bg-divine-secondary       (#ECB96A — gold)
bg-divine-popover

TEXT                           STATUS
text-divine-text               bg-divine-success / text-divine-success
text-divine-text-muted         bg-divine-error   / text-divine-error
                               bg-divine-warning / text-divine-warning
                               bg-divine-info    / text-divine-info

RADII                          FONTS
rounded-divine-md  (6px)       font-[family-name:var(--font-hero)]      Manrope
rounded-divine-lg  (8px)       font-[family-name:var(--font-section)]   Poppins
rounded-divine-xl  (12px)      font-[family-name:var(--font-ui)]        Inter
                               font-mono                                JetBrains Mono
```

**Order of preference when picking a class:**

1. Semantic `divine-*` token (`bg-divine-surface`, `text-divine-text`)
2. Arbitrary value with brand hex (`bg-[#783CB5]`) — only when no token covers
3. Generic Tailwind palette (`text-white`, `bg-zinc-900`) — avoid; use tokens

---

## 10. Icon Library

**`lucide-react`** is the official icon set across both prod and wiki. Always use lucide; never mix sets.

```tsx
import { Download, BookOpen, ExternalLink, X } from "lucide-react";

<Download className="size-4 text-divine-text" />
<BookOpen className="size-5 text-divine-primary" />
```

### Conventions

- Import named icons directly. No default or namespace imports.
- **Size:** `size-4` (16px) inline, `size-5` (20px) buttons, `size-6` (24px) headers / standalone. Avoid raw `w-* h-*`.
- **Color:** drive via `text-*` classes. Inherits from parent text color when no class is set.
- **Stroke:** keep default `strokeWidth={2}`. Use `strokeWidth={1.5}` only for large decorative icons (32px+).
- **Choose names by action**, not literal object: `Download` for downloads, `BookOpen` for guide listings, `ExternalLink` for outbound links, `Github` for source links.

---

## 11. Wiki-Stack Reminders

A few wiki-specific gotchas that affect UI work — keep them in mind so your component compiles and ships:

- **Tailwind v4 + Fumadocs.** Tokens live in `src/app/global.css` under `@theme`. There is no `tailwind.config.js`. If a token doesn't resolve, check `global.css` first.
- **MDX `<` escape.** When writing component examples in MDX docs, `<` before a digit (e.g. `<3`, `<60k`) must be escaped as `\<3`.
- **Fumadocs caches `source.config.ts`** in `.source/`. If a config or token edit doesn't take effect, `rm -rf .next .source` and restart `npm run dev`.
- **No `<ViewTransition>` from React.** It's Canary-only; we're on stable. Don't import it.
- **Don't hand-edit non-English MDX.** `content/docs/fr-FR/**`, `tr-TR`, `pt-BR` are Crowdin-managed. UI you ship to those locales must keep token classes intact since the content gets re-synced.

---

## 12. Quick Token Sheet (One-Glance)

```
SURFACES        BRAND           TEXT             STATUS
#0B0A0F  void   #783CB5  purple #E4E4E7  text    #22C55E  success
#15141C  surf   #ECB96A  gold   #8B8D98  muted   #EF4444  error
#1C1C1C  elev   #B472FF  lilac*                  #FACC15  warning
#363242  border #C084FC  soft*                   #5865F2  info
#111016  popovr

* gradient endpoints

FONTS                      RADII             KEY GRADIENTS
Manrope         hero       6px  md           #B472FF → #783CB5  buttons
Poppins         section    8px  lg (cards)   #ECB96A → #C084FC  premium borders
Inter           UI         12px xl (buttons) #C084FC → #783CB5  accent text
JetBrains Mono  code       999  full (pills) #ECB96A → #783CB5  decorative dividers

GLOWS
Button idle:   shadow-[0_0_54px_-7px_#783CB5]
Button hover:  shadow-[0_0_5px_#783CB5,0_0_25px_#783CB5,0_0_25px_#783CB5,0_0_100px_#783CB5]
Card idle:     shadow-[0_4px_12px_rgba(0,0,0,0.3)]
Card hover:    shadow-[0_8px_25px_rgba(120,60,181,0.15)]
```

---

_Synced with the prod design system at `DivineSkinsWEB-PROD/.claude/skills/divine-ui-design-system/`. When the prod tokens change, mirror them here and into `src/app/global.css`._
