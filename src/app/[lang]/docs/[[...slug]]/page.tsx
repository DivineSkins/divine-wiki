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
import { i18n, ogLanguageBlacklist } from "@/lib/i18n";
import {
  baseOpenGraph,
  baseTwitter,
  llmAlternateTypes,
  LANDING_OG_IMAGE,
  LANDING_OG_WIDTH,
  LANDING_OG_HEIGHT,
  SITE_NAME,
} from "@/lib/seo";
import { Separator } from "@/components/ui/separator";
import { DocsLanding } from "@/components/home/docs-landing";
import { PageCredits } from "@/components/page-credits";
import { DocsBanner } from "../docs-banner";

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

  return (
    <DocsPage
      toc={loadedPageData.toc}
      tableOfContent={{ style: "clerk", footer: <DocsBanner /> }}
      full={page.data.full}
    >
      <DocsTitle className="divine-doc-title">{page.data.title}</DocsTitle>
      <DocsDescription className="divine-doc-description mb-0">
        {page.data.description}
      </DocsDescription>

      {authors && authors.length > 0 && (
        <div className="text-muted-foreground mt-4 text-sm">
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

      <Separator className="mt-4 mb-6" />

      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: MDXLink,
          })}
        />
        <hr className="border-divine-border my-8" />
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <PageCredits
            credits={page.data.credits}
            label={messages.misc?.madeBy ?? "Made by"}
          />
          <Link
            href={`/${params.lang}/draft?edit=${page.slugs.join("/")}`}
            className="text-divine-primary-light text-sm hover:underline"
          >
            {messages.misc?.editOnGithub ?? "Edit on GitHub"} →
          </Link>
        </div>
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
  const imageUrl = `/api/og/docs/${params.lang}${slug.length > 0 ? "/" + slug.join("/") : ""}`;

  // The LoL guides index (slug ["lol"]) is the redirect target for the site
  // root (/:lang -> /:lang/docs/lol), so it's the de-facto landing page a
  // shared site link resolves to. Give it the static branded banner instead of
  // the dynamic per-page card. The banner is a static image with no localized
  // text, so it's safe to serve even for OG-blacklisted locales.
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
  const pageKeywords = (page.data as any).keywords || [];
  const globalKeywords = [
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
      title: page.data.title,
      description: page.data.description,
      keywords: [...globalKeywords, ...pageKeywords],
      alternates,
    };

  return {
    title: page.data.title,
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
