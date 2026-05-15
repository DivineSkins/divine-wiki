import Link from "next/link";
import {
  BookOpenIcon,
  PencilLineIcon,
  MessageCircleIcon,
  CompassIcon,
  PaintbrushIcon,
  SparklesIcon,
} from "lucide-react";
import { GlowCTA } from "@/components/mdx/GlowCTA";
import { PremiumCard } from "@/components/mdx/PremiumCard";
import { ContributeCtaButton } from "@/components/contribute-picker";
import { getMessages } from "@/lib/locale";
import { discordInviteUrl } from "@/lib/config";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  const messages = getMessages(lang);
  const t = messages.home;

  const textLinkClass =
    "text-divine-text-muted hover:text-divine-primary-light inline-flex items-center gap-2 text-sm no-underline transition-colors";

  return (
    <main className="relative flex flex-1 flex-col">
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(120,60,181,0.22),transparent_60%)]"
        aria-hidden
      />

      <section className="flex flex-col items-center px-6 pt-24 pb-16 text-center md:pt-32 md:pb-20">
        <h1 className="text-divine-text font-manrope max-w-4xl text-4xl leading-[1.05] font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          {renderTitleWithBrandAccent(t.title)}
        </h1>
        <p className="font-manrope text-divine-text-muted mt-6 max-w-2xl text-base font-medium sm:text-lg md:text-xl">
          {t.tagline}
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-3.5">
          <GlowCTA
            href={`/${lang}/docs/lol/guided-walkthrough`}
            variant="primary"
          >
            <BookOpenIcon className="size-4" aria-hidden />
            {t.ctaStart}
          </GlowCTA>
          <GlowCTA href={`/${lang}/docs`} variant="secondary">
            {t.ctaBrowse}
          </GlowCTA>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
          <ContributeCtaButton
            text={t.ctaContribute}
            icon={<PencilLineIcon className="size-4" aria-hidden />}
            className={textLinkClass}
          />
          <Link
            href={discordInviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={textLinkClass}
          >
            <MessageCircleIcon className="size-4" aria-hidden />
            {t.joinDiscord}
          </Link>
        </div>
      </section>

      <hr className="divine-hr mx-auto w-full max-w-5xl opacity-60" />

      <section className="mx-auto w-full max-w-5xl px-6 py-16 md:py-20">
        <div className="mb-8 text-center">
          <h2 className="text-divine-text font-manrope text-2xl font-bold tracking-tight md:text-[26px]">
            {t.tracksHeading}
          </h2>
          <p className="text-divine-text-muted font-manrope mt-2 text-sm">
            {t.tracksSubheading}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <PremiumCard
            href={`/${lang}/docs/lol/guided-walkthrough`}
            title={t.trackWalkthroughTitle}
            icon={<CompassIcon className="size-5" aria-hidden />}
          >
            {t.trackWalkthroughDesc}
          </PremiumCard>
          <PremiumCard
            href={`/${lang}/docs/lol/maya`}
            title={t.trackMayaTitle}
            icon={<PaintbrushIcon className="size-5" aria-hidden />}
          >
            {t.trackMayaDesc}
          </PremiumCard>
          <PremiumCard
            href={`/${lang}/docs/lol/vfx-bins`}
            title={t.trackVfxTitle}
            icon={<SparklesIcon className="size-5" aria-hidden />}
          >
            {t.trackVfxDesc}
          </PremiumCard>
        </div>
      </section>
    </main>
  );
}

/**
 * Splits the title on the brand word so we can wrap it in the divine-gradient-text
 * utility. Falls back gracefully if the brand word isn't present.
 */
function renderTitleWithBrandAccent(title: string) {
  const candidates = ["League of Legends", "Divine Skins", "Divine"];
  for (const word of candidates) {
    const idx = title.indexOf(word);
    if (idx !== -1) {
      return (
        <>
          {title.slice(0, idx)}
          <span className="divine-gradient-text">{word}</span>
          {title.slice(idx + word.length)}
        </>
      );
    }
  }
  return title;
}
