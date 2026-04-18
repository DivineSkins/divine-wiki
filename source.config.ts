import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from "fumadocs-mdx/config";
import { z } from "zod";

const extendedSchema = frontmatterSchema.extend({
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
    schema: extendedSchema,
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
    rehypeCodeOptions: {
      langs: ["bash", "json", "python", "javascript", "typescript"],
      themes: {
        light: "light-plus",
        dark: "github-dark",
      },
    },
  },
});
