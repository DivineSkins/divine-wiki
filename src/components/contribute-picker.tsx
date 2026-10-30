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
  ArrowLeftIcon,
  ChevronRightIcon,
  HourglassIcon,
  PencilIcon,
  PencilLine,
  XIcon,
} from "lucide-react";
import { GitHubLogo } from "@/components/brand-logos";
import { useMessages } from "@/lib/hooks/useMessages";
import { PremiumCard } from "@/components/mdx/PremiumCard";
import { acceptsGuides, GAMES, type Game } from "@/lib/games";
import { cn } from "@/lib/utils";

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

  // Escape-to-close, mirroring src/app/[lang]/draft/handoff.tsx.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  // Close the modal on navigation — without this, clicking a card opens the
  // target route but the modal stays mounted (the provider lives in the
  // layout) and covers the page.
  useEffect(() => {
    if (pathname !== initialPathnameRef.current) {
      close();
      initialPathnameRef.current = pathname;
    }
  }, [pathname, close]);

  // The dialog mounts fresh on every open, so it always starts on the game
  // step.
  return isOpen ? <PickerDialog onClose={close} /> : null;
}

/**
 * Two steps: which game the guide is for, then how to write it (the visual
 * editor, which gets the game as `?game=`, or by hand on GitHub). Games
 * whose docs segment has no categories yet show as "Coming soon".
 */
function PickerDialog({ onClose }: { onClose: () => void }) {
  const messages = useMessages();
  const p = messages.picker;
  const params = useParams();
  const lang = (params?.lang as string) ?? "en";
  const [game, setGame] = useState<Game | null>(null);

  return (
    <div
      className="animate-in fade-in-0 fixed inset-0 z-50 flex items-center justify-center bg-[#0b0a0f]/80 p-4 backdrop-blur-sm duration-200"
      onClick={onClose}
    >
      <div
        className="divine-picker animate-in fade-in-0 zoom-in-95 light:bg-divine-surface light:border-divine-border relative max-h-[85vh] w-full max-w-2xl overflow-auto rounded-xl border border-[#191722] bg-[#121119] p-6 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] duration-200"
        role="dialog"
        aria-modal="true"
        aria-label={game ? p.pickerHeading : p.gameHeading}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          className="text-divine-text-muted hover:text-divine-text absolute top-4 right-4 flex size-8 items-center justify-center rounded-full transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-[rgba(120,60,181,0.4)] focus-visible:outline-none"
          onClick={onClose}
        >
          <XIcon className="size-4" aria-hidden />
        </button>

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
            <button
              type="button"
              onClick={() => setGame(null)}
              className="text-divine-text-muted hover:text-divine-text -mt-1 mb-4 inline-flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm font-semibold transition-colors hover:bg-white/5"
            >
              <ArrowLeftIcon className="size-4" aria-hidden />
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
            </button>
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
      </div>
    </div>
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
    <div className="mb-5 pr-8">
      <h2 className="text-divine-text text-lg leading-tight font-bold tracking-tight">
        {title}
      </h2>
      <p className="text-divine-text-muted mt-1.5 text-sm leading-relaxed font-medium">
        {subtitle}
      </p>
    </div>
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
        "group light:border-divine-border light:bg-divine-surface flex items-center gap-4 rounded-xl border border-[#191722] bg-[#121119] p-3 pr-4 text-left transition-[background-color,border-color] duration-200",
        "outline-none focus-visible:ring-1 focus-visible:ring-[#C084FC]",
        available
          ? "light:hover:bg-divine-elevated hover:border-[#25222F] hover:bg-[#1A1922]"
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
            available && "group-hover:text-divine-primary-light",
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
          className="text-divine-text-muted group-hover:text-divine-primary-light size-4 shrink-0 transition-[color,transform] duration-200 group-hover:translate-x-0.5"
          aria-hidden
        />
      ) : null}
    </button>
  );
}

/**
 * Nav-bar trigger. Renders an icon+text button styled to sit next to the
 * other Fumadocs nav links. Fumadocs renders this as a `type: "custom"` item
 * (or the fallback route imports it).
 */
export function ContributeButton({ className }: { className?: string }) {
  const messages = useMessages();
  const { open } = useContributePicker();
  return (
    <button
      type="button"
      onClick={open}
      className={cn(
        "text-fd-muted-foreground hover:text-fd-accent-foreground inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
        className,
      )}
    >
      <PencilIcon className="h-4 w-4" />
      <span>{messages.nav.contribute}</span>
    </button>
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
      className={
        className ?? "text-divine-primary-light text-sm hover:underline"
      }
    >
      {icon}
      {text}
    </button>
  );
}
