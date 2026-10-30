#!/usr/bin/env node
// Generates src/git-info.json with the current branch + short commit hash.
// Pure Node: reads .git/ directly, no shell. (The page-dates step below runs git.)

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createHash } from "node:crypto";

const OUT = resolve("src/git-info.json");

function readGitInfo() {
  const gitDir = resolve(".git");
  if (!existsSync(gitDir)) {
    return { branch: "unknown", commit: "unknown" };
  }

  const head = readFileSync(resolve(gitDir, "HEAD"), "utf-8").trim();

  if (head.startsWith("ref: ")) {
    const refPath = head.slice(5);
    const branch = refPath.replace(/^refs\/heads\//, "");
    const refFile = resolve(gitDir, refPath);
    let commit = "unknown";
    if (existsSync(refFile)) {
      commit = readFileSync(refFile, "utf-8").trim().slice(0, 7);
    } else {
      // Packed refs fallback
      const packed = resolve(gitDir, "packed-refs");
      if (existsSync(packed)) {
        for (const line of readFileSync(packed, "utf-8").split("\n")) {
          if (line.endsWith(refPath)) {
            commit = line.split(" ")[0].slice(0, 7);
            break;
          }
        }
      }
    }
    return { branch, commit };
  }

  // Detached HEAD — head is the commit SHA itself
  return { branch: "detached", commit: head.slice(0, 7) };
}

try {
  const info = readGitInfo();
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(info, null, 2) + "\n");
  console.log("git-info.json generated:", info);
} catch (err) {
  console.warn("Could not generate git-info.json:", err.message);
  // Write a sentinel so the import in src/components/git-info-button.tsx doesn't explode
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(
    OUT,
    JSON.stringify({ branch: "unknown", commit: "unknown" }, null, 2) + "\n",
  );
}

// --- Entity index for the draft editor's @-mention smart-linking ---------
// Scans content/docs/en/** for guides and writes a flat list of linkable
// entities (title + slug + category + url). Pure Node, no front-matter lib.

import { readdirSync, statSync } from "node:fs";

const ENTITY_OUT = resolve("src/lib/draft/entity-index.json");
const EN_DIR = resolve("content/docs/en");

