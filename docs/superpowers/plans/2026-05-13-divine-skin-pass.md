# Divine Skin Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the wiki's buttons, home hero, and docs chrome with the live Divine Skins site at `https://divineskins.gg`.

**Architecture:** Three surgical edits to existing files — no new files, no new dependencies. Rewrite `GlowCTA` to use prod's pill recipe (solid purple, inset highlight, 44px purple bloom). Retune the home page hero to Manrope and a two-CTA layout. Drop the gold→purple gradient from the docs page title and align the edit-on-GitHub footer button + TOC active state.

**Tech Stack:** Next.js 16 App Router, Fumadocs 16.2.3, Tailwind v4 (`@theme` tokens in `src/app/global.css`), TypeScript strict. **No test runner** — this is a static docs site; verification gates are `npm run lint`, `npm run types:check`, `npm run format:check`, and visual inspection in `npm run dev`.

**Spec:** `docs/superpowers/specs/2026-05-13-divine-skin-pass-design.md`

---

## File Structure

| Path                             | Action                               | Responsibility                                                                                                                                                                |
| -------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/mdx/GlowCTA.tsx` | Modify (full rewrite, same exports)  | Brand CTA component. Three variants (`primary`, `secondary`, `ghost`) × two sizes. Used by home page and MDX authors.                                                         |
| `src/app/[lang]/(home)/page.tsx` | Modify (hero block + tracks heading) | Wiki home. Typography goes Manrope; hero CTA count drops from three pills to one primary + one secondary + a text link.                                                       |
| `src/app/global.css`             | Modify (3 small rule changes)        | (a) `.divine-doc-title` → white Manrope. (b) Edit-on-GitHub button → secondary pill. (c) TOC active state → purple-light.                                                     |
| `messages/en.json`               | Modify (no key changes)              | No changes; existing copy strings (`ctaStart`, `ctaBrowse`, `ctaContribute`) already fit the new layout. Non-English locales are Crowdin-managed and must not be hand-edited. |

---

### Task 1: Rewrite GlowCTA — pill shape, three variants

**Files:**

- Modify: `src/components/mdx/GlowCTA.tsx` (full rewrite, keeps the same export name)

- [ ] **Step 1: Replace the file contents**

Open `src/components/mdx/GlowCTA.tsx` and replace the whole file with:

```tsx
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

interface GlowCTAProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
}

const SIZE_CLASSES: Record<Size, string> = {
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-7 text-base",
};

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-full " +
  "font-[var(--font-ui)] font-bold whitespace-nowrap no-underline";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-[#783CB5] hover:bg-[#8b4dd4] text-white " +
    "transition-[background-color,box-shadow] duration-300",
  secondary:
    "bg-white/10 hover:bg-white/20 text-white transition-colors duration-200",
  ghost:
    "border border-divine-border bg-transparent text-divine-text " +
    "hover:border-divine-primary/60 hover:text-divine-primary-light " +
    "transition-colors duration-200",
};

const PRIMARY_GLOW: CSSProperties = {
  boxShadow:
    "inset 0px 1px 1px 0px rgba(255,255,255,0.35), " +
    "0px 0px 44px 0px rgba(120,60,181,0.55)",
};

