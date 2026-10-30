import { source } from "@/lib/source";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import type { Metadata } from "next";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { localizeHref } from "@/lib/localize-href";
import Link from "next/link";
import { homePath, i18n, ogLanguageBlacklist } from "@/lib/i18n";
import { baseUrl } from "@/lib/config";
import {
  baseOpenGraph,
  baseTwitter,
  llmAlternateTypes,
  LANDING_OG_IMAGE,
  LANDING_OG_WIDTH,
  LANDING_OG_HEIGHT,
  SITE_NAME,
  docsTitle,
} from "@/lib/seo";
import { Separator } from "@/components/ui/separator";
import { DocsLanding } from "@/components/home/docs-landing";
import { GuideCredits } from "@/components/guide-credits";
import { getGuideCredits } from "@/lib/guide-credits";
import { getMessages } from "@/lib/locale";
import { DocsBanner } from "../docs-banner";
import { DocsFooter } from "@/components/docs-footer";
import { AskAI } from "@/components/ask-ai";
import { cn } from "@/lib/utils";
import { findNeighbour } from "fumadocs-core/page-tree";
import { localizePageTree } from "@/lib/tree-localization";

// BreadcrumbList for Google, so results show "Divine Skins Wiki > ... > page"
// instead of a raw URL: the homepage, then every parent folder that has its
// own page, then this page. Parents resolve like the page itself does, so an
// English fallback page lists English parents.
function breadcrumbJsonLd(slugs: string[], lang: string) {
  const crumbs = slugs.flatMap((_, i) => {
    const prefix = slugs.slice(0, i + 1);
    const crumb = source.getPage(prefix, lang) ?? source.getPage(prefix, "en");
    return crumb ? [{ name: crumb.data.title, url: crumb.url }] : [];
  });
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: SITE_NAME, url: homePath(lang) }, ...crumbs].map(
      (crumb, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: crumb.name,
        item: `${baseUrl}${crumb.url}`,
      }),
    ),
  };
}

