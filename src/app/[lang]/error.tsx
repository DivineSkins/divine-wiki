"use client";

import { useEffect } from "react";
import { Button } from "@divineskins/ui";
import { GlowCTA } from "@/components/mdx/GlowCTA";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-[70vh] flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.15),transparent_60%)]"
        aria-hidden
      />

      <p className="text-divine-error text-xs font-[var(--font-ui)] font-semibold tracking-[0.3em] uppercase">
        Something broke
      </p>
      <h1 className="text-divine-text mt-3 text-5xl font-[var(--font-hero)] font-extrabold tracking-tight md:text-7xl">
        <span className="divine-gradient-text">Crash</span> reported
      </h1>
      <p className="text-divine-text-muted mt-5 max-w-xl text-base font-[var(--font-section)] md:text-lg">
        The page hit an error and stopped rendering. Try once more - if it
        happens again, drop us a note in Discord with the digest below.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <GlowCTA href="/en/docs" size="lg" variant="ghost">
          Back to docs
        </GlowCTA>
      </div>

      {error.digest ? (
        <details className="border-divine-border bg-divine-surface text-divine-text-muted mt-10 max-w-lg rounded-[8px] border px-4 py-3 text-left text-xs">
          <summary className="text-divine-text cursor-pointer">
            Error details
          </summary>
          <pre className="mt-2 overflow-x-auto break-all whitespace-pre-wrap">
            digest: {error.digest}
            {error.message ? `\nmessage: ${error.message}` : ""}
          </pre>
        </details>
      ) : null}
    </main>
  );
}