export function GlowCTA({
  href,
  children,
  variant = "primary",
  size = "md",
}: GlowCTAProps) {
  const isExternal = /^https?:\/\//i.test(href);
  const Tag = isExternal ? "a" : Link;
  const externalProps = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  const className = `${BASE_CLASSES} ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]}`;
  const style = variant === "primary" ? PRIMARY_GLOW : undefined;

  return (
    <Tag href={href} {...externalProps} className={className} style={style}>
      {children}
    </Tag>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run types:check`
Expected: passes with no errors. (If a caller still passes `variant="ghost"` with no second slot, that's fine — `ghost` is preserved.)

- [ ] **Step 3: Verify lint + format**

Run: `npm run lint && npm run format:check`
Expected: both pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/mdx/GlowCTA.tsx
git commit -m "feat(home): rewrite GlowCTA to pill shape with prod-aligned glow"
```

---

### Task 2: Home page — Manrope hero + two-pill CTA layout

**Files:**

- Modify: `src/app/[lang]/(home)/page.tsx` (hero `<section>` block plus the tracks `<h2>`/subheading; lines ~27–69 in current file)

- [ ] **Step 1: Update the hero `<h1>`, subtitle, and CTA block**

In `src/app/[lang]/(home)/page.tsx`, replace the hero `<section>` (the one starting `className="flex flex-col items-center px-6 pt-24 pb-16 text-center md:pt-32 md:pb-20"`) with:

```tsx
<section className="flex flex-col items-center px-6 pt-24 pb-16 text-center md:pt-32 md:pb-20">
  <h1 className="text-divine-text font-manrope max-w-4xl text-4xl leading-[1.05] font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
    {renderTitleWithBrandAccent(t.title)}
  </h1>
  <p className="font-manrope mt-6 max-w-2xl text-base font-medium text-[#8B8D98] sm:text-lg md:text-xl">
    {t.tagline}
  </p>
  <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-3.5">
    <GlowCTA href={`/${lang}/docs/guided-walkthrough`} variant="primary">
      <BookOpenIcon className="size-4" aria-hidden />
      {t.ctaStart}
    </GlowCTA>
    <GlowCTA href={`/${lang}/docs`} variant="secondary">
      {t.ctaBrowse}
    </GlowCTA>
  </div>

  <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
    <Link
      href={`/${lang}/docs/contributing`}
      className="text-divine-text-muted hover:text-divine-primary-light inline-flex items-center gap-2 text-sm no-underline transition-colors"
    >
      <PencilLineIcon className="size-4" aria-hidden />
      {t.ctaContribute}
    </Link>
    <Link
      href={discordInviteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-divine-text-muted hover:text-divine-primary-light inline-flex items-center gap-2 text-sm no-underline transition-colors"
    >
      <MessageCircleIcon className="size-4" aria-hidden />
      {t.joinDiscord}
    </Link>
  </div>
</section>
```

This (a) sets the Manrope ladder on H1 + subtitle, (b) reduces the hero pills to primary + secondary, and (c) groups Contribute and Discord as sibling text links beneath.

- [ ] **Step 2: Update the tracks section heading**

In the same file, find the `<div className="mb-8 text-center">` block (~line 62) and replace it with:

```tsx
<div className="mb-8 text-center">
  <h2 className="text-divine-text font-manrope text-2xl font-bold tracking-tight md:text-[26px]">
    {t.tracksHeading}
  </h2>
  <p className="text-divine-text-muted font-manrope mt-2 text-sm">
    {t.tracksSubheading}
  </p>
</div>
```

- [ ] **Step 3: Verify the imports**

Confirm the top of the file already imports `Link`, `BookOpenIcon`, `PencilLineIcon`, `MessageCircleIcon`, `GlowCTA`, `getMessages`, `discordInviteUrl`. (They all exist in the current file — no change needed.) Remove `CompassIcon`, `PaintbrushIcon`, `SparklesIcon` from the import list **only if** they're now unused; they're still used by the `PremiumCard` block below, so leave them.

- [ ] **Step 4: Start the dev server and verify visually**

Run: `npm run dev`

Open `http://localhost:3000/en` and confirm:

- H1 reads in Manrope, with `Divine Skins` (or the brand word in the title string) wrapped in the gold→purple gradient via `.divine-gradient-text`.
- Primary CTA `Start here` is a solid purple pill with a soft purple bloom around it at rest; hover deepens the bloom.
- Secondary CTA `Browse guides` is a translucent white pill; hover lightens it.
- `Write a guide` and `Join the Divine Discord` appear below as two muted text links.
- Section heading `Pick your lane` renders in Manrope.

Stop the dev server (Ctrl-C) before continuing.

- [ ] **Step 5: Lint, types, format**

Run: `npm run lint && npm run types:check && npm run format:check`
Expected: all three pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/[lang]/\(home\)/page.tsx
git commit -m "feat(home): adopt prod hero typography and two-pill CTA layout"
```

---

### Task 3: Docs page title — drop gradient, use white Manrope

**Files:**

- Modify: `src/app/global.css` (the `.divine-doc-title` rule, lines ~249–262)

- [ ] **Step 1: Replace the `.divine-doc-title` rule**

In `src/app/global.css`, find the block starting `.divine-doc-title {` inside the `@layer components` and replace its body with:

```css
.divine-doc-title {
  font-family: var(--font-manrope), system-ui, sans-serif !important;
  font-weight: 800 !important;
  font-size: clamp(2rem, 1.4rem + 2vw, 2.75rem) !important;
  line-height: 1.1 !important;
  letter-spacing: -0.02em !important;
  color: var(--color-divine-text) !important;
  padding-bottom: 0.1em;
  margin-bottom: 0.4em !important;
}
```

Removed: the `background: linear-gradient(...)`, `-webkit-background-clip`, `background-clip`, and the `color: transparent` declarations. Everything else (Manrope, weight 800, size, spacing) stays.

- [ ] **Step 2: Verify visually**

Run: `npm run dev`

Open `http://localhost:3000/en/docs/guided-walkthrough` and confirm:

- The page title is white Manrope, **no gradient**.
- Subheadings (`##` → purple light h3s, `##` → white h2s) are unaffected.
- Body prose, code blocks, callouts unchanged.

Stop the dev server.

- [ ] **Step 3: Lint, format**

Run: `npm run lint && npm run format:check`
Expected: pass. (No `types:check` needed for a CSS-only change, but running it costs nothing — feel free to include it.)

- [ ] **Step 4: Commit**

```bash
git add src/app/global.css
git commit -m "style(docs): drop gradient from docs page title, use white Manrope"
```

---

### Task 4: Style the edit-on-GitHub button as a secondary pill

**Files:**

- Modify: `src/app/global.css` (add a new rule inside the existing `@layer components`)

- [ ] **Step 1: Identify the live selector**

Run: `npm run dev`

Open `http://localhost:3000/en/docs/guided-walkthrough` and scroll to the footer of the article. Right-click the **Edit on GitHub** link → Inspect. Note the rendered element — Fumadocs uses `a[href*="github.com"]` inside a footer container; the exact class is generated. The reliable selector is:

```
.prose + footer a[href*="github.com"],
[data-rehype-pretty-code-figure] ~ footer a[href*="github.com"]
```

If the live DOM differs, capture the actual class chain or `data-` attribute and use that — but the `a[href*="github.com"]` attribute selector is portable across Fumadocs releases.

Stop the dev server.

- [ ] **Step 2: Add the rule**

In `src/app/global.css`, inside the existing `@layer components { ... }` block (after the `.divine-doc-description` rule is a good landing spot), add:

```css
/* Edit-on-GitHub button — secondary pill, matches home CTA language. */
a[href*="github.com"][href*="/edit/"] {
  display: inline-flex !important;
  align-items: center;
  gap: 0.5rem;
  height: 2.5rem;
  padding-inline: 1.25rem;
  border-radius: 999px !important;
  background: color-mix(in srgb, #ffffff 10%, transparent) !important;
  color: var(--color-divine-text) !important;
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none !important;
  border: 0 !important;
  transition:
    background-color 0.2s,
    color 0.2s;
}
a[href*="github.com"][href*="/edit/"]:hover {
  background: color-mix(in srgb, #ffffff 20%, transparent) !important;
  color: #ffffff !important;
}
```

The `[href*="/edit/"]` attribute filter scopes the rule to Fumadocs' edit-on-GitHub link only (its href is `github.com/<owner>/<repo>/edit/<branch>/...`), avoiding collateral damage to other GitHub links in prose.

- [ ] **Step 3: Verify visually**

Run: `npm run dev`

Reload the docs page. Confirm the edit-on-GitHub link now renders as a translucent white pill that matches the home page's secondary CTA. Hover lightens.

Stop the dev server.

- [ ] **Step 4: Lint, format**

Run: `npm run lint && npm run format:check`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/global.css
git commit -m "style(docs): match edit-on-GitHub link to secondary pill button"
```

---

### Task 5: TOC active state — purple-light + gold→purple rail

**Files:**

- Modify: `src/app/global.css` (add a new rule inside `@layer components`)

- [ ] **Step 1: Inspect the TOC selectors**

Run: `npm run dev`

Open a docs page with multiple headings (e.g., `http://localhost:3000/en/docs/guided-walkthrough`). On a wide viewport, the right-rail TOC appears. Right-click an active TOC item → Inspect. Fumadocs renders TOC links with `data-active="true"` and a thumb element labelled `[data-toc-thumb]` or similar — capture the exact attribute used.

Stop the dev server.

- [ ] **Step 2: Add the rule**

In `src/app/global.css`, inside the same `@layer components` block, append:

```css
/* TOC active state — align with sidebar's purple-light + gold→purple rail. */
.dark [data-toc] a[data-active="true"],
.dark nav[aria-label*="able of contents"] a[data-active="true"] {
  color: var(--color-divine-primary-light) !important;
  font-weight: 600;
}
.dark [data-toc-thumb],
.dark [data-toc] [data-thumb] {
  background: linear-gradient(180deg, #ecb96a 0%, #c084fc 100%) !important;
  width: 2px !important;
  border-radius: 2px;
}
```

Both selectors are belt-and-suspenders for Fumadocs releases that toggle between `[data-toc]` and the ARIA-labelled `<nav>`. If your inspection in Step 1 shows a single canonical attribute, you can drop the other.

- [ ] **Step 3: Verify visually**

Run: `npm run dev`

Scroll a long docs page. As you scroll, confirm:

- The active TOC item turns purple-light (`#c084fc`) and bolder.
- The active rail/thumb beside the TOC items is a gold→purple gradient (matches the sidebar's active rail).
- Inactive items keep their muted style.

Stop the dev server.

- [ ] **Step 4: Lint, format**

Run: `npm run lint && npm run format:check`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/global.css
git commit -m "style(docs): polish TOC active state with purple-light + gradient rail"
```

---

### Task 6: Final verification pass

- [ ] **Step 1: Clean build**

Run: `rm -rf .next .source && npm run build`
Expected: build completes without errors. (Per CLAUDE.md, `source.config.ts` output is cached in `.source/`; nuking it ensures the fresh tokens compile cleanly.)

- [ ] **Step 2: Full lint + types + format gate**

Run: `npm run lint && npm run types:check && npm run format:check`
Expected: all three pass.

- [ ] **Step 3: Visual smoke test**

Run: `npm run dev`

Walk through these paths and confirm everything reads as one site with the live product:

- `http://localhost:3000/en` — hero in Manrope, two pills, two text links beneath.
- `http://localhost:3000/en/docs` — sidebar purple/gold, top-level category cards.
- `http://localhost:3000/en/docs/guided-walkthrough` — white Manrope page title (no gradient), prose intact, edit-on-GitHub pill at the bottom, TOC purple-light active state.
- One MDX page that uses `<GlowCTA>` (search content for `GlowCTA` if any exist; if none, this point is N/A) — renders as a pill in the new style.

Stop the dev server.

- [ ] **Step 4: Push branch and (optionally) open a PR**

This step is **optional** and only run if the user asks for a PR. Otherwise stop here — leave the branch local for review.

```bash
git status   # confirm clean working tree
git log --oneline -10
```

If the user asks for a PR:

```bash
git push -u origin chore/remove-backend   # or current branch
gh pr create --title "Divine skin pass — pill CTAs, hero typography, docs chrome" \
  --body "Aligns wiki with the live site. See docs/superpowers/specs/2026-05-13-divine-skin-pass-design.md."
```
