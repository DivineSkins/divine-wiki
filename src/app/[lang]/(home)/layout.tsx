import { type ReactNode } from "react";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/lib/layout.shared";
import { SiteFooter } from "@/components/site-footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Divine Skins Wiki",
  description:
    "Community-written guides for creating custom skins for League of Legends — modeling, VFX, animations, and tools used by the Divine Skins creator community.",
};

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const { lang } = await params;
  return (
    <HomeLayout {...baseOptions(lang)} className="flex min-h-screen flex-col">
      {children}
      <SiteFooter locale={lang} />
    </HomeLayout>
  );
}
