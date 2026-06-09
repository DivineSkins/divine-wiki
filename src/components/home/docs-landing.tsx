import Link from "next/link";
import type { ReactNode } from "react";
import {
  PencilLineIcon,
  CompassIcon,
  WrenchIcon,
  ClapperboardIcon,
  SparklesIcon,
  LibraryIcon,
  TriangleAlertIcon,
  ArrowUpRightIcon,
} from "lucide-react";
import { CategoryCard } from "@/components/home/category-card";
import { MayaLogo, BlenderLogo, DiscordLogo } from "@/components/brand-logos";
import { ContributeCtaButton } from "@/components/contribute-picker";
import { getMessages } from "@/lib/locale";
import { discordInviteUrl } from "@/lib/config";
import { source } from "@/lib/source";

/** Category portals shown on the docs landing, in display order. The
 *  `title` is pulled from localized `meta.*` messages; descriptions are
 *  the English landing copy (fine to fall back for partial locales). */
const CATEGORIES: { slug: string; icon: ReactNode; desc: string }[] = [
  {
    slug: "guided-walkthrough",
    icon: <CompassIcon className="size-5" />,
    desc: "Never made a skin? Start here and just follow it top to bottom.",
  },
  {
    slug: "tools",
    icon: <WrenchIcon className="size-5" />,
    desc: "Jade, Flint, Quartz, LtMAO and the rest — what each one actually does.",
  },
  {
    slug: "maya",
    icon: <MayaLogo className="size-[18px]" />,
    desc: "Rigging, skinning, weight painting and getting it into the game.",
  },
  {
    slug: "blender",
    icon: <BlenderLogo className="size-5" />,
    desc: "Same stuff as Maya, just in Blender if that's your thing.",
  },
  {
    slug: "animations",
    icon: <ClapperboardIcon className="size-5" />,
    desc: "Idle loops, recalls, retargeting — all the animation stuff.",
  },
  {
    slug: "vfx-bins",
    icon: <SparklesIcon className="size-5" />,
    desc: "Particles and bin edits without crashing your client every 5 minutes.",
  },
  {
    slug: "assets-library",
    icon: <LibraryIcon className="size-5" />,
    desc: "Rigs, textures, emitters and other stuff you can reuse.",
  },
  {
    slug: "errors",
    icon: <TriangleAlertIcon className="size-5" />,
    desc: "Something broke? Find your error and how to get past it.",
  },
];

/** Quick links to the pages people actually open first. */
const FEATURED = [
  {
    href: "docs/lol/guided-walkthrough/walkthrough",
    label: "Full walkthrough",
  },
  {
    href: "docs/lol/tools/modding-apps/jade",
    label: "Jade — the all-in-one editor",
  },
  {
    href: "docs/lol/animations/animation-retargeting",
    label: "Animation retargeting",
  },
  { href: "docs/lol/maya/rigging-uvs", label: "Rigging & UVs in Maya" },
] as const;

/**
 * The docs-root landing. Rendered in place of an MDX page at
 * `/{lang}/docs` — it keeps the docs sidebar (it lives inside the docs
 * layout) but the route disables the TOC, so it's a clean full-width
 * front door to every guide category.
 */
