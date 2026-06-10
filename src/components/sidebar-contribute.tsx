"use client";

import type * as PageTree from "fumadocs-core/page-tree";
import { SidebarSeparator } from "fumadocs-ui/components/sidebar/base";
import { ContributeButton } from "@/components/contribute-picker";
import { contributeSidebarNodeId } from "@/lib/config";

/**
 * Separator renderer for the docs sidebar page tree. The docs layout appends
 * a sentinel separator node (`$id` = contributeSidebarNodeId) after the last
 * category; this renderer swaps it for the Contribute button so the trigger
 * sits directly under the nav tree instead of in the pinned sidebar footer.
 * Real separators fall through to fumadocs' default rendering.
 */
export function SidebarSeparatorWithContribute({
  item,
}: {
  item: PageTree.Separator;
}) {
  if (item.$id === contributeSidebarNodeId) {
    return <ContributeButton className="mt-4" />;
  }
  return (
    <SidebarSeparator>
      {item.icon}
      {item.name}
    </SidebarSeparator>
  );
}
