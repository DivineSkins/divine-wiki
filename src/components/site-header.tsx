"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  buttonVariants,
  cn,
  iconTileVariants,
  menuItemClassName,
  menuPanelClassName,
  Popover,
  PopoverContent,
  PopoverItem,
  PopoverTrigger,
  Separator,
} from "@divineskins/ui";
import {
  ArrowUpRightIcon,
  ChevronDownIcon,
  LanguagesIcon,
  MenuIcon,
  SearchIcon,
} from "lucide-react";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import {
  AppearanceSettings,
  type SettingsLabels,
} from "@/components/appearance-settings";
import { useContributePicker } from "@/components/contribute-picker";
import type { GameEntry } from "@/lib/games";
import { homePath } from "@/lib/i18n";

export interface SiteHeaderLabels {
  guides: string;
  search: string;
  language: string;
  menu: string;
  writeGuide: string;
  settings: SettingsLabels;
}

/** Scroll distance over which the navbar's fade comes in: its own height. */
const NAV_FADE_DISTANCE = 96;

// The site navbar's icon button: secondary, 40px.
const ICON_BUTTON_CLASS = "size-10 shrink-0 [&_svg]:size-[18px]";
const ICON_BUTTON = cn(
  buttonVariants({ variant: "secondary", size: "icon" }),
  ICON_BUTTON_CLASS,
);

// A navbar item (NavMenuDropdown): 14px semibold, a white/10 pill on hover. The
// 9px side padding is offset by the nav's negative margin.
const NAV_ITEM =
  "text-divine-text flex h-9 items-center gap-1.5 rounded-md px-[9px] text-sm leading-5 font-semibold tracking-[-0.2px] whitespace-nowrap no-underline transition-colors duration-200 hover:bg-white/10 focus-visible:ring-divine-highlight focus-visible:ring-1 focus-visible:outline-none";

const MENU_ITEM = menuItemClassName({
  className: "justify-between no-underline",
});

// Each game's glyph, as a mask on its 512px tile (the site's GameIcon).
const GAME_GLYPHS: Record<string, { src: string; size: string }> = {
  lol: { src: "/brand/games/lol-glyph.svg", size: "100%" },
  deadlock: { src: "/brand/games/deadlock-glyph.svg", size: "69.14%" },
};

function GameIcon({ game }: { game: GameEntry }) {
  const glyph = GAME_GLYPHS[game.slug];
  const tile = cn(
    iconTileVariants({ size: null, tone: null }),
    "relative size-6 overflow-hidden rounded-[7px]",
  );
  // A game added later has no glyph here yet: its cover.
  if (!glyph) {
    return (
      <span aria-hidden className={tile}>
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny box-art thumbnail */}
        <img src={game.cover} alt="" className="size-full object-cover" />
      </span>
    );
  }
  const mask = `url(${glyph.src}) center / ${glyph.size} no-repeat`;
  return (
    <span aria-hidden className={tile}>
      <span
        className="absolute inset-0 block"
        style={{
          background: game.href
            ? "linear-gradient(180deg, var(--divine-highlight) 0%, var(--divine-accent) 100%)"
            : "var(--color-divine-muted)",
          mask,
          WebkitMask: mask,
        }}
      />
    </span>
  );
}

