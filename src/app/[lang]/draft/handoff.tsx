"use client";

import { useEffect, useRef, useState } from "react";
import { useMessages } from "@/lib/hooks/useMessages";
import {
  newFileUrl,
  editFileUrl,
  metaJsonUrl,
  uploadImagesUrl,
} from "@/lib/draft/github";

interface HandoffProps {
  mode: "new" | "edit";
  /** Fully assembled .mdx text. */
  mdx: string;
  category: string;
  slug: string;
  /** For edit mode: the slug path, e.g. "tools/flint". */
  editPath: string | null;
  onClose: () => void;
}

type DraftMessages = ReturnType<typeof useMessages>["draft"];

export function Handoff({
  mode,
  mdx,
  category,
  slug,
  editPath,
  onClose,
}: HandoffProps) {
  const messages = useMessages();
  const d = messages.draft;
  const [copied, setCopied] = useState(false);

  const copyMdx = async () => {
    try {
      await navigator.clipboard.writeText(mdx);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can reject (non-HTTPS context, denied permission).
      // Non-fatal — the MDX stays visible in the panel for manual selection.
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const metaSnippet = `"pages": [ …, "${slug}" ]`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="bg-divine-surface border-divine-border max-h-[85vh] w-full max-w-lg overflow-auto rounded-xl border p-5"
        role="dialog"
        aria-modal="true"
        aria-label={d.contribute}
        onClick={(e) => e.stopPropagation()}
      >
        {mode === "new" ? (
          <NewGuideHandoff
            d={d}
            mdx={mdx}
            category={category}
            slug={slug}
            metaSnippet={metaSnippet}
            copied={copied}
            onCopyMdx={copyMdx}
          />
        ) : (
          <EditHandoff
            d={d}
            editPath={editPath ?? ""}
            copied={copied}
            onCopyMdx={copyMdx}
          />
        )}

        <ImagesReminder d={d} />

        <button
          type="button"
          className="text-divine-text-muted mt-4 text-sm"
          onClick={onClose}
        >
          {d.close}
        </button>
      </div>
    </div>
  );
}

function NewGuideHandoff({
  d,
  mdx,
  category,
  slug,
  metaSnippet,
  copied,
  onCopyMdx,
}: {
  d: DraftMessages;
  mdx: string;
  category: string;
  slug: string;
  metaSnippet: string;
  copied: boolean;
  onCopyMdx: () => void;
}) {
  const handoff = newFileUrl(category, slug, mdx);

  // Open the GitHub tab once, when this screen mounts, if the URL is prefilled.
  // The ref guard makes this survive React Strict Mode's double-invoked
  // effects in dev — without it, two identical tabs open.
  const openedRef = useRef(false);
  useEffect(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    if (handoff.prefilled) window.open(handoff.url, "_blank", "noopener");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {handoff.prefilled ? (
        <div className="mb-3">
          <h3 className="text-divine-success font-semibold">
            {d.handoffNewHeading}
          </h3>
          <p className="text-divine-text-muted mt-1 text-sm">
            {d.handoffNewBody}
          </p>
        </div>
      ) : (
        <div className="mb-3">
          <h3 className="text-divine-text font-semibold">
            {d.handoffFallbackHeading}
          </h3>
          <p className="text-divine-text-muted mt-1 text-sm">
            {d.handoffFallbackBody}
          </p>
          <button
            type="button"
            className="bg-divine-primary mt-2 rounded-md px-3 py-1.5 text-sm text-white"
            onClick={onCopyMdx}
          >
            {copied ? d.copied : d.copyMdx}
          </button>{" "}
          <a
            href={handoff.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-divine-primary-light text-sm"
          >
            {d.openGuideOnGithub} →
          </a>
        </div>
      )}

      <div className="border-divine-primary bg-divine-void mt-3 rounded-lg border p-3">
        <h4 className="text-divine-primary-light font-semibold">
          {d.metaHeading}
        </h4>
        <p className="text-divine-text-muted mt-1 text-sm">{d.metaBody}</p>
        <pre className="bg-divine-surface mt-2 rounded p-2 text-xs">
          {metaSnippet}
        </pre>
        <a
          href={metaJsonUrl(category)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-divine-primary-light mt-2 inline-block text-sm"
        >
          {d.openMetaOnGithub} →
        </a>
      </div>
    </>
  );
}

function EditHandoff({
  d,
  editPath,
  copied,
  onCopyMdx,
}: {
  d: DraftMessages;
  editPath: string;
  copied: boolean;
  onCopyMdx: () => void;
}) {
  return (
    <div className="mb-3">
      <h3 className="text-divine-text font-semibold">{d.handoffEditHeading}</h3>
      <p className="text-divine-text-muted mt-1 text-sm">{d.handoffEditBody}</p>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          className="bg-divine-primary rounded-md px-3 py-1.5 text-sm text-white"
          onClick={onCopyMdx}
        >
          {copied ? d.copied : d.copyMdx}
        </button>
        <a
          href={editFileUrl(editPath)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-divine-primary-light text-sm"
        >
          {d.openGuideOnGithub} →
        </a>
      </div>
    </div>
  );
}

function ImagesReminder({ d }: { d: DraftMessages }) {
  return (
    <div className="border-divine-border mt-3 rounded-lg border p-3">
      <h4 className="text-divine-text text-sm font-semibold">
        {d.imagesHeading}
      </h4>
      <p className="text-divine-text-muted mt-1 text-sm">{d.imagesBody}</p>
      <a
        href={uploadImagesUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="text-divine-primary-light mt-1 inline-block text-sm"
      >
        {d.uploadOnGithub} →
      </a>
    </div>
  );
}
