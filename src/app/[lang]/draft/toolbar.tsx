"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronsRight,
  Code,
  Columns2,
  FolderTree,
  Gauge,
  Image as ImageIcon,
  ImagePlus,
  Info,
  LayoutGrid,
  List,
  ListChecks,
  ListCollapse,
  ListOrdered,
  MousePointerClick,
  PanelTop,
  Sparkles,
  Table,
  Wrench,
} from "lucide-react";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { YouTubeLogo } from "@/components/brand-logos";
import { useMessages } from "@/lib/hooks/useMessages";
import { cn } from "@/lib/utils";
import {
  mainSnippets,
  overflowSnippets,
  type ComponentSnippet,
} from "@/lib/draft/snippets";
import { compilePreview } from "@/lib/draft/compile-preview";
import { buildPreviewComponents } from "./preview-components";
import {
  CHIP,
  EYEBROW,
  MENU_ROW,
  PANE_BAR,
  POPOVER,
  TEXT_LINK,
} from "./styles";

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
  steps: ListOrdered,
  files: FolderTree,
  requirements: ListChecks,
  toolheader: PanelTop,
  cardgrid: LayoutGrid,
  menupath: ChevronsRight,
};

// The hover card is w-80; keep it inside the toolbar's right edge.
const CARD_WIDTH = 320;

interface ToolbarProps {
  onInsert: (snippet: string) => void;
  onUploadImage: (files: File[]) => void;
  /** Builds /<lang>/docs/contributing/components#anchor links. */
  docsHref: (anchor: string) => string;
}