/**
 * Homepage navbar, built from the divineskins.gg navbar (NewLayout): 96px tall
 * with no bar of its own, the logo, a divider and the menus on the left, icon
 * buttons and one primary pill on the right. A fade comes in behind it over
 * the first 96px of scroll, so it stays legible over the page. Below lg
 * everything but the icon buttons moves into a menu.
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
  const fadeRef = useRef<HTMLDivElement>(null);
  const { setOpenSearch } = useSearchContext();
  const { open: openContribute } = useContributePicker();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      if (fadeRef.current) {
        fadeRef.current.style.opacity = String(
          Math.min(window.scrollY / NAV_FADE_DISTANCE, 1),
        );
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links: NavItem[] = [
    { label: "Divine Skins", href: "https://divineskins.gg", external: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      <div
        ref={fadeRef}
        aria-hidden
        className="divine-nav-fade pointer-events-none absolute inset-x-0 top-0 h-[140%] opacity-0"
      />
      <div className="relative z-10 flex min-h-[96px] w-full justify-center">
        <div className="flex w-full max-w-[1309px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link
              href={homePath(lang)}
              aria-label="Divine Skins Wiki"
              className="inline-flex shrink-0 items-center no-underline focus:outline-none"
            >
              <Image
                src="/brand/divine-wordmark.webp"
                alt=""
                width={134}
                height={45}
                priority
                className="h-[44.831px] w-[134px]"
              />
            </Link>

            <div
              aria-hidden
              className="light:bg-divine-border -mx-px hidden h-6 w-0.5 rounded-full bg-[#2A2638] lg:block"
            />

            <nav className="-mx-[9px] hidden items-center lg:flex">
              <GuidesMenu label={labels.guides} games={games} />
              {links.map((link) => (
                <NavLink key={link.href} item={link} className={NAV_ITEM} />
              ))}
            </nav>
          </div>

          <div className="flex items-center justify-end gap-2 lg:gap-3.5">
            <Button
              variant="secondary"
              size="icon"
              aria-label={labels.search}
              onClick={() => setOpenSearch(true)}
              className={ICON_BUTTON_CLASS}
            >
              <SearchIcon aria-hidden />
            </Button>
            <LanguageMenu label={labels.language} />
            <AppearanceSettings
              labels={labels.settings}
              triggerClassName={ICON_BUTTON}
              align="end"
            />
            <Button
              size="md"
              onClick={openContribute}
              className={cn(
                "hidden px-6 font-semibold lg:inline-flex",
                scrolled && "opacity-80 hover:opacity-100",
              )}
            >
              {labels.writeGuide}
            </Button>
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
 * "Guides ⌄": the site navbar's hover dropdown (NavMenuDropdown) listing every
 * game. Opens on hover, with a short close delay so the pointer can travel to
 * the panel, and on click for touch and keyboard. Escape, or focus leaving the
 * menu, closes it.
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
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        className={NAV_ITEM}
      >
        {label}
        <ChevronDownIcon
          className={cn(
            "size-3.5 shrink-0 transition-transform duration-300",
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
        <div className={menuPanelClassName("flex w-[200px] flex-col gap-0.5")}>
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
 * One game in the Guides menu: its icon and name. A game without guides yet
 * shows a muted icon and isn't a link.
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
      <GameIcon game={game} />
      <span>{game.name}</span>
    </>
  );

  if (!game.href) {
    return (
      <div
        aria-disabled="true"
        className={menuItemClassName({
          className: "cursor-default hover:bg-transparent",
        })}
      >
        {body}
      </div>
    );
  }
  return (
    <Link
      href={game.href}
      onClick={onNavigate}
      className={menuItemClassName({ className: "no-underline" })}
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
        <LanguagesIcon aria-hidden />
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-48 flex-col gap-0.5">
        <MenuHeading>{label}</MenuHeading>
        {locales.map((item) => {
          const active = item.locale === locale;
          return (
            <PopoverItem
              key={item.locale}
              selected={active}
              aria-pressed={active}
              onClick={() => router.push(homePath(item.locale))}
            >
              {item.name}
            </PopoverItem>
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
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "text-divine-text lg:hidden [&_svg]:size-6",
        )}
      >
        <MenuIcon aria-hidden />
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-60 flex-col gap-0.5">
        <MenuHeading>{guidesLabel}</MenuHeading>
        {games.map((game) => (
          <GameMenuItem
            key={game.slug}
            game={game}
            onNavigate={() => setOpen(false)}
          />
        ))}
        <Separator className="my-1.5" />
        {links.map((link) => (
          <NavLink
            key={link.href}
            item={link}
            className={MENU_ITEM}
            onClick={() => setOpen(false)}
          />
        ))}
        <Button
          size="md"
          onClick={() => {
            setOpen(false);
            onWriteGuide();
          }}
          className="mt-2 w-full"
        >
          {writeGuide}
        </Button>
      </PopoverContent>
    </Popover>
  );
}

// A <div>, not a <p>: global.css styles the sidebar's Fumadocs language list
// by its shape (`div:has(> p + button)`, pinned to its trigger's width), and
// a <p> here would match it and squeeze this menu to 36px.
function MenuHeading({ children }: { children: ReactNode }) {
  return (
    <div className="text-divine-muted px-2.5 pt-1.5 pb-1 text-xs font-semibold">
      {children}
    </div>
  );
}
