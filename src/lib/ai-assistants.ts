import type { ComponentType } from "react";
import {
  ClaudeLogo,
  GeminiLogo,
  GrokLogo,
  OpenAILogo,
  PerplexityLogo,
} from "@/components/brand-logos";

/**
 * AI assistants the wiki hands a prompt to: "Ask AI about this guide"
 * (src/components/ask-ai.tsx) and the /draft editor's "Rewrite with AI"
 * (src/app/[lang]/draft/rewrite-menu.tsx). The Cloudflare WAF rule "Let AI
 * assistants read the wiki" lets their fetchers through bot detection; add a
 * new assistant's user agent there too.
 */
export interface Assistant {
  name: string;
  Logo: ComponentType<{ className?: string }>;
  /** Chat URL with the prompt prefilled. `q` is already URI-encoded. */
  href: (q: string) => string;
  /**
   * A new, empty chat. Only chat apps have one, and only they get "Rewrite
   * with AI": search engines answer a question, they don't hand back a whole
   * rewritten guide, and their query boxes are short.
   */
  newChat?: string;
}

export const ASSISTANTS: Assistant[] = [
  {
    name: "ChatGPT",
    Logo: OpenAILogo,
    // `hints=search` turns on web search, so it opens the links.
    href: (q) => `https://chatgpt.com/?hints=search&q=${q}`,
    newChat: "https://chatgpt.com/?hints=search",
  },
  {
    name: "Claude",
    Logo: ClaudeLogo,
    href: (q) => `https://claude.ai/new?q=${q}`,
    newChat: "https://claude.ai/new",
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
    newChat: "https://grok.com/",
  },
];
