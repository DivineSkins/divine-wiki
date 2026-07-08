// Content MDX (English and Crowdin-managed locales alike) links internally
// with locale-less absolute paths like `/docs/lol/tools`. Those must stay
// locale-less in the files — translated content is byte-synced from English
// and never hand-edited — so the locale prefix is added at render time.
// Without it, the Cloudflare edge rule `/docs/* → /en/docs/:splat` kicks a
// reader from any locale back to English.

/** App route roots under `src/app/[lang]` that content links can target. */
const LOCALIZED_ROOTS = ["/docs", "/contribute", "/draft"];

export function localizeHref(
  href: string | undefined,
  lang: string,
): string | undefined {
  if (!href) return href;
  const localizable = LOCALIZED_ROOTS.some(
    (root) =>
      href === root ||
      href.startsWith(`${root}/`) ||
      href.startsWith(`${root}#`) ||
      href.startsWith(`${root}?`),
  );
  return localizable ? `/${lang}${href}` : href;
}
