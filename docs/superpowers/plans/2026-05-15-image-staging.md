# Image Staging (Local Preview) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let creators pick images from their machine — the image shows in the draft editor's live preview immediately, and the handoff modal lists which filenames they still need to upload to GitHub.

**Architecture:** Add a `Map<filename, { file, objectUrl }>` state in `draft-editor.tsx`. A new toolbar "Upload image" chip stages files into that map, derives a canonical kebab-case filename, and inserts an `<img src="/wiki-images/<name>" alt="" />` line at the cursor. The preview pane wraps the MDX `img` component to swap staged sources for `URL.createObjectURL(file)` blob URLs. The handoff modal lists the staged filenames in its existing "Added images?" reminder.

**Tech Stack:** Next.js 16, React 19, TypeScript strict, Tailwind v4. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-05-15-image-staging-design.md`

**Testing note:** No test runner. Each task's gates: `npm run types:check`, `npm run lint`, `npx prettier --check` on touched files, brief `npm run dev` smoke test where relevant. Final task does the interactive browser check.

---

## File structure

**New files:**

| File                             | Responsibility                                                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/draft/staged-images.ts` | Pure utilities + types: `StagedImage`, `StagedImages`, `normalizeFilename`, `dedupeName`, `wikiImageSrc`, `resolveStagedSrc`. |

**Modified files:**

| File                                    | Change                                                                                                                                  |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `messages/en.json`                      | Add 3 strings to the `draft` block.                                                                                                     |
| `src/app/[lang]/draft/draft-editor.tsx` | Add `stagedImages` state, `addImages` handler, blob-URL cleanup on unmount. Pass the map + handler to children as props in later tasks. |
| `src/app/[lang]/draft/toolbar.tsx`      | Add an "Upload image" chip with a hidden `<input type="file">`. Calls a new `onUploadImage` prop.                                       |
| `src/app/[lang]/draft/preview-pane.tsx` | Accept `stagedImages` prop. Wrap the `img` component override to substitute staged blob URLs.                                           |
| `src/app/[lang]/draft/handoff.tsx`      | Accept `stagedImages` prop. List staged filenames in the existing `ImagesReminder` when the map is non-empty.                           |

---

## Task 1 — Foundation: messages, helpers, editor state

**Files:**

- Modify: `messages/en.json`
- Create: `src/lib/draft/staged-images.ts`
- Modify: `src/app/[lang]/draft/draft-editor.tsx`

- [ ] **Step 1: Add the 3 messages strings.** In `messages/en.json`, inside the `draft` block, add these three keys (place them sensibly near the existing `imagesHeading`/`imagesBody` keys):

```json
    "uploadImage": "Upload image",
    "uploadImageBlurb": "Pick a file. It shows in the preview and is referenced in your guide. Upload it to GitHub after Contribute.",
    "imagesToUpload": "Files to upload along with this guide:",
```

