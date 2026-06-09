import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/mdx/Callout";
import { ImageZoom } from "@/components/image-zoom";
import { ParameterList } from "@/components/mdx/parameter-list";
import { YouTube } from "@/components/mdx/YouTube";
import { PremiumCard } from "@/components/mdx/PremiumCard";
import { GlowCTA } from "@/components/mdx/GlowCTA";
import { LevelPill } from "@/components/mdx/LevelPill";
import { ToolCard } from "@/components/mdx/ToolCard";
import { Icon } from "@/components/icon";
import * as TabsComponents from "fumadocs-ui/components/tabs";
import { Accordions, Accordion } from "fumadocs-ui/components/accordion";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...components,
    ...TabsComponents,
    Accordions,
    Accordion,
    Callout,
    ParameterList,
    YouTube,
    PremiumCard,
    GlowCTA,
    LevelPill,
    ToolCard,
    Icon,
    img: ImageZoom,
  };
}
