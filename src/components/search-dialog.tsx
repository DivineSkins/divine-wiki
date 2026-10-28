"use client";

import { create } from "@orama/orama";
import { useDocsSearch } from "fumadocs-core/search/client";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from "fumadocs-ui/components/dialog/search";
import { version } from "@/lib/search-version.json";
import { useTrackSearch } from "@/components/analytics";
import { useMessages } from "@/lib/hooks/useMessages";

// Orama rejects locale codes ("fr-FR") — it wants language names. Keep in
// sync with the localeMap in src/app/api/search/[locale]/route.ts so the client
// tokenizes queries the same way the index was built.
const ORAMA_LANGUAGES: Record<string, string> = {
  en: "english",
  "fr-FR": "french",
  "tr-TR": "turkish",
  "pt-BR": "portuguese",
  // Orama ships no Polish stemmer; mirrors the english fallback the pl-PL
  // index is built with.
  "pl-PL": "english",
  // No Vietnamese stemmer; mirrors the english fallback the vi-VN index is
  // built with.
  "vi-VN": "english",
};

// Most searches that find nothing are champion or hero names: players looking
// for a skin, not a guide. Point them at the Divine site. Rendered as an
// element (not called) so the hook inside runs as its own component.
function NoResults() {
  const { misc } = useMessages();
  return (
    <div className="text-fd-muted-foreground py-12 text-center text-sm">
      <p>{misc.searchNoResults}</p>
      <p className="mt-2">
        {misc.searchSkinsPrompt}{" "}
        <a
          href="https://divineskins.gg/"
          className="text-fd-primary font-medium hover:underline"
        >
          {misc.searchSkinsLink}
        </a>
      </p>
    </div>
  );
}
const renderNoResults = () => <NoResults />;

/**
 * Static search dialog: downloads the current locale's exported index once
 * (keyed by the search inputs so changed content fetches a fresh copy) and
 * runs all queries in the browser. Replaces the default dialog, which sent
 * a request to the Worker on every keystroke.
 *
 * `locale` is deliberately NOT passed to useDocsSearch: the per-locale route
 * returns a single-locale index, which the static client stores under the
 * "" key. Passing the locale would make it look up a key that isn't there.
 */
export default function StaticSearchDialog(props: SharedProps) {
  const { locale } = useI18n();
  const { search, setSearch, query } = useDocsSearch({
    type: "static",
    from:
      process.env.NODE_ENV === "development"
        ? `/api/search/${locale ?? "en"}`
        : `/search/${version}/${locale ?? "en"}.json`,
    initOrama: () =>
      create({
        schema: { _: "string" },
        language: ORAMA_LANGUAGES[locale ?? "en"] ?? "english",
      }),
  });
  // Results are reported as matching pages: heading and text hits on the
  // same page share its URL up to the #anchor.
  useTrackSearch(
    search,
    query.isLoading || query.data === "empty" || !query.data
      ? null
      : new Set(query.data.map((result) => result.url.split("#")[0])).size,
    props.open,
  );

  return (
    <SearchDialog
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
      {...props}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList
          items={query.data !== "empty" ? query.data : null}
          Empty={renderNoResults}
        />
      </SearchDialogContent>
    </SearchDialog>
  );
}
