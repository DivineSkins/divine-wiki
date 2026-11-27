// Puts the prerendered pages where the Worker reads them: in its static
// assets, under cdn-cgi/_next_cache (see open-next.config.ts).
//
// Wrangler runs this before every deploy, version upload and dev session (the
// [build] command in wrangler.toml). `opennextjs-cloudflare deploy` does the
// same copy itself, but a plain `wrangler versions upload`, which preview
// builds use, does not. Guides can only be rendered at build time (see the
// note on `dynamic` in source.config.ts), so an upload without these files
// serves an error page for every guide.
//
// The files are moved, not copied: they are several GB.
import { existsSync, mkdirSync, readdirSync, renameSync } from "node:fs";
import { join } from "node:path";

const cache = ".open-next/cache";
const target = ".open-next/assets/cdn-cgi/_next_cache";

if (!existsSync(cache)) {
  console.log("No .open-next/cache yet: nothing to populate.");
  process.exit(0);
}

// Already there after `opennextjs-cloudflare deploy`, or an earlier run.
const pending = readdirSync(cache).filter(
  (entry) => !existsSync(join(target, entry)),
);
if (pending.length === 0) {
  console.log("Prerendered pages are already in the static assets.");
  process.exit(0);
}

mkdirSync(target, { recursive: true });
for (const entry of pending) {
  renameSync(join(cache, entry), join(target, entry));
}
console.log(`Moved the prerendered pages into ${target}.`);
