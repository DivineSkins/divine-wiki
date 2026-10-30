import Image from "next/image";
import Link from "next/link";
import { DiscordLogo, GitHubLogo } from "@/components/brand-logos";
import { discordInviteUrl, githubRepoUrl } from "@/lib/config";
import { getMessages } from "@/lib/locale";

const SITE = "https://divineskins.gg";

const LINK =
  "text-divine-text-muted hover:text-divine-text text-sm font-medium no-underline transition-colors duration-200";

/**
 * Site footer for the homepage, built from the divineskins.gg footer
 * (NewLayout.tsx): #111016 band, a purple hairline fading out at both ends,
 * a soft glow behind its top edge, logo and fine print on the left, link
 * columns on the right. The legal pages live on the main site, so those
 * links leave the wiki.
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
    <footer className="bg-divine-popover relative mt-24 overflow-hidden pt-14 pb-10">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--color-divine-primary)_50%,transparent),transparent)]"
      />
      <div
        aria-hidden
        className="bg-divine-primary/15 light:hidden pointer-events-none absolute top-0 left-1/2 h-[290px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px]"
      />

      <div className="relative mx-auto flex w-full max-w-[992px] flex-col gap-12 px-6 lg:flex-row lg:justify-between lg:gap-8">
        <div className="flex max-w-xs flex-col items-start">
          <Link
            href={SITE}
            className="transition-opacity duration-200 hover:opacity-80"
            aria-label="Divine Skins"
          >
            <Image
              src="/brand/footer-logo.webp"
              alt=""
              width={157}
              height={60}
              className="-ml-2 h-[60px] w-auto"
            />
          </Link>
          <p className="text-divine-text-muted mt-4 text-sm leading-relaxed">
            {t.tagline}
          </p>
          <div className="mt-5 flex gap-4">
            <a
              href={discordInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord"
              className="text-divine-text-muted hover:text-divine-text transition-colors duration-200"
            >
              <DiscordLogo className="size-[18px]" />
            </a>
            <a
              href={githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-divine-text-muted hover:text-divine-text transition-colors duration-200"
            >
              <GitHubLogo className="size-[18px]" />
            </a>
          </div>
        </div>

        <nav
          aria-label={t.navLabel}
          className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-12"
        >
          {columns.map((column) => (
            <div key={column.heading}>
              <h2 className="text-divine-text mb-4 text-base font-bold">
                {column.heading}
              </h2>
              <ul className="flex flex-col gap-2.5">
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

      <div className="relative mx-auto mt-12 w-full max-w-[992px] px-6">
        <div className="border-divine-border/60 flex flex-col gap-2 border-t pt-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <p className="text-divine-text-muted text-[13px] font-medium">
            {t.copyright.replace("{year}", String(new Date().getFullYear()))}
          </p>
          <p className="text-divine-text-muted/70 max-w-md text-xs leading-relaxed sm:text-right">
            {t.disclaimer}
          </p>
        </div>
      </div>
    </footer>
  );
}
