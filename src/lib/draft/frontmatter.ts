export interface DraftFields {
  title: string;
  description: string;
  category: string;
  slug: string;
  body: string;
}

/**
 * Build the full .mdx file text from the editor fields.
 * Only `title` and `description` go into frontmatter — `category` is implied
 * by the file path, and the schema in source.config.ts rejects unknown keys.
 */
export function assembleMdx(
  fields: Pick<DraftFields, "title" | "description" | "body">,
): string {
  const lines: string[] = ["---", `title: ${yamlScalar(fields.title)}`];
  if (fields.description.trim()) {
    lines.push(`description: ${yamlScalar(fields.description)}`);
  }
  lines.push("---", "");
  return lines.join("\n") + "\n" + fields.body.replace(/^\s+/, "") + "\n";
}

/** Quote a YAML scalar only when it could otherwise misparse. */
function yamlScalar(value: string): string {
  const trimmed = value.trim();
  if (/^[A-Za-z0-9][A-Za-z0-9 .,'!?()/-]*$/.test(trimmed)) return trimmed;
  return JSON.stringify(trimmed);
}
