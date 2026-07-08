import remarkYouTube from "@/lib/remark-youtube";
import remarkImg from "@/lib/remark-img";

/**
 * Remark plugins used by the in-browser draft preview (compile-preview.ts).
 *
 * Keep this list in sync with the `remarkPlugins` array in `source.config.ts`
 * (the Fumadocs build pipeline). next-mdx-remote can't perfectly replicate
 * Fumadocs' full internal remark/rehype stack, but matching the project's
 * own custom plugins keeps the preview close to production output.
 *
 * `remarkImg` routes literal `<img>` JSX through the components.img
 * override in both pipelines: the build wraps images in ImageZoom, the
 * preview swaps staged blob URLs in (preview-components.tsx).
 */
export const previewRemarkPlugins = [remarkYouTube, remarkImg];
