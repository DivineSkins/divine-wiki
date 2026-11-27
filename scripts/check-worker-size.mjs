// Fails when the Worker bundle is too big to run well on Cloudflare.
// Run after `wrangler deploy --dry-run --outdir <dir>`:
//   node scripts/check-worker-size.mjs <dir>
//
// Two limits apply. Cloudflare rejects a Worker over 64 MiB uncompressed, and
// only at upload, so a build can pass every check and still fail to deploy.
// Before that, memory runs out: at startup the Worker holds about twice its
// bundle size, and an isolate over 128 MB is restarted, which makes every
// request pay a cold start. The budget keeps startup memory under ~90 MB.
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const BUDGET_MIB = 45;

const dir = process.argv[2];
if (!dir) {
  console.error("Usage: node scripts/check-worker-size.mjs <dry-run outdir>");
  process.exit(2);
}

let bytes = 0;
const entries = await readdir(dir, { recursive: true }).catch(() => []);
for (const entry of entries) {
  // Source maps and the README wrangler writes are not uploaded as modules.
  if (entry.endsWith(".map") || entry.endsWith(".md")) continue;
  const info = await stat(join(dir, entry));
  if (info.isFile()) bytes += info.size;
}
if (bytes === 0) {
  console.error(`No bundle found in ${dir}`);
  process.exit(2);
}

const mib = bytes / 1024 / 1024;
console.log(`Worker bundle: ${mib.toFixed(1)} MiB (budget ${BUDGET_MIB} MiB)`);
if (mib > BUDGET_MIB) {
  console.error(
    "The Worker bundle is over budget. Look for content or large libraries " +
      "pulled into server code (see the note on `dynamic` in source.config.ts).",
  );
  process.exit(1);
}
