/**
 * Turn a guide title into a kebab-case file slug.
 * "Install a Skin with Celestial!" -> "install-a-skin-with-celestial"
 */
export function deriveSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** A slug is valid if it's non-empty and only lowercase letters, digits, dashes. */
export function isValidSlug(slug: string): boolean {
  return slug.length > 0 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
