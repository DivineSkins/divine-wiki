"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { useMessages } from "@/lib/hooks/useMessages";
import { getMDXComponents } from "@/mdx-components";
import { resolveStagedSrc, type StagedImages } from "@/lib/draft/staged-images";

interface PreviewPaneProps {
  /** The fully assembled .mdx text (frontmatter + body). */
  mdx: string;
  stagedImages?: StagedImages;
}

type PreviewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; serialized: MDXRemoteSerializeResult }
  | { status: "error"; message: string; line: number | null }
  | { status: "unavailable" };

const DEBOUNCE_MS = 400;

export function PreviewPane({ mdx, stagedImages }: PreviewPaneProps) {
  const messages = useMessages();
  const d = messages.draft;
  const [state, setState] = useState<PreviewState>({ status: "idle" });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const components = useMemo(() => {
    const base = getMDXComponents();
    if (!stagedImages || stagedImages.size === 0) return base;
    const OriginalImg = base.img;
    return {
      ...base,
      img: (
        props: { src?: unknown; alt?: string } & Record<string, unknown>,
      ) => {
        const blobUrl =
          typeof props.src === "string"
            ? resolveStagedSrc(props.src, stagedImages)
            : null;
        if (blobUrl && OriginalImg) {
          const Img = OriginalImg as any;
          return <Img {...props} src={blobUrl} />;
        }
        if (blobUrl) {
          // Fallback — no base img override, render a plain <img>.
          // eslint-disable-next-line @next/next/no-img-element
          return (
            <img
              {...(props as Record<string, unknown>)}
              src={blobUrl}
              alt={props.alt ?? ""}
            />
          );
        }
        if (OriginalImg) {
          const Img = OriginalImg as any;
          return <Img {...props} />;
        }
        // eslint-disable-next-line @next/next/no-img-element
        return (
          <img {...(props as Record<string, unknown>)} alt={props.alt ?? ""} />
        );
      },
    };
  }, [stagedImages]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const controller = new AbortController();
    timer.current = setTimeout(async () => {
      setState({ status: "loading" });
      try {
        const res = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mdx }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (data.ok) {
          setState({ status: "ok", serialized: data.serialized });
        } else {
          setState({
            status: "error",
            message: data.error ?? "MDX failed to compile",
            line: data.line ?? null,
          });
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({ status: "unavailable" });
      }
    }, DEBOUNCE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      controller.abort();
    };
  }, [mdx]);

  if (state.status === "idle" || state.status === "loading") {
    return <p className="text-divine-text-muted text-sm">{d.previewLoading}</p>;
  }

  if (state.status === "unavailable") {
    return (
      <p className="text-divine-text-muted text-sm">{d.previewUnavailable}</p>
    );
  }

  if (state.status === "error") {
    return (
      <div className="bg-divine-surface ring-divine-border rounded-md p-3 ring-1">
        <p className="text-divine-error text-sm font-semibold">
          {d.previewError}
        </p>
        <p className="text-divine-text-muted mt-1 font-mono text-xs">
          {state.line ? `Line ${state.line}: ` : ""}
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <div className="prose prose-invert max-w-none">
      <MDXRemote {...state.serialized} components={components} />
    </div>
  );
}
