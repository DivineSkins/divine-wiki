import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/mdx/Callout";
import { ImageZoom } from "@/components/image-zoom";
import { ParameterList } from "@/components/mdx/parameter-list";
import { YouTube } from "@/components/mdx/YouTube";
import { Video } from "@/components/mdx/Video";
import { PremiumCard } from "@/components/mdx/PremiumCard";
import { GlowCTA } from "@/components/mdx/GlowCTA";
import { LevelPill } from "@/components/mdx/LevelPill";
import { ToolCard } from "@/components/mdx/ToolCard";
import { Icon } from "@/components/icon";
import * as TabsComponents from "fumadocs-ui/components/tabs";
import { Steps, Step } from "fumadocs-ui/components/steps";
import { Files, Folder, File } from "fumadocs-ui/components/files";
import { Accordions, Accordion } from "@/components/mdx/Accordions";
import { CodeBlock } from "@/components/mdx/CodeBlock";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...components,
    ...TabsComponents,
    Steps,
    Step,
    Files,
    Folder,
    File,
    Accordions,
    Accordion,
    Callout,
    ParameterList,
    YouTube,
    Video,
    PremiumCard,
    GlowCTA,
    LevelPill,
    ToolCard,
    Icon,
    img: ImageZoom,
    pre: CodeBlock,
  };
}
