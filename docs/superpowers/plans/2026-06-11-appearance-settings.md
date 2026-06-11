# Appearance Settings + Minimal Style Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A site-wide appearance settings popover (Mode / Style / Font / Width) plus a neutral grayscale "Minimal" style, persisted in localStorage and applied before first paint.

**Architecture:** Style and Font are an html class (`minimal`) and attribute (`data-font`) applied pre-paint by the existing inline script, exactly like the current `centered-reading` pattern. The Minimal palette works by re-declaring the three CSS token groups (`--color-divine-*`, shadcn vars, `--color-fd-*`) under `.minimal.light` / `.minimal.dark`, so token-driven styling flattens automatically; a small set of explicit resets kills glows/gradients, and the branded sidebar/search/TOC selectors get a `:not(.minimal)` guard so Minimal falls back to fumadocs' stock neutral look. One client component (gear popover) replaces the built-in ThemeToggle and the reading-width toggle.

**Tech Stack:** Next.js 16 App Router, fumadocs-ui 16.10 (`themeSwitch` option, `fumadocs-ui/components/ui/popover`), next-themes (already provided by RootProvider), next/font/google (Geist, Lora, Atkinson_Hyperlegible with `preload: false`), Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-06-11-appearance-settings-design.md`

**Verification model:** This repo has no JS test framework (and adding one for CSS theming is YAGNI). Each task verifies via `npm run lint` + `npm run types:check`, and the final task does a full visual pass with the dev server. Run `npm run format` before each commit so `format:check` (CI) stays green.

---

## Reference values (used by Task 1)

Fumadocs stock neutral palette, copied from
`node_modules/fumadocs-ui/css/lib/default-colors.css`. This IS the look of
the reference site (`Reference/site` imports `fumadocs-ui/css/neutral.css`
and never overrides the fd vars). Light:

```css
--color-fd-background: hsl(0, 0%, 96%);
--color-fd-foreground: hsl(0, 0%, 3.9%);
--color-fd-muted: hsl(0, 0%, 96.1%);
--color-fd-muted-foreground: hsl(0, 0%, 45.1%);
--color-fd-popover: hsl(0, 0%, 98%);
--color-fd-popover-foreground: hsl(0, 0%, 15.1%);
--color-fd-card: hsl(0, 0%, 94.7%);
--color-fd-card-foreground: hsl(0, 0%, 3.9%);
--color-fd-border: hsla(0, 0%, 80%, 50%);
--color-fd-primary: hsl(0, 0%, 9%);
--color-fd-primary-foreground: hsl(0, 0%, 98%);
--color-fd-secondary: hsl(0, 0%, 93.1%);
--color-fd-secondary-foreground: hsl(0, 0%, 9%);
--color-fd-accent: hsla(0, 0%, 82%, 50%);
--color-fd-accent-foreground: hsl(0, 0%, 9%);
--color-fd-ring: hsl(0, 0%, 63.9%);
--color-fd-overlay: hsla(0, 0%, 0%, 0.2);
```

Dark:

```css
--color-fd-background: hsl(0, 0%, 7.04%);
--color-fd-foreground: hsl(0, 0%, 92%);
--color-fd-muted: hsl(0, 0%, 12.9%);
--color-fd-muted-foreground: hsla(0, 0%, 70%, 0.8);
--color-fd-popover: hsl(0, 0%, 11.6%);
--color-fd-popover-foreground: hsl(0, 0%, 86.9%);
--color-fd-card: hsl(0, 0%, 9.8%);
--color-fd-card-foreground: hsl(0, 0%, 98%);
--color-fd-border: hsla(0, 0%, 40%, 20%);
--color-fd-primary: hsl(0, 0%, 98%);
--color-fd-primary-foreground: hsl(0, 0%, 9%);
--color-fd-secondary: hsl(0, 0%, 12.9%);
--color-fd-secondary-foreground: hsl(0, 0%, 92%);
--color-fd-accent: hsla(0, 0%, 40.9%, 30%);
--color-fd-accent-foreground: hsl(0, 0%, 90%);
--color-fd-ring: hsl(0, 0%, 54.9%);
--color-fd-overlay: hsla(0, 0%, 0%, 0.2);
```

---

### Task 1: Minimal palette + decoration resets in global.css

**Files:**

- Modify: `src/app/global.css`

- [ ] **Step 1: Add the `.minimal.dark` and `.minimal.light` token blocks**

Insert immediately AFTER the closing brace of the `.light { ... }` block
(currently ends at line 269, right before `@layer base`):

```css
/* ──────────────────────────────────────────────────────────────
   Minimal style — neutral grayscale, no brand decoration.
   Values mirror fumadocs' stock neutral palette (the look of the
   reference Fumadocs site this mode is modeled on). Activated by
   a `minimal` class on <html>: set pre-paint by the root-layout
   inline script, toggled by the appearance-settings popover.
   Composes with .light/.dark, so all four combos work.
   Re-declares all three token groups (divine, shadcn, fd) — the
   wiki's styling consumes these vars, so recoloring them is what
   flattens the branding. Two classes (0-2-0) out-rank the .dark /
   .light blocks above (0-1-0).
   ────────────────────────────────────────────────────────────── */
