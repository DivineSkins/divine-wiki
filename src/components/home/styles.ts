/**
 * The divineskins.gg panel: #121119 fill on a #191722 hairline. The fill
 * rides --color-fd-card, which global.css already sets per theme (#121119 in
 * Divine dark, the light surface in light mode, neutral grey under Minimal),
 * so only the hairline needs its own light and Minimal fallbacks.
 */
export const PANEL_FILL = "bg-fd-card";
export const PANEL_BORDER =
  "border border-[#191722] light:border-divine-border [.minimal_&]:border-divine-border";
