import type { ComponentType } from "react";
import { Sparkles } from "lucide-react";
import {
  ClaudeLogo,
  GeminiLogo,
  GrokLogo,
  OpenAILogo,
  PerplexityLogo,
} from "@/components/brand-logos";
import {
  PANEL_BORDER,
  PANEL_FILL,
  TOOLTIP_CHIP,
} from "@/components/home/styles";
import { getMessages } from "@/lib/locale";
import { cn } from "@/lib/utils";

/**
 * "Ask AI about this guide": one link per assistant that opens it in a new
 * tab with a prompt naming this guide and linking it, so the assistant reads
 * the page and walks the reader through it. The prompt is in the reader's
 * language, so the answer comes back in it too.
 *
 * Two placements, only one visible at a time:
 * - `rail`: a panel at the bottom of the sticky table-of-contents column
 *   (xl and up). It stays in view wherever the reader gets stuck, which is
 *   usually mid-guide, not at the top or bottom.
 * - `inline`: a row under the page title, for screens where fumadocs hides
 *   that column (below xl) and for `full` pages, which have no TOC.
 *
 * Plain links and CSS tooltips, so no client JS. The analytics click
 * listener logs each click as an outbound event (host + path only, never the
 * prompt), which shows which assistants readers pick. The Cloudflare WAF
 * rule "Let AI assistants read the wiki" lets these assistants' fetchers
 * through bot detection; add a new assistant's user agent there too.
 */

interface Provider {
  name: string;
  Logo: ComponentType<{ className?: string }>;
  /** Chat URL with the prompt prefilled. `q` is already URI-encoded. */
  href: (q: string) => string;
}

const PROVIDERS: Provider[] = [
  {
    name: "ChatGPT",
    Logo: OpenAILogo,
    // `hints=search` turns on web search, so it opens the link.
    href: (q) => `https://chatgpt.com/?hints=search&q=${q}`,
  },
  {
    name: "Claude",
    Logo: ClaudeLogo,
    href: (q) => `https://claude.ai/new?q=${q}`,
  },
  {
    // Gemini's own app takes no prefilled prompt; Google's AI Mode (also
    // Gemini) does, via `udm=50`.
    name: "Google AI Mode",
    Logo: GeminiLogo,
    href: (q) => `https://www.google.com/search?udm=50&q=${q}`,
  },
  {
    name: "Perplexity",
    Logo: PerplexityLogo,
    href: (q) => `https://www.perplexity.ai/search/new?q=${q}`,
  },
  {
    name: "Grok",
    Logo: GrokLogo,
    href: (q) => `https://grok.com/?q=${q}`,
  },
];

// The header's icon-circle recipe (site-header.tsx ICON_BUTTON), with the
// logo muted at rest so five brand marks don't compete with the page.
const CIRCLE =
  "group/ai relative inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[rgba(37,34,47,0.46)] text-divine-text-muted transition-colors duration-200 hover:bg-[rgba(37,34,47,0.7)] hover:text-divine-text " +
  "light:bg-black/5 light:hover:bg-black/10 " +
  "outline-none focus-visible:ring-1 focus-visible:ring-[#C084FC] focus-visible:text-divine-text";

interface AskAIProps {
  variant: "rail" | "inline";
  lang: string;
  /** Guide title, quoted in the prompt. */
  title: string;
  /** Absolute URL of the guide. */
  url: string;
  className?: string;
}

export function AskAI({ variant, lang, title, url, className }: AskAIProps) {
  const t = getMessages(lang).askAi;
  const q = encodeURIComponent(
    t.prompt.replace("{title}", title).replace("{url}", url),
  );

  // In the rail the five circles spread edge to edge, so the row lines up
  // with the panel's text instead of leaving a gap after the last one.
  const links = (
    <ul
      className={cn(
        "flex gap-2",
        variant === "rail" ? "justify-between" : "flex-wrap",
      )}
    >
      {PROVIDERS.map(({ name, Logo, href }, i) => (
        <li key={name}>
          <a
            href={href(q)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t.open.replace("{provider}", name)}
            className={CIRCLE}
          >
            <Logo className="size-[18px]" />
            <span
              aria-hidden
              className={cn(
                TOOLTIP_CHIP,
                "group-hover/ai:opacity-100 group-focus-visible/ai:opacity-100",
                // Centered over its circle, except at the row's ends, where
                // it lines up with the outer edge instead of hanging past
                // the panel.
                i === 0
                  ? "left-0"
                  : i === PROVIDERS.length - 1
                    ? "right-0"
                    : "left-1/2 -translate-x-1/2",
              )}
            >
              {name}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );

  if (variant === "rail") {
    return (
      <section
        aria-label={t.title}
        className={cn("rounded-xl p-3.5", PANEL_FILL, PANEL_BORDER, className)}
      >
        <p className="text-divine-text flex items-center gap-1.5 text-[13px] font-semibold">
          <Sparkles
            aria-hidden
            className="text-divine-primary-light size-3.5 shrink-0"
          />
          {t.title}
        </p>
        {/* Sized to fit one line at the rail's width in English. */}
        <p className="text-divine-text-muted mt-1 text-xs leading-relaxed">
          {t.hint}
        </p>
        <div className="mt-3">{links}</div>
      </section>
    );
  }

  return (
    <section
      aria-label={t.title}
      className={cn(
        "not-prose flex flex-wrap items-center gap-x-3 gap-y-2",
        className,
      )}
    >
      <p className="text-divine-text-muted flex items-center gap-1.5 text-sm font-medium">
        <Sparkles
          aria-hidden
          className="text-divine-primary-light size-4 shrink-0"
        />
        {t.title}
      </p>
      {links}
    </section>
  );
}
