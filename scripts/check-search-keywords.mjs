// Run with: node scripts/check-search-keywords.mjs
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import { initAdvancedSearch } from "fumadocs-core/search/server";

// Exercise the TypeScript helper without adding another runtime or test runner.
const compiled = ts.transpileModule(
  await readFile(
    new URL("../src/lib/search-keywords.ts", import.meta.url),
    "utf8",
  ),
  { compilerOptions: { module: ts.ModuleKind.ESNext } },
).outputText;
const { withSearchKeywords } = await import(
  "data:text/javascript;base64," + Buffer.from(compiled).toString("base64")
);
const article = { headings: [], contents: [] };
assert.equal(withSearchKeywords(article), article);
const data = withSearchKeywords(
  article,
  ["outfit swap", "clothes swap", "texture swap", "mesh swap", "outfit swap"],
  ["wardrobe", " "],
);
assert.deepEqual(article, { headings: [], contents: [] });
assert.equal(data.contents[0].content.match(/outfit swap/g).length, 1);

// The title and article contain no aliases, so only metadata can produce hits.
const index = { id: "guide", title: "Guide", url: "/guide" };
const baseline = initAdvancedSearch({
  indexes: [{ ...index, structuredData: article }],
});
const search = initAdvancedSearch({
  indexes: [{ ...index, structuredData: data }],
});
for (const query of [
  "outfit swap",
  "clothes swap",
  "texture swap",
  "mesh swap",
  "wardrobe",
]) {
  assert.equal((await baseline.search(query)).length, 0, query);
  assert.ok(
    (await search.search(query)).some((result) =>
      result.url.startsWith("/guide"),
    ),
    query,
  );
}
assert.ok(await search.export());
console.log(
  "Search keywords and tags are searchable without changing the article.",
);
