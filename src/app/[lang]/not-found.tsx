import Link from "next/link";
import { DiscordLogo } from "@/components/brand-logos";
import { GlowCTA } from "@/components/mdx/GlowCTA";
import { discordInviteUrl } from "@/lib/config";

export default function NotFound() {
  return (
    <main className="relative flex min-h-[70vh] flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(120,60,181,0.2),transparent_60%)]"
        aria-hidden
      />

      <p className="text-divine-text-muted text-xs font-[var(--font-ui)] font-semibold tracking-[0.3em] uppercase">
        404
      </p>
      <h1 className="text-divine-text mt-3 text-5xl font-[var(--font-hero)] font-extrabold tracking-tight md:text-7xl">
        <span className="divine-gradient-text">Page</span> not found
      </h1>
      <p className="text-divine-text-muted mt-5 max-w-xl text-base font-[var(--font-section)] md:text-lg">
        Wrong link, deleted guide, or it never existed. Try the docs index, or
        ping us in Discord and we&apos;ll point you the right way.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <GlowCTA href="/en/docs" size="lg">
          Back to the wiki
        </GlowCTA>
        <GlowCTA href="/en" size="lg" variant="ghost">
          Home
        </GlowCTA>
      </div>

      <hr className="divine-hr mt-12 w-40 opacity-60" />

      <Link
        href={discordInviteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-divine-text-muted hover:text-divine-primary-light mt-6 inline-flex items-center gap-2 text-sm no-underline transition-colors"
      >
        <DiscordLogo className="size-4" />
        Ask in the Divine Discord
      </Link>
    </main>
  );
}
