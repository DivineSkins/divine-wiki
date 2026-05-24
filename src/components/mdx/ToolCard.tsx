import Link from "next/link";
import type { ReactNode } from "react";

interface ToolCardProps {
  name: string;
  href: string;
  children: ReactNode;
  badge?: string;
}

/**
 * Tool list card — matches the Divine Academy layout where each tool
 * renders as its own row with a purple-light left rail, the name as a
 * link, a pipe separator, and the description trailing in muted text.
 */
export function ToolCard({ name, href, children, badge }: ToolCardProps) {
  const isExternal = /^https?:\/\//i.test(href);
  const Tag = isExternal ? "a" : Link;
  const externalProps = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Tag
      href={href}
      {...externalProps}
      className="group border-divine-border/60 bg-divine-surface/60 hover:border-divine-primary/40 hover:bg-divine-surface relative my-2 flex items-center gap-3 overflow-hidden rounded-[8px] border px-4 py-3 no-underline transition-all duration-200 hover:shadow-[0_8px_24px_-12px_rgba(120,60,181,0.4)]"
    >
      <span
        aria-hidden
        className="from-divine-primary-light to-divine-primary absolute inset-y-2 left-0 w-[3px] rounded-full bg-gradient-to-b opacity-80 transition-opacity duration-200 group-hover:opacity-100"
      />
      <span className="text-divine-primary-light group-hover:text-divine-text text-[15px] font-[var(--font-poppins),system-ui,sans-serif] font-semibold transition-colors duration-200">
        {name}
      </span>
      <span className="text-divine-text-muted/60" aria-hidden>
        |
      </span>
      <span className="text-divine-text/85 flex-1 text-[14px] font-[var(--font-inter),system-ui,sans-serif]">
        {children}
      </span>
      {badge ? (
        <span className="bg-divine-primary/15 text-divine-primary-light ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-[var(--font-inter),system-ui,sans-serif] font-semibold tracking-wider uppercase">
          {badge}
        </span>
      ) : null}
    </Tag>
  );
}
