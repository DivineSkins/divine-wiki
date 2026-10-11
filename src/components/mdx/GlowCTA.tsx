import { LocalizedLink } from "@/components/localized-link";
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

// Sizes copy the live divineskins.gg buttons: `lg` is the home hero CTA
// (h-11 px-6, 14 → 16px), `md` the navbar pill (h-10 px-6, 15px).
const SIZE_CLASSES: Record<Size, string> = {
  md: "h-10 px-6 text-[15px]",
  lg: "h-11 px-6 text-sm sm:text-base",
};

// Bold body-font labels; focus is a thin lilac ring flush to the edge (the
// white offset ring is the design system's most common off-brand regression).
const BASE_CLASSES =
  "divine-press inline-flex items-center justify-center gap-2 rounded-full " +
  "font-bold whitespace-nowrap no-underline " +
  "outline-none focus-visible:ring-1 focus-visible:ring-[#C084FC] focus-visible:ring-offset-0 " +
  "disabled:opacity-50";

// Design system secondary pill: white/10 tint, no border. Light mode has no
// white tint to lean on, so it falls back to a faint dark tint.
const SECONDARY_CLASSES =
  "bg-white/10 hover:bg-white/20 text-white " +
  "light:bg-black/5 light:hover:bg-black/10 light:text-divine-text";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-[#783CB5] text-white hover:brightness-110",
  // Theme-aware solid fill (unlike `primary`, a hardcoded purple marketing
  // glow). Dark mode: purple fill, white text. Light mode: divine-primary is
  // #8b6914 — a deep amber tuned for TEXT contrast, muddy as a fill — so the
  // fill switches to the brand gold with near-black text, and hover darkens
  // instead of brightens.
  // `divine-cta-solid` is also the hook for two overrides in global.css:
  // the dark Divine style adds the primary CTA bloom + #8b4dd4 hover, and
  // Minimal restyles the fill (the light: pair below turns
  // near-black-on-near-black under Minimal's neutral tokens).
  solid:
    "divine-cta-solid " +
    "bg-divine-primary text-white " +
    "light:bg-divine-primary-light light:text-divine-text " +
    "light:hover:brightness-95",
  secondary: SECONDARY_CLASSES,
  // The design system has no outlined button; ghost is kept as an alias so
  // existing content keeps rendering, and gets the secondary pill.
  ghost: SECONDARY_CLASSES,
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
  const Tag = isExternal ? "a" : LocalizedLink;
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
