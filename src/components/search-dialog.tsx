"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { create } from "@orama/orama";
import { useDocsSearch } from "fumadocs-core/search/client";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from "fumadocs-ui/components/dialog/search";
import { Chip, EmptyState, SearchInput, Spinner } from "@divineskins/ui";
import { SearchX } from "lucide-react";
import { DEFAULT_GAME, GAMES } from "@/lib/games";
import { SEARCH_GAMES, searchGameFromPath, searchLanguage } from "@/lib/search";
import { version } from "@/lib/search-version.json";
import { useTrackSearch } from "@/components/analytics";
import { useMessages } from "@/lib/hooks/useMessages";

const SEARCH_GAME_OPTIONS = GAMES.filter((game) =>
  SEARCH_GAMES.includes(game.slug),
);

// The game the reader last read or picked, so search on pages outside a
// game (the homepage, /draft) starts in that game.
const LAST_GAME_KEY = "divine-search-game";
function readLastGame(): string | undefined {
  try {
    const game = localStorage.getItem(LAST_GAME_KEY);
    return game && SEARCH_GAMES.includes(game) ? game : undefined;
  } catch {
    return undefined;
  }
}
function writeLastGame(game: string) {
  try {
    localStorage.setItem(LAST_GAME_KEY, game);
  } catch {
    // Storage blocked: search falls back to the default game.
  }
}
// Read on every render; nothing needs to subscribe.
const noSubscribe = () => () => {};
const noServerGame = () => undefined;

// Most searches that find nothing are champion or hero names: players looking
// for a skin, not a guide. Point them at the Divine site. Rendered as an
// element (not called) so the hook inside runs as its own component.
function NoResults() {
  const { misc } = useMessages();
  return (
    <EmptyState
      size="sm"
      icon={<SearchX />}
      title={misc.searchNoResults}
      description={
        <>
          {misc.searchSkinsPrompt}{" "}
          <a
            href="https://divineskins.gg/"
            className="text-divine-highlight font-medium hover:underline"
          >
            {misc.searchSkinsLink}
          </a>
        </>
      }
      className="py-10"
    />
  );
}
const renderNoResults = () => <NoResults />;

/**
 * Static search dialog: searches one game at a time. It downloads that
 * game's exported index for the current locale once (keyed by the search
 * inputs so changed content fetches a fresh copy) and runs all queries in
 * the browser. Starts in the game of the page being read; the footer
 * switches games.
 *
 * `locale` is deliberately NOT passed to useDocsSearch: each file is a
 * single-locale index, which the static client stores under the "" key.
 * Passing the locale would make it look up a key that isn't there.
 */
export default function StaticSearchDialog(props: SharedProps) {
  const locale = useI18n().locale ?? "en";
  const { nav } = useMessages();
  const pathname = usePathname();
  const pageGame = searchGameFromPath(pathname);
  const lastGame = useSyncExternalStore(
    noSubscribe,
    readLastGame,
    noServerGame,
  );
  // A game picked in the footer holds until the reader opens another page.
  const [picked, setPicked] = useState<{ on: string; game: string }>();
  const game =
    (picked?.on === pathname ? picked.game : undefined) ??
    pageGame ??
    lastGame ??
    DEFAULT_GAME;

  useEffect(() => {
    if (pageGame) writeLastGame(pageGame);
  }, [pageGame]);

  const { search, setSearch, query } = useDocsSearch({
    type: "static",
    from:
      process.env.NODE_ENV === "development"
        ? `/api/search/${locale}/${game}`
        : `/search/${version}/${locale}/${game}.json`,
    initOrama: () =>
      create({
        schema: { _: "string" },
        language: searchLanguage(locale, game),
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
      {/* The package's Dialog overlay and surface. */}
      <SearchDialogOverlay className="bg-divine-overlay/80 backdrop-blur-[4px]" />
      <SearchDialogContent className="bg-divine-panel border-divine-border-faint text-divine-text shadow-divine-dialog font-manrope rounded-2xl *:border-b-0">
        <SearchDialogHeader className="p-3">
          <SearchInput
            value={search}
            onValueChange={setSearch}
            placeholder={nav.search}
            className="w-full"
            trailing={
              <span className="flex items-center gap-2">
                {query.isLoading ? <Spinner size="xs" tone="muted" /> : null}
                <SearchDialogClose className="text-divine-muted font-manrope h-7 rounded-lg border-0 bg-white/[0.06] px-2 text-[11px] font-bold" />
              </span>
            }
          />
        </SearchDialogHeader>
        <SearchDialogList
          items={query.data !== "empty" ? query.data : null}
          Empty={renderNoResults}
          className="border-divine-border-subtle mx-3 border-t data-[empty=true]:border-t-0"
        />
        {SEARCH_GAME_OPTIONS.length > 1 && (
          <SearchDialogFooter className="border-divine-border-subtle mx-3 flex flex-wrap gap-1.5 border-t bg-transparent px-0">
            {SEARCH_GAME_OPTIONS.map((option) => (
              <Chip
                key={option.slug}
                size="sm"
                selected={option.slug === game}
                onClick={() => {
                  setPicked({ on: pathname, game: option.slug });
                  writeLastGame(option.slug);
                }}
              >
                {option.name}
              </Chip>
            ))}
          </SearchDialogFooter>
        )}
      </SearchDialogContent>
    </SearchDialog>
  );
}
