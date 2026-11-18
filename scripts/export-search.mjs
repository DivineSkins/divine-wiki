// Publish Next's prerendered indexes before OpenNext copies public/.
// One file per locale and game: public/search/<hash>/<locale>/<game>.json.
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const { version } = JSON.parse(
  await readFile("src/lib/search-version.json", "utf8"),
);
if (!/^[a-f0-9]{20}$/.test(version)) throw new Error("Invalid search version");
const manifest = JSON.parse(
  await readFile(".next/prerender-manifest.json", "utf8"),
);
const routes = Object.keys(manifest.routes).filter((route) =>
  /^\/api\/search\/[a-z]{2}(?:-[A-Z]{2})?\/[a-z0-9-]+$/.test(route),
);
if (routes.length === 0) throw new Error("No prerendered search indexes found");

// Only clear this script's generated directories.
await mkdir("public/search", { recursive: true });
for (const entry of await readdir("public/search")) {
  if (/^[a-f0-9]{20}$/.test(entry)) {
    await rm(join("public/search", entry), { recursive: true, force: true });
  }
}
const output = join("public/search", version);
for (const route of routes) {
  const body = await readFile(
    join(".next/server/app", `${route.slice(1)}.body`),
  );
  const index = JSON.parse(body.toString("utf8"));
  if (index.type !== "advanced" || !index.index || !index.docs) {
    throw new Error(`Invalid search index: ${route}`);
  }
  if (Object.keys(index.docs.docs ?? {}).length === 0) {
    throw new Error(`Empty search index: ${route}`);
  }
  const [locale, game] = route.split("/").slice(-2);
  await mkdir(join(output, locale), { recursive: true });
  await writeFile(join(output, locale, `${game}.json`), body);
  console.log(`Static search: ${locale}/${game} (${body.length} bytes)`);
}
