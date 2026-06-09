import Image from "next/image";
import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";
import { discordInviteUrl } from "@/lib/config";

/**
 * Attribution banner pinned to the bottom of the table-of-contents rail —
 * Divine Skins logo, "written by the community", and a "Get help in Discord"
 * link. Passed as the TOC `footer` slot and pushed to the bottom of that
 * column with `mt-auto` so it fills the empty space under the page outline.
 * Compact (text-xs) to fit the narrow TOC width.
 */
export function DocsBanner() {
  return (
    <div className="border-divine-border text-divine-text-muted mt-auto flex flex-col gap-2.5 border-t pt-4 text-xs leading-relaxed">
      <div className="flex items-center gap-2.5">
        <Image
          src="/brand/footer-logo.webp"
          width={106}
          height={40}
          alt="Divine Skins"
          className="h-7 w-auto shrink-0 opacity-80"
        />
        <span>
          Written by the Divine Skins community. Open source on{" "}
          <Link
            href="https://github.com/DivineSkins/divine-wiki"
            target="_blank"
            rel="noopener noreferrer"
            className="text-divine-primary-light underline-offset-4 hover:text-white hover:underline"
          >
            GitHub
          </Link>
          .
        </span>
      </div>
      <Link
        href={discordInviteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-divine-primary-light inline-flex items-center gap-1.5 transition-colors"
      >
        Get help in Discord
        <ExternalLinkIcon className="size-3" aria-hidden />
      </Link>
    </div>
  );
}
