"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTheme } from "next-themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "fumadocs-ui/components/ui/popover";
import { SettingsIcon, ChevronDownIcon, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  STYLE_STORAGE_KEY,
  FONT_STORAGE_KEY,
  READING_WIDTH_STORAGE_KEY,
  MINIMAL_CLASS,
  CENTERED_CLASS,
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
  width: string;
  widthWide: string;
  widthCentered: string;
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

/** One setting: the site's 11px uppercase eyebrow over a full-width
 *  control, so every row lines up edge to edge. */
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="light:text-fd-muted-foreground text-[11px] tracking-[0.18em] text-[#8B8D98]/70 uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  groupLabel,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
  groupLabel: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={groupLabel}
      className="light:border-fd-border light:bg-fd-secondary grid w-full auto-cols-fr grid-flow-col gap-0.5 rounded-full border border-[#191722] bg-[#121119] p-0.5"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "h-7 rounded-full px-2 text-xs font-bold transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-[rgba(120,60,181,0.5)] focus-visible:outline-none",
            value === option.value
              ? "light:bg-fd-primary light:text-fd-primary-foreground light:shadow-none bg-[#783CB5] text-white shadow-[inset_0px_1px_1px_0px_rgba(255,255,255,0.35)]"
              : "light:text-fd-muted-foreground light:hover:text-fd-foreground text-[#8B8D98] hover:text-[#E4E4E7]",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// The sidebar-footer trigger: a square tile beside the Discord and GitHub
// icon links. The homepage header passes its own circle instead.
const SIDEBAR_TRIGGER_CLASS =
  "light:border-fd-border light:bg-fd-secondary light:text-fd-muted-foreground light:hover:text-fd-accent-foreground inline-flex size-10 items-center justify-center rounded-lg border border-[#191722] bg-[#121119] text-[#E4E4E7] transition-colors duration-200 hover:bg-[#1A1922] focus-visible:ring-1 focus-visible:ring-[rgba(120,60,181,0.5)] focus-visible:outline-none";

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
  // sync once after hydration (same pattern the reading-width toggle
  // used). `mounted` gates the Mode row to avoid a hydration mismatch
  // from next-themes.
  const [mounted, setMounted] = useState(false);
  const [style, setStyle] = useState<"divine" | "minimal">("divine");
  const [font, setFont] = useState<FontId>("inter");
  // Centered is the default reading width (see the pre-paint script in
  // src/app/[lang]/layout.tsx); the effect below reconciles with the actual
  // <html> class on mount, so visitors who chose "wide" still sync correctly.
  const [centered, setCentered] = useState(true);

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
    setCentered(root.classList.contains(CENTERED_CLASS));
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

  function applyWidth(next: boolean) {
    setCentered(next);
    document.documentElement.classList.toggle(CENTERED_CLASS, next);
    persist(READING_WIDTH_STORAGE_KEY, next ? "centered" : "wide");
  }

  return (
    <Popover>
      <PopoverTrigger aria-label={labels.trigger} className={triggerClassName}>
        <SettingsIcon className="size-4" aria-hidden />
      </PopoverTrigger>
      <PopoverContent align={align} className="flex w-60 flex-col gap-4 p-3.5!">
        <Row label={labels.mode}>
          {mounted ? (
            <Segmented
              groupLabel={labels.mode}
              value={(theme ?? "system") as "light" | "dark" | "system"}
              onChange={setTheme}
              options={[
                { value: "light", label: labels.modeLight },
                { value: "dark", label: labels.modeDark },
                { value: "system", label: labels.modeSystem },
              ]}
            />
          ) : null}
        </Row>
        <Row label={labels.style}>
          <Segmented
            groupLabel={labels.style}
            value={style}
            onChange={applyStyle}
            options={[
              { value: "divine", label: labels.styleDivine },
              { value: "minimal", label: labels.styleMinimal },
            ]}
          />
        </Row>
        <Row label={labels.width}>
          <Segmented
            groupLabel={labels.width}
            value={centered ? "centered" : "wide"}
            onChange={(next) => applyWidth(next === "centered")}
            options={[
              { value: "wide", label: labels.widthWide },
              { value: "centered", label: labels.widthCentered },
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
 * Font picker. A custom list instead of a native <select>, whose open menu
 * the browser draws in OS styling. Same panel as the wiki's other
 * dropdowns: #121119 on a #191722 hairline, 12px radius, 14px rows on
 * #1A1922 hover, the current font in lilac with a check. Each row and the
 * trigger preview their own typeface.
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
      <PopoverTrigger
        aria-label={label}
        style={{ fontFamily: current?.family }}
        className="light:border-fd-border light:bg-fd-secondary light:text-fd-foreground flex h-9 w-full items-center justify-between rounded-lg border border-[#191722] bg-[#121119] pr-2.5 pl-3 text-[13px] font-semibold text-[#E4E4E7] transition-colors duration-200 hover:bg-[#1A1922] focus-visible:border-[#25222F] focus-visible:outline-none data-[state=open]:bg-[#1A1922]"
      >
        {current?.label || systemLabel}
        <ChevronDownIcon
          className={cn(
            "light:text-fd-muted-foreground size-3.5 text-[#8B8D98] transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="divine-font-list flex w-(--radix-popover-trigger-width) min-w-0 flex-col gap-0.5"
      >
        {FONT_OPTIONS.map((option) => {
          const selected = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => {
                onChange(option.id);
                setOpen(false);
              }}
              style={{ fontFamily: option.family }}
              className={cn(
                "flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-[14px] transition-colors duration-150",
                selected
                  ? "light:bg-fd-accent light:text-fd-foreground bg-[#1A1922] font-semibold text-[#C084FC]"
                  : "light:text-fd-foreground light:hover:bg-fd-accent text-[#E4E4E7] hover:bg-[#1A1922]",
              )}
            >
              {option.label || systemLabel}
              {selected ? <CheckIcon className="size-4" aria-hidden /> : null}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
