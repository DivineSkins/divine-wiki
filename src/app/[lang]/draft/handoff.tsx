"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, ImagePlus, Link2, X } from "lucide-react";
import { GitHubLogo } from "@/components/brand-logos";
import { useMessages } from "@/lib/hooks/useMessages";
import {
  newFileUrl,
  editFileUrl,
  uploadImagesUrl,
  forkUrl,
  comparePrUrl,
  isValidGithubUsername,
} from "@/lib/draft/github";
import { loadGithubUser, saveGithubUser } from "@/lib/draft/persistence";
import { type StagedImages } from "@/lib/draft/staged-images";
import type { LinkSuggestion } from "@/lib/draft/scan-links";

interface HandoffProps {
  /** "links" = pre-flight link suggestions; "main" = the GitHub handoff. */
  step: "links" | "main";
  suggestions: LinkSuggestion[];
  onApplySuggestion: (suggestion: LinkSuggestion) => void;
  /** Continue from the link-check step to the GitHub handoff. */
  onContinue: () => void;
  mode: "new" | "edit";
  /** Fully assembled .mdx text. */
  mdx: string;
  /** Docs segment the guide goes in, e.g. "lol". */
  game: string;
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
  suggestions,
  onApplySuggestion,
  onContinue,
  mode,
  mdx,
  game,
  category,
  slug,
  editPath,
  stagedImages,
  onClose,
}: HandoffProps) {
  const messages = useMessages();
  const d = messages.draft;
  const [copied, setCopied] = useState(false);
  // The contributor's GitHub username — every "create" / "upload" link
  // targets their fork, where the prefill URL actually works. Remembered
  // across drafts.
  const [username, setUsername] = useState(loadGithubUser);
  const trimmedUser = username.trim().replace(/^@/, "");
  const owner = isValidGithubUsername(trimmedUser) ? trimmedUser : undefined;

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    const candidate = value.trim().replace(/^@/, "");
    if (candidate === "" || isValidGithubUsername(candidate)) {
      saveGithubUser(candidate);
    }
  };

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
        className="bg-divine-surface border-divine-primary/35 rounded-divine-xl relative max-h-[90vh] w-full max-w-3xl overflow-auto border p-6 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.6),0_0_60px_-10px_rgba(120,60,181,0.35)] sm:p-8"
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
                game={game}
                category={category}
                slug={slug}
                username={username}
                owner={owner}
                onUsernameChange={handleUsernameChange}
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
            <ImagesReminder d={d} stagedImages={stagedImages} owner={owner} />
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

/**
 * Fork-first walkthrough. GitHub's `/new` page only works for people with
 * push access — everyone else gets a fork interstitial that loses the
 * prefilled content (and its fork button is flaky). So contributors give
 * their username once, fork the wiki, and every link targets their fork.
 */
function NewGuideHandoff({
  d,
  mdx,
  game,
  category,
  slug,
  username,
  owner,
  onUsernameChange,
  copied,
  onCopyMdx,
}: {
  d: DraftMessages;
  mdx: string;
  game: string;
  category: string;
  slug: string;
  username: string;
  /** Validated username, or undefined while the input is empty/invalid. */
  owner: string | undefined;
  onUsernameChange: (value: string) => void;
  copied: boolean;
  onCopyMdx: () => void;
}) {
  const handoff = newFileUrl(game, category, slug, mdx, owner);
  const maintainerUrl = newFileUrl(game, category, slug, mdx).url;

  return (
    <div className="flex items-start gap-3">
      <GitHubLogo className="text-divine-text mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <h3 className="text-divine-text font-semibold">{d.handoffHeading}</h3>
        <p className="text-divine-text-muted mt-1 text-sm leading-relaxed">
          {d.handoffIntro}
        </p>

        <label className="mt-4 block">
          <span className="text-divine-text text-sm font-medium">
            {d.githubUsernameLabel}
          </span>
          <input
            className="text-divine-text placeholder:text-divine-text-muted/40 focus:border-divine-primary/50 mt-1.5 w-full rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-sm transition-colors outline-none"
            placeholder={d.githubUsernamePlaceholder}
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
        </label>

        <ol className="mt-4 flex flex-col gap-4">
          <HandoffStep n={1} heading={d.stepForkHeading} body={d.stepForkBody}>
            <GlowLink href={forkUrl()} label={d.forkOnGithub} />
          </HandoffStep>

          <HandoffStep
            n={2}
            heading={d.stepCreateHeading}
            body={handoff.prefilled ? d.stepCreateBody : d.stepCreateBodyLong}
          >
            {!handoff.prefilled && (
              <CopyButton copied={copied} onCopy={onCopyMdx} d={d} />
            )}
            {owner ? (
              // The step that actually carries the guide — styled as the
              // primary action so it doesn't read as optional next to step 1.
              <GlowLink href={handoff.url} label={d.createOnGithub} />
            ) : (
              <span className="text-divine-text-muted text-xs italic">
                {d.usernameNeeded}
              </span>
            )}
          </HandoffStep>

          <HandoffStep n={3} heading={d.stepPrHeading} body={d.stepPrBody}>
            {owner && (
              <GlowLink href={comparePrUrl(owner)} label={d.openPrOnGithub} />
            )}
          </HandoffStep>
        </ol>

        <p className="text-divine-text-muted mt-5 border-t border-white/[0.06] pt-3 text-xs">
          {d.maintainerPath}{" "}
          <a
            href={maintainerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-divine-primary-light hover:text-divine-text font-medium transition-colors"
          >
            {d.maintainerLink}
          </a>
        </p>
      </div>
    </div>
  );
}

/** Primary-action external link: brand gradient, no glow halo. */
function GlowLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#B472FF] to-[#783CB5] px-4 py-1.5 text-sm font-semibold text-white shadow-md shadow-[#783CB5]/25 transition-[filter] duration-200 hover:brightness-110"
    >
      {label}
      <ExternalLink className="size-4" />
    </a>
  );
}

function HandoffStep({
  n,
  heading,
  body,
  children,
}: {
  n: number;
  heading: string;
  body: string;
  children?: React.ReactNode;
}) {
  // Badge sits inline with the heading; body and actions stay flush with the
  // modal's left content edge instead of indenting under the badge.
  return (
    <li>
      <div className="flex items-center gap-2.5">
        <span className="border-divine-primary/40 bg-divine-primary/10 text-divine-primary-light flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold">
          {n}
        </span>
        <p className="text-divine-text text-sm font-semibold">{heading}</p>
      </div>
      <p className="text-divine-text-muted mt-1.5 text-sm leading-relaxed">
        {body}
      </p>
      {children && (
        <div className="mt-3 flex flex-wrap items-center gap-3">{children}</div>
      )}
    </li>
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
  owner,
}: {
  d: DraftMessages;
  stagedImages?: StagedImages;
  /** Upload to the contributor's fork when known; upstream needs push access. */
  owner?: string;
}) {
  const filenames = stagedImages ? Array.from(stagedImages.keys()).sort() : [];
  if (filenames.length === 0) return null;

  return (
    <div className="border-divine-primary/30 bg-divine-primary/[0.06] rounded-divine-lg mt-5 border p-5">
      <h4 className="text-divine-primary-light flex items-center gap-2 text-sm font-semibold">
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
      <div className="mt-3">
        <GlowLink href={uploadImagesUrl(owner)} label={d.uploadOnGithub} />
      </div>
    </div>
  );
}