export function Toolbar({ onInsert, onUploadImage, docsHref }: ToolbarProps) {
  const messages = useMessages();
  const d = messages.draft;
  const [hovered, setHovered] = useState<{
    snippet: ComponentSnippet;
    left: number;
  } | null>(null);
  const [showOverflow, setShowOverflow] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const keepCard = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  // A short delay lets the pointer cross from the chip onto the card (its
  // "Full docs" link); the site's Guides menu uses the same 150ms bridge.
  const closeCard = () => {
    keepCard();
    closeTimer.current = setTimeout(() => setHovered(null), 150);
  };
  useEffect(() => keepCard, []);

  // Anchor the hover card under the chip it describes.
  const showCard = (snippet: ComponentSnippet | null, chip?: HTMLElement) => {
    const bar = barRef.current;
    if (!snippet || !chip || !bar) {
      closeCard();
      return;
    }
    keepCard();
    const left =
      chip.getBoundingClientRect().left - bar.getBoundingClientRect().left;
    setHovered({
      snippet,
      left: Math.max(12, Math.min(left, bar.clientWidth - CARD_WIDTH - 12)),
    });
  };

  // Close the More menu on Escape or a click outside the toolbar.
  useEffect(() => {
    if (!showOverflow) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowOverflow(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setShowOverflow(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [showOverflow]);

  return (
    <div
      ref={barRef}
      className={cn(
        PANE_BAR,
        "relative flex min-h-12 shrink-0 items-start gap-1.5 px-3 py-2",
      )}
    >
      {/* Below lg the chips scroll sideways in one row, so the editor
          keeps its height on phones; wider panes wrap them. The menus stay
          outside this scroller so it can't clip them. */}
      <div className="-my-1 flex min-w-0 flex-1 [scrollbar-width:none] items-center gap-1.5 overflow-x-auto py-1 lg:flex-wrap lg:overflow-visible">
        {mainSnippets.map((snippet) => (
          <Chip
            key={snippet.id}
            snippet={snippet}
            onInsert={onInsert}
            onHover={showCard}
          />
        ))}
        <button
          type="button"
          className={cn(
            CHIP,
            "shrink-0",
            showOverflow && "border-divine-primary/60 text-divine-text",
          )}
          onClick={() => {
            keepCard();
            setHovered(null);
            setShowOverflow((v) => !v);
          }}
          aria-expanded={showOverflow}
          aria-haspopup="menu"
        >
          {d.more}
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform duration-200",
              showOverflow && "rotate-180",
            )}
          />
        </button>
      </div>

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
        title={d.uploadImageBlurb}
        className={cn(CHIP, "text-divine-text shrink-0")}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImagePlus className="text-divine-primary-light light:text-divine-primary size-3.5" />
        {/* Icon only on phones, where the chip row needs the room. */}
        <span className="sr-only sm:not-sr-only">{d.uploadImage}</span>
      </button>

      {showOverflow && (
        <div
          role="menu"
          className={cn(
            POPOVER,
            "absolute top-full left-3 z-20 mt-1.5 grid w-[26rem] max-w-[calc(100%-1.5rem)] grid-cols-1 gap-0.5 p-1.5 sm:grid-cols-2",
          )}
        >
          {overflowSnippets.map((snippet) => {
            const Icon = SNIPPET_ICONS[snippet.id];
            return (
              <button
                key={snippet.id}
                type="button"
                role="menuitem"
                className={MENU_ROW}
                onClick={() => {
                  onInsert(snippet.snippet);
                  setShowOverflow(false);
                }}
              >
                {Icon && (
                  <Icon className="text-divine-primary-light light:text-divine-primary size-4 shrink-0" />
                )}
                <span className="truncate">{snippet.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {hovered && !showOverflow && (
        <SnippetCard
          snippet={hovered.snippet}
          left={hovered.left}
          d={d}
          docsHref={docsHref}
          onMouseEnter={keepCard}
          onMouseLeave={closeCard}
        />
      )}
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
  onHover: (snippet: ComponentSnippet | null, chip?: HTMLElement) => void;
}) {
  const Icon = SNIPPET_ICONS[snippet.id];
  return (
    <button
      type="button"
      className={cn(CHIP, "group shrink-0")}
      onClick={() => onInsert(snippet.snippet)}
      onMouseEnter={(e) => onHover(snippet, e.currentTarget)}
      onMouseLeave={() => onHover(null)}
      onFocus={(e) => onHover(snippet, e.currentTarget)}
      onBlur={() => onHover(null)}
    >
      {Icon && (
        <Icon className="text-divine-primary-light/80 group-hover:text-divine-primary-light light:text-divine-primary size-3.5 transition-colors" />
      )}
      {snippet.label}
    </button>
  );
}

/** Hover card: what the component is for, a live render, and the snippet. */
function SnippetCard({
  snippet,
  left,
  d,
  docsHref,
  onMouseEnter,
  onMouseLeave,
}: {
  snippet: ComponentSnippet;
  left: number;
  d: ReturnType<typeof useMessages>["draft"];
  docsHref: (anchor: string) => string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const [preview, setPreview] = useState<MDXRemoteSerializeResult | null>(null);
  const components = useMemo(() => buildPreviewComponents(), []);

  useEffect(() => {
    let cancelled = false;
    compilePreview(snippet.preview)
      .then((result) => {
        if (!cancelled && result.ok) setPreview(result.serialized);
      })
      .catch(() => {
        if (!cancelled) setPreview(null);
      });
    return () => {
      cancelled = true;
    };
  }, [snippet.preview]);

  return (
    <div
      className={cn(POPOVER, "absolute top-full z-30 mt-1.5 w-80 p-4")}
      style={{ left }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="text-divine-text font-[family-name:var(--font-hero)] text-sm font-bold">
        {snippet.label}
      </div>
      <p className="text-divine-text-muted mt-1 text-xs leading-relaxed">
        {snippet.blurb}
      </p>

      <div className={cn(EYEBROW, "mt-4")}>{d.previewHeading}</div>
      <div className="border-fd-border bg-fd-background mt-1.5 rounded-lg border p-3">
        <div className="prose max-w-none text-xs [&>:first-child]:mt-0 [&>:last-child]:mb-0">
          {preview ? (
            <MDXRemote {...preview} components={components} />
          ) : (
            <span className="text-divine-text-muted">{d.previewLoading}</span>
          )}
        </div>
      </div>

      <div className={cn(EYEBROW, "mt-4")}>{d.snippetLabel}</div>
      <pre className="border-fd-border bg-fd-background text-divine-text mt-1.5 overflow-x-auto rounded-lg border p-2.5 font-mono text-[11px] leading-relaxed">
        {snippet.snippet}
      </pre>

      <a
        href={docsHref(snippet.docsAnchor)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(TEXT_LINK, "mt-3 text-xs")}
      >
        {d.fullDocs}
        <ArrowRight className="size-3.5" />
      </a>
    </div>
  );
}
