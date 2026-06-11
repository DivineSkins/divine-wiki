import { icons } from "lucide-react";
import { createElement, type ReactNode } from "react";
import {
  MayaLogo,
  BlenderLogo,
  DiscordLogo,
  GitHubLogo,
  YouTubeLogo,
  LeagueOfLegendsLogo,
} from "@/components/brand-logos";

// Brand logos (Simple Icons) keyed by the names used in meta.json `icon`
// fields and the MDX `<Icon name="..." />` helper. Everything else falls
// through to a Lucide icon by name. Lucide v1 removed its brand icons, so
// GitHub/YouTube live here (the lowercase-h/t spellings keep content that
// used the old Lucide names working).
const brandIcons = {
  Maya: MayaLogo,
  Blender: BlenderLogo,
  Discord: DiscordLogo,
  GitHub: GitHubLogo,
  Github: GitHubLogo,
  YouTube: YouTubeLogo,
  Youtube: YouTubeLogo,
  LeagueOfLegends: LeagueOfLegendsLogo,
};

/**
 * Resolve an icon name to an element — a brand logo if we have one, otherwise
 * a Lucide icon by name. Returns null for unknown/empty names. Shared by the
 * sidebar icon resolver (src/lib/source.ts) and the `<Icon>` MDX component so
 * both draw from the same set.
 */
export function resolveIcon(name?: string, className?: string): ReactNode {
  if (!name) return null;
  const Brand = brandIcons[name as keyof typeof brandIcons];
  if (Brand) return createElement(Brand, { className });
  const LucideIcon = icons[name as keyof typeof icons];
  if (LucideIcon) return createElement(LucideIcon, { className });
  return null;
}

/**
 * MDX-friendly icon. Use any Lucide name (e.g. `Wrench`, `Sparkles`) or a
 * brand name (`Maya`, `Blender`, `Discord`, `LeagueOfLegends`):
 * `<Icon name="Maya" />`.
 */
export function Icon({
  name,
  className = "size-5",
}: {
  name: string;
  className?: string;
}) {
  return resolveIcon(name, className);
}
