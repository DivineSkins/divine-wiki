# Contribute Picker Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a centered modal that opens from the nav "Contribute" button and the homepage "Write a guide" CTA, offering two choices — Visual editor (`/draft`) or Manual on GitHub (`/docs/contributing`).

**Architecture:** One client module (`src/components/contribute-picker.tsx`) owns everything — Context provider + `useContributePicker()` hook + modal + the two trigger buttons (nav + homepage CTA). The provider is mounted once in the `[lang]` layout. The Fumadocs nav entry uses a `type: "custom"` item to render the trigger button; if Fumadocs v16.2.3 doesn't accept that item shape, the plan's Task 5 fallback adds a tiny `/[lang]/contribute` route that auto-opens the modal.

**Tech Stack:** Next.js 16 App Router, Fumadocs v16.2.3, React 19.2, Tailwind v4, TypeScript strict. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-05-15-contribute-picker-design.md`

**Testing note:** No test runner. Verification uses `npm run types:check`, `npm run lint`, `npm run build`, `npx prettier --check`, and a manual browser smoke test of the modal triggers + close affordances.

---

## File structure

**New files:**

| File | Responsibility |
|---|---|
| `src/components/contribute-picker.tsx` | Provider + `useContributePicker()` hook + `<ContributePickerModal />` + `<ContributeButton />` (nav trigger) + `<ContributeCtaButton />` (homepage trigger). |

**Modified files:**

| File | Change |
|---|---|
| `messages/en.json` | Add a new `picker` block (6 strings). |
| `src/app/[lang]/layout.tsx` | Wrap children with `<ContributePickerProvider>` and mount `<ContributePickerModal />` once. |
| `src/app/[lang]/(home)/page.tsx` | Replace the homepage "Write a guide" `<Link>` with `<ContributeCtaButton>` so it opens the modal. |
| `src/lib/layout.shared.tsx` | Replace the Contribute nav `links[]` entry with a Fumadocs `type: "custom"` item rendering `<ContributeButton />`. If `type: "custom"` is rejected by Fumadocs v16.2.3 types — see Task 5's fallback branch. |

**Conditional file (only if Fumadocs fallback is needed):**

| File | Responsibility |
|---|---|
| `src/app/[lang]/contribute/page.tsx` | Tiny client route that auto-opens the picker modal on mount. Renders the picker's two cards as a static fallback below for JS-disabled users. |

---

## Task 1 — Add picker UI strings

**Files:**
- Modify: `messages/en.json`

- [ ] **Step 1: Add the `picker` block.** In `messages/en.json`, after the existing top-level `"draft"` block (the last block before the closing `}`), insert this new top-level key (add a comma after `draft`'s closing brace, then this block):

```json
  "picker": {
    "pickerHeading": "Create a new guide",
    "pickerSubheading": "Pick your path. Both end with a pull request a maintainer reviews and merges.",
    "visualEditorTitle": "Visual editor",
    "visualEditorBody": "Write in the browser with a live preview. No setup. You need a GitHub account to submit.",
    "manualGithubTitle": "Manual on GitHub",
    "manualGithubBody": "Edit Markdown files directly on GitHub. Best for big changes and image-heavy guides."
  }
