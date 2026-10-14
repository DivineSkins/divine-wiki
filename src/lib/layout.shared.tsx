import Image from "next/image";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { LanguageSelectText } from "fumadocs-ui/layouts/shared/slots/language-select";
import { GameAwareLanguageSelect } from "@/components/language-select";
import { homePath } from "./i18n";
import { getMessages } from "./locale";

/**
 * Fumadocs layout options for the docs layout. The homepage doesn't use a
 * Fumadocs layout: it has its own header (src/components/site-header.tsx).
 */
export function baseOptions(locale: string): BaseLayoutProps {
  const messages = getMessages(locale);

  const options: BaseLayoutProps = {
    // Just toggles the language selector. Don't pass the i18n config object:
    // fumadocs-core 16.10 attaches a translations() method to it, which can't
    // cross the server-to-client boundary (locales come from RootProvider).
    i18n: true,
    // Stock language picker, except on English-only game segments
    // (ENGLISH_ONLY_GAMES in src/lib/games.ts), where it renders nothing.
    slots: {
      languageSelect: {
        root: GameAwareLanguageSelect,
        text: LanguageSelectText,
      },
    },
    nav: {
      title: (
        <>
          <div className="relative h-9 w-9 lg:h-8 lg:w-8">
            <Image
              alt="Divine Skins"
              src="/brand/logo.webp"
              fill
              sizes="36px"
              priority
            />
          </div>
          <span className="text-base font-[var(--font-hero)] font-bold tracking-tight">
            {messages.nav.title}
          </span>
        </>
      ),
      url: homePath(locale),
    },
    // The appearance popover's Mode row replaces fumadocs' ThemeToggle.
    themeSwitch: { enabled: false },
  };

  // The sidebar footer (see src/app/[lang]/docs/layout.tsx) renders its own
  // flat icon row (Discord, GitHub, appearance gear), so no nav icon links:
  // they'd produce fumadocs' boxed icon strip on top of it.
  options.links = [];

  return options;
}
