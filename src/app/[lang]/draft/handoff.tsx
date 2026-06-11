"use client";

import { useEffect, useState } from "react";
import {
  Check,
  CircleCheck,
  Copy,
  ExternalLink,
  ImagePlus,
  Link2,
  X,
} from "lucide-react";
import { GitHubLogo } from "@/components/brand-logos";
import { useMessages } from "@/lib/hooks/useMessages";
import { newFileUrl, editFileUrl, uploadImagesUrl } from "@/lib/draft/github";
import { type StagedImages } from "@/lib/draft/staged-images";
import type { LinkSuggestion } from "@/lib/draft/scan-links";

interface HandoffProps {
  /** "links" = pre-flight link suggestions; "main" = the GitHub handoff. */
  step: "links" | "main";
  /** true when the parent already opened the prefilled GitHub tab. */
  tabOpened: boolean;
  suggestions: LinkSuggestion[];
  onApplySuggestion: (suggestion: LinkSuggestion) => void;
  /** Continue from the link-check step to the GitHub handoff. */
  onContinue: () => void;
  mode: "new" | "edit";
  /** Fully assembled .mdx text. */
  mdx: string;
  category: string;
  slug: string;
  /** For edit mode: the slug path, e.g. "lol/tools/flint". */
  editPath: string | null;
  stagedImages?: StagedImages;
  onClose: () => void;
}

type DraftMessages = ReturnType<typeof useMessages>["draft"];

