import { RootProvider } from "fumadocs-ui/provider/next";
import { defineI18nUI } from "fumadocs-ui/i18n";
import { i18n } from "@/lib/i18n";
import englishTranslations from "@/../messages/en.json";
import { Manrope, Poppins, Inter, JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import { baseUrl } from "@/lib/config";
import { cn } from "@/lib/utils";
import {
  ContributePickerProvider,
  ContributePickerModal,
} from "@/components/contribute-picker";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "600", "700", "800"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  keywords: [
    "league of legends",
    "lol custom skins",
    "league modding",
    "champion mods",
    "fantome files",
    "skin modding tutorial",
    "league of legends vfx",
    "ltmao",
    "cs-lol-manager",
    "divine skins",
    "celestial launcher",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    types: {
      "text/plain": [
        { url: "/llms.txt", title: "LLM-friendly site index" },
        { url: "/llms-full.txt", title: "LLM-friendly full documentation" },
      ],
    },
  },
};

const translations = Object.fromEntries(
  i18n.languages.map((lang) => {
    const messages = require(`@/../messages/${lang}.json`);
    return [
      lang,
      {
        displayName: messages.displayName ?? lang,
        ...(messages.nav?.search && {
          search: messages.nav.search ?? englishTranslations.nav.search,
        }),
      },
    ];
  }),
);

const { provider } = defineI18nUI(i18n, {
  translations,
});

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;

  return (
    <html lang={lang} dir="ltr" className="dark" suppressHydrationWarning>
      <body>
        <div
          className={cn(
            manrope.variable,
            poppins.variable,
            inter.variable,
            jetbrainsMono.variable,
          )}
        >
          <RootProvider i18n={provider(lang)}>
            <ContributePickerProvider>
              {children}
              <ContributePickerModal />
            </ContributePickerProvider>
          </RootProvider>
        </div>
      </body>
    </html>
  );
}
