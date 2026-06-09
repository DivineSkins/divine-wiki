"use client";

import { SearchIcon } from "lucide-react";
import { useCallback } from "react";

/**
 * Prominent landing-page search pill. Opens Fumadocs' search dialog by
 * clicking the nav's built-in search trigger (rendered by HomeLayout),
 * falling back to dispatching the ⌘K / Ctrl-K hotkey Fumadocs listens
 * for globally. Either path reuses the same dialog the rest of the wiki
 * uses — no duplicate search UI.
 */
export function HomeSearch({ placeholder }: { placeholder: string }) {
  const openSearch = useCallback(() => {
    const trigger = document.querySelector<HTMLElement>(
      '[data-search-full], button[aria-label="Search" i], button[aria-label*="search" i]',
    );
    if (trigger) {
      trigger.click();
      return;
    }
    // Fallback: synthesise the global search hotkey.
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        code: "KeyK",
        metaKey: true,
        ctrlKey: true,
        bubbles: true,
      }),
    );
  }, []);

  return (
    <button
      type="button"
      onClick={openSearch}
      className="group border-divine-border bg-divine-surface/60 hover:border-divine-primary/50 hover:bg-divine-surface mx-auto flex h-12 w-full max-w-xl items-center gap-3 rounded-full border px-5 backdrop-blur transition-colors"
      aria-label="Search the wiki"
    >
      <SearchIcon className="text-divine-text-muted group-hover:text-divine-primary-light size-4 shrink-0 transition-colors" />
      <span className="text-divine-text-muted flex-1 text-left text-sm">
        {placeholder}
      </span>
      <kbd className="border-divine-border text-divine-text-muted hidden rounded border bg-black/20 px-1.5 py-0.5 text-[10px] font-medium tracking-wide sm:inline">
        ⌘K
      </kbd>
    </button>
  );
}
