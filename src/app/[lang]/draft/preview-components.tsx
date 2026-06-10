import { getMDXComponents } from "@/mdx-components";
import { resolveStagedSrc, type StagedImages } from "@/lib/draft/staged-images";

/**
 * MDX components for the /draft runtime preview.
 *
 * The published pipeline routes images through ImageZoom → next/image, which
 * requires width/height that Fumadocs' build-time remark-image plugin
 * injects. The runtime preview has no such pass — handing an `<img>` to
 * ImageZoom throws ("missing required width") and trips the page error
 * boundary, nuking the draft state. So the preview always renders a plain
 * `<img>`, swapping in staged blob URLs when the src matches an upload.
 */
export function buildPreviewComponents(stagedImages?: StagedImages) {
  const base = getMDXComponents();
  return {
    ...base,
    img: (props: { src?: unknown; alt?: string } & Record<string, unknown>) => {
      const src =
        typeof props.src === "string"
          ? stagedImages
            ? (resolveStagedSrc(props.src, stagedImages) ?? props.src)
            : props.src
          : undefined;
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          {...(props as Record<string, unknown>)}
          src={src}
          alt={props.alt ?? ""}
        />
      );
    },
  };
}
