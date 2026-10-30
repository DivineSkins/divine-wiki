"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  ImagePlus,
  Link2,
  Lock,
  X,
} from "lucide-react";
import { GitHubLogo } from "@/components/brand-logos";
import { useMessages } from "@/lib/hooks/useMessages";
import { cn } from "@/lib/utils";
import {
  CHIP,
  FIELD,
  FIELD_INPUT,
  PANE,
  pillClassName,
  TAG,
  TEXT_LINK,
} from "./styles";
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
      className="animate-in fade-in-0 light:bg-black/30 fixed inset-0 z-50 flex items-center justify-center bg-[#0b0a0f]/80 p-4 backdrop-blur-sm duration-200"
      onClick={onClose}
    >
      <div
        className={cn(
          PANE,
          "animate-in fade-in-0 zoom-in-95 light:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.2)] relative max-h-[90vh] w-full max-w-2xl overflow-auto p-6 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] duration-200 sm:p-8",
        )}
        role="dialog"
        aria-modal="true"
        aria-label={d.contribute}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label={d.close}
          className="text-divine-text-muted hover:text-divine-text light:hover:bg-black/5 absolute top-4 right-4 flex size-8 items-center justify-center rounded-full transition-colors outline-none hover:bg-white/5 focus-visible:ring-1 focus-visible:ring-[#C084FC]"
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

/** Dialog title and one-line intro: the contribute picker's heading. */
function DialogHeading({ title, body }: { title: string; body: string }) {
  return (
    <div className="mb-6 pr-8">
      <h2 className="text-divine-text font-[family-name:var(--font-hero)] text-lg leading-tight font-bold tracking-tight">
        {title}
      </h2>
      <p className="text-divine-text-muted mt-1.5 text-sm leading-relaxed font-medium">
        {body}
      </p>
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
    <>
      <DialogHeading title={d.linkCheckHeading} body={d.linkCheckBody} />
      <div className="flex flex-col items-start gap-2">
        {suggestions.map((suggestion, i) => (
          <button
            key={`${suggestion.entity.slug}-${i}`}
            type="button"
            className={cn(CHIP, "max-w-full px-3 py-1.5")}
            onClick={() => onApplySuggestion(suggestion)}
          >
            <Link2 className="text-divine-primary-light light:text-divine-primary size-3.5 shrink-0" />
            <span className="text-divine-text truncate">
              &ldquo;{suggestion.match}&rdquo;
            </span>
            <ArrowRight className="size-3 shrink-0" />
            <span className="truncate font-mono font-medium">
              {suggestion.entity.url}
            </span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className={cn(pillClassName("solid"), "mt-6")}
        onClick={onContinue}
      >
        {d.continueToGithub}
        <ArrowRight className="size-4" />
      </button>
    </>
  );
}

function CopyButton({
  copied,
  onCopy,
  d,
  variant = "secondary",
}: {
  copied: boolean;
  onCopy: () => void;
  d: DraftMessages;
  variant?: "solid" | "secondary";
}) {
  return (
    <button type="button" className={pillClassName(variant)} onClick={onCopy}>
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? d.copied : d.copyMdx}
    </button>
  );
}

/** External GitHub link as a pill. One `solid` per step list: the action
 *  that carries the guide. */
function GithubPill({
  href,
  label,
  variant = "secondary",
}: {
  href: string;
  label: string;
  variant?: "solid" | "secondary";
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={pillClassName(variant)}
    >
      {label}
      <ExternalLink className="size-4" />
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
    <>
      <DialogHeading title={d.handoffHeading} body={d.handoffIntro} />

      <label className="block">
        <span className="text-divine-text text-sm font-semibold">
          {d.githubUsernameLabel}
        </span>
        <span className={cn(FIELD, "mt-2 max-w-sm")}>
          <GitHubLogo className="text-divine-text-muted size-4 shrink-0" />
          <input
            className={cn(FIELD_INPUT, "flex-1 font-mono")}
            placeholder={d.githubUsernamePlaceholder}
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
        </span>
      </label>

      <ol className="mt-7 flex flex-col">
        <HandoffStep n={1} heading={d.stepForkHeading} body={d.stepForkBody}>
          <GithubPill href={forkUrl()} label={d.forkOnGithub} />
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
            // The step that carries the guide, so it gets the solid pill
            // and doesn't read as optional next to steps 1 and 3.
            <GithubPill
              href={handoff.url}
              label={d.createOnGithub}
              variant="solid"
            />
          ) : (
            <span className="text-divine-text-muted inline-flex items-center gap-1.5 text-xs font-medium">
              <Lock className="size-3.5" />
              {d.usernameNeeded}
            </span>
          )}
        </HandoffStep>

        <HandoffStep n={3} heading={d.stepPrHeading} body={d.stepPrBody} last>
          {owner && (
            <GithubPill href={comparePrUrl(owner)} label={d.openPrOnGithub} />
          )}
        </HandoffStep>
      </ol>

      <p className="text-divine-text-muted border-fd-border mt-6 border-t pt-4 text-xs font-medium">
        {d.maintainerPath}{" "}
        <a
          href={maintainerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(TEXT_LINK, "text-xs")}
        >
          {d.maintainerLink}
        </a>
      </p>
    </>
  );
}

/**
 * One numbered step on a rail, like the guides' own Steps component: a
 * #25222F badge, a hairline down to the next step, body and actions beside.
 */
function HandoffStep({
  n,
  heading,
  body,
  last = false,
  children,
}: {
  n: number;
  heading: string;
  body: string;
  last?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <li className={cn("relative pl-11", !last && "pb-7")}>
      {!last && (
        <span
          aria-hidden
          className="bg-fd-border absolute top-9 bottom-1 left-[15px] w-px"
        />
      )}
      <span className="border-fd-border text-divine-text light:bg-black/5 absolute top-0 left-0 flex size-8 items-center justify-center rounded-full border bg-white/5 text-sm font-bold tabular-nums">
        {n}
      </span>
      <p className="text-divine-text pt-1 text-[15px] font-bold">{heading}</p>
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
    <>
      <DialogHeading title={d.handoffEditHeading} body={d.handoffEditBody} />
      <div className="flex flex-wrap items-center gap-3">
        <CopyButton copied={copied} onCopy={onCopyMdx} d={d} variant="solid" />
        <GithubPill href={editFileUrl(editPath)} label={d.openGuideOnGithub} />
      </div>
    </>
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
    <section className="border-fd-border mt-7 border-t pt-6">
      <h3 className="text-divine-text flex items-center gap-2 text-[15px] font-bold">
        <ImagePlus className="text-divine-primary-light light:text-divine-primary size-4" />
        {d.imagesHeading}
      </h3>
      <p className="text-divine-text-muted mt-1.5 text-sm leading-relaxed">
        {d.imagesBody}
      </p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {filenames.map((name) => (
          <li key={name} className={cn(TAG, "font-mono font-medium")}>
            {name}
          </li>
        ))}
      </ul>
      <p className="text-divine-text-muted mt-3 text-sm leading-relaxed">
        {d.imagesOutcome}
      </p>
      <div className="mt-4">
        <GithubPill href={uploadImagesUrl(owner)} label={d.uploadOnGithub} />
      </div>
    </section>
  );
}
