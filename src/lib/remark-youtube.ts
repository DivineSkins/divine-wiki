import { visit } from "unist-util-visit";
import { toString as mdastToString } from "mdast-util-to-string";
import type { Root, Paragraph, Link, Text, RootContent } from "mdast";

interface YouTubeInfo {
  id: string;
  start?: number;
  list?: string;
}

const YT_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
]);

function parseStart(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const simple = /^(\d+)s?$/.exec(raw);
  if (simple) return Number(simple[1]);
  const hms = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(raw);
  if (!hms) return undefined;
  const [, h, m, s] = hms;
  const total = +(h ?? 0) * 3600 + +(m ?? 0) * 60 + +(s ?? 0);
  return total > 0 ? total : undefined;
}

function parseYouTubeUrl(raw: string): YouTubeInfo | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (!YT_HOSTS.has(url.hostname)) return null;

  let id: string | null = null;
  if (url.hostname === "youtu.be") {
    id = url.pathname.replace(/^\/+/, "").split("/")[0] || null;
  } else if (url.pathname === "/watch") {
    id = url.searchParams.get("v");
  } else if (url.pathname.startsWith("/embed/")) {
    id = url.pathname.slice("/embed/".length).split("/")[0] || null;
  } else if (url.pathname.startsWith("/shorts/")) {
    id = url.pathname.slice("/shorts/".length).split("/")[0] || null;
  }
  if (!id || !/^[\w-]{6,}$/.test(id)) return null;

  const start = parseStart(
    url.searchParams.get("t") ?? url.searchParams.get("start"),
  );
  const list = url.searchParams.get("list") ?? undefined;
  return { id, start, list: list ?? undefined };
}

type JsxAttribute = {
  type: "mdxJsxAttribute";
  name: string;
  value: string;
};

function buildJsxAttrs(info: YouTubeInfo): JsxAttribute[] {
  // All attribute values are strings so we don't have to hand-build an
  // estree expression node — MDX's compiler needs that for numeric/JS
  // expressions, but string attributes go through untouched. The component
  // coerces `start` back to a number.
  const attrs: JsxAttribute[] = [
    { type: "mdxJsxAttribute", name: "id", value: info.id },
  ];
  if (info.start) {
    attrs.push({
      type: "mdxJsxAttribute",
      name: "start",
      value: String(info.start),
    });
  }
  if (info.list) {
    attrs.push({ type: "mdxJsxAttribute", name: "list", value: info.list });
  }
  return attrs;
}

function makeEmbedNode(info: YouTubeInfo): RootContent {
  return {
    type: "mdxJsxFlowElement",
    name: "YouTube",
    attributes: buildJsxAttrs(info),
    children: [],
  } as unknown as RootContent;
}

function childToEmbedInfo(
  child: Paragraph["children"][number],
): YouTubeInfo | null {
  if (child.type === "link") {
    const link = child as Link;
    const text = mdastToString(link).trim();
    if (text !== link.url.trim()) return null;
    return parseYouTubeUrl(link.url);
  }
  if (child.type === "text") {
    return parseYouTubeUrl((child as Text).value.trim());
  }
  return null;
}

export default function remarkYouTube() {
  return (tree: Root) => {
    visit(tree, "paragraph", (node: Paragraph, index, parent) => {
      if (!parent || index == null) return;
      const kids = node.children;
      if (kids.length === 0) return;

      // Find the first child that is a bare YouTube URL or a YouTube
      // autolink. If there is one, replace this paragraph with:
      //   (optional leading siblings paragraph) + <YouTube/> + (optional trailing siblings paragraph)
      // That way "<URL>\nCaption" markdown (which parses as a single paragraph)
      // still becomes an embed with the caption surviving underneath.
      let hitIndex = -1;
      let info: YouTubeInfo | null = null;
      for (let i = 0; i < kids.length; i++) {
        const candidate = childToEmbedInfo(kids[i]);
        if (candidate) {
          hitIndex = i;
          info = candidate;
          break;
        }
      }
      if (!info || hitIndex < 0) return;

      const before = kids.slice(0, hitIndex);
      const after = kids.slice(hitIndex + 1);

      // Trim whitespace-only break nodes at the seams so we don't leave
      // empty "   " paragraphs around the embed.
      const isBlank = (c: Paragraph["children"][number]) =>
        (c.type === "text" && c.value.trim() === "") || c.type === "break";
      while (before.length && isBlank(before[before.length - 1])) before.pop();
      while (after.length && isBlank(after[0])) after.shift();

      const replacement: RootContent[] = [];
      if (before.length)
        replacement.push({ ...node, children: before } as Paragraph);
      replacement.push(makeEmbedNode(info));
      if (after.length)
        replacement.push({ ...node, children: after } as Paragraph);

      parent.children.splice(index, 1, ...replacement);
      return index + replacement.length;
    });
  };
}
