import Link from "next/link";
import { BookOpenIcon } from "lucide-react";
import type { GameEntry } from "@/lib/games";
import { cn } from "@/lib/utils";
import { AutoScrollRow } from "./auto-scroll-row";
import { TiltCard } from "./tilt-card";

// The divineskins.gg hero game cards (its PopularGamesRow), with the wiki's
// guide count where the site shows downloads and mods.
const ASSETS = "/brand/hero";

/** px per second when the row is too wide for its box and scrolls itself. */
const SPEED = 16;

const CARD = "flex w-[178px] shrink-0 flex-col items-center gap-2 py-px";
const FACE =
  "relative h-[236px] w-[178px] overflow-hidden rounded-xl border border-[#2A2638] light:border-divine-border";
const NAME =
  "w-[178px] text-center text-base leading-[normal] font-semibold text-divine-text";
const META =
  "flex items-center justify-center gap-1 px-1.5 py-1 text-sm leading-[normal] font-medium text-divine-muted";

/** Each game's art crop inside the card's 1px border, as on the site. */
const GAME_ART: Record<string, { box: string; img: string }> = {
  lol: {
    box: "bottom-[-1.5px] left-0 h-[236px] w-[177px]",
    img: "left-[0.15%] top-[-0.02%] h-[100.04%] w-[99.69%]",
  },
  deadlock: {
    box: "left-[-3px] top-[calc(50%+0.5px)] h-[236px] w-[180px] -translate-y-1/2",
    img: "left-[0.33%] top-[-0.21%] h-[100.42%] w-[99.35%]",
  },
  "genshin-impact": {
    box: "bottom-[-1.5px] left-[-1px] h-[237px] w-[178px]",
    img: "left-[-0.14%] top-0 h-[100.42%] w-[100.28%]",
  },
  "wuthering-waves": {
    box: "bottom-[-1.5px] left-[-1px] h-[237px] w-[178px]",
    img: "inset-0 size-full object-cover",
  },
  "zenless-zone-zero": {
    box: "bottom-[-1.5px] left-[-1px] h-[237px] w-[178px]",
    img: "left-[0.01%] top-0 h-[105.43%] w-[99.99%]",
  },
};

function GameArt({ slug, cover }: { slug: string; cover?: string }) {
  const art = GAME_ART[slug];
  // A game added later has no crop here yet: its cover, filling the card.
  const src = art ? `${ASSETS}/game-${slug}.webp` : cover;
  return (
    <div className={cn("absolute", art?.box ?? "inset-0")}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- small WebP art at its display size; next/image adds nothing here */}
        <img
          src={src}
          alt=""
          decoding="async"
          className={cn(
            "absolute max-w-none",
            art?.img ?? "inset-0 size-full object-cover",
          )}
        />
      </div>
    </div>
  );
}

/** The art toned down under the page color, with a grey "Coming soon". */
function ComingSoonCard({
  slug,
  name,
  cover,
  label,
  status,
}: {
  slug: string;
  name: string;
  cover?: string;
  label: string;
  status?: string;
}) {
  return (
    <div className={CARD}>
      <div className={FACE}>
        <GameArt slug={slug} cover={cover} />
        <div aria-hidden className="bg-divine-bg/68 absolute inset-0" />
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <p className={cn(NAME, "text-divine-muted")}>
          {status ?? label}
          <span className="sr-only">: {name}</span>
        </p>
        {/* Keeps the art lined up with the live cards, which have a count. */}
        <p aria-hidden className={cn(META, "invisible")}>
          &nbsp;
        </p>
      </div>
    </div>
  );
}

function LiveCard({
  game,
  href,
  copy,
}: {
  game: GameEntry;
  href: string;
  /** In the row's second copy: clickable, but not a second tab stop. */
  copy?: boolean;
}) {
  return (
    <Link
      href={href}
      tabIndex={copy ? -1 : undefined}
      className={cn(CARD, "group rounded-xl no-underline outline-none")}
    >
      <TiltCard className="h-[236px] w-[178px] shrink-0" artClassName={FACE}>
        <GameArt slug={game.slug} cover={game.cover} />
      </TiltCard>
      <div className="flex flex-col items-center gap-0.5">
        <p
          className={cn(
            NAME,
            "group-hover:text-divine-icon-accent group-focus-visible:text-divine-icon-accent transition-colors duration-300",
          )}
        >
          {game.name}
        </p>
        <p
          className={cn(
            META,
            "group-hover:text-divine-text group-focus-visible:text-divine-text transition-colors duration-300",
          )}
        >
          <BookOpenIcon className="size-[15px] shrink-0" aria-hidden />
          {game.status}
        </p>
      </div>
    </Link>
  );
}

const LIST = "flex w-max shrink-0 items-center gap-[14px]";

/**
 * The homepage game row, from `listGames()`. A live game links to its docs
 * segment; the rest show toned-down art. When the cards don't fit the box,
 * the row scrolls itself slowly in a loop (AutoScrollRow), which is what the
 * second, hidden copy of the list is for.
 */
export function GamePicker({
  games,
  comingSoon,
}: {
  games: GameEntry[];
  comingSoon: string;
}) {
  const cards = (copy: boolean) =>
    games.map((game) => (
      <li key={game.slug}>
        {game.href ? (
          <LiveCard game={game} href={game.href} copy={copy} />
        ) : (
          <ComingSoonCard
            slug={game.slug}
            name={game.name}
            cover={game.cover}
            label={comingSoon}
            status={game.status}
          />
        )}
      </li>
    ));

  return (
    // The 12px and 8px padding, cancelled by the negative margin, keeps the
    // hover tilt from being clipped by the scrolling row. Centered through
    // `mx-auto` on a max-content list, so a row wider than the screen still
    // starts from its first card. The edges fade only while it scrolls.
    <AutoScrollRow
      speed={SPEED}
      className={cn(
        "group/row -m-3 flex w-[calc(100%+24px)] gap-[14px] overflow-x-auto px-2 py-3",
        // A focused card stops clear of the faded edges.
        "scroll-px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "data-[scrolling]:[mask-image:linear-gradient(to_right,transparent,#000_24px,#000_calc(100%_-_24px),transparent)]",
      )}
    >
      <ul className={cn(LIST, "mx-auto")}>{cards(false)}</ul>
      <ul
        aria-hidden
        className={cn(LIST, "hidden group-data-[scrolling]/row:flex")}
      >
        {cards(true)}
      </ul>
    </AutoScrollRow>
  );
}