```

- [ ] **Step 2: Verify.** Run `npx prettier --check messages/en.json` — must PASS (run `--write` then re-check if needed). Run `npm run types:check` — must PASS (the derived `Messages` type picks up the new keys automatically).

- [ ] **Step 3: Commit.**
```bash
git add messages/en.json
git commit -m "feat(picker): add contribute picker UI strings"
```
NO co-author trailer, NO emoji.

---

## Task 2 — Create the picker component module

**Files:**
- Create: `src/components/contribute-picker.tsx`

- [ ] **Step 1: Create the file** with EXACTLY this content:

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PencilIcon, PencilLine, Github } from "lucide-react";
import { useMessages } from "@/lib/hooks/useMessages";
import { PremiumCard } from "@/components/mdx/PremiumCard";

interface PickerContextValue {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const PickerContext = createContext<PickerContextValue | null>(null);

export function ContributePickerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const value = useMemo<PickerContextValue>(
    () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      isOpen,
    }),
    [isOpen],
  );
  return (
    <PickerContext.Provider value={value}>{children}</PickerContext.Provider>
  );
}

export function useContributePicker(): PickerContextValue {
  const ctx = useContext(PickerContext);
  if (!ctx) {
    throw new Error(
      "useContributePicker must be used inside ContributePickerProvider",
    );
  }
  return ctx;
}

export function ContributePickerModal() {
  const messages = useMessages();
  const p = messages.picker;
  const { isOpen, close } = useContributePicker();
  const params = useParams();
  const lang = (params?.lang as string) ?? "en";

  // Escape-to-close, mirroring src/app/[lang]/draft/handoff.tsx.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={close}
    >
      <div
        className="bg-divine-surface border-divine-border max-h-[85vh] w-full max-w-2xl overflow-auto rounded-xl border p-6"
        role="dialog"
        aria-modal="true"
        aria-label={p.pickerHeading}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-divine-text text-xl font-semibold">
              {p.pickerHeading}
            </h2>
            <p className="text-divine-text-muted mt-1 text-sm">
              {p.pickerSubheading}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="text-divine-text-muted hover:text-divine-text text-2xl leading-none"
            onClick={close}
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <PremiumCard
            title={p.visualEditorTitle}
            href={`/${lang}/draft`}
            icon={<PencilLine className="h-5 w-5" />}
          >
            {p.visualEditorBody}
          </PremiumCard>
          <PremiumCard
            title={p.manualGithubTitle}
            href={`/${lang}/docs/contributing`}
            icon={<Github className="h-5 w-5" />}
          >
            {p.manualGithubBody}
          </PremiumCard>
        </div>
      </div>
    </div>
  );
}

/**
 * Nav-bar trigger. Renders an icon+text button styled to sit next to the
 * other Fumadocs nav links. Fumadocs renders this as a `type: "custom"` item.
 */
export function ContributeButton() {
  const messages = useMessages();
  const { open } = useContributePicker();
  return (
    <button
      type="button"
      onClick={open}
      className="text-fd-muted-foreground hover:text-fd-accent-foreground inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
    >
      <PencilIcon className="h-4 w-4" />
      <span>{messages.nav.contribute}</span>
    </button>
  );
}

/**
 * Homepage CTA trigger. Renders a button styled to match the existing
 * text-link CTA the home page already uses for "Write a guide".
 */
export function ContributeCtaButton({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const { open } = useContributePicker();
  return (
    <button
      type="button"
      onClick={open}
      className={
        className ?? "text-divine-primary-light text-sm hover:underline"
      }
    >
      <Link
        href="#"
        className="contents"
        onClick={(e) => {
          e.preventDefault();
          open();
        }}
      >
        {text}
      </Link>
    </button>
  );
}
```

Note: the `<ContributeCtaButton>` wraps a `<Link>` for visual consistency — `className="contents"` on the inner Link makes the wrapping `<button>` keep its own click handler while inheriting layout from the button. The Link's `href="#"` + `preventDefault` is purely for accessibility (right-click → copy link gives a sensible result); the click actually opens the modal.

- [ ] **Step 2: Verify.** Run `npm run types:check` — must PASS. Run `npm run lint` — must PASS. Run `npx prettier --check src/components/contribute-picker.tsx` — must PASS (write + recheck if needed).

- [ ] **Step 3: Commit.**
```bash
git add src/components/contribute-picker.tsx
git commit -m "feat(picker): add contribute picker provider, modal, and triggers"
```

---

## Task 3 — Mount the provider and modal in the [lang] layout

**Files:**
- Modify: `src/app/[lang]/layout.tsx`

- [ ] **Step 1: Read the file.** Confirm it's a server component that renders `<html>`/`<body>` and `<RootProvider>`-like wiring (it does — it sets up fonts and `RootProvider`).

- [ ] **Step 2: Add imports.** Near the other imports at the top, add:

```tsx
import {
  ContributePickerProvider,
  ContributePickerModal,
} from "@/components/contribute-picker";
```

- [ ] **Step 3: Wrap the existing children render.** Find the part of the JSX where `{children}` is rendered (inside whatever Fumadocs `RootProvider` wraps). Change the surrounding so children are wrapped with `<ContributePickerProvider>` and `<ContributePickerModal />` is rendered once as a sibling.

For example, if the current shape is:
```tsx
        <RootProvider i18n={...}>
          {children}
        </RootProvider>
```
change it to:
```tsx
        <RootProvider i18n={...}>
          <ContributePickerProvider>
            {children}
            <ContributePickerModal />
          </ContributePickerProvider>
        </RootProvider>
```

The exact ancestor element may differ — the goal is that ALL routes under `[lang]/*` (home, docs, draft) end up inside the provider, and the modal is mounted exactly once.

- [ ] **Step 4: Verify.** Run `npm run types:check` and `npm run lint` — both must PASS. Then a brief dev smoke test:
```bash
pkill -f "next dev" 2>/dev/null; sleep 2
(npm run dev > /tmp/picker-dev.log 2>&1 &)
until curl -s -o /dev/null http://localhost:3000/en; do sleep 2; done
curl -s -o /dev/null -w "/en -> %{http_code}\n" http://localhost:3000/en
curl -s -o /dev/null -w "/en/draft -> %{http_code}\n" http://localhost:3000/en/draft
tail -6 /tmp/picker-dev.log
pkill -f "next dev" 2>/dev/null
```
Expected: both routes 200, no compile/runtime errors in the log.

