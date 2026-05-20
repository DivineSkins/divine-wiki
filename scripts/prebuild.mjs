#!/usr/bin/env node
// Generates src/git-info.json with the current branch + short commit hash.
// Pure Node — reads from .git/ directly, no shell invocation, no external PM.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

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
        entities.push({ title, slug, category: game, url });
        continue;
      }
      if (!entryStat.isDirectory()) continue;
      const category = entry;
      for (const file of readdirSync(entryPath)) {
        if (!file.endsWith(".mdx")) continue;
        const slug = file.replace(/\.mdx$/, "");
        const title = readTitle(resolve(entryPath, file));
        if (!title) continue;
        const url =
          slug === "index"
            ? `/docs/${game}/${category}`
            : `/docs/${game}/${category}/${slug}`;
        entities.push({ title, slug, category, url });
      }
    }
  }
  return entities;
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
