import type { ReactNode } from "react";
import { DiscordLogo } from "@/components/brand-logos";
import { PANEL_BORDER, PANEL_FILL } from "@/components/home/styles";
import { cn } from "@/lib/utils";

/**
 * Credits row at the bottom of every guide: who wrote it, who has edited it
 * since, when it last changed, and a link to its full history on GitHub.
 * Data comes from getGuideCredits() (src/lib/guide-credits.ts) on the published
 * page, and from the frontmatter alone in the /draft preview. Plain links, no
 * client JS, so it renders the same on the server and in the editor.
 */

export interface CreditPerson {
  name: string;
  /** GitHub login; links the name and avatar to the profile. */
  login: string | null;
  avatar: string | null;
  /** Discord handle from the frontmatter `credits` block. */
  discord?: string;
}

interface FrontmatterCredits {
  discord?: string;
  github?: string;
}

interface FrontmatterAuthor {
  name: string;
  url?: string;
}

/** "@name", "name" and "https://github.com/name/" all give "name". */
function githubLogin(value?: string): string | null {
  const login = (value ?? "")
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0];
  return /^[a-z0-9-]+$/i.test(login) ? login : null;
}

export function githubAvatar(login: string): string {
  return `https://github.com/${login}.png?size=96`;
}

/**
 * The writers a guide names itself: the `credits` block the /draft editor
 * writes, else the older `authors` list.
 */
export function writersFromFrontmatter(
  credits?: FrontmatterCredits,
  authors?: FrontmatterAuthor[],
): CreditPerson[] {
  const login = githubLogin(credits?.github);
  const discord = credits?.discord?.trim().replace(/^@/, "") || undefined;
  if (login || discord) {
    return [
      {
        name: login ?? discord!,
        login,
        avatar: login ? githubAvatar(login) : null,
        discord,
      },
    ];
  }
  return (authors ?? []).map((author) => {
    const authorLogin = /github\.com/i.test(author.url ?? "")
      ? githubLogin(author.url)
      : null;
    return {
      name: author.name,
      login: authorLogin,
      avatar: authorLogin ? githubAvatar(authorLogin) : null,
    };
  });
}

/** Round avatar, or the person's initial when there's no picture. */
function CreditAvatar({
  person,
  size,
}: {
  person: Pick<CreditPerson, "name" | "avatar">;
  size: number;
}) {
  return person.avatar ? (
    // eslint-disable-next-line @next/next/no-img-element -- small remote avatar, sized by the caller
    <img
      src={person.avatar}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className="bg-divine-border/40 shrink-0 rounded-full"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      aria-hidden
      className="text-divine-text light:bg-black/5 inline-flex shrink-0 items-center justify-center rounded-full bg-[#25222F] text-xs font-semibold"
      style={{ width: size, height: size }}
    >
      {person.name.slice(0, 1).toUpperCase()}
    </span>
  );
}

const LABEL =
  "text-[11px] tracking-[0.18em] text-[#8B8D98]/70 uppercase light:text-divine-text-muted";

// Person chip: avatar and name in one pill, so every name is a link and
// every row lines up. Hover is the wiki's neutral one (fill steps up, as on
// sidebar rows and header links), not purple.
const CHIP =
  "inline-flex h-8 items-center gap-2 rounded-full border border-[#25222F] bg-white/5 pr-3 pl-1 text-[13px] leading-none font-semibold text-divine-text no-underline " +
  "light:border-divine-border light:bg-black/5";
const CHIP_LINK =
  CHIP +
  " transition-colors duration-200 hover:bg-white/10 light:hover:bg-black/10 " +
  "outline-none focus-visible:ring-1 focus-visible:ring-[#C084FC]";

function PersonChip({ person }: { person: CreditPerson }) {
  const body = (
    <>
      <CreditAvatar person={person} size={24} />
      <span>{person.name}</span>
    </>
  );
  if (!person.login) return <span className={CHIP}>{body}</span>;
  return (
    <a
      href={`https://github.com/${person.login}`}
      target="_blank"
      rel="noopener noreferrer"
      className={CHIP_LINK}
    >
      {body}
    </a>
  );
}

