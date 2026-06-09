import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "lucide-react";

/**
 * Landing-page portal card — one per wiki category. Glassy Divine
 * surface with a brand icon chip, title, blurb, and a guide count.
 * Lifts + brightens on hover, matching the site's premium card feel.
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
    <Link
      href={href}
      className="group divine-cut border-divine-border bg-divine-surface/60 hover:border-divine-primary/50 hover:bg-divine-surface relative flex flex-col gap-3 rounded-none border p-5 no-underline backdrop-blur transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3">
        <span className="bg-divine-primary/15 text-divine-primary-light ring-divine-primary/10 inline-flex size-10 shrink-0 items-center justify-center rounded-none ring-1 transition-colors group-hover:bg-divine-primary/25">
          {icon}
        </span>
        <h3 className="text-divine-text font-[var(--font-section)] text-base leading-tight font-semibold">
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
        <ArrowRightIcon className="text-divine-text-muted group-hover:text-divine-primary-light size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