.minimal.dark {
  /* Divine tokens → neutral, so token-driven accents (code rails,
     blockquote rails, links, list markers, table tints) go gray. */
  --color-divine-void: hsl(0, 0%, 7%);
  --color-divine-surface: hsl(0, 0%, 9.8%);
  --color-divine-elevated: hsl(0, 0%, 12.9%);
  --color-divine-border: hsla(0, 0%, 40%, 0.2);
  --color-divine-popover: hsl(0, 0%, 11.6%);
  --color-divine-primary: hsl(0, 0%, 55%);
  --color-divine-primary-light: hsl(0, 0%, 92%);
  --color-divine-primary-lilac: hsl(0, 0%, 92%);
  --color-divine-secondary: hsl(0, 0%, 70%);
  --color-divine-text: hsl(0, 0%, 92%);
  --color-divine-text-muted: hsla(0, 0%, 70%, 0.8);

  /* shadcn tokens */
  --background: hsl(0, 0%, 7%);
  --foreground: hsl(0, 0%, 92%);
  --card: hsl(0, 0%, 9.8%);
  --card-foreground: hsl(0, 0%, 98%);
  --popover: hsl(0, 0%, 11.6%);
  --popover-foreground: hsl(0, 0%, 86.9%);
  --primary: hsl(0, 0%, 98%);
  --primary-foreground: hsl(0, 0%, 9%);
  --secondary: hsl(0, 0%, 12.9%);
  --secondary-foreground: hsl(0, 0%, 92%);
  --muted: hsl(0, 0%, 12.9%);
  --muted-foreground: hsla(0, 0%, 70%, 0.8);
  --accent: hsla(0, 0%, 40.9%, 0.3);
  --accent-foreground: hsl(0, 0%, 90%);
  --destructive: #ef4444;
  --border: hsla(0, 0%, 40%, 0.2);
  --input: hsla(0, 0%, 40%, 0.2);
  --ring: hsl(0, 0%, 54.9%);
  --sidebar: hsl(0, 0%, 7%);
  --sidebar-foreground: hsl(0, 0%, 92%);
  --sidebar-primary: hsl(0, 0%, 98%);
  --sidebar-primary-foreground: hsl(0, 0%, 9%);
  --sidebar-accent: hsla(0, 0%, 40.9%, 0.3);
  --sidebar-accent-foreground: hsl(0, 0%, 90%);
  --sidebar-border: hsla(0, 0%, 40%, 0.2);
  --sidebar-ring: hsl(0, 0%, 54.9%);

  /* Code */
  --prose-code-text: hsl(0, 0%, 92%);
  --prose-code-bg: hsl(0, 0%, 9.8%);

  /* Fumadocs tokens → stock neutral (every fumadocs surface). */
  --color-fd-background: hsl(0, 0%, 7.04%);
  --color-fd-foreground: hsl(0, 0%, 92%);
  --color-fd-muted: hsl(0, 0%, 12.9%);
  --color-fd-muted-foreground: hsla(0, 0%, 70%, 0.8);
  --color-fd-popover: hsl(0, 0%, 11.6%);
  --color-fd-popover-foreground: hsl(0, 0%, 86.9%);
  --color-fd-card: hsl(0, 0%, 9.8%);
  --color-fd-card-foreground: hsl(0, 0%, 98%);
  --color-fd-border: hsla(0, 0%, 40%, 0.2);
  --color-fd-primary: hsl(0, 0%, 98%);
  --color-fd-primary-foreground: hsl(0, 0%, 9%);
  --color-fd-secondary: hsl(0, 0%, 12.9%);
  --color-fd-secondary-foreground: hsl(0, 0%, 92%);
  --color-fd-accent: hsla(0, 0%, 40.9%, 0.3);
  --color-fd-accent-foreground: hsl(0, 0%, 90%);
  --color-fd-ring: hsl(0, 0%, 54.9%);
  --color-fd-overlay: hsla(0, 0%, 0%, 0.2);
}

