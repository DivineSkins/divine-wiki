import {
  Accordions as BaseAccordions,
  Accordion,
} from "fumadocs-ui/components/accordion";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Fumadocs Accordions reskinned to the wiki's flat FAQ rows. The
 * `divine-faq` class hooks the overrides in global.css that replace the
 * boxed card look with hairline dividers and a right-side chevron, the
 * same design the hand-written `<details>` FAQs use. Behavior (deep
 * links, copy-link button, single/multiple) is unchanged.
 */
export function Accordions({
  className,
  ...props
}: ComponentProps<typeof BaseAccordions>) {
  return <BaseAccordions className={cn("divine-faq", className)} {...props} />;
}

export { Accordion };
