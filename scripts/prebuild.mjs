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
  writeFileSync(OUT, JSON.stringify({ branch: "unknown", commit: "unknown" }, null, 2) + "\n");
}
