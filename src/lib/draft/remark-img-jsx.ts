import { visit } from "unist-util-visit";
import type { Root, Image, Paragraph, RootContent } from "mdast";

// MDX compiles `<img />` (lowercase JSX) to a literal host element, bypassing
// the components map. The /draft preview needs it to hit `components.img` so
// staged blob URLs can be swapped in. Rewriting to a markdown image node
// (`![alt](src)`) is the standard MDX route to that mapping.

type MdxJsxAttribute = {
  type: "mdxJsxAttribute";
  name: string;
  value: string | null | { type: string };
};

interface MdxJsxElement {
  type: "mdxJsxTextElement" | "mdxJsxFlowElement";
  name: string | null;
  attributes?: MdxJsxAttribute[];
}

function stringAttr(node: MdxJsxElement, name: string): string | undefined {
  const attr = node.attributes?.find(
    (a) => a.type === "mdxJsxAttribute" && a.name === name,
  );
  if (!attr) return undefined;
  return typeof attr.value === "string" ? attr.value : undefined;
}

function makeImage(node: MdxJsxElement): Image | null {
  const src = stringAttr(node, "src");
  if (!src) return null;
  return {
    type: "image",
    url: src,
    alt: stringAttr(node, "alt") ?? "",
    title: stringAttr(node, "title") ?? null,
  };
}

export default function remarkImgJsx() {
  return (tree: Root) => {
    visit(tree, (node, index, parent) => {
      const el = node as unknown as MdxJsxElement;
      if (
        el.type !== "mdxJsxTextElement" &&
        el.type !== "mdxJsxFlowElement"
      ) {
        return;
      }
      if (el.name !== "img" || !parent || index == null) return;
      const image = makeImage(el);
      if (!image) return;
      const parentChildren = (parent as { children: RootContent[] }).children;
      if (el.type === "mdxJsxFlowElement") {
        const wrap: Paragraph = { type: "paragraph", children: [image] };
        parentChildren.splice(index, 1, wrap as RootContent);
      } else {
        parentChildren.splice(index, 1, image as unknown as RootContent);
      }
    });
  };
}
