"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ComponentProps } from "react";
import { localizeHref } from "@/lib/localize-href";

/**
 * next/link that prefixes the current locale onto locale-less internal
 * hrefs (`/docs/...` → `/pl-PL/docs/...`). MDX components that take an
 * `href` prop (ToolCard, PremiumCard, GlowCTA) render through this so
 * content links keep the reader's language. See src/lib/localize-href.ts.
 */
export function LocalizedLink({ href, ...props }: ComponentProps<typeof Link>) {
  const params = useParams<{ lang?: string }>();
  const lang = typeof params?.lang === "string" ? params.lang : undefined;
  const localized =
    lang && typeof href === "string"
      ? (localizeHref(href, lang) ?? href)
      : href;
  return <Link {...props} href={localized} />;
}
