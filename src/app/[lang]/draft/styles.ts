import {
  badgeVariants,
  buttonVariants,
  cardVariants,
  chipVariants,
  cn,
  iconTileVariants,
  menuItemClassName,
  menuPanelClassName,
  FIELD_CONTROL_CLASS,
} from "@divineskins/ui";

/**
 * Class recipes for the /draft editor, from the package's own variants. The
 * editor is client-only, so these can call them. Its package tokens follow
 * the reader's theme.
 */

/** Bottom hairline of the top bar: the site navbar once scrolled. */
export const HAIRLINE_BOTTOM = "border-b border-divine-border-faint";

/** Editor and preview frames: a Card with no padding. */
export const PANE = cardVariants({ padding: "none" });

/** Strip across the top of a pane (toolbar, preview label). */
export const PANE_BAR = "border-b border-fd-border";

/** A chip that only labels something (the game, the file being edited). */
export const TAG = badgeVariants({ tone: "neutral", size: "md" });

/** A chip that acts. */
export const CHIP = chipVariants({ size: "sm" });

/**
 * Form field shell: label and control inside one box, on the package's field
 * look. Focus turns the border accent.
 */
export const FIELD = cn(
  "flex h-10 items-center gap-2 rounded-xl px-3 transition-colors duration-200 focus-within:border-divine-accent/60",
  FIELD_CONTROL_CLASS,
);

/** Text inside a FIELD. */
export const FIELD_INPUT =
  "min-w-0 bg-transparent text-sm text-divine-text outline-none placeholder:text-divine-muted/60 disabled:opacity-60";

/** Dropdown and hover panels. */
export const POPOVER = menuPanelClassName();

/** A row in a POPOVER. */
export const MENU_ROW = menuItemClassName();

/** A small Button: the editor's top bar and dialog, where actions sit close. */
export function pillClassName(variant: "solid" | "secondary" = "solid") {
  return buttonVariants({
    variant: variant === "solid" ? "primary" : "secondary",
    size: "sm",
  });
}

/** A secondary Button at a compact h-8, for actions inside a panel. */
export const SMALL_PILL = cn(
  buttonVariants({ variant: "secondary", size: "sm" }),
  "h-8 px-3.5 text-xs",
);

/** Highlight text link with no underline (secondary actions). */
export const TEXT_LINK =
  "inline-flex items-center gap-1.5 text-sm font-semibold text-divine-highlight transition-colors hover:text-divine-text";

/** A 44px IconTile with the brand glyph gradient. */
export const ICON_TILE = iconTileVariants({
  size: "lg",
  className: "divine-icon-brand",
});

/** Eyebrow label (the Eyebrow Exception: tiny, letter-spaced, CSS uppercase). */
export const EYEBROW =
  "text-[10px] font-semibold tracking-[0.16em] text-divine-muted uppercase";
