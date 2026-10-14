const REPO_OWNER = "DivineSkins";
const REPO_NAME = "divine-wiki";
const REPO = `${REPO_OWNER}/${REPO_NAME}`;
const BRANCH = "main";

/**
 * Conservative cap on the total prefill URL length. GitHub + browsers start
 * dropping the `?value=` payload somewhere around 8 KB; 6 KB leaves margin.
 */
const MAX_PREFILL_URL_BYTES = 6000;

/** Repo-relative path to a guide's .mdx file. `game` is the docs segment. */
export function contentPath(
  game: string,
  category: string,
  slug: string,
): string {
  return `content/docs/en/${game}/${category}/${slug}.mdx`;
}

/**
 * "owner" is the contributor's GitHub username — URLs then point at their
 * fork, where they have push access and GitHub honors the `?value=` prefill.
 * Without it, URLs point at the upstream repo (maintainers only: GitHub's
 * fork-and-edit interstitial on /new is unreliable and drops the prefill).
 */
function repoFor(owner?: string): string {
  return owner ? `${owner}/${REPO_NAME}` : REPO;
}

/** GitHub's "create a new fork" page for the wiki repo. */
export function forkUrl(): string {
  return `https://github.com/${REPO}/fork`;
}

/**
 * Cross-repo compare page: the fork's main branch against upstream main,
 * with the PR form already expanded. Assumes the contributor committed to
 * their fork's main (the default option in GitHub's commit dialog, and what
 * the handoff modal tells them to do).
 */
export function comparePrUrl(owner: string): string {
  return `https://github.com/${REPO}/compare/${BRANCH}...${encodeURIComponent(owner)}:${REPO_NAME}:${BRANCH}?expand=1`;
}

/** GitHub username rules: alphanumeric + inner hyphens, max 39 chars. */
export function isValidGithubUsername(name: string): boolean {
  return /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(name);
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
  game: string,
  category: string,
  slug: string,
  mdx: string,
  owner?: string,
): NewFileHandoff {
  const filename = contentPath(game, category, slug);
  const base = `https://github.com/${repoFor(owner)}/new/${BRANCH}`;
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
export function metaJsonUrl(game: string, category: string): string {
  return `https://github.com/${REPO}/edit/${BRANCH}/content/docs/en/${game}/${category}/meta.json`;
}

/** raw.githubusercontent URL for a guide's source. `path` e.g. "tools/flint". */
export function rawSourceUrl(path: string): string {
  return `https://raw.githubusercontent.com/${REPO}/${BRANCH}/content/docs/en/${path}.mdx`;
}

/** GitHub "upload files" URL pointed at the wiki-images folder. */
export function uploadImagesUrl(owner?: string): string {
  return `https://github.com/${repoFor(owner)}/upload/${BRANCH}/public/wiki-images`;
}

function byteLength(s: string): number {
  return new TextEncoder().encode(s).length;
}
