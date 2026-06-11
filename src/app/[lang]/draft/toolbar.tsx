"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import {
  ChevronDown,
  Code,
  Columns2,
  Gauge,
  Image as ImageIcon,
  ImagePlus,
  Info,
  List,
  ListCollapse,
  MousePointerClick,
  Sparkles,
  Table,
  Wrench,
} from "lucide-react";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { YouTubeLogo } from "@/components/brand-logos";
import { useMessages } from "@/lib/hooks/useMessages";
import {
  mainSnippets,
  overflowSnippets,
  type ComponentSnippet,
} from "@/lib/draft/snippets";
import { buildPreviewComponents } from "./preview-components";

// Lucide icons plus our Simple Icons brand logos (lucide v1 dropped brands).
const SNIPPET_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  callout: Info,
  tabs: Columns2,
  accordion: ListCollapse,
  image: ImageIcon,
  code: Code,
  table: Table,
  toolcard: Wrench,
  levelpill: Gauge,
  parameterlist: List,
  premiumcard: Sparkles,
  glowcta: MousePointerClick,
  youtube: YouTubeLogo,
};

interface ToolbarProps {
  onInsert: (snippet: string) => void;
  onUploadImage: (files: File[]) => void;
  /** Builds /<lang>/docs/contributing/components#anchor links. */
  docsHref: (anchor: string) => string;
}

export function Toolbar({ onInsert, onUploadImage, docsHref }: ToolbarProps) {
  const messages = useMessages();
  const d = messages.draft;
  const [hovered, setHovered] = useState<ComponentSnippet | null>(null);
  const [showOverflow, setShowOverflow] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border-divine-primary/15 relative flex flex-wrap items-center gap-1.5 border-b bg-white/[0.02] px-3 py-2">
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
        className="text-divine-text-muted hover:text-divine-text hover:border-divine-primary/40 hover:bg-divine-primary/10 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium transition-colors"
        onClick={() => setShowOverflow((v) => !v)}
        aria-expanded={showOverflow}
      >
        {d.more}
        <ChevronDown
          className={`size-3 transition-transform ${showOverflow ? "rotate-180" : ""}`}
        />
      </button>

      <span
        aria-hidden
        className="bg-divine-border/70 mx-1 hidden h-4 w-px sm:block"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length > 0) onUploadImage(files);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        className="bg-divine-primary/15 text-divine-primary-light hover:bg-divine-primary/25 border-divine-primary/30 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <ImagePlus className="size-3.5" />
        {d.uploadImage}
      </button>

      {showOverflow && (
        <div className="bg-divine-popover border-divine-primary/25 rounded-divine-lg absolute top-full left-3 z-20 mt-1.5 flex flex-col gap-1 border p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.55)]">
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
  const Icon = SNIPPET_ICONS[snippet.id];
  return (
    <button
      type="button"
      className="text-divine-text-muted hover:text-divine-text hover:border-divine-primary/40 hover:bg-divine-primary/10 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium transition-colors"
      onClick={() => onInsert(snippet.snippet)}
      onMouseEnter={() => onHover(snippet)}
      onMouseLeave={() => onHover(null)}
    >
      {Icon && <Icon className="text-divine-primary-light/80 size-3.5" />}
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
  const components = useMemo(() => buildPreviewComponents(), []);

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
    <div className="bg-divine-popover border-divine-primary/35 rounded-divine-xl absolute top-full left-3 z-30 mt-1.5 w-80 border p-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.6),0_0_40px_-12px_rgba(120,60,181,0.45)]">
      <div className="text-divine-text text-sm font-bold">{snippet.label}</div>
      <p className="text-divine-text-muted mt-1 text-xs leading-relaxed">
        {snippet.blurb}
      </p>

      <div className="text-divine-primary-light mt-3 text-[10px] font-semibold tracking-[0.1em] uppercase">
        {d.previewHeading}
      </div>
      <div className="prose prose-invert mt-1 max-w-none text-xs">
        {preview ? (
          <MDXRemote {...preview} components={components} />
        ) : (
          <span className="text-divine-text-muted">{d.previewLoading}</span>
        )}
      </div>

      <div className="text-divine-primary-light mt-3 text-[10px] font-semibold tracking-[0.1em] uppercase">
        {d.snippetLabel}
      </div>
      <pre className="bg-divine-void border-divine-border/60 rounded-divine-md mt-1 overflow-x-auto border p-2 font-mono text-[10px] leading-relaxed">
        {snippet.snippet}
      </pre>

      <a
        href={docsHref(snippet.docsAnchor)}
        className="text-divine-primary-light hover:text-divine-text mt-2.5 inline-block text-xs font-medium transition-colors"
      >
        {d.fullDocs} →
      </a>
    </div>
  );
}
