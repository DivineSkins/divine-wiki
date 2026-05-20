# Divine skin pass — wiki ↔ live site alignment

**Date:** 2026-05-13
**Status:** Approved, ready for implementation plan
**Reference:** Production design at `/Users/mike/Quick/Divine/Product/Divine Prod/DivineSkinsWEB-PROD`

## Goal

Bring the wiki closer to the live site's visual language by aligning **three surfaces** that diverge today:

1. **Buttons / CTAs** — the wiki's `GlowCTA` is gradient + `rounded-[12px]`; production uses a solid purple pill (`rounded-full`) with an inset highlight and a 44px outer purple bloom.
2. **Home page hero** — the wiki home uses generic system type; production uses Manrope at a specific scale and tracking.
3. **Docs chrome** — sidebar and prose are already deeply themed; a small tightening pass closes the last gaps (page title, edit-on-GitHub button, TOC).

The wiki's design tokens (purple `#783CB5`, gold `#ECB96A`, surface `#15141C`, etc.) already mirror production — only component-level expression diverges.

## Out of scope

- Marketing animations (Stars, ParticleField, NewHomePage's hand-select, hero video) — too heavy for a docs site; the existing radial purple wash is the right amount of atmosphere.
- Auth/profile/Redux/admin components from production — wiki is static and doesn't need them.
- Migrating Tailwind v4 `@theme` back to v3 config — token values already match.
- Touching Crowdin-managed non-English MDX (`content/docs/fr-FR/**`, etc.).

---

## 1. Button language

### Decision: pill shape with inset highlight + outer purple bloom

The single source of truth is `src/components/mdx/GlowCTA.tsx`. It's exported to MDX authors and used on the home page, so making it match production gets us most of the visual gain in one change.

**Primary variant** — solid purple pill, used for the one main action per surface:

```
inline-flex items-center justify-center gap-2
h-11 px-6
rounded-full
bg-[#783CB5] hover:bg-[#8b4dd4]
text-white text-sm font-bold whitespace-nowrap
transition-[background-color,box-shadow] duration-300
```

with inline style:

```ts
boxShadow: "inset 0px 1px 1px 0px rgba(255,255,255,0.35), " +
  "0px 0px 44px 0px rgba(120,60,181,0.55)";
```

**Secondary variant** — translucent white pill, used for the alternate action:

```
rounded-full bg-white/10 hover:bg-white/20
text-white text-sm font-bold
h-11 px-6
transition-colors duration-200
```

**Ghost variant** — bordered, no fill; kept for tertiary use:

```
rounded-full border border-divine-border
hover:border-divine-primary/60 hover:text-divine-primary-light
text-divine-text bg-transparent
h-11 px-6
transition-colors duration-200
```

**Sizes**: keep the current `md` (default) / `lg` two-size API. `md` = `h-11 px-6 text-sm` (prod hero baseline). `lg` = `h-12 px-7 text-base` (used when the CTA needs extra weight, e.g. standalone hero with one button).

**External-link handling**: unchanged — auto-detected via `/^https?:\/\//i`, opens in new tab with `rel="noopener noreferrer"`.

### Why this exact recipe

The 44px purple bloom (`0 0 44px rgba(120,60,181,0.55)`) is production's at-rest glow — it reads as Divine-branded without being loud. The inset 1px white highlight gives the button physicality (a subtle top edge) that the wiki's flat gradient currently lacks. Pill shape locks the brand instantly because every CTA on the live site is a pill.

### What we drop

- The current gradient background (`linear-gradient(90deg, #B472FF, #783CB5)`) — production uses solid purple. Gradient survives in the `divine-gradient-text` utility for accent words and the `divine-hr` divider.
- The `divine-glow-hover` 4-stack bloom (`0 0 5px, 0 0 25px, 0 0 25px, 0 0 100px`). It's too aggressive next to body copy; the simpler 44px glow scales better.
- Uppercase tracking on labels. Production uses sentence case.

### What stays untouched

- `src/components/ui/button.tsx` (shadcn `Button`). It's used in docs chrome (search, copy, edit-on-GitHub). Keep it shadcn-default — the brand glow belongs on hero CTAs, not on every button in the sidebar.

---

## 2. Home page hero

File: `src/app/[lang]/(home)/page.tsx`

### Typography ladder

Match production's hero scale exactly:

| Element                  | Class                                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| H1                       | `font-manrope font-bold tracking-tight leading-[1.05] text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-center` |
| Subtitle                 | `font-manrope font-medium text-base sm:text-lg md:text-xl text-[#8B8D98] text-center max-w-2xl mt-2`            |
| Section heading (Tracks) | `font-manrope font-bold text-2xl md:text-[26px] tracking-tight text-[#E4E4E7]`                                  |

The H1 keeps `renderTitleWithBrandAccent` so the brand word (`Divine Skins` / `Divine` / `League of Legends`) gets the gold→purple gradient via `.divine-gradient-text`.

### CTAs

Reduce from three pills to **one primary + one secondary** + a text link, mirroring production's "Explore Mods / Celestial Launcher" pattern:

```
[Start creating]   [Browse docs]
        Contribute →   (text link, muted, hover purple-light)
        Join the Discord →   (existing link, unchanged)
```

- Primary CTA: `<GlowCTA variant="primary">` → `Start creating` → `/docs/guided-walkthrough`
- Secondary CTA: `<GlowCTA variant="secondary">` → `Browse docs` → `/docs`
- Contribute: demoted to a text link sibling to the existing Discord link

### Atmosphere

Keep the existing radial purple wash:

```tsx
className =
  "absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(120,60,181,0.22),transparent_60%)]";
```

No stars, no particles, no animated columns — production's hero motion is brand marketing; the wiki's job is to get readers into content fast.

### Track cards

Keep `PremiumCard` as-is (already brand-correct). Update the wrapping section heading to use the Manrope scale above; subheading goes to `text-[#8B8D98] font-manrope`.

---

## 3. Docs chrome

The sidebar and prose styling in `src/app/global.css` are already deep; this is a light pass.

### Docs page title

Current `.divine-doc-title` uses a gold → light-gold → purple gradient that competes with body copy. Production keeps page titles white-Manrope, reserving gradient text for hero accents.

**Change:** `.divine-doc-title` becomes:

```css
font-family: var(--font-manrope), system-ui, sans-serif !important;
font-weight: 800 !important;
font-size: clamp(2rem, 1.4rem + 2vw, 2.75rem) !important;
line-height: 1.1 !important;
letter-spacing: -0.02em !important;
color: var(--color-divine-text) !important; /* was a gold→purple gradient */
margin-bottom: 0.4em !important;
```

The gradient utility (`.divine-gradient-text`) stays available for authors who want a single accent word.

### Edit on GitHub button

Re-style the Fumadocs edit-on-GitHub footer link to match the new secondary pill (white/10, rounded-full). Likely a small `@layer components` rule in `global.css` targeting the Fumadocs class — confirm selector during implementation.

### TOC active item

Audit `.dark` selectors for the Fumadocs TOC (`[data-toc-thumb]`, `[data-toc-link][data-active="true"]`). Apply `color: var(--color-divine-primary-light)` for active items; align the rail with the sidebar's gold→purple gradient bar (`linear-gradient(180deg, #ECB96A 0%, #C084FC 100%)`).

---

## Files touched

| Path                             | Change                                                                                                                              |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/mdx/GlowCTA.tsx` | Replace gradient + `rounded-[12px]` with prod's pill recipe. Add `secondary` variant. Keep `ghost`.                                 |
| `src/app/[lang]/(home)/page.tsx` | Update H1/subtitle/section typography to Manrope ladder. Reduce hero CTAs to primary + secondary. Demote "Contribute" to text link. |
| `src/app/global.css`             | (a) `.divine-doc-title` → white Manrope, drop gradient. (b) Edit-on-GitHub button styling. (c) TOC active-state polish.             |

**Not touched:** `src/components/ui/button.tsx`, content MDX, sidebar CSS (already correct), prose styling (already correct).

## Testing plan

- `npm run dev` and verify:
  - Home page hero renders with Manrope and the two-pill CTA pattern.
  - Primary CTA shows the inset highlight + 44px purple bloom at rest, deeper bloom on hover.
  - Secondary CTA renders as white/10 pill, hover lightens to white/20.
  - Track cards retain `PremiumCard` border + glow.
  - Docs page title is white Manrope, no gradient.
  - Edit on GitHub button reads as a secondary pill.
  - TOC active item is purple-light.
- `npm run lint`, `npm run format:check`, `npm run types:check` all pass.
- Quick spot-check on a docs page with H1 + body + code block + table + callout that the prose layer still reads correctly.

## Open questions resolved during brainstorming

| Question                            | Answer                                                                                   |
| ----------------------------------- | ---------------------------------------------------------------------------------------- |
| Pill vs `rounded-[12px]`?           | Pill (`rounded-full`) — matches production.                                              |
| Three hero CTAs vs two + text link? | Two pills + text link — production never shows three competing CTAs.                     |
| Keep gradient on docs page H1?      | No — make it white Manrope. Gradient stays for hero accent word and `divine-hr` divider. |
