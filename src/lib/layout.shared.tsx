import Image from "next/image";
import { BookIcon } from "lucide-react";
import { DiscordLogo } from "@/components/brand-logos";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { discordInviteUrl } from "@/lib/config";
import { getMessages } from "./locale";
import { ContributeButton } from "@/components/contribute-picker";
import { AppearanceSettings } from "@/components/appearance-settings";

export function baseOptions(
  locale: string,
  docsLayout?: boolean,
): BaseLayoutProps {
  const messages = getMessages(locale);

  const options: BaseLayoutProps = {
    // Just toggles the language selector. Don't pass the i18n config object:
    // fumadocs-core 16.10 attaches a translations() method to it, which can't
    // cross the server-to-client boundary (locales come from RootProvider).
    i18n: true,
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
      url: `/${locale}/`,
    },
    // The appearance popover's Mode row replaces fumadocs' ThemeToggle.
    themeSwitch: { enabled: false },
  };

  // On docs pages the sidebar footer (see src/app/[lang]/docs/layout.tsx)
  // renders its own flat icon row (Discord, GitHub, appearance gear), so no
  // nav icon links — they'd produce fumadocs' boxed icon strip on top of it.
  if (docsLayout) {
    options.links = [];
  } else {
    options.links = [
      {
        icon: <BookIcon />,
        text: messages.nav.documentation,
        url: `/${locale}/docs`,
        active: "nested-url",
      },
      {
        type: "custom",
        children: <ContributeButton />,
      },
      {
        icon: <DiscordLogo className="size-4" />,
        text: messages.nav.discord,
        url: discordInviteUrl,
      },
      {
        type: "custom",
        children: <AppearanceSettings labels={messages.settings} />,
      },
    ];
  }

  return options;
}
