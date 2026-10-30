"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Blocks,
  BookOpen,
  Check,
  ChevronDown,
  Eye,
  FileText,
  GitPullRequest,
  History,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DiscordLogo, GitHubLogo } from "@/components/brand-logos";
import { NAV_LINK } from "@/components/home/styles";
import {
  FIELD,
  FIELD_INPUT,
  HAIRLINE_BOTTOM,
  ICON_TILE,
  PANE,
  PANE_BAR,
  pillClassName,
  SMALL_PILL,
  TAG,
} from "./styles";
import { useMessages } from "@/lib/hooks/useMessages";
import { deriveSlug, isValidSlug } from "@/lib/draft/slug";
import { CodeEditor, type CodeEditorHandle } from "./code-editor";
import { assembleMdx } from "@/lib/draft/frontmatter";
import { mentionExtension } from "@/lib/draft/mention-extension";
import { scanForLinks, applySuggestion } from "@/lib/draft/scan-links";
import { PreviewPane, type PreviewStatus } from "./preview-pane";
import { Toolbar } from "./toolbar";
import { Handoff } from "./handoff";
import matter from "gray-matter";
import { rawSourceUrl, editFileUrl } from "@/lib/draft/github";
import {
  draftKey,
  loadDraft,
  saveDraft,
  clearDraft,
} from "@/lib/draft/persistence";
import { entities } from "@/lib/draft/entities";
import {
  acceptsGuides,
  DEFAULT_GAME,
  GAMES,
  gameCategories,
} from "@/lib/games";
import {
  normalizeFilename,
  dedupeName,
  wikiImageSrc,
  type StagedImage,
  type StagedImages,
} from "@/lib/draft/staged-images";

export interface DraftEditorProps {
  mode: "new" | "edit";
  /** Docs segment from `?game=`; the contribute picker always sets it. */
  initialGame: string | null;
  initialCategory: string | null;
  editPath: string | null;
}

/**
 * The game a draft belongs to. An edit path carries it as its first segment
 * ("lol/tools/flint"); a new draft takes `?game=` if that game accepts
 * guides, and falls back to the default game otherwise.
 */
function resolveGame(initialGame: string | null, editPath: string | null) {
  const fromPath = editPath?.split("/")[0];
  if (fromPath && acceptsGuides(fromPath)) return fromPath;
  if (initialGame && acceptsGuides(initialGame)) return initialGame;
  return DEFAULT_GAME;
}

/** Tools is the usual home for a new guide, so it's the default category. */
function defaultCategory(categories: string[], requested: string | null) {
  if (requested && categories.includes(requested)) return requested;
  return categories.includes("tools") ? "tools" : (categories[0] ?? "");
}

