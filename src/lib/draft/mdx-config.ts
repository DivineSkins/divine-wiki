import remarkYouTube from "@/lib/remark-youtube";
import remarkImgJsx from "@/lib/draft/remark-img-jsx";

/**
 * Remark plugins used by the runtime /api/preview route.
 *
 * Keep this list in sync with the `remarkPlugins` array in `source.config.ts`
 * (the Fumadocs build pipeline). next-mdx-remote can't perfectly replicate
 * Fumadocs' full internal remark/rehype stack, but matching the project's
 * own custom plugins keeps the preview close to production output.
 *
 * `remarkImgJsx` is preview-only: it rewrites `<img>` JSX to markdown image
 * nodes so the components.img override can swap staged blob URLs in. The
 * build pipeline doesn't need this — Fumadocs handles `<img>` JSX directly.
 */
export const previewRemarkPlugins = [remarkYouTube, remarkImgJsx];