.minimal.light {
  /* Divine tokens → neutral */
  --color-divine-void: hsl(0, 0%, 100%);
  --color-divine-surface: hsl(0, 0%, 97%);
  --color-divine-elevated: hsl(0, 0%, 94.7%);
  --color-divine-border: hsla(0, 0%, 80%, 0.5);
  --color-divine-popover: hsl(0, 0%, 98%);
  --color-divine-primary: hsl(0, 0%, 45%);
  --color-divine-primary-light: hsl(0, 0%, 9%);
  --color-divine-primary-lilac: hsl(0, 0%, 9%);
  --color-divine-secondary: hsl(0, 0%, 45%);
  --color-divine-text: hsl(0, 0%, 3.9%);
  --color-divine-text-muted: hsl(0, 0%, 45.1%);

  /* shadcn tokens */
  --background: hsl(0, 0%, 100%);
  --foreground: hsl(0, 0%, 3.9%);
  --card: hsl(0, 0%, 97%);
  --card-foreground: hsl(0, 0%, 3.9%);
  --popover: hsl(0, 0%, 98%);
  --popover-foreground: hsl(0, 0%, 15.1%);
  --primary: hsl(0, 0%, 9%);
  --primary-foreground: hsl(0, 0%, 98%);
  --secondary: hsl(0, 0%, 93.1%);
  --secondary-foreground: hsl(0, 0%, 9%);
  --muted: hsl(0, 0%, 96.1%);
  --muted-foreground: hsl(0, 0%, 45.1%);
  --accent: hsla(0, 0%, 82%, 0.5);
  --accent-foreground: hsl(0, 0%, 9%);
  --destructive: #dc2626;
  --border: hsla(0, 0%, 80%, 0.5);
  --input: hsla(0, 0%, 80%, 0.5);
  --ring: hsl(0, 0%, 63.9%);
  --sidebar: hsl(0, 0%, 98%);
  --sidebar-foreground: hsl(0, 0%, 3.9%);
  --sidebar-primary: hsl(0, 0%, 9%);
  --sidebar-primary-foreground: hsl(0, 0%, 98%);
  --sidebar-accent: hsla(0, 0%, 82%, 0.5);
  --sidebar-accent-foreground: hsl(0, 0%, 9%);
  --sidebar-border: hsla(0, 0%, 80%, 0.5);
  --sidebar-ring: hsl(0, 0%, 63.9%);

  /* Code */
  --prose-code-text: hsl(0, 0%, 15%);
  --prose-code-bg: hsl(0, 0%, 97%);

  /* Fumadocs tokens → stock neutral */
  --color-fd-background: hsl(0, 0%, 96%);
  --color-fd-foreground: hsl(0, 0%, 3.9%);
  --color-fd-muted: hsl(0, 0%, 96.1%);
  --color-fd-muted-foreground: hsl(0, 0%, 45.1%);
  --color-fd-popover: hsl(0, 0%, 98%);
  --color-fd-popover-foreground: hsl(0, 0%, 15.1%);
  --color-fd-card: hsl(0, 0%, 94.7%);
  --color-fd-card-foreground: hsl(0, 0%, 3.9%);
  --color-fd-border: hsla(0, 0%, 80%, 0.5);
  --color-fd-primary: hsl(0, 0%, 9%);
  --color-fd-primary-foreground: hsl(0, 0%, 98%);
  --color-fd-secondary: hsl(0, 0%, 93.1%);
  --color-fd-secondary-foreground: hsl(0, 0%, 9%);
  --color-fd-accent: hsla(0, 0%, 82%, 0.5);
  --color-fd-accent-foreground: hsl(0, 0%, 9%);
  --color-fd-ring: hsl(0, 0%, 63.9%);
  --color-fd-overlay: hsla(0, 0%, 0%, 0.2);
}
```

- [ ] **Step 2: Guard the branded `.dark`-scoped overrides with `:not(.minimal)`**

Inside `@layer components`, every selector that hard-codes the branded look
under `.dark` must not fire in Minimal. Replace the `.dark ` prefix with
`.dark:not(.minimal) ` on these rules (find each by its current selector;
`.dark` sits on `<html>`, and the draft editor's forced-dark `<div class="dark">`
also matches `.dark:not(.minimal)` so `/draft` keeps its branded dark look):

- `.dark [data-toc] a[data-active="true"]` and `.dark nav[aria-label*="able of contents"] a[data-active="true"]`
- `.dark [data-toc-thumb]` and `.dark [data-toc] [data-thumb]`
- `.dark #nd-sidebar` (the big sidebar block)
- `.dark #nd-sidebar > div:first-child`
- `.dark #nd-sidebar button[aria-label="Search"]`, `.dark #nd-sidebar [data-search-full]` (and their `:hover` twins)
- `.dark #nd-sidebar a[data-active]`, `.dark #nd-sidebar button[data-active]`
- `.dark #nd-sidebar a[data-active="false"]:hover`, `.dark #nd-sidebar button[data-active="false"]:hover`
- `.dark #nd-sidebar a[data-active="true"]`, `.dark #nd-sidebar button[data-active="true"]` (and the `svg` and `::before` variants)
- `.dark #nd-sidebar [class*="before:bg-fd-border"]::before`
- `.dark #nd-sidebar > div:last-child`
- `.dark [data-state="open"][data-slot="overlay"]`, `.dark [data-radix-popper-content-wrapper] + div[data-state="open"]`
- `.dark [role="dialog"][data-state="open"]:has(input[placeholder])`, `.dark [role="dialog"][data-state="open"][aria-labelledby*="radix"]`
- `.dark [role="dialog"] input[placeholder]`
- `.dark [role="dialog"] button[type="button"]:has(> *:only-child)`
- `.dark [role="dialog"] button[aria-selected="true"]`
- `.dark [role="dialog"] [class*="bg-fd-secondary"]`
- `.dark [role="dialog"] :focus-visible`

