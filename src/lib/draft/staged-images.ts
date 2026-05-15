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
