import { Badge, IconTile } from "@divineskins/ui";
import type { ReactNode } from "react";

import { resolveIcon } from "@/components/icon";
import { GlowCTA } from "@/components/mdx/GlowCTA";
import { PANEL_BORDER, PANEL_FILL } from "@/components/home/styles";
import { cn } from "@/lib/utils";

interface ToolHeaderLink {
  label: string;
  href: string;
}

interface ToolHeaderProps {
  name: string;
  /** Brand or Lucide icon name, as in `<Icon name>`. */
  icon?: string;
  /** Small pill after the name: Recommended, Unofficial, Legacy... */
  badge?: string;
  /** Short facts shown as chips: price, license, platforms, version. */
  facts?: string[];
  /** The main download or open link. Rendered as the solid pill. */
  primary?: ToolHeaderLink;
  /** Secondary links (GitHub, docs). Rendered as ghost pills. */
  links?: ToolHeaderLink[];
  /** One or two sentences on what the tool does. */
  children?: ReactNode;
}

/**
 * Summary panel at the top of a tool page: the tool's mark in the site's
 * icon tile, its name and badge, a line on what it does, fact chips, and
 * the download pills. The panel is the site panel (`PANEL_FILL` on
 * `PANEL_BORDER`, 16px radius); the chips use the tool-chip recipe from the
 * design system (§6.4); buttons are GlowCTA (`solid` for the download,
 * `ghost` for the rest).
 */
export function ToolHeader({
  name,
  icon,
  badge,
  facts,
  primary,
  links,
  children,
}: ToolHeaderProps) {
  const glyph = icon ? resolveIcon(icon, "size-7") : null;
  return (
    <div
      className={cn(
        "not-prose my-6 rounded-2xl p-5 sm:p-6",
        PANEL_FILL,
        PANEL_BORDER,
      )}
    >
      <div className="flex items-start gap-4">
        {glyph ? (
          <IconTile
            size="2xl"
            className="divine-icon-brand [&_img]:size-8 [&_svg]:size-7"
          >
            {glyph}
          </IconTile>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-divine-text text-[20px] leading-snug font-bold">
              {name}
            </span>
            {badge ? <Badge caps>{badge}</Badge> : null}
          </div>
          {children ? (
            <div className="text-divine-text-muted [&_a]:text-divine-highlight mt-1.5 text-[14px] leading-relaxed [&_a]:underline [&_p]:m-0">
              {children}
            </div>
          ) : null}
          {facts && facts.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {facts.map((fact) => (
                <Badge key={fact} tone="neutral" size="md" className="text-xs">
                  {fact}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {primary || (links && links.length > 0) ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {primary ? (
            <GlowCTA href={primary.href} variant="solid">
              {primary.label}
            </GlowCTA>
          ) : null}
          {links?.map((link) => (
            <GlowCTA key={link.href} href={link.href} variant="ghost">
              {link.label}
            </GlowCTA>
          ))}
        </div>
      ) : null}
    </div>
  );
}
