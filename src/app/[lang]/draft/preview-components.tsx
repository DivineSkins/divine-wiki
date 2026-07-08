import type { ComponentProps, ElementType } from "react";
import { useParams } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import { localizeHref } from "@/lib/localize-href";
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
  // Mirrors the published pipeline's locale prefixing of internal links
  // (src/app/[lang]/docs/[[...slug]]/page.tsx) so preview hrefs match the
  // published page. Relative-file-link resolution stays build-time only.
  const BaseLink = (base.a ?? "a") as ElementType;
  const PreviewLink = (props: ComponentProps<"a">) => {
    const params = useParams<{ lang?: string }>();
    const lang = typeof params?.lang === "string" ? params.lang : undefined;
    return (
      <BaseLink
        {...props}
        href={lang ? localizeHref(props.href, lang) : props.href}
      />
    );
  };
  return {
    ...base,
    a: PreviewLink,
    img: (props: ComponentProps<"img">) => {
      const src =
        typeof props.src === "string"
          ? stagedImages
            ? (resolveStagedSrc(props.src, stagedImages) ?? props.src)
            : props.src
          : undefined;
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img {...props} src={src} alt={props.alt ?? ""} />
      );
    },
  };
}
