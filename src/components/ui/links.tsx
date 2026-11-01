"use client";

import type { ReactNode } from "react";
import { cardVariants, chipVariants, cn } from "@divineskins/ui";

import { LocalizedLink } from "@/components/localized-link";

/**
 * Links with a package look. `cardVariants` and `chipVariants` live in the
 * package's client bundle, so a Server Component can't call them; these render
 * them for ToolCard, PremiumCard and the other server-rendered link cards.
 */

interface LinkProps {
  href: string;
  className?: string;
  children: ReactNode;
}

function linkProps(href: string) {
  return /^https?:\/\//i.test(href)
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
}

function SmartLink({ href, className, children }: LinkProps) {
  const Tag = /^https?:\/\//i.test(href) ? "a" : LocalizedLink;
  return (
    <Tag href={href} {...linkProps(href)} className={className}>
      {children}
    </Tag>
  );
}

/** A clickable Card: its fill brightens on hover. */
export function CardLink({
  padding = "none",
  className,
  ...props
}: LinkProps & {
  padding?: "none" | "sm" | "md" | "lg";
}) {
  return (
    <SmartLink
      {...props}
      className={cn(
        cardVariants({ variant: "interactive", padding }),
        "not-prose hover:bg-divine-surface-raised no-underline",
        className,
      )}
    />
  );
}

/** A Chip that navigates. */
export function ChipLink({ className, ...props }: LinkProps) {
  return (
    <SmartLink
      {...props}
      className={cn(chipVariants({ size: "sm" }), "no-underline", className)}
    />
  );
}
