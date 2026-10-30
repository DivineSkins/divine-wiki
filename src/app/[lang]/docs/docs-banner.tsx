import Link from "next/link";
import { githubRepoUrl } from "@/lib/config";
import { getMessages } from "@/lib/locale";

/**
 * Attribution line pinned to the bottom of the table-of-contents rail, under
 * the Ask AI panel: "Written by the community · Open source", with "Open
 * source" linking to the repo. One line at the rail's width in English; the
 * strings live in messages (`misc.writtenByCommunity`, `misc.openSource`).
 * The Discord link lives in the sidebar footer next to the GitHub icon (see
 * layout.shared.tsx).
 */
export function DocsBanner({ lang }: { lang: string }) {
  const t = getMessages(lang).misc;
  return (
    <p className="border-divine-border text-divine-text-muted border-t pt-4 text-xs leading-relaxed">
      {t.writtenByCommunity}
      <span aria-hidden> · </span>
      <Link
        href={githubRepoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-divine-primary-light hover:text-divine-text underline-offset-4 hover:underline"
      >
        {t.openSource}
      </Link>
    </p>
  );
}