Example (first rule):

```css
.dark:not(.minimal) [data-toc] a[data-active="true"],
.dark:not(.minimal) nav[aria-label*="able of contents"] a[data-active="true"] {
```

Note: the spec mentions converting literal `#783cb5` hexes to
`var(--color-divine-primary)`. The guards in this step plus the resets in
Step 3 cover every literal that matters (the TOC thumb and sidebar rail
literals live inside guarded rules; the glow/gradient literals get reset;
the `.dark` block's `--color-fd-accent`/`--color-fd-border` literals are
out-ranked by the `.minimal.dark` re-declarations) — same outcome, fewer
edits, so no mass conversion is needed.

- [ ] **Step 3: Add the decoration reset block**

Append at the very END of `global.css` (after the `#nd-page` rules), kept
UNLAYERED on purpose — `divine-glow` etc. are Tailwind `@utility` classes
emitted in the utilities layer, and an unlayered rule overrides any layered
one:

```css
/* ──────────────────────────────────────────────────────────────
   Minimal style — decoration resets. Token recoloring (see the
   .minimal.dark/.minimal.light blocks) flattens everything that
   reads vars; these kill the effects that don't: glows, the
   gradient text, and the card-hover bloom.
   ────────────────────────────────────────────────────────────── */
.minimal .divine-glow,
.minimal .divine-glow-hover {
  box-shadow: none;
}
.minimal .divine-card-hover {
  box-shadow: 0 8px 25px rgb(0 0 0 / 0.12);
}
.minimal .divine-gradient-text {
  background: none;
  -webkit-background-clip: border-box;
  background-clip: border-box;
  color: var(--color-divine-text);
}
```

- [ ] **Step 4: Verify build health**

