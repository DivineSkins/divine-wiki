"use client";

import { ReactNode } from "react";
import { Alert, type AlertTone } from "@divineskins/ui";
import { GraduationCap } from "lucide-react";
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

const tones: Record<NonNullable<CalloutProps["type"]>, AlertTone> = {
  info: "info",
  warning: "warning",
  danger: "danger",
  success: "success",
  lvl_beginner: "success",
  lvl_intermediate: "warning",
  lvl_advanced: "info",
};

/**
 * The package's Alert: a neutral box, with the type only in its icon tile. A
 * callout's body is guide content rather than Alert's one muted line (code,
 * lists, links), so it renders as `children`, at reading size. So does the
 * title: Alert's own is a <p>, and the wiki's prose rules force those.
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

  return (
    <Alert
      role="note"
      tone={tone}
      description=""
      icon={type.startsWith("lvl_") ? <GraduationCap /> : undefined}
      className="divine-callout my-7"
    >
      <div className="text-divine-text text-[13px] leading-[18px] font-bold">
        {title || defaultTitles[type]}
      </div>
      <div className="text-divine-text mt-1 text-[14px] leading-[22px] [&_p]:leading-[22px] [&>:first-child]:mt-0 [&>:last-child]:mb-0">
        {children}
      </div>
    </Alert>
  );
}
