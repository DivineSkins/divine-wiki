"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { useMessages } from "@/lib/hooks/useMessages";
import { type StagedImages } from "@/lib/draft/staged-images";
import { buildPreviewComponents } from "./preview-components";

export type PreviewStatus = "loading" | "ok" | "error" | "unavailable";

interface PreviewPaneProps {
  /** The fully assembled .mdx text (frontmatter + body). */
  mdx: string;
  stagedImages?: StagedImages;
  /** Rendered as the page header above the body, like the published page. */
  title?: string;
  description?: string;
  /** Lets the parent surface a live/error indicator in the pane header. */
  onStatusChange?: (status: PreviewStatus) => void;
}

const DEBOUNCE_MS = 400;

export function PreviewPane({
  mdx,
  stagedImages,
  title,
  description,
  onStatusChange,
}: PreviewPaneProps) {
  const messages = useMessages();
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
    const controller = new AbortController();
    // Status updates also notify the parent (live/error dot in the pane
    // header). `onStatusChange` is in the deps; the parent memoizes it.
    const apply = (next: PreviewStatus) => {
      setStatus(next);
      onStatusChange?.(next);
    };
    timer.current = setTimeout(async () => {
      apply("loading");
      try {
        const res = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mdx }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (data.ok) {
          setSerialized(data.serialized);
          setError(null);
          apply("ok");
        } else {
          setError({
            message: data.error ?? "MDX failed to compile",
            line: data.line ?? null,
          });
          apply("error");
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        apply("unavailable");
      }
    }, DEBOUNCE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      controller.abort();
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
    </div>
  );
}
