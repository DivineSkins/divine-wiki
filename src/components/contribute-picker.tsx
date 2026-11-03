"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useParams, usePathname } from "next/navigation";
import {
  Button,
  cardVariants,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@divineskins/ui";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  HourglassIcon,
  PencilLine,
  PlusIcon,
} from "lucide-react";
import { GitHubLogo } from "@/components/brand-logos";
import { useMessages } from "@/lib/hooks/useMessages";
import { PremiumCard } from "@/components/mdx/PremiumCard";
import { acceptsGuides, GAMES, type Game } from "@/lib/games";

interface PickerContextValue {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const PickerContext = createContext<PickerContextValue | null>(null);

export function ContributePickerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const value = useMemo<PickerContextValue>(
    () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      isOpen,
    }),
    [isOpen],
  );
  return (
    <PickerContext.Provider value={value}>{children}</PickerContext.Provider>
  );
}

export function useContributePicker(): PickerContextValue {
  const ctx = useContext(PickerContext);
  if (!ctx) {
    throw new Error(
      "useContributePicker must be used inside ContributePickerProvider",
    );
  }
  return ctx;
}

export function ContributePickerModal() {
  const { isOpen, close } = useContributePicker();
  const pathname = usePathname();
  const initialPathnameRef = useRef(pathname);

  // Close the modal on navigation — without this, clicking a card opens the
  // target route but the modal stays mounted (the provider lives in the
  // layout) and covers the page.
  useEffect(() => {
    if (pathname !== initialPathnameRef.current) {
      close();
      initialPathnameRef.current = pathname;
    }
  }, [pathname, close]);

  // DialogContent mounts fresh on every open, so it always starts on the game
  // step.
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent className="divine-picker block max-h-[85vh] max-w-2xl p-6">
        <PickerSteps />
      </DialogContent>
    </Dialog>
  );
}

/**
 * Two steps: which game the guide is for, then how to write it (the visual
 * editor, which gets the game as `?game=`, or by hand on GitHub). Games
 * whose docs segment has no categories yet show as "Coming soon".
 */
function PickerSteps() {
  const messages = useMessages();
  const p = messages.picker;
  const params = useParams();
  const lang = (params?.lang as string) ?? "en";
  const [game, setGame] = useState<Game | null>(null);

  return (
    <>
      {game === null ? (
        <>
          <PickerHeading title={p.gameHeading} subtitle={p.gameSubheading} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {GAMES.map((option) => (
              <GameOption
                key={option.slug}
                game={option}
                available={acceptsGuides(option.slug)}
                comingSoon={p.comingSoon}
                onPick={() => setGame(option)}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setGame(null)}
            className="-mt-1 mb-4 pr-3 pl-1 font-semibold"
          >
            <ArrowLeftIcon aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element -- tiny cover thumbnail */}
            <img
              src={game.cover}
              alt=""
              width={18}
              height={24}
              className="h-6 w-[18px] rounded-[3px] object-cover"
            />
            <span className="text-divine-text">{game.name}</span>
            <span aria-hidden>·</span>
            {p.changeGame}
          </Button>
          <PickerHeading
            title={p.pickerHeading}
            subtitle={p.pickerSubheading}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PremiumCard
              title={p.visualEditorTitle}
              href={`/${lang}/draft?game=${game.slug}`}
              icon={<PencilLine className="h-5 w-5" />}
            >
              {p.visualEditorBody}
            </PremiumCard>
            <PremiumCard
              title={p.manualGithubTitle}
              href={`/${lang}/docs/${game.slug}/contributing`}
              icon={<GitHubLogo className="h-5 w-5" />}
            >
              {p.manualGithubBody}
            </PremiumCard>
          </div>
        </>
      )}
    </>
  );
}

function PickerHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <DialogHeader className="mb-5 pr-8">
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{subtitle}</DialogDescription>
    </DialogHeader>
  );
}

/**
 * A game in the picker: box art thumbnail, name, and either an arrow (pick
 * it) or "Coming soon" (its docs segment doesn't exist yet). Same card
 * recipe as PremiumCard so the two steps look like one dialog.
 */
function GameOption({
  game,
  available,
  comingSoon,
  onPick,
}: {
  game: Game;
  available: boolean;
  comingSoon: string;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      disabled={!available}
      className={cn(
        cardVariants({
          variant: available ? "interactive" : "default",
          padding: "none",
        }),
        "group focus-visible:ring-divine-accent/50 flex items-center gap-4 p-3 pr-4 text-left outline-none focus-visible:ring-1",
        available
          ? "hover:bg-divine-surface-raised cursor-pointer"
          : "cursor-default",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- 3:4 box art thumbnail */}
      <img
        src={game.cover}
        alt=""
        width={48}
        height={64}
        className={cn(
          "h-16 w-12 shrink-0 rounded-lg object-cover",
          !available && "opacity-60 saturate-50",
        )}
      />
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "text-divine-text block text-[15px] leading-snug font-bold transition-colors",
            available && "group-hover:text-divine-highlight",
          )}
        >
          {game.name}
        </span>
        {!available ? (
          <span className="text-divine-text-muted mt-0.5 inline-flex items-center gap-1.5 text-xs font-medium">
            <HourglassIcon className="size-3.5" aria-hidden />
            {comingSoon}
          </span>
        ) : null}
      </span>
      {available ? (
        <ChevronRightIcon
          className="text-divine-text-muted group-hover:text-divine-highlight size-4 shrink-0 transition-[color,transform] duration-200 group-hover:translate-x-0.5"
          aria-hidden
        />
      ) : null}
    </button>
  );
}

/**
 * Docs sidebar trigger ("Add a guide"): the homepage header's "Write a
 * guide" button (`solid`, `md`) at full width. The sidebar's placement,
 * divider and collapsed-rail styling live in global.css
 * (`.divine-sidebar-contribute`).
 */
export function ContributeButton({ className }: { className?: string }) {
  const messages = useMessages();
  const { open } = useContributePicker();
  return (
    <Button size="md" onClick={open} className={cn("w-full", className)}>
      {/* The plus sits inside the label so "+ Add a guide" centers as one
          unit. The collapsed rail hides the text and keeps the plus. */}
      <span className="inline-flex items-center gap-1.5">
        <PlusIcon className="size-3.5" strokeWidth={2.75} />
        {messages.nav.addGuide}
      </span>
    </Button>
  );
}

/**
 * Homepage CTA trigger. Renders a single button styled to match the existing
 * text-link CTA the home page already uses for "Write a guide". An optional
 * `icon` is rendered before the text.
 */
export function ContributeCtaButton({
  text,
  icon,
  className,
}: {
  text: string;
  icon?: ReactNode;
  className?: string;
}) {
  const { open } = useContributePicker();
  return (
    <button
      type="button"
      onClick={open}
      className={className ?? "text-divine-highlight text-sm hover:underline"}
    >
      {icon}
      {text}
    </button>
  );
}
