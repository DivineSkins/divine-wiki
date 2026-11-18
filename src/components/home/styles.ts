/** The package's panel surface, for blocks that aren't a Card. */
export const PANEL_FILL = "bg-divine-panel";
export const PANEL_BORDER = "border border-divine-border-faint";

/**
 * Navbar text link: muted, brightens on hover with a faint pill behind it.
 * The site never underlines nav items. Used by the homepage header and the
 * /draft editor's top bar.
 */
export const NAV_LINK =
  "text-divine-text-muted hover:text-divine-text inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold no-underline transition-colors duration-200 hover:bg-white/5 light:hover:bg-black/5";

/**
 * Hover label above an icon (the Ask AI circles), in the package Tooltip's
 * look but CSS-only, so those links need no client JS. Hidden until the
 * trigger, a `group/<name>`, adds `group-hover/<name>:opacity-100` (and the
 * focus-visible twin). Callers place it horizontally (`left-1/2
 * -translate-x-1/2`, `left-0`, `right-0`).
 */
export const TOOLTIP_CHIP =
  "pointer-events-none absolute bottom-full z-20 mb-2 rounded-lg bg-divine-tooltip px-3 py-1.5 text-xs leading-[18px] font-medium whitespace-nowrap text-divine-text opacity-0 shadow-divine-panel transition-opacity duration-150";
