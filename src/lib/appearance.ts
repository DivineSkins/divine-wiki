// Appearance preferences (Style / Font / reading Width) live as a class or
// data attribute on <html>, persisted in localStorage. Three places apply
// them and must stay in sync:
//   1. The pre-paint inline script in src/app/[lang]/layout.tsx (first load,
//      before hydration — a serialized copy of applyStoredAppearance).
//   2. ApplyAppearance (src/components/apply-appearance.tsx), which re-runs
//      applyStoredAppearance after the [lang] segment remounts on a language
//      change (React resets <html> attributes on that remount).
//   3. AppearanceSettings (src/components/appearance-settings.tsx), which
//      writes the values when the visitor changes them.

export const STYLE_STORAGE_KEY = "divine-style";
export const FONT_STORAGE_KEY = "divine-font";
export const READING_WIDTH_STORAGE_KEY = "divine-reading-width";

export const MINIMAL_CLASS = "minimal";
export const CENTERED_CLASS = "centered-reading";

export const FONT_IDS = [
  "inter",
  "geist",
  "lora",
  "atkinson",
  "system",
] as const;
export type FontId = (typeof FONT_IDS)[number];

/**
 * Apply the persisted appearance preferences to <html>. Also re-asserts the
 * next-themes class: after a locale-change remount React briefly restores the
 * server-rendered "dark" class, and next-themes only fixes it in a passive
 * effect — re-applying here (inside a layout effect) avoids the flash.
 */
export function applyStoredAppearance() {
  const root = document.documentElement;
  try {
    const classes = root.classList;
    classes.toggle(
      CENTERED_CLASS,
      localStorage.getItem(READING_WIDTH_STORAGE_KEY) !== "wide",
    );
    classes.toggle(
      MINIMAL_CLASS,
      localStorage.getItem(STYLE_STORAGE_KEY) === "minimal",
    );

    const font = localStorage.getItem(FONT_STORAGE_KEY);
    if (font && font !== "inter" && FONT_IDS.includes(font as FontId)) {
      root.setAttribute("data-font", font);
    } else {
      root.removeAttribute("data-font");
    }

    // Mirror next-themes' resolution (storageKey "theme", default "system",
    // attribute "class") — see RootProvider in src/app/[lang]/layout.tsx.
    const stored = localStorage.getItem("theme");
    const resolved =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    classes.remove("light", "dark");
    classes.add(resolved);
    root.style.colorScheme = resolved;
  } catch {
    // localStorage can be unavailable (private mode); defaults still apply.
  }
}