- [ ] **Step 5: Restore generated files + commit.**
```bash
git checkout -- src/git-info.json 2>/dev/null
git add "src/app/[lang]/layout.tsx"
git commit -m "feat(picker): mount picker provider and modal in [lang] layout"
```

---

## Task 4 — Wire the homepage CTA to open the modal

**Files:**
- Modify: `src/app/[lang]/(home)/page.tsx`

- [ ] **Step 1: Read the file.** Find the existing "Write a guide" link. It currently looks like:
```tsx
          <Link href={`/${lang}/docs/contributing`} className={textLinkClass}>
            {t.ctaContribute}
          </Link>
```
(There may be small variations — the className is the project's text-link class.)

- [ ] **Step 2: Add the import.** Near the existing imports, add:
```tsx
import { ContributeCtaButton } from "@/components/contribute-picker";
```

- [ ] **Step 3: Replace the `<Link>` with `<ContributeCtaButton>`.** Change the block to:
```tsx
          <ContributeCtaButton text={t.ctaContribute} className={textLinkClass} />
```
Pass the SAME `className` the original `<Link>` used (e.g. `textLinkClass`) so visual styling stays identical. If the `<Link>` import is no longer used anywhere else in the file after this change, remove it; otherwise leave it.

- [ ] **Step 4: Verify.** Run `npm run types:check`, `npm run lint` — both must PASS. Then a dev smoke test:
```bash
pkill -f "next dev" 2>/dev/null; sleep 2
(npm run dev > /tmp/picker-dev.log 2>&1 &)
until curl -s -o /dev/null http://localhost:3000/en; do sleep 2; done
curl -s -o /dev/null -w "/en -> %{http_code}\n" http://localhost:3000/en
tail -6 /tmp/picker-dev.log
pkill -f "next dev" 2>/dev/null
```
Expected: 200, no errors. (Interactive verification of the click → modal is done in Task 6.)

- [ ] **Step 5: Restore + commit.**
```bash
git checkout -- src/git-info.json 2>/dev/null
git add "src/app/[lang]/(home)/page.tsx"
git commit -m "feat(picker): wire homepage CTA to open the picker modal"
```

---

## Task 5 — Wire the nav Contribute entry to open the modal

**Files:**
- Modify: `src/lib/layout.shared.tsx`
- Conditionally create: `src/app/[lang]/contribute/page.tsx` (fallback only)

- [ ] **Step 1: Inspect the current nav entry.** In `src/lib/layout.shared.tsx`, the Contribute entry currently is:
```tsx
      {
        icon: <PencilIcon />,
        text: messages.nav.contribute,
        url: `/${locale}/draft`,
      },
```

- [ ] **Step 2: Try the `type: "custom"` approach first.** Add this import near the existing imports:
```tsx
import { ContributeButton } from "@/components/contribute-picker";
```
Then replace the Contribute entry above with:
```tsx
      {
        type: "custom",
        children: <ContributeButton />,
      },
```

- [ ] **Step 3: Type-check the custom item.** Run `npm run types:check`. If it PASSES — great, the `type: "custom"` shape is accepted by Fumadocs v16.2.3, skip to Step 5.

- [ ] **Step 4: Fallback path if types:check FAILS at Step 3.** Fumadocs doesn't accept the custom item — revert the nav entry to use a URL link instead, AND create a tiny route that opens the modal:

    a. In `src/lib/layout.shared.tsx`, remove the import you added in Step 2, and change the Contribute entry to:
    ```tsx
          {
            icon: <PencilIcon />,
            text: messages.nav.contribute,
            url: `/${locale}/contribute`,
          },
    ```

    b. Create `src/app/[lang]/contribute/page.tsx` with EXACTLY this content:
    ```tsx
    "use client";

    import { useEffect } from "react";
    import { useRouter } from "next/navigation";
    import {
      useContributePicker,
    } from "@/components/contribute-picker";

    export default function ContributeFallback() {
      const router = useRouter();
      const { open } = useContributePicker();

      useEffect(() => {
        open();
        router.back();
      }, [open, router]);

      return null;
    }
    ```
    This route, when navigated to via the nav link, opens the modal and then routes back to wherever the user came from — so the modal appears OVER the previous page, matching the spec's intent. If `router.back()` isn't safe (no previous history), this still leaves the page on `/contribute` with the modal open, which is acceptable.

    c. Re-run `npm run types:check` — must PASS now.

- [ ] **Step 5: Verify.** Run `npm run lint` — must PASS. Then a dev smoke test for both branches:
```bash
pkill -f "next dev" 2>/dev/null; sleep 2
(npm run dev > /tmp/picker-dev.log 2>&1 &)
until curl -s -o /dev/null http://localhost:3000/en; do sleep 2; done
curl -s -o /dev/null -w "/en -> %{http_code}\n" http://localhost:3000/en
curl -s -o /dev/null -w "/en/contribute -> %{http_code}\n" http://localhost:3000/en/contribute
tail -6 /tmp/picker-dev.log
pkill -f "next dev" 2>/dev/null
```
Expected: 200 from `/en` (always). If you went the fallback route, `/en/contribute` also serves 200; if you used `type: "custom"`, `/en/contribute` returns 404 and that's fine.

- [ ] **Step 6: Restore + commit.**
```bash
git checkout -- src/git-info.json 2>/dev/null
# If you used the custom item:
git add src/lib/layout.shared.tsx
# If you used the fallback route, also add:
# git add "src/app/[lang]/contribute/page.tsx"
git commit -m "feat(picker): wire nav Contribute button to open the picker modal"
```
Report in the implementer note which path was taken (custom item vs fallback route).

---

## Task 6 — Verify + interactive browser test

**Files:** none (verification only).

- [ ] **Step 1: Clean build.**
```bash
pkill -f "next dev" 2>/dev/null
rm -rf .next .source
npm run build
```
Expected: build COMPLETES SUCCESSFULLY. `/en/contribute` may or may not appear in the route list depending on Task 5's branch.

- [ ] **Step 2: Lint + types + prettier-targeted.**
```bash
npm run types:check
npm run lint
npx prettier --check messages/en.json src/components/contribute-picker.tsx "src/app/[lang]/layout.tsx" "src/app/[lang]/(home)/page.tsx" src/lib/layout.shared.tsx
```
All three must PASS. If `prettier` fails on any of the files this plan touched, run `npx prettier --write` on those specific files and recheck. (Repo-wide pre-existing Prettier failures on unrelated files are out of scope.)

- [ ] **Step 3: Interactive browser smoke test.** Start dev:
```bash
pkill -f "next dev" 2>/dev/null; sleep 2
(npm run dev > /tmp/picker-dev.log 2>&1 &)
until curl -s -o /dev/null http://localhost:3000/en; do sleep 2; done
```
Then manually verify (or via Playwright MCP):
- Visit `http://localhost:3000/en`. Click the "Write a guide" CTA in the page body. The modal opens with two cards.
- Press Escape — modal closes.
- Open the modal again, click outside the inner panel (the dim backdrop). Modal closes.
- Open again, click the × button. Modal closes.
- Open again, click the **Visual editor** card — navigates to `/en/draft`.
- Back to `/en`, this time click the **Contribute** entry in the top nav. Modal opens.
- Click **Manual on GitHub** — navigates to `/en/docs/contributing`.
- Visit `http://localhost:3000/en/docs/tools/flint`. Click the per-page "Edit on GitHub" link near the bottom. It must navigate STRAIGHT to `/en/draft?edit=tools/flint` (NOT the picker — the picker is for create-new only).
- Check browser console for errors — must be clean.

- [ ] **Step 4: Clean up.**
```bash
pkill -f "next dev" 2>/dev/null
git checkout -- src/git-info.json 2>/dev/null
```
Should be no uncommitted changes after this. If there are any formatting-only changes from Step 2, commit them:
```bash
git add -A
git commit -m "style(picker): prettier-format picker module"
```
(Skip if nothing to add.)

---

## Self-review notes

- **Spec coverage:** scope (one modal, two triggers, no new top-level route, no change to `/draft` or per-page edit link) — fully covered by Tasks 1-5. Modal mechanics (Context provider + globally-mounted modal + hook) — Task 2 builds it, Task 3 mounts it. Close affordances (backdrop / Escape / X) — Task 2 includes all three. Card targets (`/draft`, `/docs/contributing`) — Task 2's `<PremiumCard href={...}>` lines. Fumadocs nav fallback — Task 5's explicit branch.
- **Refinement vs spec:** The spec mentioned 5 strings in `messages/en.json`; the plan adds 6 (heading + subheading + 2× (title + body)). The 6th is the subheading the modal mockup in the spec included — counted as the same scope, just explicit.
- **Type consistency:** `useContributePicker()` returns the same `{ open, close, isOpen }` shape used by `<ContributePickerModal />`, `<ContributeButton />`, and `<ContributeCtaButton />`. `messages.picker.*` keys match `messages/en.json` keys (Task 1) one-for-one.
