import { IconTile } from "@divineskins/ui";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

import { LevelPill } from "@/components/mdx/LevelPill";
import { CardLink } from "@/components/ui/links";

interface PremiumCardProps {
  title: string;
  href: string;
  icon?: ReactNode;
  children?: ReactNode;
  /** No visual effect now; guides still pass it, so it stays accepted. */
  featured?: boolean;
  /** Optional difficulty tag under the title, for guide cards. */
  level?: "beginner" | "intermediate" | "advanced";
}

/** Link card: an interactive Card with the icon in an IconTile. */
export function PremiumCard({
  title,
  href,
  icon,
  children,
  level,
}: PremiumCardProps) {
  return (
    <CardLink
      href={href}
      padding="md"
      className="group relative my-2 block leading-normal"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            {icon ? (
              <IconTile className="divine-icon-brand [&_img]:size-5">
                {icon}
              </IconTile>
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
          className="text-divine-text-muted group-hover:text-divine-highlight mt-0.5 size-4 shrink-0 transition-[color,translate] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden
        />
      </div>
    </CardLink>
  );
}
