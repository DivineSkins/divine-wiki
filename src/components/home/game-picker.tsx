import Link from "next/link";
import { BookOpenIcon, HourglassIcon } from "lucide-react";
import type { GameEntry } from "@/lib/games";
import { cn } from "@/lib/utils";
import { PANEL_BORDER, PANEL_FILL } from "./styles";

// The divineskins.gg game card (src/blog/components/GameCards.tsx on the
// site): 3:4 box art in a 12px panel frame, name and a meta line centered
// under it.
const CARD =
  "group flex w-[132px] shrink-0 flex-col items-center text-center no-underline outline-none sm:w-[160px] md:w-[176px]";
const FRAME = cn(
  "relative aspect-[3/4] w-full overflow-hidden rounded-xl",
  PANEL_BORDER,
  PANEL_FILL,
);
const NAME = "mt-3 text-sm leading-snug font-bold sm:text-[15px]";
const META =
  "text-divine-text-muted mt-1 inline-flex items-center gap-1.5 text-xs font-medium";

/** Empty slots after the real games, so the row reads as "more to come". */
const PLACEHOLDER_SLOTS = 3;

/**
 * The homepage game row, from `listGames()`. A live game links to its docs
 * segment; one without guides yet shows its art with a "Coming soon" line
 * and no link. Placeholder slots fade out after them.
 */
export function GamePicker({
  games,
  comingSoon,
}: {
  games: GameEntry[];
  comingSoon: string;
}) {
  return (
    // The padding is room for the hover lift and glow: the scrolling row
    // clips anything outside it, and the negative margins keep the layout.
    <div className="-mx-6 -my-6 [scrollbar-width:none] overflow-x-auto px-6 py-6">
      <ul className="flex w-max gap-3 sm:gap-4">
        {games.map((game) => (
          <li key={game.slug}>
            {game.href ? (
              <LiveGameCard game={game} href={game.href} />
            ) : (
              <UpcomingGameCard game={game} />
            )}
          </li>
        ))}
        {Array.from({ length: PLACEHOLDER_SLOTS }, (_, i) => (
          <li
            key={i}
            aria-hidden
            className={cn(
              CARD,
              i === 1 && "opacity-70",
              i === 2 && "opacity-40",
            )}
          >
            <div
              className={cn(
                FRAME,
                "bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.035)_0_10px,transparent_10px_20px)]",
                "light:bg-[repeating-linear-gradient(135deg,rgba(0,0,0,0.04)_0_10px,transparent_10px_20px)]",
              )}
            />
            <p className={cn(NAME, "text-divine-text-muted")}>{comingSoon}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LiveGameCard({ game, href }: { game: GameEntry; href: string }) {
  return (
    <Link href={href} className={CARD}>
      <div
        className={cn(
          FRAME,
          "transition-[border-color,transform,box-shadow] duration-200 group-hover:-translate-y-1 group-hover:border-[#25222F]",
          "group-hover:shadow-[0_0_32px_-6px_color-mix(in_srgb,var(--color-divine-primary)_65%,transparent)]",
          "light:group-hover:border-divine-primary/40",
          "group-focus-visible:ring-divine-primary-light group-focus-visible:ring-2",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- 36 KB WebP at its display size; next/image adds nothing here */}
        <img
          src={game.cover}
          alt=""
          width={360}
          height={480}
          decoding="async"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <p
        className={cn(
          NAME,
          "text-divine-text group-hover:text-divine-primary-light transition-colors duration-200",
        )}
      >
        {game.name}
      </p>
      <p className={META}>
        <BookOpenIcon className="size-3.5" aria-hidden />
        {game.status}
      </p>
    </Link>
  );
}

function UpcomingGameCard({ game }: { game: GameEntry }) {
  return (
    <div className={cn(CARD, "cursor-default")}>
      <div className={FRAME}>
        {/* eslint-disable-next-line @next/next/no-img-element -- 23 KB WebP at its display size */}
        <img
          src={game.cover}
          alt=""
          width={360}
          height={480}
          decoding="async"
          className="size-full object-cover opacity-60 saturate-50"
        />
      </div>
      <p className={cn(NAME, "text-divine-text")}>{game.name}</p>
      <p className={META}>
        <HourglassIcon className="size-3.5" aria-hidden />
        {game.status}
      </p>
    </div>
  );
}
