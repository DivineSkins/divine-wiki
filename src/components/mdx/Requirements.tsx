import type { ReactNode } from "react";
import { Badge } from "@divineskins/ui";
import { ArrowUpRight } from "lucide-react";

import { resolveIcon } from "@/components/icon";
import { ChipLink } from "@/components/ui/links";

/**
 * "What you need" as a row of chips: one per tool, file, or account the
 * guide expects, with an optional 16px logo first. Chips with an `href` are
 * links; the rest are neutral Badges at the same size and don't react to
 * hover.
 */
export function Requirements({ children }: { children: ReactNode }) {
  return <div className="not-prose my-4 flex flex-wrap gap-2">{children}</div>;
}

interface RequirementProps {
  /** Brand or Lucide icon name, as in `<Icon name>`. */
  icon?: string;
  /** Wiki path or external URL. External links open in a new tab. */
  href?: string;
  /** Short muted aside after the label, e.g. "dev build" or "optional". */
  note?: string;
  children: ReactNode;
}

const CHIP_TEXT = "text-divine-text gap-2 text-[13px]";

export function Requirement({ icon, href, note, children }: RequirementProps) {
  const glyph = icon ? resolveIcon(icon, "size-4") : null;
  const body = (
    <>
      {glyph ? (
        <span className="text-divine-highlight flex shrink-0 items-center [&_img]:size-4 [&_svg]:size-4">
          {glyph}
        </span>
      ) : null}
      <span>{children}</span>
      {note ? (
        <span className="text-divine-text-muted font-normal">{note}</span>
      ) : null}
    </>
  );

  if (!href) {
    return (
      <Badge tone="neutral" className={`h-8 px-3 ${CHIP_TEXT}`}>
        {body}
      </Badge>
    );
  }

  const isExternal = /^https?:\/\//i.test(href);
  return (
    <ChipLink href={href} className={`group ${CHIP_TEXT}`}>
      {body}
      {isExternal ? (
        <ArrowUpRight
          aria-hidden
          className="text-divine-text-muted group-hover:text-divine-highlight transition-colors"
        />
      ) : null}
    </ChipLink>
  );
}
