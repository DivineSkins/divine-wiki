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
import Link from "next/link";
import { ogLanguageBlacklist } from "@/lib/i18n";
import { Separator } from "@/components/ui/separator";

export default async function Page(
  props: PageProps<"/[lang]/docs/[[...slug]]">,
) {
  const params = await props.params;
  const page =
    source.getPage(params.slug, params.lang) ??
    source.getPage(params.slug, "en");
  if (!page) notFound();

  const messages = require(`@/../messages/${params.lang}.json`);

  const authors = page.data.authors;
  const loadedPageData = await page.data.load();

  const MDX = loadedPageData.body;

  return (
    <DocsPage
      toc={loadedPageData.toc}
      tableOfContent={{ style: "clerk" }}
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
            a: createRelativeLink(source, page),
          })}
        />
        <hr className="border-divine-border my-8" />
        <Link
          href={`/${params.lang}/draft?edit=${page.slugs.join("/")}`}
          className="text-divine-primary-light text-sm hover:underline"
        >
          {messages.misc?.editOnGithub ?? "Edit on GitHub"} →
        </Link>
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
  const pageKeywords = (page.data as any).keywords || [];
  const globalKeywords = [
    "league of legends",
    "lol custom skins",
    "league modding",
    "divine skins",
    "celestial launcher",
  ];

  if (ogLanguageBlacklist.includes(params.lang))
    return {
      title: page.data.title,
      description: page.data.description,
      keywords: [...globalKeywords, ...pageKeywords],
    };

  return {
    title: page.data.title,
    description: page.data.description,
    keywords: [...globalKeywords, ...pageKeywords],
    openGraph: {
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}