export function Handoff({
  step,
  tabOpened,
  suggestions,
  onApplySuggestion,
  onContinue,
  mode,
  mdx,
  category,
  slug,
  editPath,
  stagedImages,
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{
        background:
          "radial-gradient(120% 80% at 50% 30%, rgba(120, 60, 181, 0.12), rgba(11, 10, 15, 0.85) 55%)",
      }}
      onClick={onClose}
    >
      <div
        className="bg-divine-surface border-divine-primary/35 rounded-divine-xl relative max-h-[85vh] w-full max-w-lg overflow-auto border p-6 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.6),0_0_60px_-10px_rgba(120,60,181,0.35)]"
        role="dialog"
        aria-modal="true"
        aria-label={d.contribute}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label={d.close}
          className="text-divine-text-muted hover:text-divine-text absolute top-4 right-4 rounded-full p-1 transition-colors"
          onClick={onClose}
        >
          <X className="size-4" />
        </button>

        {step === "links" ? (
          <LinkCheck
            d={d}
            suggestions={suggestions}
            onApplySuggestion={onApplySuggestion}
            onContinue={onContinue}
          />
        ) : (
          <>
            {mode === "new" ? (
              <NewGuideHandoff
                d={d}
                mdx={mdx}
                category={category}
                slug={slug}
                tabOpened={tabOpened}
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
            <ImagesReminder d={d} stagedImages={stagedImages} />
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Pre-flight step: bare mentions of other guides found in the draft. Each
 * click links one; applying the last one continues to GitHub automatically
 * (the parent handles that).
 */
function LinkCheck({
  d,
  suggestions,
  onApplySuggestion,
  onContinue,
}: {
  d: DraftMessages;
  suggestions: LinkSuggestion[];
  onApplySuggestion: (suggestion: LinkSuggestion) => void;
  onContinue: () => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <Link2 className="text-divine-primary-light mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <h3 className="text-divine-text font-semibold">{d.linkCheckHeading}</h3>
        <p className="text-divine-text-muted mt-1 text-sm leading-relaxed">
          {d.linkCheckBody}
        </p>
        <div className="mt-3 flex flex-col items-start gap-2">
          {suggestions.map((suggestion, i) => (
            <button
              key={`${suggestion.entity.slug}-${i}`}
              type="button"
              className="text-divine-text-muted hover:border-divine-primary/40 hover:bg-divine-primary/10 hover:text-divine-text inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs transition-colors"
              onClick={() => onApplySuggestion(suggestion)}
            >
              <Link2 className="text-divine-primary-light size-3 shrink-0" />
              <span className="truncate">
                &ldquo;{suggestion.match}&rdquo; → {suggestion.entity.url}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-gradient-to-r from-[#B472FF] to-[#783CB5] px-5 text-sm font-semibold text-white shadow-[0_0_54px_-7px_#783CB5] transition-shadow hover:shadow-[0_0_5px_#783CB5,0_0_25px_#783CB5,0_0_25px_#783CB5,0_0_100px_#783CB5]"
          onClick={onContinue}
        >
          {d.continueToGithub}
          <ExternalLink className="size-4" />
        </button>
      </div>
    </div>
  );
}

function CopyButton({
  copied,
  onCopy,
  d,
}: {
  copied: boolean;
  onCopy: () => void;
  d: DraftMessages;
}) {
  return (
    <button
      type="button"
      className="bg-divine-primary hover:bg-divine-primary/85 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-white transition-colors"
      onClick={onCopy}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? d.copied : d.copyMdx}
    </button>
  );
}

function GithubLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-divine-primary-light hover:text-divine-text inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
    >
      {label}
      <ExternalLink className="size-3.5" />
    </a>
  );
}

function NewGuideHandoff({
  d,
  mdx,
  category,
  slug,
  tabOpened,
  copied,
  onCopyMdx,
}: {
  d: DraftMessages;
  mdx: string;
  category: string;
  slug: string;
  tabOpened: boolean;
  copied: boolean;
  onCopyMdx: () => void;
}) {
  if (tabOpened) {
    return (
      <div className="flex items-start gap-3">
        <CircleCheck className="text-divine-success mt-0.5 size-5 shrink-0" />
        <div>
          <h3 className="text-divine-text font-semibold">
            {d.handoffNewHeading}
          </h3>
          <p className="text-divine-text-muted mt-1 text-sm leading-relaxed">
            {d.handoffNewBody}
          </p>
        </div>
      </div>
    );
  }

  // Fallback: the draft is too long for a prefilled GitHub URL. The blank-file
  // link still carries the filename; the writer pastes the copied MDX there.
  const handoff = newFileUrl(category, slug, mdx);
  return (
    <div className="flex items-start gap-3">
      <GitHubLogo className="text-divine-text mt-0.5 size-5 shrink-0" />
      <div>
        <h3 className="text-divine-text font-semibold">
          {d.handoffFallbackHeading}
        </h3>
        <p className="text-divine-text-muted mt-1 text-sm leading-relaxed">
          {d.handoffFallbackBody}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <CopyButton copied={copied} onCopy={onCopyMdx} d={d} />
          <GithubLink href={handoff.url} label={d.openGuideOnGithub} />
        </div>
      </div>
    </div>
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
    <div className="flex items-start gap-3">
      <GitHubLogo className="text-divine-text mt-0.5 size-5 shrink-0" />
      <div>
        <h3 className="text-divine-text font-semibold">
          {d.handoffEditHeading}
        </h3>
        <p className="text-divine-text-muted mt-1 text-sm leading-relaxed">
          {d.handoffEditBody}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <CopyButton copied={copied} onCopy={onCopyMdx} d={d} />
          <GithubLink
            href={editFileUrl(editPath)}
            label={d.openGuideOnGithub}
          />
        </div>
      </div>
    </div>
  );
}

/** Rendered only when the draft references staged (not yet uploaded) images. */
function ImagesReminder({
  d,
  stagedImages,
}: {
  d: DraftMessages;
  stagedImages?: StagedImages;
}) {
  const filenames = stagedImages ? Array.from(stagedImages.keys()).sort() : [];
  if (filenames.length === 0) return null;

  return (
    <div className="border-divine-secondary/30 bg-divine-secondary/[0.06] rounded-divine-lg mt-4 border p-4">
      <h4 className="text-divine-secondary flex items-center gap-2 text-sm font-semibold">
        <ImagePlus className="size-4" />
        {d.imagesHeading}
      </h4>
      <p className="text-divine-text-muted mt-1 text-sm leading-relaxed">
        {d.imagesBody}
      </p>
      <ul className="text-divine-text mt-2 list-inside list-disc font-mono text-sm">
        {filenames.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <p className="text-divine-text-muted mt-2 text-sm leading-relaxed">
        {d.imagesOutcome}
      </p>
      <div className="mt-2.5">
        <GithubLink href={uploadImagesUrl()} label={d.uploadOnGithub} />
      </div>
    </div>
  );
}
