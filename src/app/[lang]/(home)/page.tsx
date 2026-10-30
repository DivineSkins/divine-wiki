import { ContributorMarquee } from "@/components/home/contributor-marquee";
import { GamePicker } from "@/components/home/game-picker";
import { StarField } from "@/components/home/star-field";
import { CONTRIBUTORS } from "@/lib/contributors";
import { listGames } from "@/lib/guide-count";
import { i18n } from "@/lib/i18n";
import { getMessages } from "@/lib/locale";

// Prerender one homepage per locale. Everything on it is known at build time
// (guide counts come from the content), so no request needs a Worker render.
export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}

// Any other first segment (`/foo`) is a 404, not an English homepage
// rendered as `<html lang="foo">`.
export const dynamicParams = false;

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  const t = getMessages(lang).home;

  return (
    <div className="relative isolate flex flex-1 flex-col">
      {/* Hero: stars on the void under a purple wash, like the site's hero.
          It starts under the transparent header, so the wash reaches the top. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-16 -z-10 h-[820px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--color-divine-primary)_24%,transparent),transparent_62%)]"
      >
        <StarField />
      </div>

      <section className="flex flex-col items-center px-6 pt-20 text-center md:pt-28">
        <h1 className="text-divine-text max-w-3xl font-[family-name:var(--font-hero)] text-4xl leading-[1.1] font-bold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-[72px]">
          <TitleWithAccent title={t.title} accent={t.titleAccent} />
        </h1>
        <p className="text-divine-text-muted mt-5 max-w-xl text-base font-medium sm:text-lg">
          {t.tagline}
        </p>
      </section>

      {/* The game row is the hero's call to action, so it sits right under
          the tagline. 944px = five 176px cards and four 16px gaps, so the
          heading lines up with the first card. Narrower screens scroll the
          row instead. Search lives in the header (and ⌘K / Ctrl K). */}
      <section
        aria-labelledby="games-heading"
        className="mx-auto mt-12 w-full max-w-[992px] px-6 md:mt-14"
      >
        <h2
          id="games-heading"
          className="text-divine-text mb-4 font-[family-name:var(--font-hero)] text-lg font-bold tracking-tight md:text-xl"
        >
          {t.gamesHeading}
        </h2>
        <GamePicker games={listGames(lang, t)} comingSoon={t.comingSoon} />
      </section>

      <section
        aria-labelledby="contributors-heading"
        className="mx-auto mt-16 mb-8 w-full max-w-[992px] px-6 md:mt-20"
      >
        <h2
          id="contributors-heading"
          className="text-divine-text font-[family-name:var(--font-hero)] text-lg font-bold tracking-tight md:text-xl"
        >
          {t.contributorsHeading}
        </h2>
        <p className="text-divine-text-muted mt-1 mb-4 text-sm font-medium">
          {t.contributorsTagline}
        </p>
        <ContributorMarquee
          contributors={CONTRIBUTORS}
          lang={lang}
          countLabel={t.contributionCount}
        />
      </section>
    </div>
  );
}

/**
 * Lilac accent on one phrase of the title. Each locale names its own accent
 * phrase (`home.titleAccent`) since word order moves it; a translation that
 * doesn't contain its accent just renders plain.
 */
function TitleWithAccent({ title, accent }: { title: string; accent: string }) {
  const idx = accent ? title.indexOf(accent) : -1;
  if (idx === -1) return title;
  return (
    <>
      {title.slice(0, idx)}
      <span className="divine-gradient-text">{accent}</span>
      {title.slice(idx + accent.length)}
    </>
  );
}
