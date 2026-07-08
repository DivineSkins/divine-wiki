#!/usr/bin/env node
// Structural en-vs-<locale> diff for translation review.
// Usage: node scripts/check-locale.mjs <locale> [relative/path/to/one-file.mdx]
// Compares every content/docs/en/**/*.mdx against its <locale> counterpart:
// heading structure, code fences, component tags, link targets, image srcs,
// frontmatter keys. Also flags em/en dashes and unescaped `<digit` in the
// translation. Exits 1 if any file is missing or mismatched.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const locale = process.argv[2];
const only = process.argv[3];
if (!locale) {
  console.error("Usage: node scripts/check-locale.mjs <locale> [file.mdx]");
  process.exit(2);
}
const ROOT = join(import.meta.dirname, "..", "content", "docs");

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return walk(p);
    return name.endsWith(".mdx") ? [p] : [];
  });
}

const stripFences = (t) => t.replace(/```[\s\S]*?```/g, "");

function fmKeys(t) {
  const m = t.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return [];
  return m[1]
    .split("\n")
    .filter((l) => /^[A-Za-z_]+\s*:/.test(l))
    .map((l) => l.split(":")[0].trim());
}

function stats(t) {
  const body = stripFences(t);
  const all = (re) => [...body.matchAll(re)].map((m) => m[1] ?? m[0]);
  return {
    fences: (t.match(/```/g) ?? []).length,
    headings: all(/^(#{1,6}) /gm),
    componentsOpen: all(/<([A-Z][A-Za-z]+)/g).sort(),
    componentsClose: all(/<\/([A-Z][A-Za-z]+)>/g).sort(),
    linkTargets: all(/\]\(([^)\s]+)/g).sort(),
    imgSrcs: all(/src="([^"]+)"/g).sort(),
    youtube: all(/^https:\/\/(?:www\.)?youtu\S+$/gm).sort(),
    frontmatter: fmKeys(t),
  };
}

const enFiles = walk(join(ROOT, "en")).filter(
  (p) => !only || relative(join(ROOT, "en"), p) === only,
);
let missing = 0;
let bad = 0;

for (const pe of enFiles) {
  const rel = relative(join(ROOT, "en"), pe);
  const pl = join(ROOT, locale, rel);
  if (!existsSync(pl)) {
    console.log(`MISSING: ${rel}`);
    missing++;
    continue;
  }
  const se = stats(readFileSync(pe, "utf8"));
  const tr = readFileSync(pl, "utf8");
  const sl = stats(tr);
  const problems = [];
  for (const k of Object.keys(se)) {
    if (JSON.stringify(se[k]) !== JSON.stringify(sl[k])) {
      problems.push(
        `  MISMATCH ${k}:\n    en: ${JSON.stringify(se[k])}\n    ${locale}: ${JSON.stringify(sl[k])}`,
      );
    }
  }
  const body = stripFences(tr);
  for (const line of body.split("\n")) {
    if (/[—–]/.test(line)) problems.push(`  DASH: ${line.trim().slice(0, 90)}`);
  }
  for (const m of body.matchAll(/[^\\]<(\d)/g)) {
    problems.push(
      `  UNESCAPED <digit: …${body.slice(Math.max(0, m.index - 20), m.index + 10)}…`,
    );
  }
  if (problems.length) {
    bad++;
    console.log(`\n${rel}\n${problems.join("\n")}`);
  }
}

console.log(
  `\n=== ${enFiles.length} en files checked vs ${locale}: ${missing} missing, ${bad} with issues ===`,
);
// Intentional localized in-page anchors will show as linkTargets mismatches;
// verify those by hand instead of silencing them here.
process.exit(missing || bad ? 1 : 0);
