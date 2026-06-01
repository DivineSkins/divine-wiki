import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// OpenNext Cloudflare adapter config. Defaults are fine for this wiki:
// the whole Next.js app (pages + /api routes + i18n middleware) ships as one
// Worker, with static assets served from the [assets] binding in wrangler.toml.
// Add an R2-backed incremental cache here later if we enable ISR.
export default defineCloudflareConfig();
