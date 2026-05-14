import remarkYouTube from "@/lib/remark-youtube";

/**
 * Remark plugins used by the runtime /api/preview route.
 *
 * Keep this list in sync with the `remarkPlugins` array in `source.config.ts`
 * (the Fumadocs build pipeline). next-mdx-remote can't perfectly replicate
 * Fumadocs' full internal remark/rehype stack, but matching the project's
 * own custom plugins keeps the preview close to production output.
 */
export const previewRemarkPlugins = [remarkYouTube];
