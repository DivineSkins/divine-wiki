"use client";

import { ReactNode, type CSSProperties } from "react";
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
  border: string;
  background: string;
}

// The divineskins.gg markdown callout palette (markdown.css): NOTE purple,
// TIP green, IMPORTANT gold, WARNING yellow, CAUTION red. Each tone is an
// accent for the title plus a tinted hairline and wash.
const NOTE: Tone = {
  accent: "#c084fc",
  border: "rgba(192, 132, 252, 0.3)",
  background: "rgba(120, 60, 181, 0.09)",
};
const TIP: Tone = {
  accent: "#4ade80",
  border: "rgba(34, 197, 94, 0.28)",
  background: "rgba(34, 197, 94, 0.075)",
};
const IMPORTANT: Tone = {
  accent: "#ecb96a",
  border: "rgba(236, 185, 106, 0.28)",
  background: "rgba(236, 185, 106, 0.075)",
};
const WARNING: Tone = {
  accent: "#facc15",
  border: "rgba(250, 204, 21, 0.28)",
  background: "rgba(250, 204, 21, 0.07)",
};
const CAUTION: Tone = {
  accent: "#f87171",
  border: "rgba(239, 68, 68, 0.3)",
  background: "rgba(239, 68, 68, 0.075)",
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
 * Note panel, 1:1 with the divineskins.gg markdown callout: 8px radius,
 * tinted hairline and wash, and a bold title in the accent color led by
 * a small dot.
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

  return (
    <div
      role="note"
      className="divine-callout my-7 rounded-[8px] border px-[1.125rem] py-4"
      style={
        {
          "--callout-accent": tone.accent,
          "--callout-border": tone.border,
          "--callout-background": tone.background,
        } as CSSProperties
      }
    >
      <div className="divine-callout-title mb-2.5 flex items-center gap-2.5 text-[0.86em] font-bold tracking-[0.01em]">
        <span aria-hidden className="size-2 shrink-0 rounded-full bg-current" />
        {displayTitle}
      </div>
      <div className="text-divine-text [&>:first-child]:mt-0 [&>:last-child]:mb-0">
        {children}
      </div>
    </div>
  );
}
