import type { CSSProperties } from "react";
import type { Contributor } from "@/lib/contributors";
import { cn } from "@/lib/utils";
import { PANEL_BORDER, PANEL_FILL } from "./styles";

// The site's featured-creators card (CreatorCard in CreatorsPage.tsx): a
// 180px column of avatar, name and count. Hover is the homepage game card's.
const CARD_WIDTH = 180;
const GAP = 16;
/** px per second, the site's MarqueeRow default. */
const SPEED = 40;

const CARD = cn(
  "group flex h-full flex-col items-center rounded-xl px-4 pt-5 pb-4 text-center no-underline outline-none",
  PANEL_BORDER,
  PANEL_FILL,
);
const CARD_LINK = cn(
  CARD,
  "transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-1 hover:border-[#25222F]",
  "hover:shadow-[0_0_32px_-6px_color-mix(in_srgb,var(--color-divine-primary)_65%,transparent)]",
  "light:hover:border-divine-primary/40",
  "focus-visible:ring-divine-primary-light focus-visible:ring-2",
);
// Each copy of the row is at least as wide as the box, so the loop never
// shows a gap. Hovering or focusing a card stops the row.
const TRACK = cn(
  "flex min-w-full shrink-0 justify-around gap-[var(--marquee-gap)]",
  "motion-safe:animate-divine-marquee group-hover/marquee:[animation-play-state:paused] group-focus-within/marquee:[animation-play-state:paused]",
);

/**
 * The homepage thank-you row: every contributor as a card linking to their
 * GitHub, scrolling left in a loop. Pure CSS: the list is rendered twice and
 * both copies slide one row width, so the second copy takes the first's
 * place. Under reduced motion it holds still and scrolls by hand instead.
 */
export function ContributorMarquee({
  contributors,
  lang,
  countLabel,
}: {
  contributors: Contributor[];
  lang: string;
  /** Plural forms keyed by Intl.PluralRules category, with `{count}`. */
  countLabel: Record<string, string>;
}) {
  if (contributors.length === 0) return null;

  const plural = new Intl.PluralRules(lang);
  const number = new Intl.NumberFormat(lang);
  const count = (n: number) =>
    (countLabel[plural.select(n)] ?? countLabel.other).replace(
      "{count}",
      number.format(n),
    );
  const cards = contributors.map((person) => (
    <li
      key={person.login ?? person.name}
      className="shrink-0"
      style={{ width: CARD_WIDTH }}
    >
      <ContributorCard person={person} count={count(person.contributions)} />
    </li>
  ));

  return (
    // The padding is room for the hover lift and glow, which the clipping
    // box would cut off; the negative margins keep the layout.
    <div
      className={cn(
        "group/marquee -mx-6 -my-6 flex gap-[var(--marquee-gap)] overflow-hidden py-6",
        "[mask-image:linear-gradient(to_right,transparent,#000_48px,#000_calc(100%_-_48px),transparent)]",
        "[scrollbar-width:none] motion-reduce:overflow-x-auto",
      )}
      style={
        {
          "--marquee-gap": `${GAP}px`,
          "--marquee-duration": `${(contributors.length * (CARD_WIDTH + GAP)) / SPEED}s`,
        } as CSSProperties
      }
    >
      <ul className={TRACK}>{cards}</ul>
      <ul aria-hidden inert className={cn(TRACK, "motion-reduce:hidden")}>
        {cards}
      </ul>
    </div>
  );
}

function ContributorCard({
  person,
  count,
}: {
  person: Contributor;
  count: string;
}) {
  const body = (
    <>
      {person.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element -- 128px remote GitHub avatar, sized at build time
        <img
          src={person.avatar}
          alt=""
          width={64}
          height={64}
          loading="lazy"
          decoding="async"
          className="light:bg-black/5 size-16 shrink-0 rounded-full bg-[#25222F] object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="text-divine-text light:bg-black/5 inline-flex size-16 shrink-0 items-center justify-center rounded-full bg-[#25222F] text-xl font-bold"
        >
          {person.name.slice(0, 1).toUpperCase()}
        </span>
      )}
      <p
        className={cn(
          "text-divine-text mt-3 w-full truncate text-[15px] leading-snug font-bold",
          person.login &&
            "group-hover:text-divine-primary-light transition-colors duration-200",
        )}
      >
        {person.name}
      </p>
      {person.login && (
        <p className="text-divine-text-muted mt-0.5 w-full truncate text-xs font-medium">
          @{person.login}
        </p>
      )}
      {/* mt-auto pins the count to the bottom, so a card without a login
          line still lines up with its neighbours. */}
      <div className="mt-auto pt-3">
        <p className="text-divine-text light:border-divine-border light:bg-black/5 rounded-full border border-[#25222F] bg-white/5 px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
          {count}
        </p>
      </div>
    </>
  );
  if (!person.login) return <div className={CARD}>{body}</div>;
  return (
    <a
      href={`https://github.com/${person.login}`}
      target="_blank"
      rel="noopener noreferrer"
      className={CARD_LINK}
    >
      {body}
    </a>
  );
}
