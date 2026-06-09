"use client";

import { useEffect, useState } from "react";
import { FoldHorizontalIcon, UnfoldHorizontalIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reading-width preference for docs pages: full-width (default — the article
 * fills the content column) vs. centered (Obsidian-style capped column).
 * The preference lives as a `centered-reading` class on <html>, set before
 * paint by an inline script in the root layout (same no-flash trick
 * next-themes uses for the theme class), and persisted in localStorage.
 * The CSS that consumes the class is next to the `#nd-page` rules in
 * global.css. Pill styling mirrors fumadocs' ThemeToggle so the two read
 * as one control group in the sidebar footer.
 */

export const READING_WIDTH_STORAGE_KEY = "divine-reading-width";
const HTML_CLASS = "centered-reading";

const ITEM_CLASSES = "size-6.5 rounded-full p-1.5";

export function ReadingWidthToggle({ label }: { label: string }) {
  // Until mounted we don't know the persisted choice (SSR can't read
  // localStorage), so render the default and sync after hydration.
  const [centered, setCentered] = useState(false);

  useEffect(() => {
    setCentered(document.documentElement.classList.contains(HTML_CLASS));
  }, []);

  function apply(next: boolean) {
    setCentered(next);
    document.documentElement.classList.toggle(HTML_CLASS, next);
    try {
      localStorage.setItem(
        READING_WIDTH_STORAGE_KEY,
        next ? "centered" : "wide",
      );
    } catch {
      // Storage can be unavailable (private mode); the toggle still works
      // for the session.
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 pt-2">
      <span className="text-fd-muted-foreground text-xs">{label}</span>
      <button
        type="button"
        aria-label={label}
        aria-pressed={centered}
        onClick={() => apply(!centered)}
        className="inline-flex items-center rounded-full border p-1"
      >
        <UnfoldHorizontalIcon
          className={cn(
            ITEM_CLASSES,
            !centered
              ? "bg-fd-accent text-fd-accent-foreground"
              : "text-fd-muted-foreground",
          )}
          aria-hidden
        />
        <FoldHorizontalIcon
          className={cn(
            ITEM_CLASSES,
            centered
              ? "bg-fd-accent text-fd-accent-foreground"
              : "text-fd-muted-foreground",
          )}
          aria-hidden
        />
      </button>
    </div>
  );
}