export function DocsLanding({ lang }: { lang: string }) {
  const messages = getMessages(lang);
  const t = messages.home;
  const metaTitles = messages.meta as Record<string, { title: string }>;

  // Real per-category guide counts off the English page set.
  const pages = source.getPages().filter((p) => p.locale === "en");
  const countFor = (slug: string) =>
    pages.filter(
      (p) => p.slugs[0] === "lol" && p.slugs[1] === slug && p.slugs.length > 2,
    ).length;
  const totalGuides = pages.filter(
    (p) => p.slugs[0] === "lol" && p.slugs.length > 2,
  ).length;

  return (
    <>
      {/* The wide `--fd-layout-width` that lets this landing fill the window
        is set once on the docs layout wrapper (src/app/[lang]/docs/layout.tsx)
        so it applies to every docs page, not just here. */}
      <div className="relative flex w-full flex-col gap-8 px-6 py-8 md:px-10 lg:flex-row lg:gap-10 lg:px-12 xl:px-16">
        {/* ── Main column ── */}
        <div className="min-w-0 flex-1">
          {/* Category portals */}
          <section className="pb-10">
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {CATEGORIES.map((c) => (
                <CategoryCard
                  key={c.slug}
                  href={`/${lang}/docs/lol/${c.slug}`}
                  title={metaTitles?.[c.slug]?.title ?? c.slug}
                  description={c.desc}
                  count={countFor(c.slug)}
                  icon={c.icon}
                />
              ))}
            </div>
          </section>

          {/* Popular guides */}
          <section>
            <h2 className="text-divine-text-muted mb-4 text-xs font-semibold tracking-[0.14em] uppercase">
              {t.featuredHeading ?? "Start with these"}
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {FEATURED.map((f) => (
                <Link
                  key={f.href}
                  href={`/${lang}/${f.href}`}
                  className="group divine-cut border-divine-border/70 bg-divine-surface/40 hover:border-divine-primary/40 hover:bg-divine-surface flex items-center justify-between gap-3 rounded-none border px-4 py-3 no-underline transition-colors"
                >
                  <span className="text-divine-text text-sm font-medium">
                    {f.label}
                  </span>
                  <ArrowUpRightIcon
                    className="text-divine-text-muted group-hover:text-divine-primary-light size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* ── Right rail (runs alongside from the top, sticks on scroll) ── */}
        <aside className="flex w-full shrink-0 flex-col gap-4 lg:sticky lg:top-6 lg:w-80 lg:self-start">
          {/* Featured tool — Jade */}
          <Link
            href={`/${lang}/docs/lol/tools/modding-apps/jade`}
            className="group divine-cut border-divine-primary/45 bg-divine-primary/10 hover:bg-divine-primary/15 hover:border-divine-primary/60 block rounded-none border p-5 no-underline transition-colors duration-200"
          >
            <div className="text-divine-primary-light flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase">
              <SparklesIcon className="size-3.5" aria-hidden />
              Featured tool
            </div>
            <div className="text-divine-text mt-2 text-lg font-[var(--font-section)] font-semibold">
              Jade
            </div>
            <p className="text-divine-text-muted mt-1 text-sm leading-relaxed">
              The all-in-one editor — meshes, textures, animations and physics
              in one app instead of five.
            </p>
            <span className="text-divine-primary-light mt-3 inline-flex items-center gap-1 text-sm font-medium">
              Open the guide
              <ArrowUpRightIcon
                className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </span>
          </Link>

          {/* Community */}
          <div className="divine-cut border-divine-border bg-divine-surface/40 rounded-none border p-5">
            <h3 className="text-divine-text text-base font-[var(--font-section)] font-semibold">
              {t.communityHeading ?? "It's all community-written"}
            </h3>
            <p className="text-divine-text-muted mt-1 text-sm leading-relaxed">
              Every page has an Edit on GitHub button. Something wrong? Fix it.
              Know a thing we don&apos;t? Write it down.
            </p>
            <div className="mt-4 flex flex-col gap-2.5">
              <ContributeCtaButton
                text={t.ctaContribute}
                icon={<PencilLineIcon className="size-4" aria-hidden />}
                className="text-divine-text hover:text-divine-primary-light inline-flex items-center gap-2 text-sm no-underline transition-colors"
              />
              <Link
                href={discordInviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-divine-text hover:text-divine-primary-light inline-flex items-center gap-2 text-sm no-underline transition-colors"
              >
                <DiscordLogo className="size-4" />
                {t.joinDiscord}
              </Link>
            </div>
          </div>

          {/* Stat */}
          <p className="text-divine-text-muted/70 text-center text-xs">
            {totalGuides} guides across {CATEGORIES.length} topics
          </p>
        </aside>
      </div>
    </>
  );
}
