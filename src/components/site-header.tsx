"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRightIcon,
  CheckIcon,
  ChevronDownIcon,
  LanguagesIcon,
  MenuIcon,
  SearchIcon,
} from "lucide-react";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "fumadocs-ui/components/ui/popover";
import {
  AppearanceSettings,
  type SettingsLabels,
} from "@/components/appearance-settings";
import { useContributePicker } from "@/components/contribute-picker";
import { PANEL_BORDER, PANEL_FILL } from "@/components/home/styles";
import { glowCtaClassName } from "@/components/mdx/GlowCTA";
import { discordInviteUrl } from "@/lib/config";
import type { GameEntry } from "@/lib/games";
import { homePath } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export interface SiteHeaderLabels {
  guides: string;
  search: string;
  language: string;
  menu: string;
  writeGuide: string;
  settings: SettingsLabels;
}

// The divineskins.gg navbar icon circle (NewLayout): 36px, translucent
// #25222F fill that firms up on hover.
const ICON_BUTTON =
  "text-divine-text inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[rgba(37,34,47,0.46)] transition-colors duration-200 hover:bg-[rgba(37,34,47,0.7)] " +
  "light:bg-black/5 light:hover:bg-black/10 " +
  "outline-none focus-visible:ring-1 focus-visible:ring-[#C084FC] data-[state=open]:bg-[rgba(37,34,47,0.7)]";

// Text links: muted, brighten on hover with a faint pill behind them. The
// site never underlines nav items.
const NAV_LINK =
  "text-divine-text-muted hover:text-divine-text inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold no-underline transition-colors duration-200 hover:bg-white/5 light:hover:bg-black/5";

const MENU_ITEM =
  "text-divine-text-muted hover:text-divine-text flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-sm font-medium no-underline transition-colors hover:bg-white/5 light:hover:bg-black/5";

// A game row in the Guides menu: the site dropdown's row (8px radius,
// #1A1922 on hover) with a box-art thumbnail.
const GAME_ROW =
  "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left no-underline transition-colors duration-150";

// The dropdown panel: the site's #121119 card on a #191722 hairline with
// its deep drop shadow.
const DROPDOWN_PANEL = cn(
  "rounded-xl p-1.5 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)]",
  PANEL_BORDER,
  PANEL_FILL,
);

/**
 * Homepage navbar, built from the divineskins.gg navbar: wordmark logo with
 * no container (it links home), a "Guides" dropdown listing every game, text
 * links, then icon circles and one primary pill on the right. Transparent
 * over the hero; once the page scrolls it gets the void fill, a blur, and a
 * hairline so it stays legible. Below md everything but the circles moves
 * into a menu.
 */
