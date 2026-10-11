"use client";

import { ReactNode, type CSSProperties } from "react";
import {
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { useMessages } from "@/lib/hooks/useMessages";

interface CalloutProps {
  type?:
    | "info"
    | "warning"
    | "danger"
    | "success"
    | "lvl_beginner"
    | "lvl_intermediate"
    | "lvl_advanced";
  title?: string;
  children: ReactNode;
}

interface Tone {
  accent: string;
  /** Glyph gradient id suffix (src/components/icon-gradients.tsx). */
  gradient: string;
  /** IconTile tone from divineskins.gg (icon-tile.tsx `tone`). */
  icon: string;
  border: string;
  background: string;
}

// The divineskins.gg markdown callout palette (markdown.css): NOTE purple,
// TIP green, IMPORTANT gold, WARNING yellow, CAUTION red. Each tone is an
// accent for the title plus a tinted hairline and wash.
const NOTE: Tone = {
  gradient: "brand",
  icon: "#ab69ef",
  accent: "#c084fc",
  border: "rgba(192, 132, 252, 0.3)",
  background: "rgba(120, 60, 181, 0.09)",
};
const TIP: Tone = {
  gradient: "success",
  icon: "#22c55e",
  accent: "#4ade80",
  border: "rgba(34, 197, 94, 0.28)",
  background: "rgba(34, 197, 94, 0.075)",
};
const IMPORTANT: Tone = {
  gradient: "gold",
  icon: "#ecb96a",
  accent: "#ecb96a",
  border: "rgba(236, 185, 106, 0.28)",
  background: "rgba(236, 185, 106, 0.075)",
};
const WARNING: Tone = {
  gradient: "warning",
  icon: "#facc15",
  accent: "#facc15",
  border: "rgba(250, 204, 21, 0.28)",
  background: "rgba(250, 204, 21, 0.07)",
};
const CAUTION: Tone = {
  gradient: "danger",
  icon: "#ef4444",
  accent: "#f87171",
  border: "rgba(239, 68, 68, 0.3)",
  background: "rgba(239, 68, 68, 0.075)",
};

const icons: Record<NonNullable<CalloutProps["type"]>, LucideIcon> = {
  info: Info,
  warning: AlertTriangle,
  danger: XCircle,
  success: CheckCircle,
  lvl_beginner: GraduationCap,
  lvl_intermediate: GraduationCap,
  lvl_advanced: GraduationCap,
};

const tones: Record<NonNullable<CalloutProps["type"]>, Tone> = {
  info: NOTE,
  warning: WARNING,
  danger: CAUTION,
  success: TIP,
  lvl_beginner: TIP,
  lvl_intermediate: IMPORTANT,
  lvl_advanced: NOTE,
};

/**
 * Note panel on the divineskins.gg markdown callout palette. The body is
 * the wiki's neutral card (#121119 on #191722); color carries meaning
 * only: a straight full-height 2px accent bar as the left edge (left
 * corners square), the type's icon in the site's IconTile (40px raised
 * square, #2A2638 → #191722, #17161C hairline, glyph in the IconTile
 * tone color), and a 14px semibold accent title centered on the tile, with the body
 * text running below it (the tile stays at the top for long callouts).
 */
export function Callout({ type = "info", title, children }: CalloutProps) {
  const messages = useMessages();

  const defaultTitles = {
    info: messages.callout.defaultTitles.info,
    warning: messages.callout.defaultTitles.warning,
    danger: messages.callout.defaultTitles.danger,
    success: messages.callout.defaultTitles.success,
    lvl_beginner: messages.callout.defaultTitles.lvl_beginner,
    lvl_intermediate: messages.callout.defaultTitles.lvl_intermediate,
    lvl_advanced: messages.callout.defaultTitles.lvl_advanced,
  };

  const tone = tones[type];
  if (!tone) {
    throw new Error(`Invalid callout type: ${type}`);
  }
  const displayTitle = title || defaultTitles[type];

  const Icon = icons[type];

  return (
    <div
      role="note"
      className="divine-callout relative my-7 flex items-start gap-4 rounded-[8px] border px-5 py-4"
      style={
        {
          "--callout-accent": tone.accent,
          "--callout-border": tone.border,
          "--callout-background": tone.background,
          "--callout-icon": tone.icon,
        } as CSSProperties
      }
    >
      <span aria-hidden className="divine-callout-bar absolute w-0.5" />
      <span
        aria-hidden
        className={`divine-callout-icon divine-icon-${tone.gradient} flex size-10 shrink-0 items-center justify-center rounded-[12px] border border-[#17161C] bg-[linear-gradient(180deg,#2A2638_0%,#191722_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] [&_svg]:size-[18px]`}
      >
        <Icon />
      </span>
      <div className="min-w-0 flex-1 pt-2.5">
        <div className="divine-callout-title mb-0.5 text-[14px] leading-5 font-semibold">
          {displayTitle}
        </div>
        <div className="text-divine-text text-[14px] leading-[22px] [&_p]:leading-[22px] [&>:first-child]:mt-0 [&>:last-child]:mb-0">
          {children}
        </div>
      </div>
    </div>
  );
}
