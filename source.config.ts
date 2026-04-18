import { defineConfig, defineDocs, metaSchema } from "fumadocs-mdx/config";
import { z } from "zod";

// Declare the frontmatter schema fresh instead of extending Fumadocs'
// re-exported `frontmatterSchema`. The re-export is bound to an internal
// copy of Zod v4 that ships nested inside fumadocs-mdx/fumadocs-core; our
// top-level `zod` is a different instance, so `.extend()` across that
// boundary hits an "expected a Zod schema" error when Fumadocs re-introspects
// the result. Declaring the whole object in one place with one Zod instance
// sidesteps it and keeps the type surface explicit.
const frontmatterSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  full: z.boolean().optional(),
  category: z.string().optional(),
  authors: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url().optional(),
      }),
    )
    .optional(),
  patch: z.string().optional(),
});

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
    async: true,
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    // Don't prefetch dimensions of external images at build time. The
    // migrated content links to third-party CDNs (postimg.cc, YouTube
    // thumbnails) that can't be reached reliably; a single timeout would
    // crash the whole page compile. Local /public/wiki-images/* still get
    // dimensions because they live on disk.
    remarkImageOptions: {
      external: false,
      onError: "ignore",
    },
    rehypeCodeOptions: {
      langs: ["bash", "json", "python", "javascript", "typescript"],
      themes: {
        light: "light-plus",
        dark: "github-dark",
      },
    },
  },
});