const CONTRIBUTORS_MAX = 8;

interface GuideCreditsProps {
  writers: CreditPerson[];
  contributors?: CreditPerson[];
  /** ISO date of the guide's last commit. */
  updated?: string | null;
  /** The guide's commit history on GitHub. */
  historyUrl?: string;
  lang: string;
  labels: {
    writtenBy: string;
    contributors: string;
    lastUpdated: string;
    history: string;
    historyLabel: string;
  };
  /** Footer action, e.g. the "Edit on GitHub" pill. */
  action?: ReactNode;
  className?: string;
}

/**
 * One panel: the people as rows of chips (label column on the left from
 * `sm`), then a footer with the date, the history link, and the action.
 * A guide's own hand-written "## Credits" section, when it has one, sits
 * right above it.
 */
export function GuideCredits({
  writers,
  contributors = [],
  updated,
  historyUrl,
  lang,
  labels,
  action,
  className,
}: GuideCreditsProps) {
  const date = updated
    ? new Intl.DateTimeFormat(lang, { dateStyle: "medium" }).format(
        new Date(updated),
      )
    : null;
  const people = writers.length > 0 || contributors.length > 0;
  if (!people && !date && !action) return null;

  const shown = contributors.slice(0, CONTRIBUTORS_MAX);
  const more = contributors.length - shown.length;
  const discords = writers.filter((w) => w.discord && w.discord !== w.name);

  return (
    <div
      className={cn(
        "not-prose overflow-hidden rounded-2xl",
        PANEL_FILL,
        PANEL_BORDER,
        className,
      )}
    >
      {people && (
        <dl className="grid items-center gap-x-6 gap-y-2 p-5 sm:grid-cols-[max-content_1fr] sm:gap-y-3">
          {writers.length > 0 && (
            <>
              <dt className={LABEL}>{labels.writtenBy}</dt>
              <dd className="flex flex-wrap gap-2">
                {writers.map((person) => (
                  <PersonChip
                    key={person.login ?? person.name}
                    person={person}
                  />
                ))}
                {discords.map((person) => (
                  <span
                    key={`discord-${person.name}`}
                    className={cn(CHIP, "pl-2.5")}
                  >
                    <DiscordLogo className="text-divine-info size-3.5 shrink-0" />
                    {person.discord}
                  </span>
                ))}
              </dd>
            </>
          )}
          {contributors.length > 0 && (
            <>
              <dt className={cn(LABEL, writers.length > 0 && "max-sm:mt-3")}>
                {labels.contributors}
              </dt>
              <dd className="flex flex-wrap gap-2">
                {shown.map((person) => (
                  <PersonChip
                    key={person.login ?? person.name}
                    person={person}
                  />
                ))}
                {more > 0 &&
                  (historyUrl ? (
                    <a
                      href={historyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={labels.historyLabel}
                      className={cn(CHIP_LINK, "pl-3")}
                    >
                      +{more}
                    </a>
                  ) : (
                    <span className={cn(CHIP, "pl-3")}>+{more}</span>
                  ))}
              </dd>
            </>
          )}
        </dl>
      )}

      {(date || action) && (
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3.5",
            people &&
              "light:border-divine-border [.minimal_&]:border-divine-border border-t border-[#191722]",
          )}
        >
          {date ? (
            <p className="text-divine-text-muted text-[13px]">
              {labels.lastUpdated} {date}
              {historyUrl && (
                <>
                  <span aria-hidden> · </span>
                  <a
                    href={historyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={labels.historyLabel}
                    className="text-divine-primary-light hover:text-divine-text underline-offset-4 transition-colors duration-200 hover:underline"
                  >
                    {labels.history}
                  </a>
                </>
              )}
            </p>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
    </div>
  );
}
