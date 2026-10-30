"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { useMessages } from "@/lib/hooks/useMessages";
import {
  GuideCredits,
  writersFromFrontmatter,
} from "@/components/guide-credits";
import { type StagedImages } from "@/lib/draft/staged-images";
import { compilePreview } from "@/lib/draft/compile-preview";
import { buildPreviewComponents } from "./preview-components";

export type PreviewStatus = "loading" | "ok" | "error" | "unavailable";

interface PreviewPaneProps {
  /** The fully assembled .mdx text (frontmatter + body). */
  mdx: string;
  stagedImages?: StagedImages;
  /** Rendered as the page header above the body, like the published page. */
  title?: string;
  description?: string;
  /** Rendered as the credit line below the body, like the published page. */
  credits?: { discord?: string; github?: string };
  /** Lets the parent surface a live/error indicator in the pane header. */
  onStatusChange?: (status: PreviewStatus) => void;
}

const DEBOUNCE_MS = 400;

export function PreviewPane({
  mdx,
  stagedImages,
  title,
  description,
  credits,
  onStatusChange,
}: PreviewPaneProps) {
  const messages = useMessages();
  const lang = useParams()?.lang?.toString() ?? "en";
  const d = messages.draft;
  // The last successful render stays mounted while the next compile is in
  // flight — no "Rendering preview…" flash on every keystroke.
  const [serialized, setSerialized] = useState<MDXRemoteSerializeResult | null>(
    null,
  );
  const [error, setError] = useState<{
    message: string;
    line: number | null;
  } | null>(null);
  const [status, setStatus] = useState<PreviewStatus>("loading");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const components = useMemo(
    () => buildPreviewComponents(stagedImages),
    [stagedImages],
  );

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    let cancelled = false;
    // Status updates also notify the parent (live/error dot in the pane
    // header). `onStatusChange` is in the deps; the parent memoizes it.
    const apply = (next: PreviewStatus) => {
      if (cancelled) return;
      setStatus(next);
      onStatusChange?.(next);
    };
    timer.current = setTimeout(async () => {
      apply("loading");
      try {
        const result = await compilePreview(mdx);
        if (cancelled) return;
        if (result.ok) {
          setSerialized(result.serialized);
          setError(null);
          apply("ok");
        } else {
          setError({ message: result.error, line: result.line });
          apply("error");
        }
      } catch {
        // The compiler chunk failed to load (e.g. went offline before the
        // first compile). Compile errors never reach here — they're values.
        apply("unavailable");
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [mdx, onStatusChange]);

  return (
    <div>
      {status === "unavailable" && (
        <p className="text-divine-text-muted mb-4 text-sm">
          {d.previewUnavailable}
        </p>
      )}

      {error && (
        <div className="bg-divine-error/10 border-divine-error/40 rounded-divine-lg mb-4 border p-3">
          <p className="text-divine-error text-sm font-semibold">
            {d.previewError}
          </p>
          <p className="text-divine-text-muted mt-1 font-mono text-xs">
            {error.line ? `Line ${error.line}: ` : ""}
            {error.message}
          </p>
        </div>
      )}

      {/* Page header — same treatment as the published docs page. */}
      {(title || description) && (
        <header className="border-divine-border/60 mb-6 border-b pb-5">
          {title && <h1 className="divine-doc-title">{title}</h1>}
          {description && (
            <p className="divine-doc-description">{description}</p>
          )}
        </header>
      )}

      {serialized === null && !error ? (
        <p className="text-divine-text-muted text-sm">{d.previewLoading}</p>
      ) : (
        serialized && (
          <div
            className={`prose prose-invert max-w-none transition-opacity ${
              error ? "opacity-40" : "opacity-100"
            }`}
          >
            <MDXRemote {...serialized} components={components} />
          </div>
        )
      )}

      {/* Credits row, as on the published page. A draft has no history
          yet, so it shows only the writer the frontmatter names. */}
      <GuideCredits
        writers={writersFromFrontmatter(credits)}
        lang={lang}
        labels={{ ...messages.credits, lastUpdated: messages.misc.lastUpdated }}
        className="mt-8"
      />
    </div>
  );
}
