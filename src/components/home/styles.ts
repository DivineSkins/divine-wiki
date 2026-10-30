/**
 * The divineskins.gg panel: #121119 fill on a #191722 hairline. The fill
 * rides --color-fd-card, which global.css already sets per theme (#121119 in
 * Divine dark, the light surface in light mode, neutral grey under Minimal),
 * so only the hairline needs its own light and Minimal fallbacks.
 */
export const PANEL_FILL = "bg-fd-card";
export const PANEL_BORDER =
  "border border-[#191722] light:border-divine-border [.minimal_&]:border-divine-border";

/**
 * Navbar text link: muted, brightens on hover with a faint pill behind it.
 * The site never underlines nav items. Used by the homepage header and the
 * /draft editor's top bar.
 */
export const NAV_LINK =
  "text-divine-text-muted hover:text-divine-text inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold no-underline transition-colors duration-200 hover:bg-white/5 light:hover:bg-black/5";

/**
 * Hover label above an icon (the Ask AI circles).
 * The sidebar rail's chip (sidebar-rail-tooltip.tsx) one step up in fill,
 * #25222F on a #363242 hairline, plus a drop shadow, so it still reads where
 * it overlaps a #121119 panel. Hidden until the trigger, a `group/<name>`,
 * adds `group-hover/<name>:opacity-100` (and the focus-visible twin). Callers
 * place it horizontally (`left-1/2 -translate-x-1/2`, `left-0`, `right-0`).
 */
export const TOOLTIP_CHIP =
  "pointer-events-none absolute bottom-full z-20 mb-2 rounded-lg border border-[#363242] bg-[#25222F] px-2.5 py-1.5 text-[13px] leading-none font-semibold whitespace-nowrap text-divine-text opacity-0 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.7)] transition-opacity duration-150 " +
  "light:border-divine-border light:bg-white light:shadow-[0_6px_16px_-6px_rgba(0,0,0,0.25)]";
