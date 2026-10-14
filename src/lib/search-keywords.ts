import type { StructuredData } from "fumadocs-core/mdx-plugins/remark-structure";

/** Index guide aliases without changing its visible description or article. */
export function withSearchKeywords(
  data: StructuredData,
  keywords: string[] = [],
  tags: string[] = [],
): StructuredData {
  const aliases = [
    ...new Set([...keywords, ...tags].map((word) => word.trim())),
  ]
    .filter(Boolean)
    .join(", ");
  if (!aliases) return data;
  return {
    ...data,
    contents: [...data.contents, { heading: undefined, content: aliases }],
  };
}
