#!/usr/bin/env node
/**
 * One-shot migration from content/<category>/*.mdx → content/docs/en/<category>/*.mdx
 *
 * Transforms applied per file:
 *  1. Backfill frontmatter: add description (first non-heading paragraph)
 *     and category (from parent folder name).
 *  2. Convert `:::tabs TITLE / ::tab LABEL / ... / :::` to Fumadocs JSX.
 *  3. Remap `/wiki/*` absolute links to `/docs/*`.
 *  4. Remap known legacy `/wiki/3d-modelling/*` paths (that folder no
 *     longer exists after the Supabase migration) to /docs/<actual>.
 *  5. Replace `YOUR_LINK_HERE` placeholders with `#` so builds don't break.
 *
 * Also generates a `meta.json` per category with Lucide icons + page order.
 *
 * Idempotent: running twice on already-migrated content is a no-op.
 */
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  statSync,
  existsSync,
  rmSync,
} from "node:fs";
import { join, basename, dirname } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "content");
const DEST = join(ROOT, "content", "docs", "en");

const CATEGORIES = [
  "guided-walkthrough",
  "tools",
  "maya",
  "blender",
  "animations",
  "vfx-bins",
  "assets-library",
  "errors",
];

// Sidebar display order + icons per category. Lucide icon names —
// resolved at build time by fumadocs-core/source/lucide-icons plugin.
const META = {
  "guided-walkthrough": { icon: "Compass", order: ["index"] },
  tools: {
    icon: "Wrench",
    order: [
      "index",
      "cs-lol-manager",
      "ltmao",
      "ritobin",
      "league-mod-repather",
      "tex-thumbnail-provider",
      "obsidian",
      "visual-studio-code",
      "blender",
      "maya",
      "photoshop",
      "photoshop-tex-plugin",
      "gimp",
      "gimp-tex-plugin",
    ],
  },
  maya: {
    icon: "Box",
    order: ["index", "lol-maya-plugin", "rigging-uvs", "3d-model-swap"],
  },
  blender: {
    icon: "Boxes",
    order: ["index", "lol-blender-plugin", "material-atlas", "3d-model-swap"],
  },
  animations: {
    icon: "Film",
    order: ["index", "animation-import-export", "animation-retargeting"],
  },
  "vfx-bins": {
    icon: "Sparkles",
    order: [
      "index",
      "file-formats",
      "matrix-scaling",
      "static-materials",
      "idle-particles",
      "hacksaw",
      "textureswap-fakegear",
      "stitch",
      "place-system",
    ],
  },
  "assets-library": {
    icon: "Library",
    order: ["index", "emitter-library", "thumbnail-template"],
  },
  errors: { icon: "AlertTriangle", order: ["index", "maya-errors"] },
};

// Absolute legacy paths that need rewriting. The `/wiki/3d-modelling/*`
// folder was flattened into maya/ and blender/ during the Supabase export,
// but link text still references the old structure.
const LEGACY_REMAPS = {
  "/wiki/3d-modelling/lol-maya-plugin": "/docs/lol/maya/lol-maya-plugin",
  "/wiki/3d-modelling/lol-blender-plugin":
    "/docs/lol/blender/lol-blender-plugin",
  "/wiki/3d-modelling/rigging--uvs": "/docs/lol/maya/rigging-uvs",
  "/wiki/3d-modelling/rigging-uvs": "/docs/lol/maya/rigging-uvs",
  "/wiki/3d-modelling/3d-model-swap": "/docs/lol/maya/3d-model-swap",
  "/wiki/3d-modelling/animation-retarget":
    "/docs/lol/animations/animation-retargeting",
  "/wiki/3d-modelling/animation-import-export":
    "/docs/lol/animations/animation-import-export",
  "/wiki/3d-modelling/material-atlas": "/docs/lol/blender/material-atlas",
  "/wiki/vfx--bins": "/docs/lol/vfx-bins",
  "/wiki/assets--library": "/docs/lol/assets-library",
};

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { frontmatter: {}, body: raw };

  const fm = {};
  for (const line of m[1].split("\n")) {
    const eq = line.indexOf(":");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    fm[key] = value;
  }
  return { frontmatter: fm, body: m[2] };
}

function serializeFrontmatter(fm) {
  const lines = ["---"];
  for (const [k, v] of Object.entries(fm)) {
    if (v === undefined || v === null || v === "") continue;
    const escaped = String(v).replace(/"/g, '\\"');
    lines.push(`${k}: "${escaped}"`);
  }
  lines.push("---");
  return lines.join("\n");
}

function firstDescriptionLine(body) {
  const blocks = body.split(/\n\s*\n/);
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#")) continue;
    if (trimmed.startsWith("---")) continue;
    if (trimmed.startsWith(":::")) continue;
    if (trimmed.startsWith("<")) continue;
    if (trimmed.startsWith("!")) continue;
    if (trimmed.startsWith("http")) continue;
    if (trimmed.startsWith("[")) continue;

    // Strip markdown formatting for the description
    const plain = trimmed
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\s+/g, " ")
      .trim();

    // Take at most ~160 chars, break at sentence boundary if we can
    if (plain.length <= 160) return plain;
    const truncated = plain.slice(0, 160);
    const lastPeriod = truncated.lastIndexOf(". ");
    return lastPeriod > 80
      ? truncated.slice(0, lastPeriod + 1)
      : truncated + "…";
  }
  return "";
}