function readTitle(filePath) {
  const text = readFileSync(filePath, "utf-8");
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return null;
  const titleLine = fm[1].match(/^title:\s*(.+)$/m);
  if (!titleLine) return null;
  return titleLine[1].trim().replace(/^["']|["']$/g, "");
}

function buildEntityIndex() {
  if (!existsSync(EN_DIR)) return [];
  const entities = [];
  for (const game of readdirSync(EN_DIR)) {
    const gameDir = resolve(EN_DIR, game);
    if (!statSync(gameDir).isDirectory()) continue;
    for (const entry of readdirSync(gameDir)) {
      const entryPath = resolve(gameDir, entry);
      const entryStat = statSync(entryPath);
      if (entryStat.isFile() && entry.endsWith(".mdx")) {
        const slug = entry.replace(/\.mdx$/, "");
        const title = readTitle(entryPath);
        if (!title) continue;
        const url =
          slug === "index" ? `/docs/${game}` : `/docs/${game}/${slug}`;
        entities.push({ title, slug, category: game, game, url });
        continue;
      }
      if (!entryStat.isDirectory()) continue;
      // Recurse the whole category: guides can sit in sub-folders
      // (e.g. tools/modding-apps/flint.mdx) and must be linkable too.
      walkCategory(entryPath, game, entry, [], entities);
    }
  }
  return entities;
}

function walkCategory(dirPath, game, category, relParts, entities) {
  for (const entry of readdirSync(dirPath)) {
    const entryPath = resolve(dirPath, entry);
    if (statSync(entryPath).isDirectory()) {
      walkCategory(entryPath, game, category, [...relParts, entry], entities);
      continue;
    }
    if (!entry.endsWith(".mdx")) continue;
    const slug = entry.replace(/\.mdx$/, "");
    const title = readTitle(entryPath);
    if (!title) continue;
    const parts = [game, category, ...relParts];
    if (slug !== "index") parts.push(slug);
    entities.push({
      title,
      slug,
      category,
      game,
      url: `/docs/${parts.join("/")}`,
    });
  }
}

try {
  const entities = buildEntityIndex();
  mkdirSync(dirname(ENTITY_OUT), { recursive: true });
  writeFileSync(ENTITY_OUT, JSON.stringify(entities, null, 2) + "\n");
  console.log(`entity-index.json generated: ${entities.length} entities`);
} catch (err) {
  console.warn("Could not generate entity-index.json:", err.message);
  mkdirSync(dirname(ENTITY_OUT), { recursive: true });
  writeFileSync(ENTITY_OUT, "[]\n");
}

// --- Game index for the contribute picker and the draft editor -----------
// Each game segment under content/docs/en/ with its guide categories: the
// folders its meta.json `pages` lists, in that (sidebar) order, then any
// folder it doesn't list. A game shows up here as soon as its segment has a
// category folder, which is what lets the picker offer it for new guides.

const GAMES_OUT = resolve("src/lib/draft/games-index.json");

function buildGamesIndex() {
  const games = {};
  if (!existsSync(EN_DIR)) return games;
  for (const game of readdirSync(EN_DIR).sort()) {
    const gameDir = resolve(EN_DIR, game);
    if (!statSync(gameDir).isDirectory()) continue;
    const folders = readdirSync(gameDir).filter((entry) =>
      statSync(resolve(gameDir, entry)).isDirectory(),
    );
    let pages = [];
    try {
      pages = JSON.parse(
        readFileSync(resolve(gameDir, "meta.json"), "utf-8"),
      ).pages;
    } catch {
      // No meta.json yet: fall back to folder order.
    }
    const listed = (Array.isArray(pages) ? pages : []).filter((page) =>
      folders.includes(page),
    );
    const unlisted = folders.filter((f) => !listed.includes(f)).sort();
    games[game] = [...listed, ...unlisted];
  }
  return games;
}

try {
  const games = buildGamesIndex();
  writeFileSync(GAMES_OUT, JSON.stringify(games, null, 2) + "\n");
  console.log(
    `games-index.json generated: ${Object.keys(games).join(", ") || "none"}`,
  );
} catch (err) {
  console.warn("Could not generate games-index.json:", err.message);
  writeFileSync(GAMES_OUT, "{}\n");
}

// --- Last-commit date per content file, for the sitemap's <lastmod> -------
// The one step here that runs git (no shell). Keys are paths relative to
// content/docs ("en/lol/tools/index.mdx").
//
// Cloudflare's build clones one commit deep, and a shallow clone would give
// every file that one commit's date. So a shallow clone first fetches the
// rest of the history without file contents (commits and trees only: about
// 6 MB and a second in Oct 2026). If that fails, or git is missing, this
// writes {} and the sitemap leaves lastmod out instead of sending wrong dates.

import { execFileSync } from "node:child_process";

const DATES_OUT = resolve("src/lib/page-dates.json");

const git = (args, options = {}) =>
  execFileSync("git", args, {
    encoding: "utf-8",
    maxBuffer: 256 * 1024 * 1024,
    ...options,
  });
const isShallow = () =>
  git(["rev-parse", "--is-shallow-repository"]).trim() === "true";

function buildPageDates() {
  if (isShallow()) {
    try {
      git(["fetch", "--quiet", "--unshallow", "--filter=blob:none"], {
        stdio: "ignore",
        timeout: 120_000,
      });
    } catch (err) {
      console.warn("Could not fetch git history for page dates:", err.message);
    }
    if (isShallow()) return {};
  }
  // --no-renames: rename detection would compare file contents, which the
  // fetch above leaves out.
  const log = git([
    "log",
    "--no-renames",
    "--format=%x00%cI",
    "--name-only",
    "--",
    "content/docs",
  ]);
  const dates = {};
  let date = "";
  for (const line of log.split("\n")) {
    if (line.startsWith("\0")) date = line.slice(1);
    else if (line.startsWith("content/docs/") && line.endsWith(".mdx")) {
      // Newest commit comes first, so the first date seen per file wins.
      dates[line.slice("content/docs/".length)] ??= date;
    }
  }
  return dates;
}

try {
  const dates = buildPageDates();
  writeFileSync(DATES_OUT, JSON.stringify(dates) + "\n");
  console.log(`page-dates.json generated: ${Object.keys(dates).length} files`);
} catch (err) {
  console.warn("Could not generate page-dates.json:", err.message);
  writeFileSync(DATES_OUT, "{}\n");
}

// ---------------------------------------------------------------------------
// Page credits: who created each guide and who has edited it since, for the
// credits row at the bottom of every guide (src/lib/guide-credits.ts). Uses
// the history fetched above. Keys match page-dates ("en/lol/maya/x.mdx").
//
// Three things in this repo's history would credit the wrong people:
// - The 40 LoL guides imported from the old Divine Academy (IMPORT_COMMITS)
//   were written by people git never saw. They get no creator here.
// - Folder moves. Exact renames are followed with -M100% (no file contents
//   needed, so it works on the blob-less fetch). Moves that also edited the
//   file show as delete + add, so an add is paired with a delete of the same
//   file name in the same commit and keeps that file's credits.
// - Site-wide sweeps (formatting, link rewrites, title passes). A commit that
//   edits BULK or more guides doesn't make anyone a contributor.
// Bots and AI co-author trailers are skipped. GitHub logins come from noreply
// emails, or from the GitHub API for other emails (cached in node_modules).
// Emails never reach the output file.

const CREDITS_OUT = resolve("src/lib/page-credits.json");
const LOGIN_CACHE = resolve(
  "node_modules/.cache/divine-wiki/github-logins.json",
);
const REPO = "DivineSkins/divine-wiki";
const IMPORT_COMMITS = ["9ec672b"];
const BULK = 15;
const BOT =
  /\[bot\]|noreply@anthropic\.com|^claude\b|dependabot|github-actions/i;
const NOREPLY = /^(?:(\d+)\+)?([^@]+)@users\.noreply\.github\.com$/i;

function parseIdent(text) {
  const m = text.trim().match(/^(.*?)\s*<([^>]+)>$/);
  return m ? { name: m[1], email: m[2] } : null;
}

function readCommits() {
  const log = git([
    "log",
    "--reverse",
    "-M100%",
    "--format=%x00%H%x1f%an%x1f%ae%x1f%(trailers:key=Co-authored-by,valueonly,separator=%x1e)",
    "--name-status",
    "--",
    "content/docs",
    // Web-UI uploads land at the repo root before being moved into place.
    ":(glob)*.mdx",
  ]);
  const commits = [];
  for (const line of log.split("\n")) {
    if (line.startsWith("\0")) {
      const [sha, name, email, co] = line.slice(1).split("\x1f");
      const people = [
        { name, email },
        ...(co ? co.split("\x1e").map(parseIdent).filter(Boolean) : []),
      ].filter((p) => !BOT.test(p.name) && !BOT.test(p.email));
      commits.push({ sha, people, changes: [] });
    } else if (line && commits.length > 0) {
      const [status, ...paths] = line.split("\t");
      if (paths.at(-1)?.endsWith(".mdx")) {
        commits.at(-1).changes.push({ status: status[0], paths });
      }
    }
  }
  return commits;
}

/** "My Guide.mdx" and "my-guide.mdx" are the same file name. */
const fileKey = (path) =>
  path
    .split("/")
    .pop()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

/**
 * Pairs each added file with a file deleted in the same commit that has the
 * same name (index.mdx also needs the same parent folder). Returns
 * added path -> deleted path.
 */
function pairMoves(deleted, added) {
  const moves = new Map();
  const used = new Set();
  for (const to of added) {
    const toParts = to.split("/");
    const candidates = deleted.filter((from) => {
      if (used.has(from) || fileKey(from) !== fileKey(to)) return false;
      if (fileKey(to) !== "index-mdx") return true;
      return from.split("/").at(-2) === toParts.at(-2);
    });
    if (candidates.length === 1) {
      moves.set(to, candidates[0]);
      used.add(candidates[0]);
    }
  }
  return moves;
}

/** email -> { login, avatar } for commit emails that aren't noreply ones. */
async function resolveLogins(emails) {
  let cache = {};
  try {
    cache = JSON.parse(readFileSync(LOGIN_CACHE, "utf-8"));
  } catch {}
  if (emails.every((email) => email in cache)) return cache;
  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  try {
    for (let page = 1; page <= 20; page++) {
      const res = await fetch(
        `https://api.github.com/repos/${REPO}/commits?per_page=100&page=${page}`,
        { headers, signal: AbortSignal.timeout(8000) },
      );
      if (!res.ok) throw new Error(`GitHub API ${res.status}`);
      const commits = await res.json();
      for (const c of commits) {
        const email = c.commit?.author?.email?.toLowerCase();
        if (email && c.author?.login && !(email in cache)) {
          cache[email] = { login: c.author.login, avatar: c.author.avatar_url };
        }
      }
      if (commits.length < 100) break;
    }
    // Emails GitHub can't match to an account: remember that too.
    for (const email of emails) cache[email] ??= null;
    mkdirSync(dirname(LOGIN_CACHE), { recursive: true });
    writeFileSync(LOGIN_CACHE, JSON.stringify(cache));
  } catch (err) {
    console.warn("Could not resolve GitHub logins:", err.message);
  }
  return cache;
}

async function buildPageCredits() {
  if (isShallow()) return { people: {}, pages: {} };
  const commits = readCommits();

  const logins = await resolveLogins([
    ...new Set(
      commits.flatMap((c) =>
        c.people
          .map((p) => p.email.toLowerCase())
          .filter((e) => !NOREPLY.test(e)),
      ),
    ),
  ]);

  // One entry per person: by GitHub login when known, else by name.
  const people = {};
  const names = {};
  const personKey = ({ name, email }) => {
    const noreply = email.match(NOREPLY);
    const known = noreply
      ? {
          login: noreply[2],
          avatar: noreply[1]
            ? `https://avatars.githubusercontent.com/u/${noreply[1]}?v=4`
            : null,
        }
      : logins[email.toLowerCase()];
    const key = known ? known.login.toLowerCase() : `name:${name}`;
    people[key] ??= {
      login: known?.login ?? null,
      avatar:
        known?.avatar ??
        (known ? `https://github.com/${known.login}.png?size=96` : null),
    };
    (names[key] ??= {})[name] = (names[key][name] ?? 0) + 1;
    return key;
  };

  const files = new Map();
  for (const commit of commits) {
    const imported = IMPORT_COMMITS.some((s) => commit.sha.startsWith(s));
    const authors = commit.people.map(personKey);
    const edits = commit.changes.filter((c) => c.status === "M").length;
    const of = (status) =>
      commit.changes.filter((c) => c.status === status).map((c) => c.paths[0]);
    const moves = pairMoves(of("D"), of("A"));
    const movedAway = new Set(moves.values());

    for (const { status, paths } of commit.changes) {
      const path = paths.at(-1);
      if (status === "R") {
        if (files.has(paths[0])) files.set(path, files.get(paths[0]));
        files.delete(paths[0]);
      } else if (status === "D") {
        if (!movedAway.has(path)) files.delete(path);
      } else if (status === "A") {
        const from = moves.get(path);
        if (from && files.has(from)) {
          files.set(path, files.get(from));
          files.delete(from);
        } else {
          const record = {
            creator: imported ? null : (authors[0] ?? null),
            edits: new Map(),
          };
          if (!imported)
            for (const a of authors.slice(1)) record.edits.set(a, 1);
          files.set(path, record);
        }
      } else if (status === "M" && edits < BULK) {
        const record = files.get(path);
        if (!record) continue;
        for (const a of authors)
          record.edits.set(a, (record.edits.get(a) ?? 0) + 1);
      }
    }
  }

  for (const [key, counts] of Object.entries(names)) {
    people[key].name = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }
  const pages = {};
  for (const [path, { creator, edits }] of files) {
    if (!path.startsWith("content/docs/")) continue;
    pages[path.slice("content/docs/".length)] = {
      creator,
      // Most edits first; the creator is listed on its own.
      contributors: [...edits]
        .filter(([key]) => key !== creator)
        .sort((a, b) => b[1] - a[1])
        .map(([key]) => key),
    };
  }
  // Only people still credited somewhere.
  const credited = new Set(
    Object.values(pages).flatMap((p) => [p.creator, ...p.contributors]),
  );
  for (const key of Object.keys(people)) {
    if (!credited.has(key)) delete people[key];
  }
  return { people, pages };
}

try {
  const credits = await buildPageCredits();
  writeFileSync(CREDITS_OUT, JSON.stringify(credits) + "\n");
  console.log(
    `page-credits.json generated: ${Object.keys(credits.pages).length} files, ${Object.keys(credits.people).length} people`,
  );
} catch (err) {
  console.warn("Could not generate page-credits.json:", err.message);
  writeFileSync(CREDITS_OUT, JSON.stringify({ people: {}, pages: {} }) + "\n");
}

// Hash search inputs, including uncommitted edits and builds without .git.
const searchHash = createHash("sha256");
function hashSearchInput(path) {
  if (statSync(path).isDirectory()) {
    for (const entry of readdirSync(path).sort()) {
      hashSearchInput(resolve(path, entry));
    }
    return;
  }
  searchHash.update(path.slice(process.cwd().length));
  searchHash.update("\0");
  searchHash.update(readFileSync(path));
  searchHash.update("\0");
}
for (const input of [
  "content/docs",
  "messages",
  "src/app/api/search",
  "src/lib/i18n.ts",
  "src/lib/source.ts",
  "src/lib/tree-localization.ts",
  "src/lib/remark-img.ts",
  "src/lib/remark-youtube.ts",
  "source.config.ts",
  "package-lock.json",
]) {
  hashSearchInput(resolve(input));
}
writeFileSync(
  resolve("src/lib/search-version.json"),
  JSON.stringify({ version: searchHash.digest("hex").slice(0, 20) }) + "\n",
);
await import("./prepare-media.mjs");
