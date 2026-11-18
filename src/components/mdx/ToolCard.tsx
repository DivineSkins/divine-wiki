import { Badge } from "@divineskins/ui";
import type { ReactNode } from "react";

import { CardLink } from "@/components/ui/links";

interface ToolCardProps {
  name: string;
  href: string;
  children: ReactNode;
  badge?: string;
  icon?: ReactNode;
}

/**
 * Tool list card — each tool renders as its own row: icon, the name, a
 * pipe separator, and the description trailing, on an interactive Card.
 *
 * The whole row is one anchor, so `children` MUST NOT contain links —
 * a markdown link in the description renders an `<a>` inside this `<a>`,
 * which is invalid HTML and breaks hydration. Reference other tools by
 * name (inline code) and let the row's own href do the navigating.
 */
export function ToolCard({ name, href, children, badge, icon }: ToolCardProps) {
  return (
    <CardLink
      href={href}
      className="group relative my-2 flex items-center gap-3 px-4 py-3 leading-normal"
    >
      {icon ? (
        <span className="text-divine-highlight flex shrink-0 items-center [&_img]:size-[22px] [&_svg]:size-[22px]">
          {icon}
        </span>
      ) : null}
      <span className="text-divine-text group-hover:text-divine-highlight text-[15px] font-bold transition-colors duration-200">
        {name}
      </span>
      <span className="text-divine-border-subtle" aria-hidden>
        |
      </span>
      <span className="text-divine-text-muted flex-1 text-[14px] [&_p]:m-0">
        {children}
      </span>
      {badge ? (
        <Badge caps className="ml-auto">
          {badge}
        </Badge>
      ) : null}
    </CardLink>
  );
}
