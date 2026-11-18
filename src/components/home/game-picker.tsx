import Link from "next/link";
import { BookOpenIcon } from "lucide-react";
import type { GameEntry } from "@/lib/games";
import { cn } from "@/lib/utils";
import { TiltCard } from "./tilt-card";

// The divineskins.gg hero game cards (its PopularGamesRow), with the wiki's
// guide count where the site shows downloads and mods.
const ASSETS = "/brand/hero";

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

/** Games the site features that the wiki has no segment for yet. */
const UPCOMING = [
  { slug: "genshin-impact", name: "Genshin Impact" },
  { slug: "wuthering-waves", name: "Wuthering Waves" },
  { slug: "zenless-zone-zero", name: "Zenless Zone Zero" },
];

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

function LiveCard({ game, href }: { game: GameEntry; href: string }) {
  return (
    <Link
      href={href}
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

/**
 * The homepage game row, from `listGames()`, then the games still to come. A
 * live game links to its docs segment; the rest show toned-down art.
 */
export function GamePicker({
  games,
  comingSoon,
}: {
  games: GameEntry[];
  comingSoon: string;
}) {
  return (
    // The 12px and 8px padding, cancelled by the negative margin, keeps the
    // hover tilt from being clipped by the scrolling row. Centered through
    // `mx-auto` on a max-content row, so a row wider than the screen still
    // scrolls from its first card.
    <div className="-m-3 flex w-[calc(100%+24px)] [scrollbar-width:none] overflow-x-auto px-2 py-3">
      <ul className="mx-auto flex w-max items-center gap-[14px]">
        {games.map((game) => (
          <li key={game.slug}>
            {game.href ? (
              <LiveCard game={game} href={game.href} />
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
        ))}
        {UPCOMING.map((game) => (
          <li key={game.slug}>
            <ComingSoonCard
              slug={game.slug}
              name={game.name}
              label={comingSoon}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
