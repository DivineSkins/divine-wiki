import { PANEL_BORDER, PANEL_FILL } from "@/components/home/styles";
import { glowCtaClassName } from "@/components/mdx/GlowCTA";
import { cn } from "@/lib/utils";

/**
 * Class recipes for the /draft editor, built on the design system's shipped
 * patterns (.claude/skills/divine-ui-design-system). The editor follows the
 * reader's theme like every other page, so every hard-coded dark hex here
 * carries a light (and, where it matters, Minimal) fallback.
 */

/** Bottom hairline of the top bar: the site navbar once scrolled. */
export const HAIRLINE_BOTTOM =
  "border-b border-[#191722] light:border-divine-border [.minimal_&]:border-divine-border";

/** Editor and preview frames: the site panel at card radius. */
export const PANE = `${PANEL_FILL} ${PANEL_BORDER} rounded-xl`;

/** Strip across the top of a pane (toolbar, preview label). */
export const PANE_BAR = "border-b border-fd-border";

// Tool chip (design system 6.4): #25222F hairline on a faint tint.
const CHIP_BASE =
  "inline-flex items-center gap-1.5 rounded-full border border-fd-border bg-white/5 px-2.5 py-1 text-xs font-semibold light:bg-black/[0.03]";

/** A chip that only labels something (the game, the file being edited). */
export const TAG = `${CHIP_BASE} text-divine-text`;

/** A chip that acts: purple hairline on hover (the site's link chip). */
export const CHIP =
  `${CHIP_BASE} text-divine-text-muted transition-colors duration-150 ` +
  "hover:border-divine-primary/60 hover:text-divine-text " +
  "outline-none focus-visible:ring-1 focus-visible:ring-[#C084FC]";

/**
 * Form field shell (design system 6.5): label and control inside one box.
 * Focus turns the border purple, no ring.
 */
export const FIELD =
  "flex h-10 items-center gap-2 rounded-divine-md border border-fd-border bg-fd-card px-3 transition-colors duration-150 " +
  "hover:border-divine-primary/40 focus-within:border-divine-primary";

/** Text inside a FIELD. */
export const FIELD_INPUT =
  "min-w-0 bg-transparent text-sm text-divine-text outline-none placeholder:text-divine-text-muted/60 disabled:opacity-60";

/** Dropdown and hover panels: the header's Guides menu. */
export const POPOVER = `${PANEL_FILL} ${PANEL_BORDER} rounded-xl shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)] light:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)]`;

/** A row in a POPOVER: the Guides menu row (8px radius, #1A1922 hover). */
export const MENU_ROW =
  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-divine-text-muted transition-colors duration-150 " +
  "hover:bg-[#1A1922] hover:text-divine-text light:hover:bg-black/5 [.minimal_&]:hover:bg-white/5 " +
  "outline-none focus-visible:ring-1 focus-visible:ring-[#C084FC]";

/**
 * GlowCTA pill one step under `md` (h-9, 14px): the editor's top bar and
 * the publish dialog, where several actions sit close together.
 */
export function pillClassName(variant: "solid" | "secondary" = "solid") {
  return cn(glowCtaClassName(variant, "md"), "h-9 px-5 text-sm");
}

/** GlowCTA's secondary pill at a compact h-8, for actions inside a panel. */
export const SMALL_PILL =
  "divine-press inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold whitespace-nowrap text-divine-text transition-colors duration-150 " +
  "bg-white/10 hover:bg-white/20 light:bg-black/5 light:hover:bg-black/10 " +
  "outline-none focus-visible:ring-1 focus-visible:ring-[#C084FC]";

/** Lilac text link with no underline (secondary actions). */
export const TEXT_LINK =
  "inline-flex items-center gap-1.5 text-sm font-semibold text-divine-primary-light light:text-divine-primary transition-colors hover:text-divine-text";

/** The site's icon tile (PremiumCard): 44px, dark gradient, lilac glyph. */
export const ICON_TILE =
  "light:border-divine-border light:bg-none light:bg-divine-elevated light:text-divine-primary divine-icon-brand inline-flex size-11 shrink-0 items-center justify-center rounded-[12px] border border-[#17161C] bg-[linear-gradient(180deg,#2A2638_0%,#191722_100%)] text-[#AB69EF] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] [&_svg]:size-5";

/** Eyebrow label (the Eyebrow Exception: tiny, letter-spaced, CSS uppercase). */
export const EYEBROW =
  "text-[10px] font-semibold tracking-[0.16em] text-divine-text-muted uppercase";
