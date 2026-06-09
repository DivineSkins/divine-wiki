import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "solid" | "secondary" | "ghost";
type Size = "md" | "lg";

interface GlowCTAProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
}

const SIZE_CLASSES: Record<Size, string> = {
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-7 text-base",
};

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-full " +
  "font-[var(--font-ui)] font-bold whitespace-nowrap no-underline " +
  "outline-none focus-visible:ring-2 focus-visible:ring-divine-primary-light/70 focus-visible:ring-offset-2 focus-visible:ring-offset-divine-void";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-[#783CB5] hover:bg-[#8b4dd4] text-white " +
    "transition-[background-color,box-shadow] duration-300",
  // Theme-aware solid fill. `divine-primary` resolves to purple in dark mode
  // and gold in light mode, so this button follows the theme toggle (unlike
  // `primary`, which is a hardcoded purple marketing glow). Subtle tinted
  // lift instead of a heavy glow.
  solid:
    "bg-divine-primary text-white shadow-md shadow-divine-primary/25 " +
    "hover:brightness-110 transition-[filter] duration-200",
  secondary:
    "bg-white/10 hover:bg-white/20 text-white transition-colors duration-200",
  ghost:
    "border border-divine-border bg-transparent text-divine-text " +
    "hover:border-divine-primary/60 hover:text-divine-primary-light " +
    "transition-colors duration-200",
};

const PRIMARY_GLOW: CSSProperties = {
  boxShadow:
    "inset 0px 1px 1px 0px rgba(255,255,255,0.35), " +
    "0px 0px 44px 0px rgba(120,60,181,0.55)",
};

export function GlowCTA({
  href,
  children,
  variant = "primary",
  size = "md",
}: GlowCTAProps) {
  const isExternal = /^https?:\/\//i.test(href);
  const Tag = isExternal ? "a" : Link;
  const externalProps = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  const className = cn(
    BASE_CLASSES,
    SIZE_CLASSES[size],
    VARIANT_CLASSES[variant],
  );
  const style = variant === "primary" ? PRIMARY_GLOW : undefined;

  return (
    <Tag href={href} {...externalProps} className={className} style={style}>
      {children}
    </Tag>
  );
}
