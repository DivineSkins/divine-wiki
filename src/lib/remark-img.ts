import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import type {
  MdxJsxAttribute,
  MdxJsxFlowElement,
  MdxJsxTextElement,
} from "mdast-util-mdx-jsx";
import mediaSizes from "./media-sizes.json";

// MDX compiles `<img />` written literally in a document to a plain host
// element (`_jsx("img", ...)`) — the parser marks author-written JSX with
// `data._mdxExplicitJsx`, and the compiler skips the `components` mapping
// for flagged nodes. Almost every wiki image is a literal `<img>` (per the
// authoring convention), so without this they bypass the `img: ImageZoom`
// override entirely. Stripping the flag routes them through
// `_components.img` like markdown images, with every author attribute
// (width, id, ...) intact.
//
// Used by BOTH MDX pipelines (gotcha #10 in CLAUDE.md): the Fumadocs build
// (source.config.ts) so published pages get ImageZoom, and the /draft
// preview (src/lib/draft/mdx-config.ts) so staged blob URLs can be swapped
// in by its components.img override.

type ImageElement = MdxJsxFlowElement | MdxJsxTextElement;
const sizes: Record<
  string,
  { width: number; height: number; animated?: boolean }
> = mediaSizes;

function dimension(attribute?: MdxJsxAttribute): number | undefined {
  const value = attribute?.value;
  const text = typeof value === "string" ? value : value?.value;
  return text && /^\d+(?:\.\d+)?$/.test(text) && Number(text) > 0
    ? Number(text)
    : undefined;
}

function addDimensions(el: ImageElement) {
  // Spread props can override src/dimensions; leave those author-controlled.
  if (el.attributes.some((attr) => attr.type === "mdxJsxExpressionAttribute"))
    return;
  const attributes = el.attributes.filter(
    (attr) => attr.type === "mdxJsxAttribute",
  );
  const src = attributes.find((attr) => attr.name === "src")?.value;
  if (typeof src !== "string" || !Object.hasOwn(sizes, src)) return;
  const size = sizes[src];
  if (
    size.animated &&
    !attributes.some((attr) => attr.name === "unoptimized")
  ) {
    el.attributes.push({
      type: "mdxJsxAttribute",
      name: "unoptimized",
      value: null,
    });
  }
  const widthAttr = attributes.find((attr) => attr.name === "width");
  const heightAttr = attributes.find((attr) => attr.name === "height");
  const width = dimension(widthAttr);
  const height = dimension(heightAttr);
  if ((widthAttr && !width) || (heightAttr && !height)) return;
  if (!widthAttr)
    el.attributes.push({
      type: "mdxJsxAttribute",
      name: "width",
      value: String(
        height ? Math.round((height * size.width) / size.height) : size.width,
      ),
    });
  if (!heightAttr)
    el.attributes.push({
      type: "mdxJsxAttribute",
      name: "height",
      value: String(
        width ? Math.round((width * size.height) / size.width) : size.height,
      ),
    });
}

export default function remarkImg() {
  return (tree: Root) => {
    visit(tree, (node) => {
      if (
        (node.type === "mdxJsxFlowElement" ||
          node.type === "mdxJsxTextElement") &&
        node.name === "img"
      ) {
        if (node.data && "_mdxExplicitJsx" in node.data)
          delete node.data._mdxExplicitJsx;
        addDimensions(node);
      }
    });
  };
}
