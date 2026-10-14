import { type ReactNode } from "react";
import { Metadata } from "next";
import { homePath, i18n } from "@/lib/i18n";
import { listGames } from "@/lib/guide-count";
import { getMessages } from "@/lib/locale";
import {
  LANDING_OG_HEIGHT,
  LANDING_OG_IMAGE,
  LANDING_OG_WIDTH,
  SITE_NAME,
  baseOpenGraph,
  baseTwitter,
  llmAlternateTypes,
} from "@/lib/seo";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const DESCRIPTION =
  "Guides for making custom skins and mods, written by the Divine Skins creator community. Modeling, VFX, animations, and the tools behind them.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  // English is the bare domain. /en still renders the same page (browsers
  // cached the old `/ -> /en` 301), so its canonical points at `/`.
  const languages: Record<string, string> = Object.fromEntries(
    i18n.languages.map((locale) => [locale, homePath(locale)]),
  );
  languages["x-default"] = homePath(i18n.defaultLanguage);

  return {
    title: SITE_NAME,
    description: DESCRIPTION,
    alternates: {
      canonical: homePath(lang),
      languages,
      types: llmAlternateTypes,
    },
    // The site's landing page gets the static branded banner (see seo.ts).
    openGraph: {
      ...baseOpenGraph,
      title: SITE_NAME,
      description: DESCRIPTION,
      url: homePath(lang),
      images: [
        {
          url: LANDING_OG_IMAGE,
          width: LANDING_OG_WIDTH,
          height: LANDING_OG_HEIGHT,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      ...baseTwitter,
      title: SITE_NAME,
      description: DESCRIPTION,
      images: [LANDING_OG_IMAGE],
    },
  };
}

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const { lang } = await params;
  const messages = getMessages(lang);

  return (
    <>
      <SiteHeader
        lang={lang}
        games={listGames(lang, messages.home)}
        labels={{
          guides: messages.nav.documentation,
          search: messages.nav.search,
          language: messages.nav.language,
          menu: messages.nav.menu,
          writeGuide: messages.home.ctaContribute,
          settings: messages.settings,
        }}
      />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter lang={lang} />
    </>
  );
}
