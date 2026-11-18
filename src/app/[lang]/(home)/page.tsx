import { ContributorMarquee } from "@/components/home/contributor-marquee";
import { GamePicker } from "@/components/home/game-picker";
import { HeroBackground } from "@/components/home/hero-background";
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
    <div className="relative isolate flex flex-1 flex-col overflow-x-clip">
      <HeroBackground />
      <HeroHeadingFilter />

      <section className="flex flex-col items-center gap-6 px-6 pt-16 text-center md:pt-[109.5px]">
        <h1 className="divine-hero-heading -my-3 w-full max-w-[1023px] bg-clip-text py-3 font-[family-name:var(--font-hero)] text-4xl leading-[1.15] font-bold tracking-[-0.2px] text-balance text-transparent sm:text-5xl sm:leading-[1.15] md:text-[64px] md:leading-[73px]">
          <TitleWithAccent title={t.title} accent={t.titleAccent} />
        </h1>
        <p className="text-divine-muted w-full max-w-[720px] text-base font-medium text-balance sm:text-lg md:text-xl md:leading-7">
          {t.tagline}
        </p>
      </section>

      {/* The game row is the hero's call to action, so it sits right under
          the tagline. Five 178px cards and four 14px gaps fill the 944px, so
          the heading lines up with the first card. Narrower screens scroll the
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
 * The site's hero heading treatment: `.divine-hero-heading` shows its purple
 * gradient through the heading's transparent text, so plain words get a solid
 * color and the accent stays bare. Each locale names its own accent phrase
 * (`home.titleAccent`) since word order moves it; a translation that doesn't
 * contain its accent just renders plain.
 */
function TitleWithAccent({ title, accent }: { title: string; accent: string }) {
  const plain = (text: string) =>
    text ? <span className="text-divine-text">{text}</span> : null;
  const idx = accent ? title.indexOf(accent) : -1;
  if (idx === -1) return plain(title);
  return (
    <>
      {plain(title.slice(0, idx))}
      {accent}
      {plain(title.slice(idx + accent.length))}
    </>
  );
}

/**
 * The heading's inner highlight (white 25%, y 1, blur 1). CSS has no inset
 * text-shadow, so it's an SVG filter: the glyph minus itself shifted 1px down,
 * laid `atop` the text so it stays inside the letters.
 */
function HeroHeadingFilter() {
  return (
    <svg aria-hidden className="pointer-events-none absolute size-0">
      <filter id="hero-heading-inner-shadow" colorInterpolationFilters="sRGB">
        <feOffset in="SourceAlpha" dy="1" />
        <feGaussianBlur stdDeviation="0.5" />
        <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.25 0"
        />
        <feComposite in2="SourceGraphic" operator="atop" />
      </filter>
    </svg>
  );
}
