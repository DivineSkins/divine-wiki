"use client";

import { ReactNode } from "react";
import {
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
  GraduationCap,
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

const accent: Record<NonNullable<CalloutProps["type"]>, string> = {
  info: "var(--color-divine-info)",
  warning: "var(--color-divine-warning)",
  danger: "var(--color-divine-error)",
  success: "var(--color-divine-success)",
  lvl_beginner: "var(--color-divine-success)",
  lvl_intermediate: "var(--color-divine-secondary)",
  lvl_advanced: "var(--color-divine-primary-light)",
};

const icons = {
  info: Info,
  warning: AlertTriangle,
  danger: XCircle,
  success: CheckCircle,
  lvl_beginner: GraduationCap,
  lvl_intermediate: GraduationCap,
  lvl_advanced: GraduationCap,
};

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

  const Icon = icons[type];
  const displayTitle = title || defaultTitles[type];

  if (!Icon) {
    throw new Error(`Invalid callout type: ${type}`);
  }

  const tone = accent[type];

  return (
    <div
      className="bg-divine-surface ring-divine-border my-4 rounded-[8px] border-l-4 p-4 ring-1"
      style={{ borderLeftColor: tone }}
    >
      <div className="flex gap-3">
        <Icon
          className="mt-0.5 h-5 w-5 shrink-0"
          style={{ color: tone }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div
            className="text-divine-text mb-1 font-[var(--font-section)] font-semibold"
            style={{ color: tone }}
          >
            {displayTitle}
          </div>
          <div className="text-divine-text/85">{children}</div>
        </div>
      </div>
    </div>
  );
}
