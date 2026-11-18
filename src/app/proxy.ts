import { createI18nMiddleware } from "fumadocs-core/i18n/middleware";
import { i18n } from "@/lib/i18n";

export default createI18nMiddleware(i18n);

export const config = {
  // `.+` rather than `.*` leaves the bare `/` alone: it's the English
  // homepage (a rewrite to /en in next.config.mjs), not a path missing its
  // locale.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|sitemap.ts).+)",
  ],
};