Run: `npm run lint && npm run types:check`
Expected: both pass (CSS-only change; this catches syntax errors via the
fumadocs-mdx step in types:check's prebuild).

Then run: `npm run format`
Expected: rewrites `global.css` if Prettier disagrees with formatting.

- [ ] **Step 5: Quick visual smoke test**

Run: `npm run dev` (background), open `http://localhost:3000/en/docs/lol`.
In browser devtools console:
`document.documentElement.classList.add("minimal")` — page should go
neutral grayscale (sidebar loses purple, links/rails go gray).
`document.documentElement.classList.remove("dark"); document.documentElement.classList.add("light")`
— white minimal. Remove `minimal` — branded light returns. Stop the server.

- [ ] **Step 6: Commit**

```bash
git add src/app/global.css
git commit -m "feat(theme): add Minimal style palette and decoration resets"
```

---

### Task 2: Font picker infrastructure (fonts, --font-body indirection, minimal typography)

**Files:**

- Modify: `src/app/[lang]/layout.tsx`
- Modify: `src/app/global.css`

- [ ] **Step 1: Load the three picker fonts in the root layout**

In `src/app/[lang]/layout.tsx`, extend the existing `next/font/google`
import and add the font constants after `jetbrainsMono`:

```tsx
import {
  Manrope,
  Poppins,
  Inter,
  JetBrains_Mono,
  Geist,
  Lora,
  Atkinson_Hyperlegible,
} from "next/font/google";
```

```tsx
// Picker fonts — preload:false means the @font-face CSS ships but the
// browser only downloads a font when the selected setting actually uses
// it, so visitors who never open the font picker pay ~nothing.
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  preload: false,
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  preload: false,
});

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
  preload: false,
});
```

- [ ] **Step 2: Move the font variables onto `<body>`**

Currently the variables live on a wrapper `<div>` inside `<body>`, which
means `body { font-family: var(--font-inter) }` can't actually resolve the
var. Move them to `<body>` and drop the wrapper div:

```tsx
<body
  className={cn(
    manrope.variable,
    poppins.variable,
    inter.variable,
    jetbrainsMono.variable,
    geist.variable,
    lora.variable,
    atkinson.variable,
  )}
>
  {/* pre-paint script stays here, unchanged in this task */}
  <RootProvider i18n={provider(lang)}>
    <ContributePickerProvider>
      {children}
      <ContributePickerModal />
    </ContributePickerProvider>
  </RootProvider>
</body>
```

(Keep the inline `<script>` as the first child of `<body>`.)

- [ ] **Step 3: Introduce `--font-body` and the `data-font` swaps in global.css**

In the `:root` block (the one with "Promote @theme font tokens..."), add
after the `--font-ui` line:

```css
--font-body: var(--font-inter), system-ui, sans-serif;
```

Then add a new top-level block right after the `:root` block's closing
brace:

```css
/* Font preference — the settings popover sets data-font on <html>
   (pre-paint via the root-layout inline script). --font-body is the
   single indirection every body-text rule consumes; headings keep
   their display fonts in Divine style and collapse to --font-body
   in Minimal (see the .minimal font overrides below). */
html[data-font="geist"] {
  --font-body: var(--font-geist), system-ui, sans-serif;
}
html[data-font="lora"] {
  --font-body: var(--font-lora), Georgia, serif;
}
html[data-font="atkinson"] {
  --font-body: var(--font-atkinson), system-ui, sans-serif;
}
html[data-font="system"] {
  --font-body: system-ui, -apple-system, "Segoe UI", sans-serif;
}
```

- [ ] **Step 4: Point body-text rules at `--font-body`**

In `global.css`, replace `var(--font-inter), system-ui, sans-serif` with
`var(--font-body)` in exactly these spots (search for each):

1. `body { ... font-family: var(--font-inter), system-ui, sans-serif; }` (in `@layer base`)
2. `.prose p { font-family: var(--font-inter), system-ui, sans-serif !important; ... }`
3. `.prose li { font-family: var(--font-inter), system-ui, sans-serif; ... }`
4. The Edit-on-GitHub link rule: `font-family: var(--font-inter), system-ui, sans-serif;`

Leave every `var(--font-jetbrains-mono)` (code) and the Manrope/Poppins
heading rules untouched — the font picker governs body text only in Divine
style.

- [ ] **Step 5: Minimal typography — headings follow the selected font**

Append to the END of the `@layer components` block (just before its closing
brace; the extra `.minimal` class out-ranks the base heading rules in the
same layer):

```css
/* Minimal style — single-typeface, reference-like: display fonts
   (Manrope/Poppins) drop out and every heading-ish element follows
   the selected body font. */
.minimal .divine-doc-title,
.minimal .divine-doc-description,
.minimal .prose h2:not(:where([class~="not-prose"], [class~="not-prose"] *)),
.minimal .prose h3:not(:where([class~="not-prose"], [class~="not-prose"] *)),
.minimal .prose h4:not(:where([class~="not-prose"], [class~="not-prose"] *)),
.minimal .prose h5:not(:where([class~="not-prose"], [class~="not-prose"] *)),
.minimal .prose h6:not(:where([class~="not-prose"], [class~="not-prose"] *)),
.minimal .prose th,
.minimal .prose details > summary,
.minimal .divine-faq h3 > button {
  font-family: var(--font-body) !important;
}
```

Also redefine the promoted font tokens so non-prose chrome (nav title,
home-page sections) follows along. Add right after the
`html[data-font="system"]` block from Step 3:

```css
.minimal {
  --font-hero: var(--font-body);
  --font-section: var(--font-body);
  --font-ui: var(--font-body);
}
```

- [ ] **Step 6: Verify**

Run: `npm run lint && npm run types:check && npm run format`
Expected: pass.

Dev-server spot check: `document.documentElement.setAttribute("data-font", "lora")`
→ body paragraphs turn serif; remove the attribute → Inter returns. With
`minimal` class added, headings also switch.

- [ ] **Step 7: Commit**

```bash
git add src/app/[lang]/layout.tsx src/app/global.css
git commit -m "feat(theme): font picker infrastructure with --font-body indirection"
```

---

### Task 3: Pre-paint script for style + font

**Files:**

- Modify: `src/app/[lang]/layout.tsx`

- [ ] **Step 1: Extend the inline script**

Replace the existing `dangerouslySetInnerHTML` script (the reading-width
one) with one that applies all three persisted preferences before first
paint. Keys must match `appearance-settings.tsx` (Task 5):

```tsx
{
  /* Apply persisted appearance preferences (reading width, Minimal
    style, font) before first paint — same no-flash trick next-themes
    uses for the theme class. Keys stay in sync with
    src/components/appearance-settings.tsx. */
}
<script
  dangerouslySetInnerHTML={{
    __html: `try{var c=document.documentElement.classList;if(localStorage.getItem("divine-reading-width")==="centered")c.add("centered-reading");if(localStorage.getItem("divine-style")==="minimal")c.add("minimal");var f=localStorage.getItem("divine-font");if(f&&f!=="inter")document.documentElement.setAttribute("data-font",f)}catch(e){}`,
  }}
/>;
```

(`<html>` already has `suppressHydrationWarning`, which covers the class
and attribute mutations.)

- [ ] **Step 2: Verify**

Run: `npm run lint && npm run types:check`
Expected: pass.

Dev-server check: in console run
`localStorage.setItem("divine-style","minimal"); localStorage.setItem("divine-font","geist")`,
reload — page loads already-minimal with Geist, no flash of branded theme.
Clear with `localStorage.clear()` afterwards.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[lang]/layout.tsx"
git commit -m "feat(theme): apply persisted style and font before first paint"
```

---

### Task 4: Settings labels in messages

**Files:**

- Modify: `messages/en.json`

- [ ] **Step 1: Add the `settings` section and drop `nav.readingWidth`**

In `messages/en.json`: remove the `"readingWidth"` key from `"nav"` (its
consumer is deleted in Task 6), and add a top-level `"settings"` object
(place it after `"nav"`):

```json
"settings": {
  "trigger": "Appearance settings",
  "mode": "Mode",
  "modeLight": "Light",
  "modeDark": "Dark",
  "modeSystem": "System",
  "style": "Style",
  "styleDivine": "Divine",
  "styleMinimal": "Minimal",
  "font": "Font",
  "fontSystem": "System font",
  "width": "Width",
  "widthWide": "Wide",
  "widthCentered": "Centered"
}
```

Non-English locales fall back to English automatically via the deep-merge
in `src/lib/locale.ts` — do NOT touch the other `messages/*.json` files
(Crowdin-managed).

- [ ] **Step 2: Verify**

Run: `npm run types:check`
Expected: FAILS in `src/app/[lang]/docs/layout.tsx` (still reads
`messages.nav.readingWidth`). That's the expected red state — Task 6
fixes the consumer. If it fails anywhere else, fix that here.

- [ ] **Step 3: Commit (together with Task 5 or 6 if you prefer green commits)**

Hold the commit until Task 6 makes types green, then commit the message
change with the wiring (see Task 6 Step 5). If executing tasks with
separate subagents, just leave the file modified and note it for Task 6.

---

### Task 5: AppearanceSettings component

**Files:**

- Create: `src/components/appearance-settings.tsx`

- [ ] **Step 1: Write the component**

Full file content:

```tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTheme } from "next-themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "fumadocs-ui/components/ui/popover";
import { Settings2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Appearance settings popover: Mode (light/dark/system via next-themes),
 * Style (Divine/Minimal), Font, and reading Width. Style, font, and width
 * live as a class / data attribute on <html>, set before paint by the
 * inline script in src/app/[lang]/layout.tsx and persisted in
 * localStorage — keep the keys in sync with that script.
 */

export const STYLE_STORAGE_KEY = "divine-style";
export const FONT_STORAGE_KEY = "divine-font";
export const READING_WIDTH_STORAGE_KEY = "divine-reading-width";

const MINIMAL_CLASS = "minimal";
const CENTERED_CLASS = "centered-reading";

export interface SettingsLabels {
  trigger: string;
  mode: string;
  modeLight: string;
  modeDark: string;
  modeSystem: string;
  style: string;
  styleDivine: string;
  styleMinimal: string;
  font: string;
  fontSystem: string;
  width: string;
  widthWide: string;
  widthCentered: string;
}

type FontId = "inter" | "geist" | "lora" | "atkinson" | "system";

// label rendered in its own typeface so the row previews the font.
const FONT_OPTIONS: { id: FontId; label: string; family: string }[] = [
  { id: "inter", label: "Inter", family: "var(--font-inter), sans-serif" },
  { id: "geist", label: "Geist", family: "var(--font-geist), sans-serif" },
  { id: "lora", label: "Lora", family: "var(--font-lora), serif" },
  {
    id: "atkinson",
    label: "Atkinson Hyperlegible",
    family: "var(--font-atkinson), sans-serif",
  },
  { id: "system", label: "", family: "system-ui, sans-serif" },
];

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-fd-muted-foreground text-xs">{label}</span>
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  groupLabel,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
  groupLabel: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={groupLabel}
      className="inline-flex items-center rounded-full border p-0.5"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs transition-colors",
            value === option.value
              ? "bg-fd-accent text-fd-accent-foreground font-medium"
              : "text-fd-muted-foreground hover:text-fd-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function AppearanceSettings({ labels }: { labels: SettingsLabels }) {
  const { theme, setTheme } = useTheme();
  // SSR can't read localStorage / the html element; render defaults and
  // sync once after hydration (same pattern the old reading-width toggle
  // used). `mounted` gates the Mode row to avoid a hydration mismatch
  // from next-themes.
  const [mounted, setMounted] = useState(false);
  const [style, setStyle] = useState<"divine" | "minimal">("divine");
  const [font, setFont] = useState<FontId>("inter");
  const [centered, setCentered] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setStyle(root.classList.contains(MINIMAL_CLASS) ? "minimal" : "divine");
    setFont((root.getAttribute("data-font") as FontId) ?? "inter");
    setCentered(root.classList.contains(CENTERED_CLASS));
  }, []);

  function persist(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage can be unavailable (private mode); the setting still
      // applies for the session.
    }
  }

  function applyStyle(next: "divine" | "minimal") {
    setStyle(next);
    document.documentElement.classList.toggle(
      MINIMAL_CLASS,
      next === "minimal",
    );
    persist(STYLE_STORAGE_KEY, next);
  }

  function applyFont(next: FontId) {
    setFont(next);
    if (next === "inter") {
      document.documentElement.removeAttribute("data-font");
    } else {
      document.documentElement.setAttribute("data-font", next);
    }
    persist(FONT_STORAGE_KEY, next);
  }

  function applyWidth(next: boolean) {
    setCentered(next);
    document.documentElement.classList.toggle(CENTERED_CLASS, next);
    persist(READING_WIDTH_STORAGE_KEY, next ? "centered" : "wide");
  }

  return (
    <Popover>
      <PopoverTrigger
        aria-label={labels.trigger}
        className="text-fd-muted-foreground hover:text-fd-accent-foreground hover:bg-fd-accent inline-flex items-center justify-center rounded-full border p-1.5"
      >
        <Settings2Icon className="size-4" aria-hidden />
      </PopoverTrigger>
      <PopoverContent className="flex w-64 flex-col gap-3 p-3">
        <Row label={labels.mode}>
          {mounted ? (
            <Segmented
              groupLabel={labels.mode}
              value={(theme ?? "system") as "light" | "dark" | "system"}
              onChange={setTheme}
              options={[
                { value: "light", label: labels.modeLight },
                { value: "dark", label: labels.modeDark },
                { value: "system", label: labels.modeSystem },
              ]}
            />
          ) : null}
        </Row>
        <Row label={labels.style}>
          <Segmented
            groupLabel={labels.style}
            value={style}
            onChange={applyStyle}
            options={[
              { value: "divine", label: labels.styleDivine },
              { value: "minimal", label: labels.styleMinimal },
            ]}
          />
        </Row>
        <div className="flex flex-col gap-1.5">
          <span className="text-fd-muted-foreground text-xs">
            {labels.font}
          </span>
          <div
            role="radiogroup"
            aria-label={labels.font}
            className="flex flex-col"
          >
            {FONT_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={font === option.id}
                onClick={() => applyFont(option.id)}
                style={{ fontFamily: option.family }}
                className={cn(
                  "rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                  font === option.id
                    ? "bg-fd-accent text-fd-accent-foreground font-medium"
                    : "text-fd-muted-foreground hover:text-fd-foreground",
                )}
              >
                {option.label || labels.fontSystem}
              </button>
            ))}
          </div>
        </div>
        <Row label={labels.width}>
          <Segmented
            groupLabel={labels.width}
            value={centered ? "centered" : "wide"}
            onChange={(next) => applyWidth(next === "centered")}
            options={[
              { value: "wide", label: labels.widthWide },
              { value: "centered", label: labels.widthCentered },
            ]}
          />
        </Row>
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run types:check`
Expected: the only remaining error is the `messages.nav.readingWidth`
consumer in `src/app/[lang]/docs/layout.tsx` (fixed next task). The new
component itself must produce no errors. If `PopoverTrigger` rejects
`className`/`aria-label` props, check
`node_modules/fumadocs-ui/dist/components/ui/popover.d.ts` — it forwards
Radix trigger props, so both are valid.

- [ ] **Step 3: Commit**

```bash
git add src/components/appearance-settings.tsx
git commit -m "feat(theme): appearance settings popover component"
```

---

### Task 6: Wire into layouts, remove old toggles

**Files:**

- Modify: `src/lib/layout.shared.tsx`
- Modify: `src/app/[lang]/docs/layout.tsx`
- Delete: `src/components/reading-width-toggle.tsx`
- Modify: `messages/en.json` (committed here, from Task 4)

- [ ] **Step 1: Disable the built-in ThemeToggle and add the gear to the home nav**

In `src/lib/layout.shared.tsx`:

```tsx
import { AppearanceSettings } from "@/components/appearance-settings";
```

Inside `baseOptions`, add to the `options` object literal (after `nav`):

```tsx
// The appearance popover's Mode row replaces fumadocs' ThemeToggle.
themeSwitch: { enabled: false },
```

In the NON-docs (`else`) links branch, add the gear as the last item:

```tsx
{
  type: "custom",
  children: <AppearanceSettings labels={messages.settings} />,
},
```

- [ ] **Step 2: Swap the docs sidebar footer**

In `src/app/[lang]/docs/layout.tsx`, replace the `ReadingWidthToggle`
import with:

```tsx
import { AppearanceSettings } from "@/components/appearance-settings";
```

and change the sidebar footer to a labeled row (keeps the footer reading
as one control group, like the old toggle did):

```tsx
sidebar={{
  components: { Separator: SidebarSeparatorWithContribute },
  footer: (
    <div className="flex items-center justify-between gap-2 pt-2">
      <span className="text-fd-muted-foreground text-xs">
        {messages.settings.trigger}
      </span>
      <AppearanceSettings labels={messages.settings} />
    </div>
  ),
}}
```

- [ ] **Step 3: Delete the old toggle**

```bash
git rm src/components/reading-width-toggle.tsx
```

Confirm nothing else imports it:
`grep -rn "reading-width-toggle\|READING_WIDTH_STORAGE_KEY" src/` — the
only `READING_WIDTH_STORAGE_KEY` left should be in
`appearance-settings.tsx`.

- [ ] **Step 4: Verify everything is green**

Run: `npm run lint && npm run types:check && npm run format`
Expected: ALL pass now (the `nav.readingWidth` consumer is gone).

- [ ] **Step 5: Commit**

```bash
git add src/lib/layout.shared.tsx "src/app/[lang]/docs/layout.tsx" messages/en.json
git commit -m "feat(theme): wire appearance settings into docs and home layouts"
```

---

### Task 7: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: CI parity**

Run: `npm run lint && npm run types:check && npm run format:check`
Expected: all pass.

- [ ] **Step 2: Visual pass with the dev server**

Run `npm run dev` in the background, then check (Playwright browser tools
or manually), on BOTH `http://localhost:3000/en` and
`http://localhost:3000/en/docs/lol/guided-walkthrough`:

