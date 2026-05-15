# Contribute Picker Modal

**Date:** 2026-05-15
**Status:** Approved design, ready for implementation plan
**Builds on:** the draft-editor work in `2026-05-14-draft-editor-design.md`

## Motivation

The two main "start contributing" entry points currently disagree:
- Nav **Contribute** → `/[lang]/draft` (the visual editor).
- Homepage **Write a guide** → `/[lang]/docs/contributing` (the manual GitHub docs).

Creators who click either land in one specific path with no awareness of the other. A new contributor who clicks the homepage CTA never finds out there's a visual editor; a power user who clicks the nav button never sees the manual flow that's better for image-heavy work.

A small modal picker, opened from both entry points, lets the creator choose. Both paths still end with a GitHub PR a maintainer reviews — only the *authoring environment* differs.

## Scope

- A single React modal triggered from two existing entry points.
- No new top-level route. No back-end. No change to `/draft` itself, `/docs/contributing` itself, or the per-page **Edit on GitHub** affordance (editing an existing guide skips the picker — that's an edit, not a create-new).

## Decisions

| Question | Decision |
|---|---|
| Form factor | Centered modal (not a dedicated page, not a banner, not two nav buttons). |
| Triggers | Nav **Contribute** + homepage **Write a guide**. |
| Modal mechanics | Shared React Context + a globally-mounted `<ContributePickerModal />`. `useContributePicker()` hook exposes `open` / `close`. |
| Close affordances | Backdrop click, Escape key, X button (matches the existing `<Handoff>` modal in `src/app/[lang]/draft/handoff.tsx`). |
| Card targets | Visual editor → `/[lang]/draft`. Manual on GitHub → `/[lang]/docs/contributing`. |
| Per-page **Edit on GitHub** link | Unchanged. Still goes straight to `/[lang]/draft?edit=<path>`. |
| Fumadocs nav fallback | Try `type: "custom"` first. If unsupported in this Fumadocs version, the nav entry becomes a regular link to a tiny `/[lang]/contribute` client route that auto-opens the modal on mount and renders the picker statically as JS-disabled fallback. Decided during implementation. |

## Architecture

### New files

| File | Responsibility |
|---|---|
| `src/components/contribute-picker.tsx` | Owns it all: `ContributePickerProvider`, `useContributePicker()` hook, `<ContributePickerModal />`, `<ContributeButton />` (the nav-button client component). One file because every piece is tightly coupled and small. |

### Modified files

| File | Change |
|---|---|
| `src/app/[lang]/layout.tsx` | Wrap children with `<ContributePickerProvider>` and mount `<ContributePickerModal />` once. |
| `src/lib/layout.shared.tsx` | Replace the Contribute nav entry: either a Fumadocs `type: "custom"` item that renders `<ContributeButton />`, or — if that fails type checks — a regular link to `/[lang]/contribute` (and add the tiny route in step 5 below). |
| `src/app/[lang]/(home)/page.tsx` | Change the homepage "Write a guide" `<Link href="/docs/contributing">` to a `<button>` that calls `picker.open()` via the hook. Keep the same `text-link` styling. |
| `messages/en.json` | Add 5 strings under a new `picker` block: `pickerHeading`, `pickerSubheading`, `visualEditorTitle`, `visualEditorBody`, `manualGithubTitle`, `manualGithubBody`. |

### Conditional 5th file (fallback only)

If Fumadocs `type: "custom"` isn't accepted:
- Create `src/app/[lang]/contribute/page.tsx` — a tiny client page that mounts a small auto-opener component (`useEffect(() => picker.open(), [])`) and renders the picker as static content below for JS-disabled / direct-visit users.

## Component design

`ContributePickerProvider` — wraps children in a Context with `{ open: boolean, setOpen }`.

`useContributePicker()` — returns `{ open: () => setOpen(true), close: () => setOpen(false) }`.

`<ContributePickerModal />` — when `open === true`, renders a fixed-position overlay with a centered panel. Two large cards inside. Reuses the modal pattern from `src/app/[lang]/draft/handoff.tsx` (same `role="dialog"`, `aria-modal`, Escape handler, backdrop-click-to-close with `stopPropagation` on the inner panel). Cards use `<PremiumCard>` (existing project component) for visual consistency.

`<ContributeButton />` — a client `<button>` that calls `picker.open()`. Renders the icon (`PencilIcon`) + text (`messages.nav.contribute`) so it matches the other nav entries' look.

## Data flow

1. User clicks nav **Contribute** OR homepage **Write a guide** → triggers `picker.open()`.
2. `<ContributePickerModal />` re-renders with the modal visible.
3. User clicks a card → that card's `<a>` navigates to `/[lang]/draft` or `/[lang]/docs/contributing`. The modal unmounts naturally with the route change.
4. User clicks backdrop / X / Escape → `picker.close()` → modal unmounts.

## Error handling & edge cases

- **No JS / SSR:** the modal won't open. The Fumadocs nav still resolves to *some* URL (either the fallback `/[lang]/contribute` page rendering the picker statically, or a direct link to `/draft` depending on the fallback decision). Either way, contribution remains reachable.
- **Multiple opens / Strict Mode:** modal state is a single boolean in Context; no side effects on open. No double-trigger risk.
- **Localization:** all 5 strings come from `messages/en.json` via the existing `useMessages` hook. Non-English locales fall back to the English values per the existing `useMessages` deep-merge behavior.

## Testing

Lightweight (matches the project's no-test-runner stance):

- `npm run types:check`, `npm run lint`, `npm run build` all pass.
- Interactive Playwright pass: click homepage **Write a guide** → modal opens. Click nav **Contribute** → same modal opens. Click each card → navigates to the right URL. Press Escape, click backdrop, click X → modal closes. Per-page **Edit on GitHub** link still goes direct to `/draft?edit=`.

## Out of scope

- No analytics on which option creators pick (could be added later — that's not what was asked for).
- No remembered preference ("always use visual editor" toggle) — same.
- No change to `/draft` or `/docs/contributing` content. Only the entry-point glue.
- No localized version of the picker copy in `fr-FR.json`, `tr-TR.json`, `pt-BR.json` — those are Crowdin-managed and the en source will land first.
