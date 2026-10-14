import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

import { LocalizedLink } from "@/components/localized-link";
import { resolveIcon } from "@/components/icon";
import { cn } from "@/lib/utils";

/**
 * "What you need" as a row of chips: one per tool, file, or account the
 * guide expects. The chip is the site's link chip (SupportedGames
 * `CHIP_CLASS`: #121119 pill on a #191722 hairline, purple hairline on
 * hover) with an optional 16px logo first. Chips with an `href` are links;
 * the rest are plain labels and don't react to hover.
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

const CHIP =
  "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] leading-tight font-semibold no-underline " +
  "border-[#191722] bg-[#121119] text-divine-text " +
  "light:border-divine-border light:bg-divine-surface [.minimal_&]:border-divine-border";

export function Requirement({ icon, href, note, children }: RequirementProps) {
  const glyph = icon ? resolveIcon(icon, "size-4") : null;
  const body = (
    <>
      {glyph ? (
        <span className="text-divine-primary-light flex shrink-0 items-center [&_img]:size-4 [&_svg]:size-4">
          {glyph}
        </span>
      ) : null}
      <span>{children}</span>
      {note ? (
        <span className="text-divine-text-muted font-normal">{note}</span>
      ) : null}
    </>
  );

  if (!href) return <span className={CHIP}>{body}</span>;

  const isExternal = /^https?:\/\//i.test(href);
  const linkClass = cn(
    CHIP,
    "group transition-[border-color,background-color] duration-200 hover:border-[rgba(120,60,181,0.6)] hover:bg-[#1A1922] light:hover:bg-divine-elevated",
  );
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {body}
        <ArrowUpRight
          aria-hidden
          className="text-divine-text-muted group-hover:text-divine-primary-light size-3.5 shrink-0 transition-colors"
        />
      </a>
    );
  }
  return (
    <LocalizedLink href={href} className={linkClass}>
      {body}
    </LocalizedLink>
  );
}
