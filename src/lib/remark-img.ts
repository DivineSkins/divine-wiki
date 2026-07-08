import { visit } from "unist-util-visit";
import type { Root } from "mdast";

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

interface MdxJsxElement {
  type: string;
  name?: string | null;
  data?: { _mdxExplicitJsx?: boolean } & Record<string, unknown>;
}

export default function remarkImg() {
  return (tree: Root) => {
    visit(tree, (node) => {
      const el = node as unknown as MdxJsxElement;
      if (
        (el.type === "mdxJsxFlowElement" || el.type === "mdxJsxTextElement") &&
        el.name === "img" &&
        el.data
      ) {
        delete el.data._mdxExplicitJsx;
      }
    });
  };
}
