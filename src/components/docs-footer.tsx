"use client";

import type { ReactNode } from "react";
import { CardLink } from "@/components/ui/links";
import { useMessages } from "@/lib/hooks/useMessages";
import { cn } from "@/lib/utils";

interface FooterItem {
  name: ReactNode;
  url: string;
  description?: ReactNode;
}

/**
 * Previous / next guide links, used as the DocsPage `footer` slot (items
 * are computed per page in [[...slug]]/page.tsx). Built from the
 * divineskins.gg card recipe: #121119 on a #191722 hairline, 12px radius,
 * #1A1922 on hover, without the lift. Type follows the site's blog card: an
 * 11px uppercase eyebrow naming the direction, a 16px bold title, and a
 * 14px medium description. The next card aligns to the right edge.
 */
export function DocsFooter({
  items,
}: {
  items?: { previous?: FooterItem; next?: FooterItem };
}) {
  const messages = useMessages();
  const previous = items?.previous;
  const next = items?.next;
  if (!previous && !next) return null;

  return (
    // A lone card spans the full row instead of sitting in half of it.
    <nav
      className={cn("mt-8 grid gap-4", previous && next && "sm:grid-cols-2")}
    >
      {previous ? (
        <FooterCard
          item={previous}
          label={messages.misc.previous}
          direction="previous"
        />
      ) : null}
      {next ? (
        <FooterCard item={next} label={messages.misc.next} direction="next" />
      ) : null}
    </nav>
  );
}

function FooterCard({
  item,
  label,
  direction,
}: {
  item: FooterItem;
  label: string;
  direction: "previous" | "next";
}) {
  return (
    <CardLink
      href={item.url}
      className={cn(
        "group flex flex-col px-5 py-4 leading-normal",
        direction === "next" && "items-end text-right",
      )}
    >
      <span className="text-divine-muted/70 text-[11px] tracking-[0.18em] uppercase">
        {label}
      </span>
      <span className="text-divine-text group-hover:text-divine-highlight mt-1.5 text-[16px] leading-snug font-bold transition-colors duration-200">
        {item.name}
      </span>
      {item.description ? (
        <span className="text-divine-text-muted mt-1 line-clamp-2 text-[14px] leading-normal font-medium">
          {item.description}
        </span>
      ) : null}
    </CardLink>
  );
}
