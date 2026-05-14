"use client";

import { useEffect, useMemo, useState } from "react";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { useMessages } from "@/lib/hooks/useMessages";
import { getMDXComponents } from "@/mdx-components";
import {
  mainSnippets,
  overflowSnippets,
  type ComponentSnippet,
} from "@/lib/draft/snippets";

interface ToolbarProps {
  onInsert: (snippet: string) => void;
  /** Builds /<lang>/docs/contributing/components#anchor links. */
  docsHref: (anchor: string) => string;
}

export function Toolbar({ onInsert, docsHref }: ToolbarProps) {
  const messages = useMessages();
  const d = messages.draft;
  const [hovered, setHovered] = useState<ComponentSnippet | null>(null);
  const [showOverflow, setShowOverflow] = useState(false);

  return (
    <div className="border-divine-border relative flex flex-wrap items-center gap-1.5 border-b px-3 py-2">
      {mainSnippets.map((snippet) => (
        <Chip
          key={snippet.id}
          snippet={snippet}
          onInsert={onInsert}
          onHover={setHovered}
        />
      ))}
      <button
        type="button"
        className="text-divine-text-muted bg-divine-surface border-divine-border rounded-md border px-2.5 py-1 text-xs"
        onClick={() => setShowOverflow((v) => !v)}
      >
        {d.components} ▾
      </button>
      {showOverflow && (
        <div className="bg-divine-surface border-divine-border absolute top-full left-3 z-20 mt-1 flex flex-col gap-1 rounded-md border p-2">
          {overflowSnippets.map((snippet) => (
            <Chip
              key={snippet.id}
              snippet={snippet}
              onInsert={(s) => {
                onInsert(s);
                setShowOverflow(false);
              }}
              onHover={setHovered}
            />
          ))}
        </div>
      )}

      {hovered && <Tooltip snippet={hovered} d={d} docsHref={docsHref} />}
    </div>
  );
}

function Chip({
  snippet,
  onInsert,
  onHover,
}: {
  snippet: ComponentSnippet;
  onInsert: (snippet: string) => void;
  onHover: (snippet: ComponentSnippet | null) => void;
}) {
  return (
    <button
      type="button"
      className="bg-divine-primary/15 text-divine-primary-light hover:bg-divine-primary/25 rounded-md px-2.5 py-1 text-xs font-semibold"
      onClick={() => onInsert(snippet.snippet)}
      onMouseEnter={() => onHover(snippet)}
      onMouseLeave={() => onHover(null)}
    >
      {snippet.label}
    </button>
  );
}

function Tooltip({
  snippet,
  d,
  docsHref,
}: {
  snippet: ComponentSnippet;
  d: ReturnType<typeof useMessages>["draft"];
  docsHref: (anchor: string) => string;
}) {
  const [preview, setPreview] = useState<MDXRemoteSerializeResult | null>(null);
  const components = useMemo(() => getMDXComponents(), []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mdx: snippet.preview }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.ok) setPreview(data.serialized);
      })
      .catch(() => {
        if (!cancelled) setPreview(null);
      });
    return () => {
      cancelled = true;
    };
  }, [snippet.preview]);

  return (
    <div className="bg-divine-surface border-divine-primary absolute top-full left-3 z-30 mt-1 w-80 rounded-lg border p-3 shadow-xl">
      <div className="text-divine-text text-sm font-bold">{snippet.label}</div>
      <p className="text-divine-text-muted mt-1 text-xs">{snippet.blurb}</p>

      <div className="text-divine-primary-light mt-2 text-[10px] tracking-wider uppercase">
        {d.previewHeading}
      </div>
      <div className="prose prose-invert mt-1 max-w-none text-xs">
        {preview ? (
          <MDXRemote {...preview} components={components} />
        ) : (
          <span className="text-divine-text-muted">{d.previewLoading}</span>
        )}
      </div>

      <div className="text-divine-primary-light mt-2 text-[10px] tracking-wider uppercase">
        {d.snippetLabel}
      </div>
      <pre className="bg-divine-void mt-1 overflow-x-auto rounded p-2 text-[10px]">
        {snippet.snippet}
      </pre>

      <a
        href={docsHref(snippet.docsAnchor)}
        className="text-divine-primary-light mt-2 inline-block text-xs"
      >
        {d.fullDocs} →
      </a>
    </div>
  );
}
