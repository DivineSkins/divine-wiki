import type { Metadata } from "next";
import { DraftEditor } from "./draft-editor";

export const metadata: Metadata = {
  title: "Write a guide",
  robots: { index: false, follow: false },
};

export default async function DraftPage(props: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ edit?: string; new?: string }>;
}) {
  const searchParams = await props.searchParams;
  const editPath = searchParams.edit ?? null;
  const mode = editPath ? "edit" : "new";

  return (
    <DraftEditor
      mode={mode}
      initialCategory={searchParams.new ?? null}
      editPath={editPath}
    />
  );
}
