import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "@/lib/source";
import { baseOptions } from "@/lib/layout.shared";
import { DocsFooter } from "./docs-banner";
import { localizePageTree } from "@/lib/tree-localization";

export default async function Layout({
  params,
  children,
}: LayoutProps<"/[lang]/docs">) {
  const { lang } = await params;
  const tree = localizePageTree(source.pageTree[lang], lang, {
    translateName: true,
    translateTitle: true,
    translateIndex: false,
    translateChildren: true,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <DocsLayout
        tree={tree}
        {...baseOptions(lang, true)}
        githubUrl="https://github.com/DivineSkins/divine-wiki"
      >
        {children}
        <DocsFooter />
      </DocsLayout>
    </div>
  );
}
