"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTheme } from "next-themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "fumadocs-ui/components/ui/popover";
import { SettingsIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Appearance settings popover: Mode (light/dark/system via next-themes),
 * Style (Divine/Minimal), Font, and reading Width. Style, font, and width
 * live as a class / data attribute on <html>, set before paint by the
 * inline script in src/app/[lang]/layout.tsx and persisted in
 * localStorage — keep the keys in sync with that script.
 */

export const STYLE_STORAGE_KEY = "divine-style";
export const FONT_STORAGE_KEY = "divine-font";
export const READING_WIDTH_STORAGE_KEY = "divine-reading-width";

const MINIMAL_CLASS = "minimal";
const CENTERED_CLASS = "centered-reading";

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

type FontId = "inter" | "geist" | "lora" | "atkinson" | "system";

// Each label renders in its own typeface so the row previews the font.
// fontFamily uses the next/font variables (defined on <html>), which
// include the size-adjusted fallback fonts — never literal family names.
// "system" has an empty label: the localized labels.fontSystem fills it.
const FONT_OPTIONS: { id: FontId; label: string; family: string }[] = [
  { id: "inter", label: "Inter", family: "var(--font-inter), sans-serif" },
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

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-fd-muted-foreground text-xs">{label}</span>
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
      className="inline-flex items-center rounded-full border p-0.5"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs transition-colors",
            value === option.value
              ? "bg-fd-accent text-fd-accent-foreground font-medium"
              : "text-fd-muted-foreground hover:text-fd-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function AppearanceSettings({ labels }: { labels: SettingsLabels }) {
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
      {/* Plain icon button — styled to sit in a row with the Discord and
          GitHub icon links in the sidebar footer. */}
      <PopoverTrigger
        aria-label={labels.trigger}
        className="text-fd-muted-foreground hover:text-fd-accent-foreground hover:bg-fd-accent inline-flex items-center justify-center rounded-md p-1.5 transition-colors"
      >
        <SettingsIcon className="size-4" aria-hidden />
      </PopoverTrigger>
      <PopoverContent className="flex w-64 flex-col gap-3 p-3">
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
          {/* Native select keeps the row dependency-free. `appearance-none`
              plus our own chevron gives a consistent trigger across OSes;
              the control sizes to its content (right-aligned by the Row)
              instead of stretching. The trigger previews the current font
              via fontFamily; per-option fontFamily styles the open list
              where the browser supports it (desktop Chrome/Firefox). */}
          <div className="relative inline-flex items-center">
            <select
              aria-label={labels.font}
              value={font}
              onChange={(event) => applyFont(event.target.value as FontId)}
              style={{
                fontFamily: FONT_OPTIONS.find((option) => option.id === font)
                  ?.family,
              }}
              className="text-fd-foreground bg-fd-popover appearance-none rounded-full border py-1.5 pr-7 pl-3 text-xs"
            >
              {FONT_OPTIONS.map((option) => (
                <option
                  key={option.id}
                  value={option.id}
                  style={{ fontFamily: option.family }}
                >
                  {option.label || labels.fontSystem}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              className="text-fd-muted-foreground pointer-events-none absolute right-2.5 size-3.5"
              aria-hidden
            />
          </div>
        </Row>
      </PopoverContent>
    </Popover>
  );
}
