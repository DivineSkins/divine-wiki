# Image Staging (Local Preview)

**Date:** 2026-05-15
**Status:** Approved (user OK'd inline design)
**Builds on:** `2026-05-14-draft-editor-design.md`

## Motivation

The draft editor's toolbar inserts an `<img src="/wiki-images/<name>" />` snippet, but there's no way to actually pick the image file — so the live preview shows a broken image link and the creator can't see what they're working with. Upload to GitHub remains manual (no-backend stance unchanged); the goal here is purely the authoring experience.

## Scope

- A new **"Upload image"** chip in the toolbar.
- Picked files get a normalized filename and are stashed in browser memory.
- An `<img>` tag pointing at the canonical `/wiki-images/<filename>` path is inserted at the cursor for each picked file.
- The live preview pane renders staged images by intercepting `<img>` src and substituting a `URL.createObjectURL(file)` blob URL.
- The handoff modal's "Added images?" reminder lists the staged filenames so the creator knows exactly which files to drag into GitHub's upload UI.

## Decisions

| Question | Decision |
|---|---|
| Trigger UI | New "Upload image" toolbar chip (with hidden `<input type="file" accept="image/*" multiple>`). No drag-and-drop in v1. |
| Filename | Kebab-case the basename, preserve extension (lowercased): `My Screenshot.PNG` → `my-screenshot.png`. On collision, suffix `-2`, `-3`. |
| Storage | In-memory `Map<filename, { file: File, objectUrl: string }>` in `draft-editor.tsx`. Not persisted across refresh — explicit trade-off, IndexedDB out of scope. |
| MDX inserted | `<img src="/wiki-images/<filename>" alt="" />` (canonical path, so production rendering after upload works as-is). |
| Preview rendering | Preview-pane wraps the `getMDXComponents()` `img` override: if the `src` resolves to a staged file, rewrite `src` to that file's blob URL before delegating to the existing `ImageZoom`. |
| Multiple files | One pick can select multiple files; each gets a deduped filename and an inserted `<img>` line. |
| Blob URL cleanup | `URL.revokeObjectURL` called when the staged Map is replaced and on component unmount. Acceptable to leak a small number of session-lifetime blob URLs. |
| Handoff reminder | Existing "Added images?" panel lists `Array.from(stagedImages.keys())` as a bullet list. |
| Existing "Image" toolbar chip | Unchanged — still inserts the template snippet for when you don't yet have a file. |

## Architecture

### New file

| File | Responsibility |
|---|---|
| `src/lib/draft/staged-images.ts` | Pure utilities: `normalizeFilename(original)`, `dedupeName(desired, taken)`, `wikiImageSrc(filename)`, `resolveStagedSrc(src, staged)`. Plus the `StagedImage` / `StagedImages` types. |

### Modified files

| File | Change |
|---|---|
| `src/app/[lang]/draft/draft-editor.tsx` | Owns the `stagedImages` state (a `Map<string, StagedImage>`), an `addImages(files: File[])` handler that normalizes/dedupes filenames, creates blob URLs, and inserts the corresponding `<img>` lines via the existing `editorRef.current?.insertAtCursor()`. Threads the map down to `<Toolbar onUploadImage={...} />`, `<PreviewPane stagedImages={...} />`, and `<Handoff stagedImages={...} />`. On unmount, revokes all object URLs. |
| `src/app/[lang]/draft/toolbar.tsx` | Add a new "Upload image" chip. It renders a `<button>` + hidden `<input type="file" accept="image/*" multiple>`; clicking the chip programmatically clicks the input. On `change`, calls `onUploadImage(files)` and resets the input value so re-selecting the same file works. |
| `src/app/[lang]/draft/preview-pane.tsx` | Accepts a `stagedImages?: StagedImages` prop. The `components` passed to `<MDXRemote>` is now memoized: it overrides `img` to first check `resolveStagedSrc(src, stagedImages)` — if a blob URL exists, rewrite the `src` before delegating to the existing `getMDXComponents().img` (`ImageZoom`). |
| `src/app/[lang]/draft/handoff.tsx` | Accepts a `stagedImages?: StagedImages` prop. In the existing `<ImagesReminder>` block, when `stagedImages.size > 0`, render a `<ul>` of `Array.from(stagedImages.keys())` with a "you need to upload these" lead-in (new i18n string). |
| `messages/en.json` | Add 3 strings under the `draft` block: `uploadImage` ("Upload image"), `uploadImageBlurb` ("Pick a file. It shows in the preview and is referenced in your guide. Upload it to GitHub after Contribute."), `imagesToUpload` ("Files to upload along with this guide:"). |

## Data flow

1. User clicks the "Upload image" toolbar chip.
2. The hidden `<input type="file">` opens the OS picker. User selects one or more images.
3. `onUploadImage(files)` is called in the toolbar; it invokes `onUploadImage` prop ultimately bound to `addImages` in `draft-editor.tsx`.
4. For each file in order:
   - Compute `normalizeFilename(file.name)`.
   - Dedupe against `Set(stagedImages.keys())` accumulating new names.
   - `URL.createObjectURL(file)`.
   - Append `[filename, { file, objectUrl }]` to a working list.
5. `setStagedImages` to a new `Map` extending the previous one with the working list.
6. After the state update, call `editorRef.current?.insertAtCursor("<img src='/wiki-images/A' alt='' />\n<img src='/wiki-images/B' alt='' />\n")` to drop the tags in the editor at the cursor in one go.
7. The auto-save effect serializes the editor body to localStorage as before (the staged Map is NOT saved — that's the documented limitation).
8. The preview debounce fires, the MDX is sent to `/api/preview`, and the rendered output uses the wrapped `img` component which substitutes the blob URL for staged sources.
9. When the user clicks Contribute, the handoff modal renders. Its `<ImagesReminder>` sees `stagedImages.size > 0` and lists each filename.
10. On unmount of `draft-editor.tsx`, all object URLs in the map are revoked.

## Error handling

- **Non-image files dropped via the file input:** the input has `accept="image/*"` so the OS picker filters them. If a non-image somehow gets through, it's still staged — the preview will fail to render (broken image icon). No additional validation in v1.
- **Empty filename after normalization** (e.g. `"@@@.png"` → empty base): `normalizeFilename` falls back to `"image"`, so the result is `"image.png"`, deduped if collision.
- **`URL.createObjectURL` throws** (extremely unlikely): the error propagates up to the user — they see the browser's native error. Not silently swallowed.
- **localStorage persistence:** the staged Map is intentionally NOT persisted. After a refresh, the body restores via the existing restore-prompt flow, but the editor body contains `<img src="/wiki-images/foo.png">` that no longer resolves to a staged file — the preview shows a broken image until the creator either uploads to GitHub OR re-picks the same file. This is acceptable for v1 and would need IndexedDB to fix.

## Out of scope

- Drag-and-drop onto the editor pane.
- IndexedDB persistence across refresh.
- Auto-upload to GitHub (would re-introduce OAuth/Octokit).
- Image resizing / format conversion / optimization.
- A "remove staged image" UI — the creator just deletes the `<img>` line from the editor; the staged Map entry is harmless until unmount.
- Non-English locales — `messages/en.json` only; Crowdin handles the rest.

## Testing

Project-standard lightweight gates:
- `npm run types:check`, `npm run lint`, `npm run build`, `npx prettier --check` all pass.
- Interactive browser: click "Upload image" → file picker opens → pick an image → `<img src="/wiki-images/<name>" alt="" />` appears at cursor → preview shows the image (not broken) → click Contribute → handoff modal lists the filename in the images reminder.
