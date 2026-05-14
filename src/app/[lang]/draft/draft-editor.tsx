"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useMessages } from "@/lib/hooks/useMessages";
import { deriveSlug, isValidSlug } from "@/lib/draft/slug";
import { CodeEditor, type CodeEditorHandle } from "./code-editor";
import { assembleMdx } from "@/lib/draft/frontmatter";
import { mentionExtension } from "@/lib/draft/mention-extension";
import { scanForLinks, applySuggestion } from "@/lib/draft/scan-links";
import { PreviewPane } from "./preview-pane";
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
  const [scanResults, setScanResults] = useState<
    ReturnType<typeof scanForLinks>
  >([]);
  const [showHandoff, setShowHandoff] = useState(false);
  const [editLoadError, setEditLoadError] = useState(false);
  const [loadingSource, setLoadingSource] = useState(mode === "edit");
  const [restorePrompt, setRestorePrompt] = useState<ReturnType<
    typeof loadDraft
  > | null>(null);

  const editorRef = useRef<CodeEditorHandle>(null);

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
        const parts = editPath.split("/");
        setCategory(parts[0] ?? "tools");
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

  const handleScan = () => setScanResults(scanForLinks(body));

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

  const handleApplySuggestion = (
    suggestion: ReturnType<typeof scanForLinks>[number],
  ) => {
    const next = applySuggestion(body, suggestion);
    setBody(next);
    setScanResults(scanForLinks(next));
  };

  if (editLoadError && editPath) {
    return (
      <div className="p-8">
        <p className="text-divine-text">{d.editLoadError}</p>
        <a
          href={editFileUrl(editPath)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-divine-primary-light mt-2 inline-block text-sm"
        >
          {d.openGuideOnGithub} →
        </a>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {restorePrompt !== null && (
        <div className="bg-divine-surface border-divine-border flex items-center gap-3 border-b px-4 py-2 text-sm">
          <span className="text-divine-text-muted">
            Unsaved draft from{" "}
            {new Date(restorePrompt.savedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            . Restore it?
          </span>
          <button
            type="button"
            className="text-divine-primary-light font-semibold"
            onClick={handleRestore}
          >
            Restore
          </button>
          <button
            type="button"
            className="text-divine-text-muted"
            onClick={handleDiscard}
          >
            Discard
          </button>
        </div>
      )}
      {/* Header bar: frontmatter inputs + Contribute */}
      <div className="border-divine-border flex flex-wrap items-end gap-3 border-b px-4 py-3">
        <div className="text-divine-text w-full text-sm font-semibold">
          {mode === "edit" ? d.editTitle : d.newTitle}
          {loadingSource ? ` — ${messages.misc.loading}` : ""}
        </div>
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-divine-text-muted text-xs">{d.fieldTitle}</span>
          <input
            className="bg-divine-surface border-divine-border rounded-md border px-2 py-1.5 text-sm"
            placeholder={d.fieldTitlePlaceholder}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-divine-text-muted text-xs">
            {d.fieldCategory}
          </span>
          <select
            className="bg-divine-surface border-divine-border rounded-md border px-2 py-1.5 text-sm"
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
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-divine-text-muted text-xs">{d.fieldSlug}</span>
          <input
            className="bg-divine-surface border-divine-border w-44 rounded-md border px-2 py-1.5 text-sm"
            value={effectiveSlug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(deriveSlug(e.target.value));
            }}
            disabled={mode === "edit"}
          />
        </label>
        {slugCollision && (
          <p className="text-divine-warning w-full text-xs">
            {d.slugCollision}
          </p>
        )}
        <label className="flex w-full flex-col gap-1">
          <span className="text-divine-text-muted text-xs">
            {d.fieldDescription}
          </span>
          <input
            className="bg-divine-surface border-divine-border rounded-md border px-2 py-1.5 text-sm"
            placeholder={d.fieldDescriptionPlaceholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="text-divine-primary-light bg-divine-primary/15 rounded-md px-3 py-1.5 text-sm"
          onClick={handleScan}
        >
          {d.scanLinks}
        </button>
        <button
          type="button"
          className="bg-divine-primary rounded-md px-4 py-1.5 text-sm font-bold text-white disabled:opacity-40"
          disabled={!canContribute}
          onClick={() => setShowHandoff(true)}
        >
          {d.contribute}
        </button>
      </div>

      {scanResults.length > 0 && (
        <div className="border-divine-border flex flex-wrap gap-2 border-b px-4 py-2">
          {scanResults.map((suggestion, i) => (
            <button
              key={`${suggestion.entity.slug}-${i}`}
              type="button"
              className="bg-divine-surface border-divine-border rounded-md border px-2 py-1 text-xs"
              onClick={() => handleApplySuggestion(suggestion)}
            >
              Link &ldquo;{suggestion.match}&rdquo; → {suggestion.entity.url}
            </button>
          ))}
        </div>
      )}

      {/* Split: editor | preview */}
      <div className="grid flex-1 grid-cols-2 overflow-hidden">
        <div className="border-divine-border flex flex-col overflow-hidden border-r">
          <Toolbar
            onInsert={handleInsert}
            docsHref={(anchor) =>
              `/${lang}/docs/contributing/components#${anchor}`
            }
          />
          <CodeEditor
            ref={editorRef}
            value={body}
            onChange={setBody}
            placeholder={d.bodyPlaceholder}
            extraExtensions={[mentionExtension]}
          />
        </div>
        <div className="overflow-auto p-4">
          <PreviewPane mdx={assembledMdx} />
        </div>
      </div>
      {showHandoff && (
        <Handoff
          mode={mode}
          mdx={assembledMdx}
          category={category}
          slug={effectiveSlug}
          editPath={editPath}
          onClose={() => {
            setShowHandoff(false);
            clearDraft(storageKey);
          }}
        />
      )}
    </div>
  );
}
