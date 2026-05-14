"use client";

import { useMemo, useRef, useState } from "react";
import { useMessages } from "@/lib/hooks/useMessages";
import { deriveSlug } from "@/lib/draft/slug";
import { CodeEditor, type CodeEditorHandle } from "./code-editor";
import { assembleMdx } from "@/lib/draft/frontmatter";
import { PreviewPane } from "./preview-pane";

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

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(
    initialCategory && CATEGORIES.includes(initialCategory)
      ? initialCategory
      : "tools",
  );
  const [slugTouched, setSlugTouched] = useState(false);
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");

  const editorRef = useRef<CodeEditorHandle>(null);

  const effectiveSlug = useMemo(
    () => (slugTouched ? slug : deriveSlug(title)),
    [slugTouched, slug, title],
  );

  const assembledMdx = useMemo(
    () => assembleMdx({ title, description, body }),
    [title, description, body],
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Header bar: frontmatter inputs + Contribute */}
      <div className="border-divine-border flex flex-wrap items-end gap-3 border-b px-4 py-3">
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
      </div>

      {/* Split: editor | preview */}
      <div className="grid flex-1 grid-cols-2 overflow-hidden">
        <div className="border-divine-border flex flex-col overflow-hidden border-r">
          <CodeEditor
            ref={editorRef}
            value={body}
            onChange={setBody}
            placeholder={d.bodyPlaceholder}
          />
        </div>
        <div className="overflow-auto p-4">
          <PreviewPane mdx={assembledMdx} />
        </div>
      </div>
    </div>
  );
}
