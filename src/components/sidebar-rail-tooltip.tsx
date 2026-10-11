"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Label chips for the collapsed sidebar rail. The rail only shows icons
 * (see the "Sidebar rail" block in global.css), so hovering or focusing
 * one shows its label beside it on the wiki's panel recipe: #121119 on a
 * #191722 hairline, 8px radius, 13px semibold text, an arrow pointing at
 * the icon, and a quick fade. Rendered in a portal because
 * the rail clips its own overflow.
 */

const RAIL = '#nd-sidebar[data-collapsed="true"]';
const TARGETS =
  "a[data-active], button[data-active], [data-search-full], button[aria-haspopup], button[aria-label], a[aria-label], .divine-sidebar-contribute";

interface Chip {
  item: HTMLElement;
  label: string;
  top: number;
  left: number;
}

/** The visible label of a rail item: its own text, else its aria-label. */
function labelOf(el: HTMLElement): string {
  // Game switcher: the selected game's name.
  const title = el.matches("button[aria-haspopup]")
    ? el.querySelector("p")?.textContent?.trim()
    : undefined;
  if (title) return title;
  // Direct text only, so nested hints (Ctrl K) and chevrons are skipped.
  const own = [...el.childNodes]
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent ?? "")
    .join("")
    .trim();
  if (own) return own;
  const span = el.querySelector(":scope > span")?.textContent?.trim();
  if (span) return span;
  const aria = el.getAttribute("aria-label") ?? "";
  // The expand button keeps fumadocs' "Collapse Sidebar" label.
  return aria === "Collapse Sidebar" ? "Expand sidebar" : aria;
}

export function SidebarRailTooltip() {
  const [chip, setChip] = useState<Chip | null>(null);

  useEffect(() => {
    const show = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const item = target?.closest<HTMLElement>(`${RAIL} :is(${TARGETS})`);
      if (!item) return;
      // Focus shows a chip for keyboard users only, not on mouse clicks.
      if (event.type === "focusin" && !item.matches(":focus-visible")) return;
      const label = labelOf(item);
      if (!label) return;
      const rect = item.getBoundingClientRect();
      const rail = item.closest<HTMLElement>(RAIL)?.getBoundingClientRect();
      setChip({
        item,
        label,
        top: rect.top + rect.height / 2,
        left: (rail?.right ?? rect.right) + 8,
      });
    };
    const hide = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const item = target?.closest<HTMLElement>(`${RAIL} :is(${TARGETS})`);
      if (!item) return;
      // Moving between an item's own parts (icon ↔ row) isn't leaving it.
      const next = (event as PointerEvent | FocusEvent)
        .relatedTarget as Node | null;
      if (next && item.contains(next)) return;
      setChip(null);
    };
    const reset = () => setChip(null);

    // Hide as soon as the rail expands or collapses (a click on the expand
    // button keeps focus there, which would otherwise leave the chip up).
    // Watches the whole document so a re-mounted sidebar is covered too.
    const observer = new MutationObserver(reset);
    observer.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-collapsed"],
    });
    document.addEventListener("pointerdown", reset);

    document.addEventListener("pointerover", show);
    document.addEventListener("focusin", show);
    document.addEventListener("pointerout", hide);
    document.addEventListener("focusout", hide);
    window.addEventListener("scroll", reset, true);
    return () => {
      document.removeEventListener("pointerover", show);
      document.removeEventListener("focusin", show);
      document.removeEventListener("pointerout", hide);
      document.removeEventListener("focusout", hide);
      window.removeEventListener("scroll", reset, true);
      document.removeEventListener("pointerdown", reset);
      observer.disconnect();
    };
  }, []);

  // Only while the item is still on screen inside a collapsed rail.
  if (!chip || !chip.item.isConnected || !chip.item.closest(RAIL)) return null;

  return createPortal(
    <div
      role="tooltip"
      key={chip.label + chip.top}
      className="divine-rail-chip pointer-events-none fixed z-50 -translate-y-1/2 rounded-lg border border-[#191722] bg-[#121119] px-2.5 py-1.5 text-[13px] font-semibold whitespace-nowrap text-[#E4E4E7]"
      style={{ top: chip.top, left: chip.left }}
    >
      {/* Arrow pointing back at the icon. */}
      <span
        aria-hidden
        className="absolute top-1/2 -left-[5px] size-2 -translate-y-1/2 rotate-45 border-b border-l border-[#191722] bg-[#121119]"
      />
      {chip.label}
    </div>,
    document.body,
  );
}
