import { LocalizedLink } from "@/components/localized-link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { LevelPill } from "@/components/mdx/LevelPill";

interface PremiumCardProps {
  title: string;
  href: string;
  icon?: ReactNode;
  children?: ReactNode;
  /**
   * Rings the card in brand purple (the site's active hairline,
   * rgba(120,60,181,0.4); no glow) to mark the one card a page wants read
   * first. Use at most once per page.
   */
  featured?: boolean;
  /** Optional difficulty tag under the title, for guide cards. */
  level?: "beginner" | "intermediate" | "advanced";
}

/**
 * Link card in the divineskins.gg card recipe (CatalogSkinCard / blog
 * cards): #121119 panel on a #191722 hairline, 12px radius, #1A1922 on
 * hover. No lift on hover: it overlapped the content above. The icon sits
 * in the site's IconTile: a raised square with a top-to-bottom
 * #2A2638 → #191722 fill, #17161C hairline, faint top highlight, and a
 * lilac (#AB69EF) glyph.
 */
export function PremiumCard({
  title,
  href,
  icon,
  children,
  featured = false,
  level,
}: PremiumCardProps) {
  const isExternal = /^https?:\/\//i.test(href);
  const Tag = isExternal ? "a" : LocalizedLink;
  const externalProps = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Tag
      href={href}
      {...externalProps}
      className={cn(
        "not-prose group light:bg-divine-surface relative my-2 block rounded-xl bg-[#121119] p-5 leading-normal no-underline",
        "light:hover:bg-divine-elevated transition-[background-color,border-color] duration-200 ease-out hover:bg-[#1A1922]",
        featured
          ? "light:border-divine-primary/40 border-2 border-[rgba(120,60,181,0.4)] p-[19px] hover:border-[rgba(120,60,181,0.6)]"
          : "light:border-divine-border border border-[#191722]",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            {icon ? (
              <div className="light:border-divine-border light:bg-none light:bg-divine-elevated light:text-divine-primary divine-icon-brand inline-flex size-11 shrink-0 items-center justify-center rounded-[12px] border border-[#17161C] bg-[linear-gradient(180deg,#2A2638_0%,#191722_100%)] text-[#AB69EF] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] [&_img]:size-5 [&_svg]:size-5">
                {icon}
              </div>
            ) : null}
            <div className="min-w-0">
              <div className="text-divine-text text-[18px] leading-snug font-bold">
                {title}
              </div>
              {level ? (
                <div className="mt-1.5">
                  <LevelPill level={level} size="sm" />
                </div>
              ) : null}
            </div>
          </div>
          {children ? (
            <div className="text-divine-text-muted mt-3 text-[14px] leading-relaxed [&_p]:m-0">
              {children}
            </div>
          ) : null}
        </div>
        <ArrowUpRight
          className="text-divine-text-muted group-hover:text-divine-primary-light mt-0.5 size-4 shrink-0 transition-[color,translate] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden
        />
      </div>
    </Tag>
  );
}
