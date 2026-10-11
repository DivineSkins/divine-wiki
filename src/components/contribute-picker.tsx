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
import { PencilIcon, PencilLine, XIcon } from "lucide-react";
import { GitHubLogo } from "@/components/brand-logos";
import { useMessages } from "@/lib/hooks/useMessages";
import { PremiumCard } from "@/components/mdx/PremiumCard";
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
  const messages = useMessages();
  const p = messages.picker;
  const { isOpen, close } = useContributePicker();
  const params = useParams();
  const lang = (params?.lang as string) ?? "en";
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

  if (!isOpen) return null;

  return (
    <div
      className="animate-in fade-in-0 fixed inset-0 z-50 flex items-center justify-center bg-[#0b0a0f]/80 p-4 backdrop-blur-sm duration-200"
      onClick={close}
    >
      <div
        className="divine-picker animate-in fade-in-0 zoom-in-95 light:bg-divine-surface light:border-divine-border relative max-h-[85vh] w-full max-w-2xl overflow-auto rounded-xl border border-[#191722] bg-[#121119] p-6 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] duration-200"
        role="dialog"
        aria-modal="true"
        aria-label={p.pickerHeading}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4 pr-8">
          <div>
            <h2 className="text-divine-text text-lg leading-tight font-bold tracking-tight">
              {p.pickerHeading}
            </h2>
            <p className="text-divine-text-muted mt-1.5 text-sm leading-relaxed font-medium">
              {p.pickerSubheading}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="text-divine-text-muted hover:text-divine-text absolute top-4 right-4 flex size-8 items-center justify-center rounded-full transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-[rgba(120,60,181,0.4)] focus-visible:outline-none"
            onClick={close}
          >
            <XIcon className="size-4" aria-hidden />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PremiumCard
            title={p.visualEditorTitle}
            href={`/${lang}/draft`}
            icon={<PencilLine className="h-5 w-5" />}
          >
            {p.visualEditorBody}
          </PremiumCard>
          <PremiumCard
            title={p.manualGithubTitle}
            href={`/${lang}/docs/contributing`}
            icon={<GitHubLogo className="h-5 w-5" />}
          >
            {p.manualGithubBody}
          </PremiumCard>
        </div>
      </div>
    </div>
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
