"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  Eye,
  FileText,
  GitPullRequest,
  History,
  Loader2,
  PencilLine,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import { rawSourceUrl, editFileUrl, newFileUrl } from "@/lib/draft/github";
import {
  draftKey,
  loadDraft,
  saveDraft,
  clearDraft,
} from "@/lib/draft/persistence";
import { entities } from "@/lib/draft/entities";
import {
  normalizeFilename,
  dedupeName,
  wikiImageSrc,
  type StagedImage,
  type StagedImages,
} from "@/lib/draft/staged-images";

export interface DraftEditorProps {
  mode: "new" | "edit";
  initialCategory: string | null;
  editPath: string | null;
}

const CATEGORIES = [
  "guided-walkthrough",
  "tools",
  "maya",
  "blender",
  "animations",
  "vfx-bins",
  "assets-library",
  "errors",
  "contributing",
];

export function DraftEditor({
  mode,
  initialCategory,
  editPath,
}: DraftEditorProps) {
  const messages = useMessages();
  const d = messages.draft;
  const params = useParams();
  const lang = (params?.lang as string) ?? "en";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(
    initialCategory && CATEGORIES.includes(initialCategory)
      ? initialCategory
      : "tools",
  );
  const storageKey = draftKey(mode, editPath ?? "new");
  const [slugTouched, setSlugTouched] = useState(false);
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [handoff, setHandoff] = useState<
    null | { step: "links" } | { step: "main"; tabOpened: boolean }
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
    () => assembleMdx({ title, description, body }),
    [title, description, body],
  );

  const canContribute =
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    isValidSlug(effectiveSlug);

  const slugCollision =
    mode === "new" &&
    entities.some((e) => e.category === category && e.slug === effectiveSlug);

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
      savedAt: Date.now(),
    });
  }, [
    storageKey,
    title,
    description,
    category,
    effectiveSlug,
    body,
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
        setBody(parsed.content.replace(/^\s+/, ""));
        // editPath is the page's slug path including the game segment,
        // e.g. "lol/tools/flint" — the category is the second part.
        const parts = editPath.split("/");
        const categoryPart = (parts.length >= 3 ? parts[1] : parts[0]) ?? "";
        setCategory(CATEGORIES.includes(categoryPart) ? categoryPart : "tools");
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
  }, [mode, editPath]);

  const handleInsert = (snippet: string) => {
    editorRef.current?.insertAtCursor(snippet);
  };

  const handleRestore = () => {
    if (!restorePrompt) return;
    setTitle(restorePrompt.title);
    setDescription(restorePrompt.description);
    setCategory(restorePrompt.category);
    setSlugTouched(true);
    setSlug(restorePrompt.slug);
    setBody(restorePrompt.body);
    setRestorePrompt(null);
  };

  const handleDiscard = () => {
    clearDraft(storageKey);
    setRestorePrompt(null);
  };

  // Contribute pre-flight: scan for unlinked mentions of other guides. With
  // matches, show the link-check step first; with none, go straight to GitHub.
  const handleContribute = () => {
    const found = scanForLinks(body);
    if (found.length > 0) {
      setPendingSuggestions(found);
      setHandoff({ step: "links" });
    } else {
      proceedToHandoff(body);
    }
  };

  // Open the GitHub flow. The modal only appears when something is left to do
  // here: the copy-paste fallback, edit mode, or staged images to upload.
  // Sidebar entries are automatic (category meta.json files end with "...").
  const proceedToHandoff = (currentBody: string) => {
    if (mode === "new") {
      const target = newFileUrl(
        category,
        effectiveSlug,
        assembleMdx({ title, description, body: currentBody }),
      );
      if (target.prefilled) {
        window.open(target.url, "_blank", "noopener");
        if (stagedImages.size === 0) {
          clearDraft(storageKey);
          setHandoff(null);
          return;
        }
        setHandoff({ step: "main", tabOpened: true });
        return;
      }
    }
    setHandoff({ step: "main", tabOpened: false });
  };

  // Applying the last pending suggestion continues to GitHub on its own.
  const handleApplyPending = (
    suggestion: ReturnType<typeof scanForLinks>[number],
  ) => {
    const next = applySuggestion(body, suggestion);
    setBody(next);
    const remaining = scanForLinks(next);
    setPendingSuggestions(remaining);
    if (remaining.length === 0) proceedToHandoff(next);
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
          <div className="bg-divine-surface border-divine-border rounded-divine-xl max-w-md border p-6 text-center shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
            <AlertTriangle className="text-divine-warning mx-auto size-6" />
            <p className="text-divine-text mt-3">{d.editLoadError}</p>
            <a
              href={editFileUrl(editPath)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-divine-primary-light hover:text-divine-text mt-3 inline-block text-sm font-medium transition-colors"
            >
              {d.openGuideOnGithub} →
            </a>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="border-divine-primary/15 bg-divine-void/85 flex h-14 shrink-0 items-center gap-3 border-b px-4 backdrop-blur sm:px-6">
        <Link
          href={`/${lang}/docs`}
          aria-label={d.backToWiki}
          className="text-divine-text-muted hover:text-divine-text group flex items-center gap-2.5 transition-colors"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="relative hidden h-7 w-7 sm:block">
            <Image
              alt="Divine Skins"
              src="/brand/logo.webp"
              fill
              sizes="28px"
            />
          </span>
        </Link>

        <span aria-hidden className="bg-divine-border/70 h-5 w-px" />

        <div className="flex min-w-0 items-center gap-2.5">
          <PencilLine className="text-divine-primary-light size-4 shrink-0" />
          <h1 className="text-divine-text truncate text-sm font-semibold">
            {mode === "edit" ? d.editTitle : d.newTitle}
          </h1>
          {mode === "edit" && editPath && (
            <span className="border-divine-primary/30 bg-divine-primary/10 text-divine-primary-light hidden truncate rounded-full border px-2.5 py-0.5 font-mono text-[11px] md:inline">
              {editPath}
            </span>
          )}
          {loadingSource && (
            <Loader2 className="text-divine-text-muted size-3.5 animate-spin" />
          )}
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          {hasSaved && (
            <span className="text-divine-text-muted hidden items-center gap-1 text-xs sm:flex">
              <Check className="text-divine-success size-3.5" />
              {d.saved}
            </span>
          )}
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-full bg-gradient-to-r from-[#B472FF] to-[#783CB5] px-5 text-sm font-semibold text-white shadow-[0_0_54px_-7px_#783CB5] transition-shadow hover:shadow-[0_0_5px_#783CB5,0_0_25px_#783CB5,0_0_25px_#783CB5,0_0_100px_#783CB5] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:shadow-none"
            disabled={!canContribute}
            onClick={handleContribute}
          >
            <GitPullRequest className="size-4" />
            {d.contribute}
          </button>
        </div>
      </header>

      {/* ── Restore banner ──────────────────────────────────────── */}
      {restorePrompt !== null && (
        <div className="border-divine-secondary/25 bg-divine-secondary/[0.07] flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-2.5 text-sm sm:px-6">
          <History className="text-divine-secondary size-4 shrink-0" />
          <span className="text-divine-text font-medium">
            {d.unsavedHeading}
          </span>
          <span className="text-divine-text-muted hidden sm:inline">
            {d.unsavedBody}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="bg-divine-secondary/15 text-divine-secondary hover:bg-divine-secondary/25 rounded-full px-3.5 py-1 text-xs font-semibold transition-colors"
              onClick={handleRestore}
            >
              {d.restore}
            </button>
            <button
              type="button"
              className="text-divine-text-muted hover:text-divine-text rounded-full px-2 py-1 text-xs transition-colors"
              onClick={handleDiscard}
            >
              {d.discard}
            </button>
          </div>
        </div>
      )}

      {/* ── Guide details ───────────────────────────────────────── */}
      <div className="shrink-0 border-b border-white/[0.06] px-4 pt-4 pb-3 sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
          <div className="min-w-0 flex-1">
            <span className="text-divine-text-muted block text-[10px] font-semibold tracking-[0.1em] uppercase">
              {d.fieldTitle}
            </span>
            <input
              aria-label={d.fieldTitle}
              className="text-divine-text placeholder:text-divine-text-muted/55 w-full bg-transparent font-[family-name:var(--font-hero)] text-3xl font-bold tracking-tight outline-none sm:text-4xl"
              placeholder={d.fieldTitlePlaceholder}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="mt-2 flex items-center gap-3">
              <span className="text-divine-text-muted shrink-0 text-[10px] font-semibold tracking-[0.1em] uppercase">
                {d.fieldDescription}
              </span>
              <input
                aria-label={d.fieldDescription}
                className="text-divine-text-muted placeholder:text-divine-text-muted/40 w-full min-w-0 flex-1 bg-transparent text-sm outline-none"
                placeholder={d.fieldDescriptionPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <span
                className={cn(
                  "shrink-0 font-mono text-[11px] tabular-nums",
                  description.length > 160
                    ? "text-divine-warning"
                    : "text-divine-text-muted/60",
                )}
              >
                {description.length}/160
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-stretch gap-2">
            <label className="bg-divine-surface/60 focus-within:border-divine-primary/50 rounded-divine-lg relative flex flex-col gap-0.5 border border-white/10 px-3 py-1.5 transition-colors">
              <span className="text-divine-text-muted text-[10px] font-semibold tracking-[0.1em] uppercase">
                {d.fieldCategory}
              </span>
              <span className="relative">
                <select
                  className="text-divine-text appearance-none bg-transparent pr-6 text-sm outline-none disabled:opacity-60"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={mode === "edit"}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="text-divine-text-muted pointer-events-none absolute top-1/2 right-0 size-3.5 -translate-y-1/2" />
              </span>
            </label>

            <label className="bg-divine-surface/60 focus-within:border-divine-primary/50 rounded-divine-lg flex flex-col gap-0.5 border border-white/10 px-3 py-1.5 transition-colors">
              <span className="text-divine-text-muted text-[10px] font-semibold tracking-[0.1em] uppercase">
                {d.fieldSlug}
              </span>
              <span className="flex items-baseline">
                <input
                  className="text-divine-text w-36 bg-transparent font-mono text-sm outline-none disabled:opacity-60"
                  value={effectiveSlug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(deriveSlug(e.target.value));
                  }}
                  disabled={mode === "edit"}
                />
                <span className="text-divine-text-muted/60 font-mono text-sm">
                  .mdx
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-divine-text-muted/80 flex items-center gap-1.5 font-mono text-[11px]">
            <FileText className="size-3.5" />
            content/docs/en/lol/{category}/{effectiveSlug || "…"}.mdx
          </span>
          {slugCollision && (
            <span className="text-divine-warning flex items-center gap-1.5 text-xs">
              <AlertTriangle className="size-3.5" />
              {d.slugCollision}
            </span>
          )}
        </div>
      </div>

      {/* ── Workspace: editor | preview ─────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pt-3 pb-4 sm:px-6">
        {/* Mobile pane switcher */}
        <div className="flex gap-1 self-start rounded-full border border-white/10 bg-white/[0.03] p-1 lg:hidden">
          {(["write", "preview"] as const).map((view) => (
            <button
              key={view}
              type="button"
              className={cn(
                "rounded-full px-4 py-1 text-xs font-semibold transition-colors",
                mobileView === view
                  ? "bg-divine-primary/20 text-divine-primary-light"
                  : "text-divine-text-muted hover:text-divine-text",
              )}
              onClick={() => setMobileView(view)}
            >
              {view === "write" ? d.tabWrite : d.previewHeading}
            </button>
          ))}
        </div>

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
          {/* Editor card */}
          <section
            className={cn(
              "rounded-divine-xl min-h-0 flex-col overflow-hidden border border-white/[0.08] bg-[#100f17] shadow-[0_4px_12px_rgba(0,0,0,0.3)]",
              mobileView === "write" ? "flex" : "hidden lg:flex",
            )}
          >
            <Toolbar
              onInsert={handleInsert}
              onUploadImage={addImages}
              docsHref={(anchor) =>
                `/${lang}/docs/contributing/components#${anchor}`
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

          {/* Preview card */}
          <section
            className={cn(
              "rounded-divine-xl min-h-0 flex-col overflow-hidden border border-white/[0.08] bg-[#100f17] shadow-[0_4px_12px_rgba(0,0,0,0.3)]",
              mobileView === "preview" ? "flex" : "hidden lg:flex",
            )}
          >
            <div className="border-divine-primary/15 flex shrink-0 items-center gap-2 border-b bg-white/[0.02] px-4 py-2">
              <Eye className="text-divine-text-muted size-3.5" />
              <span className="text-divine-text-muted text-xs font-semibold">
                {d.previewHeading}
              </span>
              {!isDraftEmpty && (
                <span className="text-divine-text-muted ml-auto flex items-center gap-1.5 text-[11px]">
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
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
              {isDraftEmpty ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                  <div className="border-divine-primary/30 bg-divine-primary/10 rounded-full border p-3 shadow-[0_0_40px_-8px_#783CB5]">
                    <Sparkles className="text-divine-primary-light size-6" />
                  </div>
                  <p className="text-divine-text font-semibold">
                    {d.previewEmptyHeading}
                  </p>
                  <p className="text-divine-text-muted max-w-xs text-sm">
                    {d.previewEmptyBody}
                  </p>
                </div>
              ) : (
                <PreviewPane
                  mdx={assembledMdx}
                  stagedImages={stagedImages}
                  title={title}
                  description={description}
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
          tabOpened={handoff.step === "main" ? handoff.tabOpened : false}
          suggestions={pendingSuggestions}
          onApplySuggestion={handleApplyPending}
          onContinue={() => proceedToHandoff(body)}
          mode={mode}
          mdx={assembledMdx}
          category={category}
          slug={effectiveSlug}
          editPath={editPath}
          stagedImages={stagedImages}
          onClose={() => {
            // Closing the link-check step returns to editing. Closing the
            // final step means the handoff happened, so the draft is done.
            if (handoff.step === "main") clearDraft(storageKey);
            setHandoff(null);
          }}
        />
      )}
    </Shell>
  );
}

/**
 * Forced-dark app shell. The editor is a "studio" surface: it always renders
 * the dark Divine look regardless of the site theme — the `.dark` class makes
 * every divine and fd token resolve to its dark value (global.css re-declares
 * them on `.dark` for exactly this), and the ambient purple wash supplies the
 * brand's glow-on-void atmosphere.
 */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="dark bg-divine-void text-divine-text relative isolate flex h-dvh flex-col overflow-hidden font-[family-name:var(--font-ui)]"
      style={{ colorScheme: "dark" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(900px 480px at 10% -10%, rgba(120, 60, 181, 0.16), transparent 60%), radial-gradient(700px 400px at 95% 0%, rgba(236, 185, 106, 0.05), transparent 55%)",
        }}
      />
      {children}
    </div>
  );
}