/**
 * Convert the legacy `:::tabs TITLE / ::tab LABEL / ... / :::` block into
 * Fumadocs <Tabs items={[...]}><Tab value="LABEL">...</Tab></Tabs>.
 *
 * The TITLE is preserved as a preceding `### TITLE` heading so the original
 * section grouping doesn't disappear.
 */
function convertTabs(body) {
  const out = [];
  const lines = body.split("\n");
  let i = 0;

  while (i < lines.length) {
    const openMatch = lines[i].match(/^:::tabs\s*(.*)$/);
    if (!openMatch) {
      out.push(lines[i]);
      i++;
      continue;
    }

    const title = openMatch[1].trim();
    i++;

    // Collect tabs until closing :::
    const tabs = [];
    let currentLabel = null;
    let currentLines = [];

    while (i < lines.length && !/^:::\s*$/.test(lines[i])) {
      const tabMatch = lines[i].match(/^::tab\s+(.+)$/);
      if (tabMatch) {
        if (currentLabel !== null) {
          tabs.push({
            label: currentLabel,
            content: currentLines.join("\n").trim(),
          });
        }
        currentLabel = tabMatch[1].trim();
        currentLines = [];
      } else {
        currentLines.push(lines[i]);
      }
      i++;
    }

    if (currentLabel !== null) {
      tabs.push({
        label: currentLabel,
        content: currentLines.join("\n").trim(),
      });
    }

    // Skip the closing :::
    if (i < lines.length && /^:::\s*$/.test(lines[i])) i++;

    if (title) out.push(`### ${title}`, "");

    const items = tabs.map((t) => JSON.stringify(t.label)).join(", ");
    out.push(`<Tabs items={[${items}]}>`);
    for (const tab of tabs) {
      out.push(
        `<Tab value=${JSON.stringify(tab.label)}>`,
        "",
        tab.content,
        "",
        "</Tab>",
      );
    }
    out.push("</Tabs>", "");
  }

  return out.join("\n");
}

function rewriteLinks(body) {
  let out = body;

  // Apply explicit legacy remaps first.
  for (const [from, to] of Object.entries(LEGACY_REMAPS)) {
    out = out.split(from).join(to);
  }

  // General /wiki/ → /docs/ conversion for anything that slipped through.
  out = out.replace(/\/wiki\//g, "/docs/");

  // Kill the YOUR_LINK_HERE placeholder.
  out = out.replace(/YOUR_LINK_HERE/g, "#");

  return out;
}

function migrateFile(srcPath, category, stem) {
  const raw = readFileSync(srcPath, "utf-8");
  const { frontmatter, body } = parseFrontmatter(raw);

  let transformed = body;
  transformed = convertTabs(transformed);
  transformed = rewriteLinks(transformed);

  const fm = { ...frontmatter };
  if (!fm.description) {
    const desc = firstDescriptionLine(transformed);
    if (desc) fm.description = desc;
  }
  fm.category = category;

  const output = `${serializeFrontmatter(fm)}\n\n${transformed.trimStart()}`;

  const destDir = join(DEST, category);
  mkdirSync(destDir, { recursive: true });
  writeFileSync(join(destDir, `${stem}.mdx`), output);
}

function writeMeta(category) {
  const meta = META[category];
  if (!meta) return;

  const dir = join(DEST, category);
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));

  // Order honors META.order, then appends anything new.
  const ordered = meta.order.filter((name) => files.includes(name));
  for (const f of files) {
    if (!ordered.includes(f)) ordered.push(f);
  }

  writeFileSync(
    join(dir, "meta.json"),
    JSON.stringify(
      {
        title: `{meta.${category}.title}`,
        icon: meta.icon,
        pages: ordered,
      },
      null,
      2,
    ) + "\n",
  );
}

function writeRootMeta() {
  mkdirSync(DEST, { recursive: true });
  writeFileSync(
    join(DEST, "meta.json"),
    JSON.stringify(
      {
        title: "Divine Skins Wiki",
        pages: CATEGORIES,
      },
      null,
      2,
    ) + "\n",
  );
}

function main() {
  let migrated = 0;

  for (const category of CATEGORIES) {
    const srcDir = join(SRC, category);
    if (!existsSync(srcDir)) continue;

    const files = readdirSync(srcDir);
    for (const file of files) {
      const full = join(srcDir, file);
      if (!statSync(full).isFile()) continue;
      if (!file.endsWith(".mdx")) continue;

      const stem = file.replace(/\.mdx$/, "");
      migrateFile(full, category, stem);
      migrated++;
    }

    writeMeta(category);

    // Remove the legacy source directory now that we've migrated it.
    rmSync(srcDir, { recursive: true, force: true });
  }

  writeRootMeta();
  console.log(`Migrated ${migrated} MDX files to content/docs/en/`);
}

main();
