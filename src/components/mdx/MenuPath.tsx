import { Fragment } from "react";
import { ChevronRight } from "lucide-react";

interface MenuPathProps {
  /** Menu items separated by `>`, e.g. "Asset Browser > Recompile > Full". */
  path: string;
}

/**
 * Inline menu path for steps: each item as a small key chip, chevrons in
 * between. Reads faster than "**Recompile > Full**" and keeps the tool's own
 * labels exact. Chip recipe: #25222F hairline on a white/5 fill (design
 * system §6.4, tool chip), Inter at 13px so it sits in a line of body text.
 */
export function MenuPath({ path }: MenuPathProps) {
  const items = path
    .split(">")
    .map((item) => item.trim())
    .filter(Boolean);
  return (
    <span className="not-prose inline-flex flex-wrap items-center gap-1 align-middle">
      <span aria-hidden className="inline-flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <Fragment key={`${item}-${i}`}>
            {i > 0 ? (
              <ChevronRight
                aria-hidden
                className="text-divine-text-muted size-3.5 shrink-0"
              />
            ) : null}
            <span className="light:border-divine-border light:bg-divine-elevated text-divine-text rounded-md border border-[#25222F] bg-white/5 px-1.5 py-0.5 [font-family:var(--font-ui)] text-[13px] leading-tight font-semibold">
              {item}
            </span>
          </Fragment>
        ))}
      </span>
      <span className="sr-only">{items.join(", then ")}</span>
    </span>
  );
}
