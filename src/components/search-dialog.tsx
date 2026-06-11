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
import gitInfo from "@/git-info.json";

// Orama rejects locale codes ("fr-FR") — it wants language names. Keep in
// sync with the localeMap in src/app/api/search/route.ts so the client
// tokenizes queries the same way the index was built.
const ORAMA_LANGUAGES: Record<string, string> = {
  en: "english",
  "fr-FR": "french",
  "tr-TR": "turkish",
  "pt-BR": "portuguese",
};

/**
 * Static search dialog: downloads the current locale's exported index once
 * (keyed by the deployed commit so a new deploy fetches a fresh copy) and
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
    from: `/api/search/${locale ?? "en"}?v=${gitInfo.commit}`,
    initOrama: () =>
      create({
        schema: { _: "string" },
        language: ORAMA_LANGUAGES[locale ?? "en"] ?? "english",
      }),
  });

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
        <SearchDialogList items={query.data !== "empty" ? query.data : null} />
      </SearchDialogContent>
    </SearchDialog>
  );
}
