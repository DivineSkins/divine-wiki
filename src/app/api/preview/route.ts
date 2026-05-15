import { NextRequest, NextResponse } from "next/server";
import { serialize } from "next-mdx-remote/serialize";
import { previewRemarkPlugins } from "@/lib/draft/mdx-config";

export const dynamic = "force-dynamic";

/**
 * Stateless MDX preview compiler. POST { mdx } → { ok, serialized } on success,
 * or { ok: false, error, line } on a compile error (still HTTP 200, so the
 * client can show the error inline instead of treating it as a network fault).
 * No secrets, no auth, no persistence — same risk class as /api/og.
 */
export async function POST(req: NextRequest) {
  let body: { mdx?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body", line: null },
      { status: 400 },
    );
  }

  const mdx = typeof body.mdx === "string" ? body.mdx : "";

  try {
    const serialized = await serialize(mdx, {
      parseFrontmatter: true,
      mdxOptions: { remarkPlugins: previewRemarkPlugins },
    });
    return NextResponse.json({ ok: true, serialized });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "MDX failed to compile";
    return NextResponse.json({
      ok: false,
      error: message,
      line: extractLine(message),
    });
  }
}

/** MDX compile errors usually embed a `line:column` — pull the line number. */
function extractLine(message: string): number | null {
  const match = message.match(/(\d+):(\d+)/);
  return match ? Number(match[1]) : null;
}