export default async function Page(
  props: PageProps<"/[lang]/docs/[[...slug]]">,
) {
  const params = await props.params;

  // Docs root (`/{lang}/docs`) gets a custom landing instead of an MDX
  // page. Rendered OUTSIDE DocsPage so it isn't capped by the prose
  // container's max-width — it fills the whole content area to the
  // right (no TOC, no breadcrumb). Sidebar still comes from the layout.
  if (!params.slug || params.slug.length === 0) {
    return <DocsLanding lang={params.lang} />;
  }

  const page =
    source.getPage(params.slug, params.lang) ??
    source.getPage(params.slug, "en");
  if (!page) notFound();

  const messages = require(`@/../messages/${params.lang}.json`);
  // Merged over English, so strings added since a locale's last sync still
  // render (the raw file above has only what that locale translated).
  const ui = getMessages(params.lang);

  const authors = page.data.authors;
  const loadedPageData = await page.data.load();

  const MDX = loadedPageData.body;

  // Relative links resolve against the page (locale-aware via source);
  // absolute internal links get the locale prefixed here, otherwise the
  // edge redirect `/docs/* → /en/docs/*` dumps readers back to English.
  const RelativeLink = createRelativeLink(source, page);
  const MDXLink = (props: React.ComponentProps<"a">) => (
    <RelativeLink {...props} href={localizeHref(props.href, params.lang)} />
  );

  // Previous / next guides for the footer cards, from the same localized
  // tree the sidebar renders (see ../layout.tsx).
  const neighbours = findNeighbour(
    localizePageTree(
      source.pageTree[params.lang] ?? source.pageTree["en"],
      params.lang,
      {
        translateName: true,
        translateTitle: true,
        translateIndex: false,
        translateChildren: true,
      },
    ),
    page.url,
  );

  const askAi = {
    lang: params.lang,
    title: page.data.title,
    url: `${baseUrl}${page.url}`,
  };

  return (
    <DocsPage
      toc={loadedPageData.toc}
      footer={{ items: neighbours }}
      slots={{ footer: DocsFooter }}
      tableOfContent={{
        style: "clerk",
        // Pinned to the bottom of the sticky TOC column, so "Ask AI" stays
        // in view while the reader scrolls (see ask-ai.tsx).
        footer: (
          <div className="mt-auto flex flex-col gap-4 pt-4">
            <AskAI variant="rail" {...askAi} />
            <DocsBanner lang={params.lang} />
          </div>
        ),
      }}
      full={page.data.full}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd(page.slugs, params.lang),
          ).replace(/</g, "\\u003c"),
        }}
      />
      <DocsTitle className="divine-doc-title">{page.data.title}</DocsTitle>
      <DocsDescription className="divine-doc-description mb-0">
        {page.data.description}
      </DocsDescription>

      {authors && authors.length > 0 && (
        <div className="text-muted-foreground mt-4 text-[14px]">
          {messages.misc?.credit ?? "Written by"}{" "}
          {authors.map((author, index) => (
            <span key={index}>
              {author.url ? (
                <Link
                  href={author.url}
                  className="text-foreground hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {author.name}
                </Link>
              ) : (
                <span className="text-foreground">{author.name}</span>
              )}
              {index < authors.length - 1 && ", "}
            </span>
          ))}
        </div>
      )}

      {/* Below xl the TOC column (and its Ask AI panel) is hidden, and full
          pages have none, so the links sit under the title instead. */}
      <AskAI
        variant="inline"
        {...askAi}
        className={cn("mt-5", !page.data.full && "xl:hidden")}
      />

      <Separator className="bg-fd-border mt-8 mb-10" />

      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: MDXLink,
          })}
        />
        <GuideCredits
          {...getGuideCredits(page)}
          lang={params.lang}
          labels={{
            ...ui.credits,
            lastUpdated: ui.misc.lastUpdated,
          }}
          className="mt-12"
          action={
            <Link
              href={`/${params.lang}/draft?edit=${page.slugs.join("/")}`}
              className="not-prose divine-press light:bg-fd-accent light:text-fd-foreground inline-flex h-10 items-center justify-center rounded-full bg-white/10 px-5 text-sm font-bold text-white hover:bg-white/20 focus-visible:ring-1 focus-visible:ring-[rgba(120,60,181,0.5)] focus-visible:outline-none"
            >
              {ui.misc.editOnGithub}
            </Link>
          }
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  if (process.env.NODE_ENV === "development") {
    return [];
  }
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<"/[lang]/docs/[[...slug]]">,
): Promise<Metadata> {
  const params = await props.params;
  const page =
    source.getPage(params.slug, params.lang) ??
    source.getPage(params.slug, "en");
  if (!page) notFound();

  const slug = params.slug || [];
  const title = { absolute: docsTitle(page.data.title, slug[0]) };
  const imageUrl = `/api/og/docs/${params.lang}${slug.length > 0 ? "/" + slug.join("/") : ""}`;

  // The LoL guides index (slug ["lol"]) was the site's landing page before
  // the homepage existed, and old shares of the site still point at it. Give
  // it the same static branded banner as the homepage instead of the dynamic
  // per-page card. The banner is a static image with no localized text, so
  // it's safe to serve even for OG-blacklisted locales.
  const isLandingTarget = slug.length === 1 && slug[0] === "lol";
  const ogImages = isLandingTarget
    ? [
        {
          url: LANDING_OG_IMAGE,
          width: LANDING_OG_WIDTH,
          height: LANDING_OG_HEIGHT,
          alt: SITE_NAME,
        },
      ]
    : [{ url: imageUrl, width: 1200, height: 630 }];
  const twitterImages = isLandingTarget ? [LANDING_OG_IMAGE] : [imageUrl];
  const pageKeywords = [
    ...new Set([...(page.data.keywords ?? []), ...(page.data.tags ?? [])]),
  ];
  // Keywords follow the page's game segment, so Deadlock guides don't
  // advertise League terms (and the other way round).
  const globalKeywords =
    slug[0] === "deadlock"
      ? [
          "deadlock",
          "deadlock mods",
          "deadlock modding",
          "deadlock custom skins",
          "divine skins",
        ]
      : [
          "league of legends",
          "lol custom skins",
          "league modding",
          "divine skins",
          "celestial launcher",
        ];

  // hreflang: advertise only locales that actually have this page. Missing
  // locales fall back to English at render time, so listing them would point
  // Google at English content under a non-English URL. `canonical` is the
  // resolved page's own URL, so en-fallback views consolidate to the en URL.
  const languages: Record<string, string> = {};
  for (const locale of i18n.languages) {
    const localized = source.getPage(slug, locale);
    if (localized) languages[locale] = localized.url;
  }
  const englishPage = source.getPage(slug, "en");
  if (englishPage) languages["x-default"] = englishPage.url;

  const alternates = {
    canonical: page.url,
    languages,
    types: llmAlternateTypes,
  };

  // Blacklisted locales skip the DYNAMIC card (it renders text that breaks for
  // those scripts), but the landing target's static banner is always safe.
  if (ogLanguageBlacklist.includes(params.lang) && !isLandingTarget)
    return {
      title,
      description: page.data.description,
      keywords: [...globalKeywords, ...pageKeywords],
      alternates,
    };

  return {
    title,
    description: page.data.description,
    keywords: [...globalKeywords, ...pageKeywords],
    alternates,
    openGraph: {
      ...baseOpenGraph,
      images: ogImages,
    },
    twitter: {
      ...baseTwitter,
      images: twitterImages,
    },
  };
}
