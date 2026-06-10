const REPO = "DivineSkins/divine-wiki";
const BRANCH = "main";
/** Game segment under content/docs/en/ — the draft editor is LoL-only today. */
const GAME = "lol";

/**
 * Conservative cap on the total prefill URL length. GitHub + browsers start
 * dropping the `?value=` payload somewhere around 8 KB; 6 KB leaves margin.
 */
const MAX_PREFILL_URL_BYTES = 6000;

/** Repo-relative path to a guide's .mdx file. */
export function contentPath(category: string, slug: string): string {
  return `content/docs/en/${GAME}/${category}/${slug}.mdx`;
}

export interface NewFileHandoff {
  url: string;
  /** true = URL carries the file content; false = blank file, copy-paste needed. */
  prefilled: boolean;
}

/**
 * GitHub "create new file" URL. If the prefilled URL is too long, fall back
 * to a blank-file URL (the caller then shows the copy-paste panel).
 */
export function newFileUrl(
  category: string,
  slug: string,
  mdx: string,
): NewFileHandoff {
  const filename = contentPath(category, slug);
  const base = `https://github.com/${REPO}/new/${BRANCH}`;
  const prefilledUrl =
    `${base}?filename=${encodeURIComponent(filename)}` +
    `&value=${encodeURIComponent(mdx)}`;

  if (byteLength(prefilledUrl) <= MAX_PREFILL_URL_BYTES) {
    return { url: prefilledUrl, prefilled: true };
  }
  return {
    url: `${base}?filename=${encodeURIComponent(filename)}`,
    prefilled: false,
  };
}

/** GitHub "edit existing file" URL. `path` is the slug path, e.g. "tools/flint". */
export function editFileUrl(path: string): string {
  return `https://github.com/${REPO}/edit/${BRANCH}/content/docs/en/${path}.mdx`;
}

/** GitHub "edit" URL for a category's meta.json. */
export function metaJsonUrl(category: string): string {
  return `https://github.com/${REPO}/edit/${BRANCH}/content/docs/en/${GAME}/${category}/meta.json`;
}

/** raw.githubusercontent URL for a guide's source. `path` e.g. "tools/flint". */
export function rawSourceUrl(path: string): string {
  return `https://raw.githubusercontent.com/${REPO}/${BRANCH}/content/docs/en/${path}.mdx`;
}

/** GitHub "upload files" URL pointed at the wiki-images folder. */
export function uploadImagesUrl(): string {
  return `https://github.com/${REPO}/upload/${BRANCH}/public/wiki-images`;
}

function byteLength(s: string): number {
  return new TextEncoder().encode(s).length;
}
