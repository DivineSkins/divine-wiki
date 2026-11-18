import type { CSSProperties } from "react";
import { Card } from "@divineskins/ui";
import type { Contributor } from "@/lib/contributors";
import { CardLink } from "@/components/ui/links";
import { cn } from "@/lib/utils";
import { MarqueeViewport } from "./marquee-viewport";

// The site's featured-creators card (CreatorCard in CreatorsPage.tsx): a
// 180px column of avatar, name and count on a Card.
const CARD_WIDTH = 180;
const GAP = 16;
/** px per second, the site's MarqueeRow default. */
const SPEED = 40;

const CARD =
  "group flex h-full flex-col items-center px-4 pt-5 pb-4 text-center";
// The fill and rim ease over 300ms; nothing moves, the row is already moving.
const CARD_LINK = cn(
  CARD,
  "focus-visible:ring-divine-accent/50 duration-300 outline-none focus-visible:ring-1",
);
// Each copy of the row is at least as wide as the box, so the loop never
// shows a gap. MarqueeViewport moves them and eases them to a stop on hover.
const TRACK =
  "flex min-w-full shrink-0 justify-around gap-[var(--marquee-gap)] [transform:translate3d(var(--marquee-x,0px),0,0)]";

/**
 * The homepage thank-you row: every contributor as a card linking to their
 * GitHub, scrolling left in a loop. The list is rendered twice, so the second
 * copy can take the first's place. Under reduced motion it holds still and
 * scrolls by hand.
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
    // The padding is room for the focus ring, which the clipping box would
    // cut off; the negative margins keep the layout.
    <MarqueeViewport
      speed={SPEED}
      className={cn(
        "-mx-6 -my-1 flex gap-[var(--marquee-gap)] overflow-hidden py-1",
        "[mask-image:linear-gradient(to_right,transparent,#000_48px,#000_calc(100%_-_48px),transparent)]",
        "[scrollbar-width:none] motion-reduce:overflow-x-auto",
      )}
      style={
        {
          "--marquee-gap": `${GAP}px`,
        } as CSSProperties
      }
    >
      <ul className={TRACK}>{cards}</ul>
      <ul aria-hidden inert className={cn(TRACK, "motion-reduce:hidden")}>
        {cards}
      </ul>
    </MarqueeViewport>
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
          className="bg-divine-border-subtle size-16 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="text-divine-text bg-divine-border-subtle inline-flex size-16 shrink-0 items-center justify-center rounded-full text-xl font-bold"
        >
          {person.name.slice(0, 1).toUpperCase()}
        </span>
      )}
      <p
        className={cn(
          "text-divine-text mt-3 w-full truncate text-[15px] leading-snug font-bold",
          person.login &&
            "group-hover:text-divine-highlight transition-colors duration-300",
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
        <p className="text-divine-text border-divine-border-subtle light:bg-black/5 rounded-full border bg-white/5 px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
          {count}
        </p>
      </div>
    </>
  );
  if (!person.login) {
    return (
      <Card padding="none" className={CARD}>
        {body}
      </Card>
    );
  }
  return (
    <CardLink href={`https://github.com/${person.login}`} className={CARD_LINK}>
      {body}
    </CardLink>
  );
}