export function SiteHeader({
  lang,
  labels,
  games,
}: {
  lang: string;
  labels: SiteHeaderLabels;
  /** From `listGames()`, so the menu agrees with the homepage cards. */
  games: GameEntry[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const { setOpenSearch } = useSearchContext();
  const { open: openContribute } = useContributePicker();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links: NavItem[] = [
    { label: "Discord", href: discordInviteUrl, external: true },
    { label: "Divine Skins", href: "https://divineskins.gg", external: true },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color] duration-200",
        scrolled
          ? "bg-divine-void/80 light:border-divine-border [.minimal_&]:border-divine-border border-[#191722] backdrop-blur-md"
          : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[992px] items-center gap-4 px-6">
        <Link
          href={homePath(lang)}
          aria-label="Divine Skins Wiki"
          className="mr-2 flex shrink-0 items-center no-underline"
        >
          <Image
            src="/brand/footer-logo.webp"
            alt=""
            width={115}
            height={44}
            priority
            className="h-11 w-auto"
          />
        </Link>

        <nav className="hidden items-center md:flex">
          <GuidesMenu label={labels.guides} games={games} />
          {links.map((link) => (
            <NavLink key={link.href} item={link} className={NAV_LINK} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            aria-label={labels.search}
            onClick={() => setOpenSearch(true)}
            className={ICON_BUTTON}
          >
            <SearchIcon className="size-4" aria-hidden />
          </button>
          <LanguageMenu label={labels.language} />
          <AppearanceSettings
            labels={labels.settings}
            triggerClassName={ICON_BUTTON}
            align="end"
          />
          <button
            type="button"
            onClick={openContribute}
            className={cn(
              glowCtaClassName("solid", "md"),
              "hidden md:inline-flex",
            )}
          >
            {labels.writeGuide}
          </button>
          <MobileMenu
            label={labels.menu}
            guidesLabel={labels.guides}
            games={games}
            links={links}
            writeGuide={labels.writeGuide}
            onWriteGuide={openContribute}
          />
        </div>
      </div>
    </header>
  );
}

interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

function NavLink({
  item,
  className,
  onClick,
}: {
  item: NavItem;
  className: string;
  onClick?: () => void;
}) {
  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
      >
        {item.label}
        <ArrowUpRightIcon className="size-3.5 opacity-60" aria-hidden />
      </a>
    );
  }
  return (
    <Link href={item.href} className={className} onClick={onClick}>
      {item.label}
    </Link>
  );
}

/**
 * "Guides ⌄": the site navbar's hover dropdown (NewLayout's Create Mods
 * menu) listing every game. Opens on hover, with a short close delay so the
 * pointer can travel to the panel, and on click for touch and keyboard.
 * Escape, or focus leaving the menu, closes it.
 */
function GuidesMenu({ label, games }: { label: string; games: GameEntry[] }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const openNow = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => {
    const timer = closeTimer;
    return () => clearTimeout(timer.current);
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          NAV_LINK,
          "gap-1.5",
          open && "text-divine-text light:bg-black/5 bg-white/5",
        )}
      >
        {label}
        <ChevronDownIcon
          className={cn(
            "size-3.5 transition-transform duration-300",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {/* pt-3, not a margin: the padding is part of the hover area, so the
          pointer can cross from the button to the panel without closing it. */}
      <div
        className={cn(
          "absolute top-full left-1/2 z-50 -translate-x-1/2 pt-3 transition-[opacity,translate,visibility] duration-150 motion-reduce:transition-none",
          open
            ? "visible translate-y-0 opacity-100"
            : "pointer-events-none invisible translate-y-2 opacity-0",
        )}
      >
        <div className={cn("w-64", DROPDOWN_PANEL)}>
          {games.map((game) => (
            <GameMenuItem
              key={game.slug}
              game={game}
              onNavigate={() => setOpen(false)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * One game in the Guides menu: box art, name, and its guide count. A game
 * without guides yet shows "Coming soon" and isn't a link.
 */
function GameMenuItem({
  game,
  onNavigate,
}: {
  game: GameEntry;
  onNavigate: () => void;
}) {
  const body = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny box-art thumbnail */}
      <img
        src={game.cover}
        alt=""
        width={24}
        height={32}
        className={cn(
          "h-8 w-6 shrink-0 rounded-[4px] object-cover",
          !game.href && "opacity-60 saturate-50",
        )}
      />
      <span className="min-w-0 flex-1">
        <span className="text-divine-text block text-[13px] leading-[18px] font-semibold">
          {game.name}
        </span>
        <span className="text-divine-text-muted block text-xs">
          {game.status}
        </span>
      </span>
    </>
  );

  if (!game.href) {
    return (
      <div aria-disabled="true" className={cn(GAME_ROW, "cursor-default")}>
        {body}
      </div>
    );
  }
  return (
    <Link
      href={game.href}
      onClick={onNavigate}
      className={cn(
        GAME_ROW,
        "light:hover:bg-black/5 outline-none hover:bg-[#1A1922] focus-visible:bg-[#1A1922] [.minimal_&]:hover:bg-white/5",
      )}
    >
      {body}
    </Link>
  );
}

/**
 * Language picker. The navbar only lives on the homepage, so picking a
 * language goes to that language's homepage (English is the bare domain).
 */
function LanguageMenu({ label }: { label: string }) {
  const { locales = [], locale } = useI18n();
  const router = useRouter();

  return (
    <Popover>
      <PopoverTrigger aria-label={label} className={ICON_BUTTON}>
        <LanguagesIcon className="size-4" aria-hidden />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="flex w-48 min-w-0 flex-col gap-0.5"
      >
        <MenuHeading>{label}</MenuHeading>
        {locales.map((item) => {
          const active = item.locale === locale;
          return (
            <button
              key={item.locale}
              type="button"
              onClick={() => router.push(homePath(item.locale))}
              className={cn(MENU_ITEM, active && "text-divine-text")}
            >
              {item.name}
              {active ? (
                <CheckIcon
                  className="text-divine-primary-light size-4"
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

function MobileMenu({
  label,
  guidesLabel,
  games,
  links,
  writeGuide,
  onWriteGuide,
}: {
  label: string;
  guidesLabel: string;
  games: GameEntry[];
  links: NavItem[];
  writeGuide: string;
  onWriteGuide: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={label}
        className={cn(ICON_BUTTON, "md:hidden")}
      >
        <MenuIcon className="size-4" aria-hidden />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="flex w-60 min-w-0 flex-col gap-0.5"
      >
        <MenuHeading>{guidesLabel}</MenuHeading>
        {games.map((game) => (
          <GameMenuItem
            key={game.slug}
            game={game}
            onNavigate={() => setOpen(false)}
          />
        ))}
        <div
          aria-hidden
          className="light:border-divine-border my-1.5 border-t border-[#191722]"
        />
        {links.map((link) => (
          <NavLink
            key={link.href}
            item={link}
            className={MENU_ITEM}
            onClick={() => setOpen(false)}
          />
        ))}
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onWriteGuide();
          }}
          className={cn(glowCtaClassName("solid", "md"), "mt-2 w-full")}
        >
          {writeGuide}
        </button>
      </PopoverContent>
    </Popover>
  );
}

// A <div>, not a <p>: global.css styles the sidebar's Fumadocs language list
// by its shape (`div:has(> p + button)`, pinned to its trigger's width), and
// a <p> here would match it and squeeze this menu to 36px.
function MenuHeading({ children }: { children: ReactNode }) {
  return (
    <div className="light:text-fd-muted-foreground px-2.5 pt-1 pb-1.5 text-[11px] tracking-[0.18em] text-[#8B8D98]/70 uppercase">
      {children}
    </div>
  );
}
