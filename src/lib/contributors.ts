import contributors from "@/lib/contributors.json";

export interface Contributor {
  name: string;
  /** GitHub login; links the card to the profile. */
  login: string | null;
  avatar: string | null;
  /** Commits to the repo, co-authored ones included. */
  contributions: number;
}

/**
 * Everyone with a commit in the wiki repo, most commits first, for the
 * homepage's thank-you row. Written by scripts/prebuild.mjs from git history
 * (bots skipped, see the "Page credits" block there); empty when the build
 * has no history, which hides the row.
 */
export const CONTRIBUTORS: Contributor[] = contributors;
