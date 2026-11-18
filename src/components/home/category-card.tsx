import type { ReactNode } from "react";
import { IconTile } from "@divineskins/ui";
import { ArrowRightIcon } from "lucide-react";

import { CardLink } from "@/components/ui/links";

/**
 * Landing-page portal card — one per wiki category: an interactive Card with
 * an IconTile, title, blurb, and a guide count.
 */
export function CategoryCard({
  href,
  title,
  description,
  icon,
  count,
}: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  count?: number;
}) {
  return (
    <CardLink
      href={href}
      padding="md"
      className="group relative flex flex-col gap-3"
    >
      <div className="flex items-center gap-3">
        <IconTile size="md" className="divine-icon-brand">
          {icon}
        </IconTile>
        <h3 className="text-divine-text text-base leading-tight font-[var(--font-section)] font-semibold">
          {title}
        </h3>
      </div>

      <p className="text-divine-text-muted line-clamp-2 text-sm leading-relaxed">
        {description}
      </p>

      <div className="mt-auto flex items-center justify-between pt-1">
        {typeof count === "number" && count > 0 ? (
          <span className="text-divine-text-muted/80 text-xs font-medium tabular-nums">
            {count} {count === 1 ? "guide" : "guides"}
          </span>
        ) : (
          <span />
        )}
        <ArrowRightIcon className="text-divine-text-muted group-hover:text-divine-highlight size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
    </CardLink>
  );
}
