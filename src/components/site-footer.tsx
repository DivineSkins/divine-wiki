import Image from "next/image";
import Link from "next/link";
import { DiscordLogo, GitHubLogo } from "@/components/brand-logos";
import { discordInviteUrl, githubRepoUrl } from "@/lib/config";
import { getMessages } from "@/lib/locale";

const SITE = "https://divineskins.gg";

const LINK =
  "text-divine-muted hover:text-divine-text text-[14px] leading-4 font-medium no-underline transition-colors duration-200";

const SOCIAL =
  "text-divine-muted hover:text-divine-text flex size-5 items-center justify-center transition-colors duration-200";

/**
 * Site footer for the homepage, from the divineskins.gg footer (NewLayout): a
 * band with a purple hairline fading out at both ends and a soft glow behind
 * its top edge, the logo, socials and fine print on the left, link columns on
 * the right. The legal pages live on the main site, so those links leave the
 * wiki.
 */
export function SiteFooter({ lang }: { lang: string }) {
  const t = getMessages(lang).footer;

  const columns: {
    heading: string;
    links: { label: string; href: string }[];
  }[] = [
    {
      heading: t.wikiHeading,
      links: [
        { label: t.contributing, href: `/${lang}/docs/lol/contributing` },
        { label: "GitHub", href: githubRepoUrl },
      ],
    },
    {
      heading: "Divine Skins",
      links: [
        { label: "Celestial", href: `${SITE}/install-mods` },
        { label: "Discord", href: discordInviteUrl },
      ],
    },
    {
      heading: t.legalHeading,
      links: [
        { label: t.terms, href: `${SITE}/legal/terms-of-service` },
        { label: t.privacy, href: `${SITE}/legal/privacy-policy` },
        { label: t.contentLicense, href: `${githubRepoUrl}/blob/main/LICENSE` },
      ],
    },
  ];

  return (
    <footer className="bg-divine-popover relative mt-16 w-full overflow-hidden pt-[50px] pb-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--color-divine-primary)_50%,transparent),transparent)]"
      />
      <div
        aria-hidden
        className="light:hidden pointer-events-none absolute top-0 left-1/2 h-[293px] w-[547px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(120,60,181,0.15)] mix-blend-screen blur-[109px] [.minimal_&]:hidden"
      />

      <div className="relative mx-auto flex w-full max-w-[1382px] flex-col gap-10 px-[46px] lg:flex-row lg:justify-between lg:gap-0">
        <div className="flex flex-col items-start">
          <Link
            href={SITE}
            className="transition-opacity duration-200 hover:opacity-80"
            aria-label="Divine Skins"
          >
            <Image
              src="/brand/divine-wordmark.webp"
              alt=""
              width={217}
              height={70}
              className="-ml-2 h-[70px] w-auto"
            />
          </Link>

          <div className="mt-[18px] flex gap-4">
            <a
              href={discordInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord"
              className={SOCIAL}
            >
              <DiscordLogo className="size-5" />
            </a>
            <a
              href={githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className={SOCIAL}
            >
              <GitHubLogo className="size-5" />
            </a>
          </div>

          <p className="text-divine-muted mt-[30px] text-[14px] leading-4 font-medium">
            {t.copyright.replace("{year}", String(new Date().getFullYear()))}
          </p>
          <p className="text-divine-muted/50 mt-3 max-w-[320px] text-[11px] leading-4 font-medium">
            {t.disclaimer}
          </p>
        </div>

        <nav
          aria-label={t.navLabel}
          className="grid grid-cols-2 gap-8 lg:flex lg:gap-[60px]"
        >
          {columns.map((column) => (
            <div key={column.heading} className="text-center lg:text-left">
              <h2 className="text-divine-text mb-5 text-[18px] leading-4 font-bold lg:mb-[30px]">
                {column.heading}
              </h2>
              <ul className="space-y-[6px]">
                {column.links.map((link) => {
                  const external = /^https?:\/\//.test(link.href);
                  return (
                    <li key={link.href}>
                      {external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={LINK}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link href={link.href} className={LINK}>
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
