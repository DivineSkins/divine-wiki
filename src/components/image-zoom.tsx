"use client";

import { Image, type ImageProps } from "fumadocs-core/framework";
import type { ComponentProps } from "react";
import Zoom, { type UncontrolledProps } from "react-medium-image-zoom";
import "../styles/image-zoom.css";

export type ImageZoomProps = Omit<ImageProps, "src"> & {
  /**
   * React 19.2 types allow a Blob img src (and MDX's img slot inherits
   * that), while fumadocs' Image only takes string | StaticImport. Accept
   * both and convert Blobs to object URLs before rendering.
   */
  src?: ImageProps["src"] | Blob;

  /**
   * Image props when zoom in
   */
  zoomInProps?: ComponentProps<"img">;

  /**
   * Props for `react-medium-image-zoom`
   */
  rmiz?: UncontrolledProps;
};

function getImageSrc(src: ImageProps["src"]): string {
  if (typeof src === "string") return src;

  if (typeof src === "object") {
    // Next.js
    if ("default" in src)
      return (src as { default: { src: string } }).default.src;
    return src.src;
  }

  return "";
}

export function ImageZoom({
  zoomInProps,
  children,
  rmiz,
  src,
  ...props
}: ImageZoomProps) {
  const imageSrc = src instanceof Blob ? URL.createObjectURL(src) : src;
  // Literal `<img>` tags from MDX (routed here by remarkImg) carry a plain
  // string src and at most an author-set width — never the width/height
  // pair next/image (behind fumadocs' Image) requires. Render those as a
  // native img; static imports and fully-dimensioned images keep the
  // optimized path.
  const plainImg =
    typeof imageSrc === "string" &&
    (props.width == null || props.height == null);
  return (
    <Zoom
      zoomMargin={20}
      wrapElement="span"
      {...rmiz}
      zoomImg={{
        src: getImageSrc(imageSrc),
        sizes: undefined,
        ...zoomInProps,
      }}
    >
      {children ??
        (plainImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            loading="lazy"
            className="rounded-lg border"
            {...(props as ComponentProps<"img">)}
            src={imageSrc as string}
            alt={props.alt ?? ""}
          />
        ) : (
          // declared in mdx files, should be in props
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px"
            className="rounded-lg border"
            {...props}
            src={imageSrc}
          />
        ))}
    </Zoom>
  );
}
