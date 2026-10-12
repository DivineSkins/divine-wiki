import {
  CodeBlock as BaseCodeBlock,
  Pre,
} from "fumadocs-ui/components/codeblock";
import { isValidElement, type ComponentProps, type ReactNode } from "react";

/**
 * Code block with a header row on every block: the language label (or the
 * fence's own `title="..."`), fumadocs' language icon, and the copy
 * button, above the code. The language comes from the `language-*` class
 * shiki adds to <code> (`addLanguageClass` in source.config.ts).
 */

const LABELS: Record<string, string> = {
  bash: "Terminal",
  sh: "Terminal",
  shell: "Terminal",
  zsh: "Terminal",
  powershell: "PowerShell",
  ps1: "PowerShell",
  json: "JSON",
  mdx: "MDX",
  md: "Markdown",
  markdown: "Markdown",
  js: "JavaScript",
  javascript: "JavaScript",
  jsx: "JSX",
  ts: "TypeScript",
  typescript: "TypeScript",
  tsx: "TSX",
  py: "Python",
  python: "Python",
  css: "CSS",
  html: "HTML",
  yaml: "YAML",
  yml: "YAML",
  cpp: "C++",
  "c++": "C++",
  c: "C",
  cs: "C#",
  csharp: "C#",
  lua: "Lua",
  ini: "INI",
  toml: "TOML",
  xml: "XML",
};

function languageOf(children: ReactNode): string | undefined {
  if (!isValidElement<{ className?: string }>(children)) return undefined;
  const match = children.props.className?.match(/language-([\w-]+)/);
  return match?.[1];
}

function labelOf(lang?: string): string {
  if (!lang || lang === "plaintext" || lang === "text" || lang === "txt") {
    return "Code";
  }
  return LABELS[lang] ?? lang.toUpperCase();
}

export function CodeBlock({
  title,
  children,
  ...props
}: ComponentProps<typeof BaseCodeBlock>) {
  const lang = languageOf(children);
  return (
    <BaseCodeBlock {...props} title={title ?? labelOf(lang)} data-lang={lang}>
      <Pre>{children}</Pre>
    </BaseCodeBlock>
  );
}
