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
