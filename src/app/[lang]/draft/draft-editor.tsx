"use client";

export interface DraftEditorProps {
  mode: "new" | "edit";
  initialCategory: string | null;
  editPath: string | null;
}

export function DraftEditor({ mode, editPath }: DraftEditorProps) {
  return (
    <div className="p-8">
      Draft editor stub — mode: {mode}
      {editPath ? `, editing ${editPath}` : ""}
    </div>
  );
}
