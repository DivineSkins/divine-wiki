// Build-time dimensions for literal MDX images, including the draft preview.
import { readdir, writeFile } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";
import sharp from "sharp";

const publicDir = resolve("public");
const sizes = {};
async function scan(dir) {
  for (const entry of (await readdir(dir, { withFileTypes: true })).sort(
    (a, b) => a.name.localeCompare(b.name),
  )) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (dir !== publicDir || entry.name !== "search") await scan(path);
    } else if (/^\.(png|jpe?g|webp|avif|gif)$/i.test(extname(path))) {
      const { width, height, pageHeight, pages } = await sharp(path).metadata();
      if (!width || !height) throw new Error(`Missing dimensions: ${path}`);
      sizes[`/${relative(publicDir, path).split("\\").join("/")}`] = {
        width,
        height: pageHeight ?? height,
        ...(pages > 1 ? { animated: true } : {}),
      };
    }
  }
}
await scan(publicDir);
await writeFile("src/lib/media-sizes.json", JSON.stringify(sizes) + "\n");
console.log(`media-sizes.json generated: ${Object.keys(sizes).length} images`);
