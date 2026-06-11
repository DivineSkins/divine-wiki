import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type * as PageTree from "fumadocs-core/page-tree";
import { source } from "@/lib/source";
import { baseOptions } from "@/lib/layout.shared";
import { localizePageTree } from "@/lib/tree-localization";
import { getMessages } from "@/lib/locale";
import { ReadingWidthToggle } from "@/components/reading-width-toggle";
import { SidebarSeparatorWithContribute } from "@/components/sidebar-contribute";
import { SiteFooter } from "@/components/site-footer";
import { contributeSidebarNodeId, githubRepoUrl } from "@/lib/config";

/**
 * Appends the Contribute sentinel node after the last item of every list the
 * sidebar can render: the top level, and the children of each `root: true`
 * folder (game segments) — fumadocs swaps the visible tree to the active
 * root's children, so the sentinel has to exist in both places. The sidebar's
 * Separator renderer turns it into the Contribute button
 * (see src/components/sidebar-contribute.tsx).
 */
function appendContributeNode(root: PageTree.Root): PageTree.Root {
  const sentinel: PageTree.Separator = {
    type: "separator",
    $id: contributeSidebarNodeId,
  };
  const mapNodes = (nodes: PageTree.Node[]): PageTree.Node[] =>
    nodes.map((node) =>
      node.type === "folder"
        ? {
            ...node,
            children: node.root
              ? [...mapNodes(node.children), sentinel]
              : mapNodes(node.children),
          }
        : node,
    );
  return { ...root, children: [...mapNodes(root.children), sentinel] };
}

export default async function Layout({
  params,
  children,
}: LayoutProps<"/[lang]/docs">) {
  const { lang } = await params;
  // Non-English locales fall back to the English page tree until Crowdin
  // lands translated content. `source.pageTree[lang]` can be undefined for
  // locales with no content dir yet.
  const rawTree = source.pageTree[lang] ?? source.pageTree["en"];
  const tree = appendContributeNode(
    localizePageTree(rawTree, lang, {
      translateName: true,
      translateTitle: true,
      translateIndex: false,
      translateChildren: true,
    }),
  );
  const messages = getMessages(lang);

  return (
    // `--fd-layout-width` is the cap fumadocs uses for the whole docs grid
    // (sidebar | content | TOC). Its default (97rem ≈ 1552px) leaves the
    // content in a narrow centered column on large monitors with the TOC
    // floating far to its right. Widening it lets the grid fill the viewport:
    // sidebar pinned left, TOC pinned right, content filling the middle.
    // Set here (an ancestor of fumadocs' grid) so it covers every docs page
    // including the landing — no per-page `:root` override needed.
    <div className="flex min-h-screen flex-col [--fd-layout-width:2000px]">
      <DocsLayout
        tree={tree}
        {...baseOptions(lang, true)}
        githubUrl={githubRepoUrl}
        sidebar={{
          components: { Separator: SidebarSeparatorWithContribute },
          footer: <ReadingWidthToggle label={messages.nav.readingWidth} />,
        }}
      >
        {children}
      </DocsLayout>
      <SiteFooter locale={lang} />
    </div>
  );
}
