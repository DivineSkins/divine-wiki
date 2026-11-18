"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTheme } from "next-themes";
import {
  buttonVariants,
  cn,
  PickerTrigger,
  Popover,
  PopoverContent,
  PopoverItem,
  PopoverTrigger,
  SegmentedControl,
} from "@divineskins/ui";
import { SettingsIcon } from "lucide-react";

import {
  STYLE_STORAGE_KEY,
  FONT_STORAGE_KEY,
  MINIMAL_CLASS,
  type FontId,
} from "@/lib/appearance";

/**
 * Appearance settings popover: Mode (light/dark/system via next-themes),
 * Style (Divine/Minimal), Font, and reading Width. Style, font, and width
 * live as a class / data attribute on <html>, set before paint by the
 * inline script in src/app/[lang]/layout.tsx and persisted in
 * localStorage — shared keys and apply logic live in src/lib/appearance.ts.
 */

export interface SettingsLabels {
  trigger: string;
  mode: string;
  modeLight: string;
  modeDark: string;
  modeSystem: string;
  style: string;
  styleDivine: string;
  styleMinimal: string;
  font: string;
  fontSystem: string;
}

// Each label renders in its own typeface so the row previews the font.
// fontFamily uses the next/font variables (defined on <html>), which
// include the size-adjusted fallback fonts — never literal family names.
// "system" has an empty label: the localized labels.fontSystem fills it.
const FONT_OPTIONS: { id: FontId; label: string; family: string }[] = [
  // The default id stays "inter" so stored preferences keep working, but
  // the default face is Manrope, the divineskins.gg body font.
  { id: "inter", label: "Manrope", family: "var(--font-manrope), sans-serif" },
  { id: "geist", label: "Geist", family: "var(--font-geist), sans-serif" },
  { id: "lora", label: "Lora", family: "var(--font-lora), serif" },
  {
    // Shortened from "Atkinson Hyperlegible": the native <select> sizes to
    // its widest option, so the full name bloated the whole control.
    id: "atkinson",
    label: "Atkinson",
    family: "var(--font-atkinson), sans-serif",
  },
  { id: "system", label: "", family: "system-ui, sans-serif" },
];

/** One setting: the package's field label over a full-width control, so
 *  every row lines up edge to edge. */
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-divine-body-sm text-divine-text font-bold tracking-tight">
        {label}
      </span>
      {children}
    </div>
  );
}

// The sidebar-footer trigger: a square tile beside the Discord and GitHub
// icon links. The homepage header passes its own circle instead.
const SIDEBAR_TRIGGER_CLASS = cn(
  buttonVariants({ variant: "field" }),
  "size-10 px-0",
);

export function AppearanceSettings({
  labels,
  triggerClassName = SIDEBAR_TRIGGER_CLASS,
  align,
}: {
  labels: SettingsLabels;
  triggerClassName?: string;
  align?: "start" | "center" | "end";
}) {
  const { theme, setTheme } = useTheme();
  // SSR can't read localStorage / the html element; render defaults and
  // sync once after hydration. `mounted` gates the Mode row to avoid a hydration mismatch
  // from next-themes.
  const [mounted, setMounted] = useState(false);
  const [style, setStyle] = useState<"divine" | "minimal">("divine");
  const [font, setFont] = useState<FontId>("inter");

  useEffect(() => {
    const root = document.documentElement;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setStyle(root.classList.contains(MINIMAL_CLASS) ? "minimal" : "divine");
    // Validate against the known options: an unknown data-font value
    // (hand-edited DOM or storage) must not leave the radio list with
    // nothing checked.
    const storedFont = root.getAttribute("data-font");
    setFont(
      FONT_OPTIONS.some((option) => option.id === storedFont)
        ? (storedFont as FontId)
        : "inter",
    );
  }, []);

  function persist(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage can be unavailable (private mode); the setting still
      // applies for the session.
    }
  }

  function applyStyle(next: "divine" | "minimal") {
    setStyle(next);
    document.documentElement.classList.toggle(
      MINIMAL_CLASS,
      next === "minimal",
    );
    persist(STYLE_STORAGE_KEY, next);
  }

  function applyFont(next: FontId) {
    setFont(next);
    if (next === "inter") {
      document.documentElement.removeAttribute("data-font");
    } else {
      document.documentElement.setAttribute("data-font", next);
    }
    persist(FONT_STORAGE_KEY, next);
  }

  return (
    <Popover>
      <PopoverTrigger aria-label={labels.trigger} className={triggerClassName}>
        <SettingsIcon className="size-4" aria-hidden />
      </PopoverTrigger>
      <PopoverContent align={align} className="flex flex-col gap-4 p-4!">
        <Row label={labels.mode}>
          {mounted ? (
            <SegmentedControl
              aria-label={labels.mode}
              className="w-full"
              value={(theme ?? "system") as "light" | "dark" | "system"}
              onValueChange={setTheme}
              options={[
                { value: "light", label: labels.modeLight },
                { value: "dark", label: labels.modeDark },
                { value: "system", label: labels.modeSystem },
              ]}
            />
          ) : null}
        </Row>
        <Row label={labels.style}>
          <SegmentedControl
            aria-label={labels.style}
            className="w-full"
            value={style}
            onValueChange={applyStyle}
            options={[
              { value: "divine", label: labels.styleDivine },
              { value: "minimal", label: labels.styleMinimal },
            ]}
          />
        </Row>
        {/* Font sits last: it's the only non-segmented control, so a
            dropdown reads more naturally at the bottom of the stack than
            wedged between the pill rows. */}
        <Row label={labels.font}>
          <FontSelect
            value={font}
            onChange={applyFont}
            label={labels.font}
            systemLabel={labels.fontSystem}
          />
        </Row>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Font picker: the package's picker, a Popover with a field trigger, because
 * a Select's portal doesn't nest inside this settings Popover. Each row and
 * the trigger preview their own typeface.
 */
function FontSelect({
  value,
  onChange,
  label,
  systemLabel,
}: {
  value: FontId;
  onChange: (next: FontId) => void;
  label: string;
  systemLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const current = FONT_OPTIONS.find((option) => option.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <PickerTrigger
          aria-label={label}
          style={{ fontFamily: current?.family }}
          // The package tints a field inside a panel so it shows on the
          // panel's matching fill; its rule only reaches a Select's trigger.
          className="h-9 border-transparent bg-white/[0.04] text-[13px] font-semibold hover:border-transparent hover:bg-white/[0.08] data-[state=open]:bg-white/[0.08]"
        >
          {current?.label || systemLabel}
        </PickerTrigger>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="flex w-(--radix-popover-trigger-width) flex-col gap-0.5"
      >
        {FONT_OPTIONS.map((option) => {
          const selected = option.id === value;
          return (
            <PopoverItem
              key={option.id}
              role="option"
              selected={selected}
              aria-selected={selected}
              onClick={() => {
                onChange(option.id);
                setOpen(false);
              }}
              style={{ fontFamily: option.family }}
            >
              {option.label || systemLabel}
            </PopoverItem>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
