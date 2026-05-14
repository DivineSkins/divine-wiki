import Image from "next/image";
import { BookIcon, PencilIcon, MessageCircleIcon } from "lucide-react";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { i18n } from "@/lib/i18n";
import { discordInviteUrl } from "@/lib/config";
import { getMessages } from "./locale";

export function baseOptions(
  locale: string,
  docsLayout?: boolean,
): BaseLayoutProps {
  const messages = getMessages(locale);

  const options: BaseLayoutProps = {
    i18n,
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
    links: [],
  };

  if (!docsLayout) {
    options.links?.push(
      {
        icon: <BookIcon />,
        text: messages.nav.documentation,
        url: `/${locale}/docs`,
        active: "nested-url",
      },
      {
        icon: <PencilIcon />,
        text: messages.nav.contribute,
        url: `/${locale}/draft`,
      },
      {
        icon: <MessageCircleIcon />,
        text: messages.nav.discord,
        url: discordInviteUrl,
      },
    );
  }

  return options;
}
