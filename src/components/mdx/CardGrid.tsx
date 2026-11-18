import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface CardGridProps {
  /** Columns from the `sm` breakpoint up. Phones always get one column. */
  cols?: 2 | 3;
  children: ReactNode;
}

/**
 * Grid for PremiumCards: category sections, "pick a path" choices, and
 * next steps with two or three real options. The same wrapper the League
 * landing page writes by hand (`not-prose grid gap-4 sm:grid-cols-2`), with
 * the cards' own vertical margin zeroed so rows line up.
 */
export function CardGrid({ cols = 2, children }: CardGridProps) {
  return (
    <div
      className={cn(
        "not-prose my-4 grid gap-4 sm:grid-cols-2 [&>*]:my-0",
        cols === 3 && "lg:grid-cols-3",
      )}
    >
      {children}
    </div>
  );
}
