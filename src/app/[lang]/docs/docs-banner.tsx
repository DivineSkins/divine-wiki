import Link from "next/link";
import { githubRepoUrl } from "@/lib/config";

/**
 * Attribution banner pinned to the bottom of the table-of-contents rail —
 * a one-line "written by the community, open source on GitHub" note. Passed
 * as the TOC `footer` slot and pushed to the bottom of that column with
 * `mt-auto` so it fills the empty space under the page outline. Compact
 * (text-xs) to fit the narrow TOC width. The Discord link lives in the
 * sidebar footer next to the GitHub icon (see layout.shared.tsx).
 */
export function DocsBanner() {
  return (
    <div className="border-divine-border text-divine-text-muted mt-auto border-t pt-4 text-xs leading-relaxed">
      Written by the Divine Skins community. Open source on{" "}
      <Link
        href={githubRepoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-divine-primary-light underline-offset-4 hover:text-white hover:underline"
      >
        GitHub
      </Link>
      .
    </div>
  );
}
