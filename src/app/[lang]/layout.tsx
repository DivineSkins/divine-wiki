import { RootProvider } from "fumadocs-ui/provider/next";
import { defineI18nUI } from "fumadocs-ui/i18n";
import { i18n } from "@/lib/i18n";
import englishTranslations from "@/../messages/en.json";
import {
  Manrope,
  Poppins,
  Inter,
  JetBrains_Mono,
  Geist,
  Lora,
  Atkinson_Hyperlegible,
} from "next/font/google";
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

// Picker fonts — preload:false means the @font-face CSS ships but the
// browser only downloads a font when the selected setting actually uses
// it, so visitors who never open the font picker pay ~nothing.
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  preload: false,
});

const lora = Lora({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  preload: false,
});

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-atkinson",
  preload: false,
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

// fumadocs-ui 16.10 takes the per-locale translations map directly.
const { provider } = defineI18nUI(i18n, translations);

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;

  return (
    // The font .variable classes must live on <html>, not <body>: the
    // --font-body / --font-hero promotion vars in global.css are declared at
    // :root/html, and var() substitution inside a custom property happens at
    // the element where it is declared. If the next/font variables were only
    // on <body>, --font-body would compute to guaranteed-invalid on <html>.
    <html
      lang={lang}
      dir="ltr"
      className={cn(
        "dark",
        manrope.variable,
        poppins.variable,
        inter.variable,
        jetbrainsMono.variable,
        geist.variable,
        lora.variable,
        atkinson.variable,
      )}
      suppressHydrationWarning
    >
      <body>
        {/* Apply persisted appearance preferences (reading width, Minimal
            style, font) before first paint — same no-flash trick next-themes
            uses for the theme class. Keys stay in sync with
            src/components/appearance-settings.tsx. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var c=document.documentElement.classList;if(localStorage.getItem("divine-reading-width")==="centered")c.add("centered-reading");if(localStorage.getItem("divine-style")==="minimal")c.add("minimal");var f=localStorage.getItem("divine-font");if(f&&f!=="inter")document.documentElement.setAttribute("data-font",f)}catch(e){}`,
          }}
        />
        <RootProvider i18n={provider(lang)}>
          <ContributePickerProvider>
            {children}
            <ContributePickerModal />
          </ContributePickerProvider>
        </RootProvider>
      </body>
    </html>
  );
}
