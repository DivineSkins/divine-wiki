// Server only: importing this from a client component would ship the whole
// credits table to the browser.
import pageCredits from "@/lib/page-credits.json";
import pageDates from "@/lib/page-dates.json";
import { githubRepoUrl } from "@/lib/config";
import { contentPath } from "@/lib/source";
import {
  githubAvatar,
  writersFromFrontmatter,
  type CreditPerson,
} from "@/components/guide-credits";

// Both files are written by scripts/prebuild.mjs from git history (see the
// "Page credits" block there for what counts). Keyed like page.path
// ("en/lol/maya/rigging.mdx"); empty when the build has no history.
const credits: {
  people: Record<
    string,
    { name: string; login: string | null; avatar: string | null }
  >;
  pages: Record<string, { creator: string | null; contributors: string[] }>;
} = pageCredits;
const dates: Record<string, string> = pageDates;

interface GuidePage {
  path: string;
  data: {
    credits?: { discord?: string; github?: string };
    authors?: { name: string; url?: string }[];
  };
}

function person(key: string): CreditPerson | null {
  const p = credits.people[key];
  if (!p) return null;
  return {
    name: p.name,
    login: p.login,
    avatar: p.avatar ?? (p.login ? githubAvatar(p.login) : null),
  };
}

const samePerson = (a: CreditPerson, b: CreditPerson) =>
  a.login && b.login
    ? a.login.toLowerCase() === b.login.toLowerCase()
    : a.name.toLowerCase() === b.name.toLowerCase();

/**
 * Who wrote a guide and who has edited it since. The writer is whoever the
 * frontmatter names (`credits`, else `authors`), else whoever created the
 * file in git. Translations credit the English guide's people: a translated
 * page is the same guide. The date and history link are the page's own file.
 */
export function getGuideCredits(page: GuidePage) {
  // Keyed by file: shared sections are one file shown in every game.
  const file = contentPath(page.path);
  const englishPath = file.replace(/^[^/]+\//, "en/");
  const record = credits.pages[englishPath];
  const creator = record?.creator ? person(record.creator) : null;
  const named = writersFromFrontmatter(page.data.credits, page.data.authors);
  const writers = named.length ? named : creator ? [creator] : [];

  const contributors: CreditPerson[] = [];
  for (const candidate of [
    creator,
    ...(record?.contributors ?? []).map(person),
  ]) {
    if (!candidate) continue;
    if ([...writers, ...contributors].some((p) => samePerson(p, candidate))) {
      continue;
    }
    contributors.push(candidate);
  }

  return {
    writers,
    contributors,
    updated: dates[file] ?? null,
    historyUrl: `${githubRepoUrl}/commits/main/content/docs/${file}`,
  };
}
