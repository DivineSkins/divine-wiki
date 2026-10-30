"use client";

import type * as PageTree from "fumadocs-core/page-tree";
import { SidebarSeparator } from "fumadocs-ui/components/sidebar/base";
import { ContributeButton } from "@/components/contribute-picker";
import { contributeSidebarNodeId } from "@/lib/config";

/**
 * Separator renderer for the docs sidebar page tree. The docs layout inserts
 * a sentinel separator node (`$id` = contributeSidebarNodeId) after the last
 * category, above the shared Contributing section; this renderer swaps it for
 * the Add a guide button so the trigger sits in the nav tree instead of in
 * the pinned sidebar footer. Real separators fall through to fumadocs'
 * default rendering.
 */
export function SidebarSeparatorWithContribute({
  item,
}: {
  item: PageTree.Separator;
}) {
  if (item.$id === contributeSidebarNodeId) {
    return <ContributeButton className="divine-sidebar-contribute" />;
  }
  return (
    <SidebarSeparator>
      {item.icon}
      {item.name}
    </SidebarSeparator>
  );
}