(Add a trailing comma after the previous key if needed so the JSON stays valid. Don't disturb other keys.)

- [ ] **Step 2: Create `src/lib/draft/staged-images.ts`** with EXACTLY this content:

```ts
export interface StagedImage {
  file: File;
  objectUrl: string;
}

export type StagedImages = Map<string, StagedImage>;

/**
 * Normalize a file's basename to lowercase kebab-case, preserving the
 * extension. Falls back to "image" if the base has no usable characters.
 */
export function normalizeFilename(originalName: string): string {
  const lastDot = originalName.lastIndexOf(".");
  const base = lastDot > 0 ? originalName.slice(0, lastDot) : originalName;
  const ext = lastDot > 0 ? originalName.slice(lastDot).toLowerCase() : "";
  const slug = base
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return (slug || "image") + ext;
}

/**
 * Pick a unique filename: append -2, -3, ... if the desired name is taken.
 * Gives up at 1000 attempts and returns the original (caller may overwrite).
 */
export function dedupeName(desired: string, taken: Set<string>): string {
  if (!taken.has(desired)) return desired;
  const lastDot = desired.lastIndexOf(".");
  const base = lastDot > 0 ? desired.slice(0, lastDot) : desired;
  const ext = lastDot > 0 ? desired.slice(lastDot) : "";
  for (let i = 2; i < 1000; i++) {
    const candidate = `${base}-${i}${ext}`;
    if (!taken.has(candidate)) return candidate;
  }
  return desired;
}

/** Canonical `<img src>` for a staged or already-uploaded wiki image. */
export function wikiImageSrc(filename: string): string {
  return `/wiki-images/${filename}`;
}

/**
 * Resolve an `<img src>` to a staged blob URL when it points at /wiki-images/X
 * and X is in the staged map. Returns null otherwise — the caller falls back
 * to rendering the original `src`.
 */
export function resolveStagedSrc(
  src: string,
  staged: StagedImages,
): string | null {
  const prefix = "/wiki-images/";
  if (!src.startsWith(prefix)) return null;
  const filename = src.slice(prefix.length);
  return staged.get(filename)?.objectUrl ?? null;
}
```

- [ ] **Step 3: Modify `src/app/[lang]/draft/draft-editor.tsx`** — add the imports, state, handler, and unmount cleanup. The children don't consume these yet (separate tasks); this step prepares the orchestrator.

  (a) Add imports near the existing `@/lib/draft/*` imports:

  ```tsx
  import {
    normalizeFilename,
    dedupeName,
    wikiImageSrc,
    type StagedImage,
    type StagedImages,
  } from "@/lib/draft/staged-images";
  ```

  (b) Add the state. Place it immediately AFTER the existing `restorePrompt` state (search for `setRestorePrompt`):

  ```tsx
  const [stagedImages, setStagedImages] = useState<StagedImages>(
    () => new Map(),
  );
  ```

  (c) Add the `addImages` handler. Place it near the other handlers like `handleInsert`, `handleScan`, etc. — anywhere in the same vicinity is fine:

  ```tsx
  const addImages = (files: File[]) => {
    if (files.length === 0) return;
    const taken = new Set(stagedImages.keys());
    const additions: [string, StagedImage][] = [];
    for (const file of files) {
      const desired = normalizeFilename(file.name);
      const filename = dedupeName(desired, taken);
      taken.add(filename);
      additions.push([
        filename,
        { file, objectUrl: URL.createObjectURL(file) },
      ]);
    }
    setStagedImages((current) => {
      const next = new Map(current);
      for (const [name, img] of additions) next.set(name, img);
      return next;
    });
    const snippet =
      additions
        .map(([name]) => `<img src="${wikiImageSrc(name)}" alt="" />`)
        .join("\n") + "\n";
    editorRef.current?.insertAtCursor(snippet);
  };
  ```

  (d) Add the blob-URL cleanup effect. Place it near the other `useEffect`s, with `[]` dependency so it ONLY runs on unmount. Use a ref to read the latest map at unmount time without making the effect re-run on every state change:

  First, add a ref next to the other refs (e.g. near `editorRef`):

  ```tsx
  const stagedImagesRef = useRef<StagedImages>(stagedImages);
  ```

  Then, near the other effects, add:

  ```tsx
  // Keep the ref in sync with the latest staged map.
  useEffect(() => {
    stagedImagesRef.current = stagedImages;
  }, [stagedImages]);

  // On unmount, revoke every blob URL we created.
  useEffect(() => {
    return () => {
      stagedImagesRef.current.forEach(({ objectUrl }) =>
        URL.revokeObjectURL(objectUrl),
      );
    };
  }, []);
  ```

  (e) NOTE — `stagedImages` and `addImages` are NOT passed to any child component yet; Tasks 2, 3, 4 do that wiring. After Step 3 the file compiles but `stagedImages`, `addImages`, and `stagedImagesRef` show as unused. **That triggers `no-unused-vars` lint errors** (the project's ESLint is strict). Mitigation: add a leading underscore to the names ONLY for this task's commit, then rename them properly when consumers arrive in Tasks 2-4. Simpler: silence with a single inline comment OR — better — also include a placeholder consumer to suppress the unused warnings.

  The cleanest path is to **JUST add the imports and types in this task** and defer the state declarations to whichever task first consumes them. Recommend: rework this Step 3 to add ONLY the imports + the `StagedImages` type to whatever signatures need it, and defer the actual `useState` + handler + cleanup to TASK 2 (the toolbar wiring), where the consumer exists.

  **REVISED Step 3 (do this instead of the above):** add ONLY the imports (sub-step a). Skip sub-steps (b), (c), (d). Tasks 2-4 will add state + handler + cleanup at the exact point a consumer appears. Mark sub-step (e) noted-and-deferred.

- [ ] **Step 4: Verify.**
  - `npm run types:check` — must PASS.
  - `npm run lint` — must PASS.
  - `npx prettier --check messages/en.json src/lib/draft/staged-images.ts "src/app/[lang]/draft/draft-editor.tsx"` — must PASS (run `--write` then re-check if needed).
  - The new TypeScript imports + the helpers file must compile without referencing things that don't exist yet.

- [ ] **Step 5: Commit.**
  ```bash
  git checkout -- src/git-info.json 2>/dev/null
  git add messages/en.json src/lib/draft/staged-images.ts "src/app/[lang]/draft/draft-editor.tsx"
  git commit -m "feat(draft): add image-staging helpers, messages, and editor imports"
  ```
  NO co-author trailer, NO emoji.

---

## Task 2 — Toolbar "Upload image" chip + editor state + handler

**Files:**

- Modify: `src/app/[lang]/draft/draft-editor.tsx`
- Modify: `src/app/[lang]/draft/toolbar.tsx`

This task adds the actual state to `draft-editor.tsx` (the consumer arrives, so unused-vars lint won't fire), and the toolbar chip that invokes the handler.

- [ ] **Step 1: Add state, handler, ref, and cleanup effect in `draft-editor.tsx`.** Apply changes (b), (c), and (d) from Task 1 Step 3 verbatim. (Re-paste the code blocks from Task 1 here for clarity — do not skip.)

  State:

  ```tsx
  const [stagedImages, setStagedImages] = useState<StagedImages>(
    () => new Map(),
  );
  ```

  Ref (near `editorRef`):

  ```tsx
  const stagedImagesRef = useRef<StagedImages>(stagedImages);
  ```

  Handler:

  ```tsx
  const addImages = (files: File[]) => {
    if (files.length === 0) return;
    const taken = new Set(stagedImages.keys());
    const additions: [string, StagedImage][] = [];
    for (const file of files) {
      const desired = normalizeFilename(file.name);
      const filename = dedupeName(desired, taken);
      taken.add(filename);
      additions.push([
        filename,
        { file, objectUrl: URL.createObjectURL(file) },
      ]);
    }
    setStagedImages((current) => {
      const next = new Map(current);
      for (const [name, img] of additions) next.set(name, img);
      return next;
    });
    const snippet =
      additions
        .map(([name]) => `<img src="${wikiImageSrc(name)}" alt="" />`)
        .join("\n") + "\n";
    editorRef.current?.insertAtCursor(snippet);
  };
  ```

  Effects:

  ```tsx
  useEffect(() => {
    stagedImagesRef.current = stagedImages;
  }, [stagedImages]);

  useEffect(() => {
    return () => {
      stagedImagesRef.current.forEach(({ objectUrl }) =>
        URL.revokeObjectURL(objectUrl),
      );
    };
  }, []);
  ```

  Then pass `addImages` down to the existing `<Toolbar>` element as a new `onUploadImage` prop:

  ```tsx
  <Toolbar
    onInsert={handleInsert}
    onUploadImage={addImages}
    docsHref={(anchor) => `/${lang}/docs/contributing/components#${anchor}`}
  />
  ```

  Keep the existing `onInsert` and `docsHref` props exactly as they are; just add the new `onUploadImage={addImages}` line.

- [ ] **Step 2: Add the "Upload image" chip in `toolbar.tsx`.**

  (a) Add a `useRef` import if not already imported. Check the top of `toolbar.tsx` — the React import line currently imports `{ useEffect, useMemo, useState }` (from Tasks 14-15 of the draft editor). Add `useRef`:

  ```tsx
  import { useEffect, useMemo, useRef, useState } from "react";
  ```

  (b) Add an icon import — the project uses lucide-react. Add `ImagePlus`:

  ```tsx
  import { ImagePlus } from "lucide-react";
  ```

  (or extend the existing lucide-react import line in this file if there is one).

  (c) Update the `ToolbarProps` interface to accept the new callback. Find:

  ```tsx
  interface ToolbarProps {
    onInsert: (snippet: string) => void;
    docsHref: (anchor: string) => string;
  }
  ```

  Change it to:

  ```tsx
  interface ToolbarProps {
    onInsert: (snippet: string) => void;
    onUploadImage: (files: File[]) => void;
    docsHref: (anchor: string) => string;
  }
  ```

  (d) Update the `Toolbar` function signature to destructure `onUploadImage`:

  ```tsx
  export function Toolbar({ onInsert, onUploadImage, docsHref }: ToolbarProps) {
  ```

  (e) Inside `Toolbar`, add a file-input ref and a click handler. Place them near the existing hooks (after `useMessages`/`useState`):

  ```tsx
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messages_d = messages.draft; // alias if `d` is the existing local var; otherwise reuse `d`
  ```

  _(If a local `d` variable already aliases `messages.draft` in this component, USE that; otherwise reference `messages.draft.uploadImage` directly. Don't introduce a redundant alias.)_

  (f) In the toolbar's JSX (the row of chips, alongside other `<Chip>` entries — find where `mainSnippets.map((snippet) => <Chip ... />)` is rendered), add a new chip as the LAST item in the main row, just BEFORE the "More" overflow button (or wherever feels naturally adjacent to the other chips). Use this JSX:

  ```tsx
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length > 0) onUploadImage(files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          className="bg-divine-primary/15 text-divine-primary-light hover:bg-divine-primary/25 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="h-3.5 w-3.5" />
          {d.uploadImage}
        </button>
  ```

  Replace `d.uploadImage` with `messages.draft.uploadImage` if no `d` alias exists. The styling mirrors the existing Chip component for visual continuity.

- [ ] **Step 3: Verify.**
  - `npm run types:check` — PASS.
  - `npm run lint` — PASS. (The `stagedImagesRef`, `setStagedImages`, etc. are now all used.)
  - `npx prettier --check "src/app/[lang]/draft/draft-editor.tsx" "src/app/[lang]/draft/toolbar.tsx"` — PASS.
  - Dev smoke:
    ```bash
    pkill -f "next dev" 2>/dev/null; sleep 2
    (npm run dev > /tmp/stage-dev.log 2>&1 &)
    until curl -s -o /dev/null http://localhost:3000/en/draft; do sleep 2; done
    curl -s -o /dev/null -w "/en/draft -> %{http_code}\n" http://localhost:3000/en/draft
    curl -s http://localhost:3000/en/draft | grep -o 'Upload image' | head -1
    tail -6 /tmp/stage-dev.log
    pkill -f "next dev" 2>/dev/null
    ```
    Expected: 200, the chip text "Upload image" appears in the HTML.

- [ ] **Step 4: Commit.**
  ```bash
  git checkout -- src/git-info.json 2>/dev/null
  git add "src/app/[lang]/draft/draft-editor.tsx" "src/app/[lang]/draft/toolbar.tsx"
  git commit -m "feat(draft): add Upload image toolbar chip with file-picker staging"
  ```

---

## Task 3 — Preview pane substitutes blob URLs for staged images

**Files:**

- Modify: `src/app/[lang]/draft/preview-pane.tsx`
- Modify: `src/app/[lang]/draft/draft-editor.tsx`

- [ ] **Step 1: Update `preview-pane.tsx` to accept a stagedImages prop and override `img`.**

  (a) Add the import near the existing `@/lib/draft/*` imports (if there are none, place it sensibly with other library imports):

  ```tsx
  import {
    resolveStagedSrc,
    type StagedImages,
  } from "@/lib/draft/staged-images";
  ```

  (b) Add the optional prop to `PreviewPaneProps`:

  ```tsx
  interface PreviewPaneProps {
    mdx: string;
    stagedImages?: StagedImages;
  }
  ```

  (c) Destructure it in the function signature:

  ```tsx
  export function PreviewPane({ mdx, stagedImages }: PreviewPaneProps) {
  ```

  (d) Replace the direct `getMDXComponents()` usage in the success-branch render with a memoized override. Find:

  ```tsx
  return (
    <div className="prose prose-invert max-w-none">
      <MDXRemote {...state.serialized} components={getMDXComponents()} />
    </div>
  );
  ```

  Above the `if (state.status === ...)` chain (or right inside the function body, before the early returns), add:

  ```tsx
  const components = useMemo(() => {
    const base = getMDXComponents();
    if (!stagedImages || stagedImages.size === 0) return base;
    const OriginalImg = base.img;
    return {
      ...base,
      img: (
        props: { src?: unknown; alt?: string } & Record<string, unknown>,
      ) => {
        const blobUrl =
          typeof props.src === "string"
            ? resolveStagedSrc(props.src, stagedImages)
            : null;
        if (blobUrl && OriginalImg) {
          return <OriginalImg {...props} src={blobUrl} />;
        }
        if (blobUrl) {
          return (
            <img
              {...(props as Record<string, unknown>)}
              src={blobUrl}
              alt={props.alt ?? ""}
            />
          );
        }
        if (OriginalImg) return <OriginalImg {...props} />;
        return (
          <img {...(props as Record<string, unknown>)} alt={props.alt ?? ""} />
        );
      },
    };
  }, [stagedImages]);
  ```

  And change the success branch render to use the memoized `components`:

  ```tsx
  return (
    <div className="prose prose-invert max-w-none">
      <MDXRemote {...state.serialized} components={components} />
    </div>
  );
  ```

  Also add `useMemo` to the existing `react` import line if it's not already there.

- [ ] **Step 2: Pass the stagedImages prop from `draft-editor.tsx`.**

  Find the existing `<PreviewPane mdx={assembledMdx} />` usage and add the new prop:

  ```tsx
  <div className="overflow-auto p-4">
    <PreviewPane mdx={assembledMdx} stagedImages={stagedImages} />
  </div>
  ```

- [ ] **Step 3: Verify.**
  - `npm run types:check` — PASS.
  - `npm run lint` — PASS.
  - `npx prettier --check "src/app/[lang]/draft/preview-pane.tsx" "src/app/[lang]/draft/draft-editor.tsx"` — PASS.
  - Brief dev smoke (HTTP 200 on `/en/draft`, no runtime errors).

- [ ] **Step 4: Commit.**
  ```bash
  git checkout -- src/git-info.json 2>/dev/null
  git add "src/app/[lang]/draft/preview-pane.tsx" "src/app/[lang]/draft/draft-editor.tsx"
  git commit -m "feat(draft): render staged images via blob URLs in the live preview"
  ```

---

## Task 4 — Handoff lists staged filenames + interactive verify

**Files:**

- Modify: `src/app/[lang]/draft/handoff.tsx`
- Modify: `src/app/[lang]/draft/draft-editor.tsx`

- [ ] **Step 1: Update `handoff.tsx` to accept a stagedImages prop and list filenames.**

  (a) Add the import:

  ```tsx
  import { type StagedImages } from "@/lib/draft/staged-images";
  ```

  (b) Add the optional prop to `HandoffProps`:

  ```tsx
  interface HandoffProps {
    mode: "new" | "edit";
    mdx: string;
    category: string;
    slug: string;
    editPath: string | null;
    stagedImages?: StagedImages;
    onClose: () => void;
  }
  ```

  (c) Destructure it in `Handoff`:

  ```tsx
  export function Handoff({
    mode,
    mdx,
    category,
    slug,
    editPath,
    stagedImages,
    onClose,
  }: HandoffProps) {
  ```

  (d) Pass `stagedImages` to `<ImagesReminder>`:

  ```tsx
  <ImagesReminder d={d} stagedImages={stagedImages} />
  ```

  (e) Update `ImagesReminder` to accept the prop and render a filenames list when non-empty. Replace the `ImagesReminder` function entirely:

  ```tsx
  function ImagesReminder({
    d,
    stagedImages,
  }: {
    d: DraftMessages;
    stagedImages?: StagedImages;
  }) {
    const filenames = stagedImages
      ? Array.from(stagedImages.keys()).sort()
      : [];
    return (
      <div className="border-divine-border mt-3 rounded-lg border p-3">
        <h4 className="text-divine-text text-sm font-semibold">
          {d.imagesHeading}
        </h4>
        <p className="text-divine-text-muted mt-1 text-sm">{d.imagesBody}</p>
        {filenames.length > 0 && (
          <>
            <p className="text-divine-text-muted mt-2 text-sm font-semibold">
              {d.imagesToUpload}
            </p>
            <ul className="text-divine-text-muted mt-1 list-inside list-disc font-mono text-sm">
              {filenames.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </>
        )}
        <a
          href={uploadImagesUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-divine-primary-light mt-2 inline-block text-sm"
        >
          {d.uploadOnGithub} →
        </a>
      </div>
    );
  }
  ```

- [ ] **Step 2: Pass stagedImages from `draft-editor.tsx`.**

  Find the existing `<Handoff ... />` JSX and add the new prop:

  ```tsx
  {
    showHandoff && (
      <Handoff
        mode={mode}
        mdx={assembledMdx}
        category={category}
        slug={effectiveSlug}
        editPath={editPath}
        stagedImages={stagedImages}
        onClose={() => {
          clearDraft(storageKey);
          setShowHandoff(false);
        }}
      />
    );
  }
  ```

  (Add the `stagedImages={stagedImages}` line; keep everything else as-is.)

- [ ] **Step 3: Final verification — full gates and interactive check.**

  Clean build + gates:

  ```bash
  pkill -f "next dev" 2>/dev/null; sleep 2
  rm -rf .next .source
  npm run build
  npm run types:check
  npm run lint
  npx prettier --check messages/en.json src/lib/draft/staged-images.ts "src/app/[lang]/draft/draft-editor.tsx" "src/app/[lang]/draft/toolbar.tsx" "src/app/[lang]/draft/preview-pane.tsx" "src/app/[lang]/draft/handoff.tsx"
  ```

  All must PASS. Build must complete with no export errors (pre-existing `LANGUAGE_NOT_SUPPORTED` warnings are non-fatal — acceptable).

  Interactive smoke (via Playwright MCP or manual):

  ```
  Start dev → visit /en/draft → click "Upload image" → pick a local PNG/JPG →
  the image appears in the preview pane and an <img> line appears in the editor →
  click Contribute → the handoff modal's "Files to upload along with this guide:"
  list shows the filename → close + done.
  ```

- [ ] **Step 4: Restore git-info, commit.**
  ```bash
  git checkout -- src/git-info.json 2>/dev/null
  git add "src/app/[lang]/draft/handoff.tsx" "src/app/[lang]/draft/draft-editor.tsx"
  git commit -m "feat(draft): list staged image filenames in the handoff reminder"
  ```

---

## Self-review notes

- **Spec coverage:** new helpers module (Task 1), toolbar chip + state + handler (Task 2), preview blob-URL substitution (Task 3), handoff filename listing (Task 4). All 5 modified files mentioned in the spec map to at least one task; the new file maps to Task 1.
- **Refinement vs spec:** Task 1 deliberately defers state/handler/cleanup to Task 2 so unused-vars lint doesn't fire on a half-wired commit. The spec assumed they'd be added in one go; the plan splits across two tasks for incremental commits without lint breaks.
- **Type consistency:** `StagedImage`/`StagedImages` types from `staged-images.ts` are imported the same way in `draft-editor.tsx`, `preview-pane.tsx`, and `handoff.tsx`. `addImages: (files: File[]) => void` signature is consistent between owner (draft-editor) and consumer (toolbar's `onUploadImage` prop).
