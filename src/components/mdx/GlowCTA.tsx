import { Button } from "@divineskins/ui";
import { LocalizedLink } from "@/components/localized-link";
import type { ReactNode } from "react";

type Variant = "primary" | "solid" | "secondary" | "ghost";
type Size = "md" | "lg";

interface GlowCTAProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
}

// The content API keeps its older names: `primary` and `solid` are the
// package's primary pill, `secondary` and `ghost` its secondary one.
const BUTTON_VARIANT: Record<Variant, "primary" | "secondary"> = {
  primary: "primary",
  solid: "primary",
  secondary: "secondary",
  ghost: "secondary",
};

export function GlowCTA({
  href,
  children,
  variant = "primary",
  size = "md",
}: GlowCTAProps) {
  const isExternal = /^https?:\/\//i.test(href);
  const Tag = isExternal ? "a" : LocalizedLink;
  const externalProps = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Button
      asChild
      variant={BUTTON_VARIANT[variant]}
      size={size}
      className="not-prose no-underline"
    >
      <Tag href={href} {...externalProps}>
        {children}
      </Tag>
    </Button>
  );
}
