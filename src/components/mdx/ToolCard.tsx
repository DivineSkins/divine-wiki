import { LocalizedLink } from "@/components/localized-link";
import type { ReactNode } from "react";

interface ToolCardProps {
  name: string;
  href: string;
  children: ReactNode;
  badge?: string;
  icon?: ReactNode;
}

/**
 * Tool list card — each tool renders as its own row: icon, the name, a
 * pipe separator, and the description trailing. Uses the divineskins.gg
 * card recipe (#121119 on a #191722 hairline, 12px radius, #1A1922 on
 * hover, no lift), plus a straight 2px accent line on the left:
 * purple, lilac on hover.
 *
 * The whole row is one anchor, so `children` MUST NOT contain links —
 * a markdown link in the description renders an `<a>` inside this `<a>`,
 * which is invalid HTML and breaks hydration. Reference other tools by
 * name (inline code) and let the row's own href do the navigating.
 */
export function ToolCard({ name, href, children, badge, icon }: ToolCardProps) {
  const isExternal = /^https?:\/\//i.test(href);
  const Tag = isExternal ? "a" : LocalizedLink;
  const externalProps = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Tag
      href={href}
      {...externalProps}
      className="not-prose group light:border-divine-border light:bg-divine-surface light:hover:bg-divine-elevated relative my-2 flex items-center gap-3 rounded-xl border border-[#191722] bg-[#121119] px-4 py-3 leading-normal no-underline transition-[background-color,border-color] duration-200 ease-out hover:bg-[#1A1922]"
    >
      {/* Straight accent line, inset from the top and bottom so the card's
          rounded corners never bend it. */}
      <span
        aria-hidden
        className="absolute inset-y-3 left-0 w-0.5 bg-[#783CB5] transition-colors duration-200 group-hover:bg-[#C084FC]"
      />
      {icon ? (
        <span className="text-divine-primary-light flex shrink-0 items-center [&_img]:size-[22px] [&_svg]:size-[22px]">
          {icon}
        </span>
      ) : null}
      <span className="text-divine-text group-hover:text-divine-primary-light text-[15px] font-bold transition-colors duration-200">
        {name}
      </span>
      <span className="light:text-divine-border text-[#25222F]" aria-hidden>
        |
      </span>
      <span className="text-divine-text-muted flex-1 text-[14px] [&_p]:m-0">
        {children}
      </span>
      {badge ? (
        <span className="ml-auto inline-flex shrink-0 items-center rounded-full border border-[rgba(120,60,181,0.3)] bg-[rgba(120,60,181,0.15)] px-2 py-0.5 text-[10px] leading-normal font-bold tracking-wider text-[#C084FC] uppercase">
          {badge}
        </span>
      ) : null}
    </Tag>
  );
}
