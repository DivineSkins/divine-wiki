"use client";

import { usePathname } from "next/navigation";
import {
  LanguageSelect,
  type LanguageSelectProps,
} from "fumadocs-ui/layouts/shared/slots/language-select";

import { ENGLISH_ONLY_GAMES } from "@/lib/games";

/**
 * Fumadocs' sidebar language picker, left out on pages of an English-only
 * game segment (`ENGLISH_ONLY_GAMES`). Plugged in through the layout's
 * `slots.languageSelect.root` (src/lib/layout.shared.tsx), so everywhere
 * else it is the stock component with the stock styling.
 */
export function GameAwareLanguageSelect(props: LanguageSelectProps) {
  const pathname = usePathname();
  // Docs paths are /{lang}/docs/{game}/...
  const game = pathname.split("/")[3];
  if (game && ENGLISH_ONLY_GAMES.has(game)) return null;
  return <LanguageSelect {...props} />;
}