1. Gear icon visible (home navbar; docs sidebar footer). Popover opens
   with Mode / Style / Font / Width rows.
2. Style → Minimal: page goes neutral grayscale. No purple/gold anywhere:
   sidebar, links, code blocks, inline code, blockquotes, tables, search
   dialog (open with the search trigger), TOC.
3. Mode → Light while Minimal: white background, near-black text. All
   four Style × Mode combos render correctly.
4. Font → Lora: body prose turns serif. In Minimal, headings follow; in
   Divine, headings stay Manrope/Poppins.
5. Width → Centered: docs article narrows (Minimal and Divine both).
6. Reload after setting Minimal + Lora: loads correctly with NO flash of
   the branded theme (pre-paint script works).
7. `http://localhost:3000/en/draft?new=tools` still renders the branded
   Divine dark editor even with Minimal set site-wide.
8. Search dialog opens and is readable in all four combos.

- [ ] **Step 3: Fix anything found, re-run Step 1, commit fixes**

```bash
git add -u
git commit -m "fix(theme): visual-pass fixes for Minimal style"
```

(Skip if nothing to fix.)

---

## Out of scope (per spec)

- `/draft` editor stays forced Divine-dark.
- OG image route (`src/app/api/og/...`) keeps brand colors on purpose
  (social cards are marketing surface).
- `src/app/not-found.tsx` retains a couple of literal brand hexes; its
  glow/gradient utilities are neutralized by the Task 1 resets, which is
  good enough.
- No Crowdin translations for the new labels (locales frozen; English
  fallback via `getMessages`).