export function DraftEditor({
  mode,
  initialGame,
  initialCategory,
  editPath,
}: DraftEditorProps) {
  const messages = useMessages();
  const d = messages.draft;
  const params = useParams();
  const lang = (params?.lang as string) ?? "en";

  const game = resolveGame(initialGame, editPath);
  const gameInfo = GAMES.find((g) => g.slug === game);
  const categories = gameCategories(game);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(() =>
    defaultCategory(categories, initialCategory),
  );
  // New League drafts keep the key they had before the editor knew about
  // games, so drafts saved back then still offer to restore.
  const storageKey = draftKey(
    mode,
    editPath ?? (game === DEFAULT_GAME ? "new" : `new:${game}`),
  );
  const [slugTouched, setSlugTouched] = useState(false);
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [discord, setDiscord] = useState("");
  const [github, setGithub] = useState("");
  const [handoff, setHandoff] = useState<
    null | { step: "links" } | { step: "main" }
  >(null);
  const [pendingSuggestions, setPendingSuggestions] = useState<
    ReturnType<typeof scanForLinks>
  >([]);
  const [editLoadError, setEditLoadError] = useState(false);
  const [loadingSource, setLoadingSource] = useState(mode === "edit");
  const [restorePrompt, setRestorePrompt] = useState<ReturnType<
    typeof loadDraft
  > | null>(null);
  const [stagedImages, setStagedImages] = useState<StagedImages>(
    () => new Map(),
  );
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus>("loading");
  const [mobileView, setMobileView] = useState<"write" | "preview">("write");

  const editorRef = useRef<CodeEditorHandle>(null);
  const stagedImagesRef = useRef<StagedImages>(stagedImages);

  const effectiveSlug = useMemo(
    () => (slugTouched ? slug : deriveSlug(title)),
    [slugTouched, slug, title],
  );

  const assembledMdx = useMemo(
    () => assembleMdx({ title, description, body, discord, github }),
    [title, description, body, discord, github],
  );

  const canContribute =
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    isValidSlug(effectiveSlug);

  const slugCollision =
    mode === "new" &&
    entities.some(
      (e) =>
        e.game === game && e.category === category && e.slug === effectiveSlug,
    );

  const isDraftEmpty = !title.trim() && !description.trim() && !body.trim();

  // Mirrors the auto-save effect's guard below: whenever there is content and
  // we're not mid-load, the draft has been written to localStorage.
  const hasSaved = !loadingSource && (!!title.trim() || !!body.trim());

  // Restore-check: runs once on mount. SSR-safe — localStorage is not available
  // during server render, so we must read it in an effect.
  useEffect(
    () => {
      const existing = loadDraft(storageKey);
      if (existing) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRestorePrompt(existing);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Auto-save on every content change.
  useEffect(() => {
    if (loadingSource) return;
    if (!title.trim() && !body.trim()) return;
    saveDraft(storageKey, {
      title,
      description,
      category,
      slug: effectiveSlug,
      body,
      discord,
      github,
      savedAt: Date.now(),
    });
  }, [
    storageKey,
    title,
    description,
    category,
    effectiveSlug,
    body,
    discord,
    github,
    loadingSource,
  ]);

  // Keep the ref in sync with the latest staged map.
  useEffect(() => {
    stagedImagesRef.current = stagedImages;
  }, [stagedImages]);

  // On unmount, revoke every blob URL we created.
  useEffect(() => {
    return () => {
      stagedImagesRef.current.forEach(({ objectUrl }) =>
        URL.revokeObjectURL(objectUrl),
      );
    };
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !editPath) return;
    let cancelled = false;
    fetch(rawSourceUrl(editPath))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((raw) => {
        if (cancelled) return;
        const parsed = matter(raw);
        setTitle((parsed.data.title as string) ?? "");
        setDescription((parsed.data.description as string) ?? "");
        const credits = parsed.data.credits as
          { discord?: string; github?: string } | undefined;
        setDiscord(credits?.discord ?? "");
        setGithub(credits?.github ?? "");
        setBody(parsed.content.replace(/^\s+/, ""));
        // editPath is the page's slug path including the game segment,
        // e.g. "lol/tools/flint" — the category is the second part.
        const parts = editPath.split("/");
        const categoryPart = (parts.length >= 3 ? parts[1] : parts[0]) ?? "";
        setCategory(defaultCategory(categories, categoryPart));
        setSlugTouched(true);
        setSlug(parts[parts.length - 1] ?? "");
        setLoadingSource(false);
      })
      .catch(() => {
        if (cancelled) return;
        setEditLoadError(true);
        setLoadingSource(false);
      });
    return () => {
      cancelled = true;
    };
    // `categories` is the generated index's own array for this game, so it
    // keeps its identity across renders.
  }, [mode, editPath, categories]);

  const handleInsert = (snippet: string) => {
    editorRef.current?.insertAtCursor(snippet);
  };

  const handleRestore = () => {
    if (!restorePrompt) return;
    setTitle(restorePrompt.title);
    setDescription(restorePrompt.description);
    setCategory(defaultCategory(categories, restorePrompt.category));
    setSlugTouched(true);
    setSlug(restorePrompt.slug);
    setBody(restorePrompt.body);
    setDiscord(restorePrompt.discord ?? "");
    setGithub(restorePrompt.github ?? "");
    setRestorePrompt(null);
  };

  const handleDiscard = () => {
    clearDraft(storageKey);
    setRestorePrompt(null);
  };

  // Contribute pre-flight: scan for unlinked mentions of other guides. With
  // matches, show the link-check step first; with none, go straight to the
  // GitHub handoff modal. The modal walks through fork → create → PR; nothing
  // opens or clears until the writer follows the links themselves.
  // Sidebar entries are automatic (category meta.json files end with "...").
  const handleContribute = () => {
    const found = scanForLinks(body);
    if (found.length > 0) {
      setPendingSuggestions(found);
      setHandoff({ step: "links" });
    } else {
      setHandoff({ step: "main" });
    }
  };

  // Applying the last pending suggestion continues to GitHub on its own.
  const handleApplyPending = (
    suggestion: ReturnType<typeof scanForLinks>[number],
  ) => {
    const next = applySuggestion(body, suggestion);
    setBody(next);
    const remaining = scanForLinks(next);
    setPendingSuggestions(remaining);
    if (remaining.length === 0) setHandoff({ step: "main" });
  };

  const handlePreviewStatus = useCallback((status: PreviewStatus) => {
    setPreviewStatus(status);
  }, []);

  const addImages = (files: File[]) => {
    if (files.length === 0) return;
    const taken = new Set(stagedImages.keys());
    const additions: [string, StagedImage][] = [];
    for (const file of files) {
      const desired = normalizeFilename(file.name);
      const filename = dedupeName(desired, taken);
      taken.add(filename);
      additions.push([
        filename,
        { file, objectUrl: URL.createObjectURL(file) },
      ]);
    }
    setStagedImages((current) => {
      const next = new Map(current);
      for (const [name, img] of additions) next.set(name, img);
      return next;
    });
    const snippet =
      additions
        .map(([name]) => `<img src="${wikiImageSrc(name)}" alt="" />`)
        .join("\n") + "\n";
    editorRef.current?.insertAtCursor(snippet);
  };

  if (editLoadError && editPath) {
    return (
      <Shell>
        <div className="flex flex-1 items-center justify-center p-8">
          <div
            className={cn(
              PANE,
              "flex max-w-md flex-col items-center p-6 text-center",
            )}
          >
            <span className={ICON_TILE}>
              <AlertTriangle />
            </span>
            <p className="text-divine-text mt-4 text-sm leading-relaxed">
              {d.editLoadError}
            </p>
            <a
              href={editFileUrl(editPath)}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(pillClassName("secondary"), "mt-5")}
            >
              <GitHubLogo className="size-4" />
              {d.openGuideOnGithub}
            </a>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* ── Top bar: the site navbar, scrolled state ───────────── */}
      <header
        className={cn(
          HAIRLINE_BOTTOM,
          "flex h-14 shrink-0 items-center gap-2 px-3 sm:gap-3 sm:px-5",
        )}
      >
        <Link
          href={`/${lang}/docs/${game}`}
          aria-label={d.backToWiki}
          className={cn(NAV_LINK, "group gap-2 px-2")}
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="relative hidden size-7 sm:block">
            <Image
              alt="Divine Skins"
              src="/brand/logo.webp"
              fill
              sizes="28px"
            />
          </span>
        </Link>

        <span aria-hidden className="bg-fd-border h-5 w-px shrink-0" />

        <div className="flex min-w-0 items-center gap-2.5">
          <h1 className="text-divine-text truncate font-[family-name:var(--font-hero)] text-[15px] font-bold tracking-tight">
            {mode === "edit" ? d.editTitle : d.newTitle}
          </h1>
          {mode === "edit" && editPath && (
            <span
              className={cn(
                TAG,
                "text-divine-text-muted hidden truncate font-mono font-medium md:inline-flex",
              )}
            >
              {editPath}
            </span>
          )}
          {/* A new draft's game comes from the contribute picker (`?game=`):
              shown here, not chosen. An edit path already names it. */}
          {mode === "new" && gameInfo && (
            <span
              title={d.fieldGame}
              className={cn(TAG, "hidden py-0.5 pl-1 sm:inline-flex")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- tiny cover thumbnail */}
              <img
                src={gameInfo.cover}
                alt=""
                width={15}
                height={20}
                className="h-5 w-[15px] rounded-[3px] object-cover"
              />
              {gameInfo.name}
            </span>
          )}
          {loadingSource && (
            <Loader2 className="text-divine-text-muted size-3.5 shrink-0 animate-spin" />
          )}
          {hasSaved && (
            <span className="text-divine-text-muted hidden shrink-0 items-center gap-1 text-xs font-medium sm:inline-flex">
              <Check className="text-divine-success size-3.5" />
              {d.saved}
            </span>
          )}
        </div>

        <nav className="ml-auto flex shrink-0 items-center gap-1">
          {/* Help links: new tab so an open draft is never navigated away. */}
          <Link
            href={`/${lang}/docs/${game}/contributing`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(NAV_LINK, "hidden gap-1.5 px-3 lg:inline-flex")}
          >
            <BookOpen className="size-4" />
            {d.contributingGuide}
          </Link>
          <Link
            href={`/${lang}/docs/${game}/contributing/components`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(NAV_LINK, "hidden gap-1.5 px-3 md:inline-flex")}
          >
            <Blocks className="size-4" />
            {d.components}
          </Link>
          <button
            type="button"
            className={cn(pillClassName("solid"), "ml-1 sm:ml-2")}
            disabled={!canContribute}
            onClick={handleContribute}
          >
            <GitPullRequest className="size-4" />
            {d.contribute}
          </button>
        </nav>
      </header>

      {/* ── Guide details ───────────────────────────────────────── */}
      <div className="shrink-0 px-4 pt-5 pb-4 sm:px-6">
        {restorePrompt !== null && (
          <div
            className={cn(
              PANE,
              "mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3",
            )}
          >
            <History className="text-divine-primary-light light:text-divine-primary size-4 shrink-0" />
            <p className="min-w-0 text-sm">
              <span className="text-divine-text font-semibold">
                {d.unsavedHeading}
              </span>{" "}
              <span className="text-divine-text-muted hidden sm:inline">
                {d.unsavedBody}
              </span>
            </p>
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                className={SMALL_PILL}
                onClick={handleRestore}
              >
                {d.restore}
              </button>
              <button
                type="button"
                className={cn(NAV_LINK, "px-3 py-1.5 text-xs")}
                onClick={handleDiscard}
              >
                {d.discard}
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:gap-8">
          <div className="min-w-0 flex-1">
            <input
              aria-label={d.fieldTitle}
              className="text-divine-text placeholder:text-divine-text-muted/50 w-full bg-transparent font-[family-name:var(--font-hero)] text-3xl font-bold tracking-tight outline-none sm:text-[2.5rem] sm:leading-tight"
              placeholder={d.fieldTitlePlaceholder}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="mt-1.5 flex max-w-2xl items-center gap-3">
              <input
                aria-label={d.fieldDescription}
                maxLength={160}
                className="text-divine-text-muted placeholder:text-divine-text-muted/50 w-full min-w-0 flex-1 bg-transparent text-[15px] outline-none"
                placeholder={d.fieldDescriptionPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <span
                className={cn(
                  "shrink-0 text-xs font-medium tabular-nums",
                  description.length >= 160
                    ? "text-divine-warning"
                    : "text-divine-text-muted/70",
                )}
              >
                {description.length}/160
              </span>
            </div>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-2 sm:max-w-xl xl:w-[34rem]">
            <label className={cn(FIELD, "col-span-2 sm:col-span-1")}>
              <span className="text-divine-text-muted shrink-0 text-xs font-medium">
                {d.fieldCategory}
              </span>
              <span className="relative flex min-w-0 flex-1 items-center">
                <select
                  className="text-divine-text w-full appearance-none bg-transparent pr-5 text-sm font-semibold outline-none disabled:opacity-60"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={mode === "edit"}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="text-divine-text-muted pointer-events-none absolute right-0 size-3.5" />
              </span>
            </label>

            <label className={cn(FIELD, "col-span-2 sm:col-span-1")}>
              <span className="text-divine-text-muted shrink-0 text-xs font-medium">
                {d.fieldSlug}
              </span>
              <span className="flex min-w-0 flex-1 items-baseline">
                <input
                  className={cn(FIELD_INPUT, "flex-1 font-mono")}
                  value={effectiveSlug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(deriveSlug(e.target.value));
                  }}
                  disabled={mode === "edit"}
                />
                <span className="text-divine-text-muted/70 font-mono text-sm">
                  .mdx
                </span>
              </span>
            </label>

            {/* Optional credit handles: written to the `credits` frontmatter
                block and shown at the bottom of the published page. */}
            <label className={FIELD}>
              <DiscordLogo className="text-divine-text-muted size-4 shrink-0" />
              <input
                aria-label={d.fieldDiscord}
                className={cn(FIELD_INPUT, "w-full")}
                placeholder={d.fieldDiscordPlaceholder}
                value={discord}
                onChange={(e) => setDiscord(e.target.value)}
              />
            </label>

            <label className={FIELD}>
              <GitHubLogo className="text-divine-text-muted size-4 shrink-0" />
              <input
                aria-label={d.fieldGithub}
                className={cn(FIELD_INPUT, "w-full")}
                placeholder={d.fieldGithubPlaceholder}
                value={github}
                onChange={(e) => setGithub(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-divine-text-muted flex min-w-0 items-center gap-1.5 font-mono text-xs">
            <FileText className="size-3.5 shrink-0" />
            <span className="truncate">
              content/docs/en/{game}/{category}/{effectiveSlug || "…"}.mdx
            </span>
          </span>
          {slugCollision && (
            <span className="text-divine-warning flex items-center gap-1.5 text-xs font-medium">
              <AlertTriangle className="size-3.5 shrink-0" />
              {d.slugCollision}
            </span>
          )}
        </div>
      </div>

      {/* ── Workspace: editor | preview ─────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4 sm:px-6 sm:pb-6">
        {/* Mobile pane switcher */}
        <div
          role="tablist"
          className="border-fd-border bg-fd-card flex gap-1 self-start rounded-full border p-1 lg:hidden"
        >
          {(["write", "preview"] as const).map((view) => (
            <button
              key={view}
              type="button"
              role="tab"
              aria-selected={mobileView === view}
              className={cn(
                "rounded-full px-4 py-1 text-xs font-semibold transition-colors",
                mobileView === view
                  ? "text-divine-text light:bg-black/10 bg-white/10"
                  : "text-divine-text-muted hover:text-divine-text",
              )}
              onClick={() => setMobileView(view)}
            >
              {view === "write" ? d.tabWrite : d.previewHeading}
            </button>
          ))}
        </div>

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
          {/* Editor pane */}
          <section
            aria-label={d.editorLabel}
            className={cn(
              PANE,
              "min-h-0 flex-col overflow-hidden",
              mobileView === "write" ? "flex" : "hidden lg:flex",
            )}
          >
            <Toolbar
              onInsert={handleInsert}
              onUploadImage={addImages}
              docsHref={(anchor) =>
                `/${lang}/docs/${game}/contributing/components#${anchor}`
              }
            />
            <div className="min-h-0 flex-1 overflow-hidden">
              <CodeEditor
                ref={editorRef}
                value={body}
                onChange={setBody}
                placeholder={d.bodyPlaceholder}
                extraExtensions={[mentionExtension]}
              />
            </div>
          </section>

          {/* Preview pane. Its body sits on the page background, not the
              panel fill, so cards and panels in the guide read exactly as
              they do on the published page. */}
          <section
            aria-label={d.previewHeading}
            className={cn(
              PANE,
              "min-h-0 flex-col overflow-hidden",
              mobileView === "preview" ? "flex" : "hidden lg:flex",
            )}
          >
            <div
              className={cn(
                PANE_BAR,
                "flex min-h-12 shrink-0 items-center gap-2 px-4",
              )}
            >
              <Eye className="text-divine-text-muted size-4" />
              <span className="text-divine-text text-sm font-semibold">
                {d.previewHeading}
              </span>
              {!isDraftEmpty && (
                <span className="text-divine-text-muted ml-auto flex items-center gap-1.5 text-xs font-medium">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      previewStatus === "ok" && "bg-divine-success",
                      previewStatus === "loading" &&
                        "bg-divine-warning animate-pulse",
                      (previewStatus === "error" ||
                        previewStatus === "unavailable") &&
                        "bg-divine-error",
                    )}
                  />
                  {d.previewLive}
                </span>
              )}
            </div>
            <div className="bg-fd-background min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
              {isDraftEmpty ? (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <span className={ICON_TILE}>
                    <Sparkles />
                  </span>
                  <p className="text-divine-text mt-4 font-[family-name:var(--font-hero)] text-base font-bold">
                    {d.previewEmptyHeading}
                  </p>
                  <p className="text-divine-text-muted mt-1.5 max-w-xs text-sm leading-relaxed">
                    {d.previewEmptyBody}
                  </p>
                </div>
              ) : (
                <PreviewPane
                  mdx={assembledMdx}
                  stagedImages={stagedImages}
                  title={title}
                  description={description}
                  credits={{ discord, github }}
                  onStatusChange={handlePreviewStatus}
                />
              )}
            </div>
          </section>
        </div>
      </div>

      {handoff !== null && (
        <Handoff
          step={handoff.step}
          suggestions={pendingSuggestions}
          onApplySuggestion={handleApplyPending}
          onContinue={() => setHandoff({ step: "main" })}
          mode={mode}
          mdx={assembledMdx}
          game={game}
          category={category}
          slug={effectiveSlug}
          editPath={editPath}
          stagedImages={stagedImages}
          // Never clear the draft here: the GitHub steps may still be in
          // flight in another tab. The restore banner offers "start fresh".
          onClose={() => setHandoff(null)}
        />
      )}
    </Shell>
  );
}

/**
 * App shell: a full-height workspace on the page background. It follows the
 * reader's theme (dark, light, Minimal) like the rest of the wiki, so the
 * preview matches the page they'll publish. No atmosphere: the Contribute
 * pill's bloom is the screen's one glow.
 */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-fd-background text-divine-text flex h-dvh flex-col overflow-hidden">
      {children}
    </div>
  );
}
