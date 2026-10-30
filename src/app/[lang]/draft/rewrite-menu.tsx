"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ClipboardCheck, ExternalLink, Sparkles } from "lucide-react";
import { useMessages } from "@/lib/hooks/useMessages";
import { ASSISTANTS } from "@/lib/ai-assistants";
import {
  buildRewritePrompt,
  MAX_PREFILL_URL,
} from "@/lib/draft/rewrite-prompt";
import { cn } from "@/lib/utils";
import { MENU_ROW, pillClassName, POPOVER } from "./styles";

// Chat apps only: they take a whole guide and hand one back.
const CHAT_ASSISTANTS = ASSISTANTS.filter((assistant) => assistant.newChat);

interface RewriteMenuProps {
  game: string;
  gameName: string;
  title: string;
  description: string;
  body: string;
}

/**
 * "Rewrite with AI": opens a chat assistant with the draft and the wiki's
 * component docs, asking for the guide back rewritten with our components
 * (the editor's twin of "Ask AI about this guide" on published pages).
 * The draft isn't online yet, so it travels in the prompt itself. A draft
 * too long for a link opens an empty chat instead and goes through the
 * clipboard: the writer pastes it and sends. The message is copied on every
 * click either way, as a fallback.
 */
export function RewriteMenu({
  game,
  gameName,
  title,
  description,
  body,
}: RewriteMenuProps) {
  const d = useMessages().draft;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Built only while the menu is open: no work on every keystroke.
  const prompt = useMemo(
    () =>
      open
        ? buildRewritePrompt({ game, gameName, title, description, body })
        : "",
    [open, game, gameName, title, description, body],
  );
  const encoded = useMemo(() => encodeURIComponent(prompt), [prompt]);
  const tooLong = CHAT_ASSISTANTS.some(
    (assistant) => assistant.href(encoded).length > MAX_PREFILL_URL,
  );

  // Close on Escape or a click outside the menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      if (tooLong) setCopied(true);
    } catch {
      // Clipboard can reject (denied permission). A short draft still
      // reaches the chat through the link.
    }
  };

  const empty = body.trim().length === 0;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={pillClassName("secondary")}
        disabled={empty}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={d.rewriteWithAi}
        onClick={() => {
          setCopied(false);
          setOpen((v) => !v);
        }}
      >
        <Sparkles className="text-divine-primary-light light:text-divine-primary size-4" />
        <span className="hidden sm:inline">{d.rewriteWithAi}</span>
      </button>

      {open && (
        <div
          className={cn(
            POPOVER,
            "absolute top-full right-0 z-40 mt-2 w-80 max-w-[calc(100vw-1.5rem)] p-2",
          )}
        >
          <div className="px-2.5 pt-2 pb-3">
            <p className="text-divine-text font-[family-name:var(--font-hero)] text-sm font-bold">
              {d.rewriteWithAi}
            </p>
            <p className="text-divine-text-muted mt-1 text-xs leading-relaxed">
              {d.rewriteHint}
            </p>
          </div>

          <ul role="menu">
            {CHAT_ASSISTANTS.map(({ name, Logo, href, newChat }) => (
              <li key={name} role="none">
                <a
                  role="menuitem"
                  href={tooLong ? newChat : href(encoded)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={d.rewriteOpen.replace("{provider}", name)}
                  className={cn(MENU_ROW, "group no-underline")}
                  onClick={() => {
                    void copyPrompt();
                    if (!tooLong) setOpen(false);
                  }}
                >
                  <Logo className="size-4 shrink-0" />
                  <span className="text-divine-text">{name}</span>
                  <ExternalLink className="ml-auto size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              </li>
            ))}
          </ul>

          {tooLong && (
            <p
              className={cn(
                "border-fd-border mt-2 flex gap-2 border-t px-2.5 pt-3 pb-1.5 text-xs leading-relaxed",
                copied ? "text-divine-text" : "text-divine-text-muted",
              )}
            >
              <ClipboardCheck
                className={cn(
                  "mt-px size-3.5 shrink-0",
                  copied && "text-divine-success",
                )}
              />
              {copied ? d.rewriteCopied : d.rewriteLong}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
