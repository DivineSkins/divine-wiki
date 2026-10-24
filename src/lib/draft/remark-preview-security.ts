import { visit } from "unist-util-visit";
import type { Root } from "mdast";

const BLOCKED_TAGS = new Set([
  "script",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
  "base",
  "style",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "option",
  "svg",
  "math",
]);
const BLOCKED_KEYS = new Set(["__proto__", "prototype", "constructor"]);
const URL_KEYS = new Set([
  "href",
  "src",
  "url",
  "poster",
  "action",
  "formAction",
]);

type Node = { type: string; [key: string]: unknown };

function node(value: unknown): Node {
  if (
    !value ||
    typeof value !== "object" ||
    !("type" in value) ||
    typeof value.type !== "string"
  ) {
    throw new Error("Preview supports static values only.");
  }
  return value as Node;
}

function children(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new Error("Invalid preview expression.");
  return value;
}

function checkUrl(value: unknown): void {
  if (typeof value !== "string") throw new Error("Preview URLs must be text.");
  // Browsers ignore ASCII whitespace inside URL schemes, so reject it first.
  if (/[\u0000-\u001f\u007f]/.test(value))
    throw new Error("Invalid preview URL.");
  const compact = value.replace(/\s/g, "");
  const scheme = /^([a-z][a-z\d+.-]*):/i.exec(compact)?.[1]?.toLowerCase();
  if (scheme && !["https", "http", "mailto", "tel", "blob"].includes(scheme)) {
    throw new Error("This URL scheme is not allowed in previews.");
  }
}

function checkAttribute(name: string): void {
  if (
    /^on/i.test(name) ||
    ["dangerouslySetInnerHTML", "innerHTML", "srcDoc", "srcdoc"].includes(name)
  ) {
    throw new Error("Preview does not allow event handlers or embedded HTML.");
  }
}

/** Allow data and the wiki's Icon JSX, never executable expressions. */
function checkExpression(value: unknown): void {
  const expression = node(value);
  switch (expression.type) {
    case "Program":
      for (const statement of children(expression.body))
        checkExpression(statement);
      return;
    case "ExpressionStatement":
      checkExpression(expression.expression);
      return;
    case "Literal":
      if (
        expression.value === null ||
        ["string", "number", "boolean"].includes(typeof expression.value)
      )
        return;
      break;
    case "ArrayExpression":
      for (const element of children(expression.elements))
        checkExpression(element);
      return;
    case "ObjectExpression":
      for (const item of children(expression.properties)) {
        const property = node(item);
        if (
          property.type !== "Property" ||
          property.computed ||
          property.method ||
          property.shorthand ||
          property.kind !== "init"
        ) {
          throw new Error(
            "Preview does not allow spreads, getters, or computed properties.",
          );
        }
        const key = node(property.key);
        const name =
          key.type === "Identifier"
            ? key.name
            : key.type === "Literal"
              ? key.value
              : null;
        if (typeof name !== "string" || BLOCKED_KEYS.has(name))
          throw new Error("Invalid preview property.");
        checkAttribute(name);
        checkExpression(property.value);
        if (URL_KEYS.has(name)) checkUrl(node(property.value).value);
      }
      return;
    case "UnaryExpression":
      if (["-", "+", "!"].includes(String(expression.operator))) {
        checkExpression(expression.argument);
        return;
      }
      break;
    case "JSXElement": {
      const opening = node(expression.openingElement);
      const name = node(opening.name);
      if (name.type !== "JSXIdentifier" || name.name !== "Icon") break;
      if (children(expression.children).length) break;
      for (const item of children(opening.attributes)) {
        const attribute = node(item);
        if (attribute.type !== "JSXAttribute")
          throw new Error("Preview does not allow spread attributes.");
        const key = node(attribute.name);
        if (key.type !== "JSXIdentifier" || typeof key.name !== "string")
          throw new Error("Invalid Icon attribute.");
        checkAttribute(key.name);
        if (attribute.value !== null) {
          const value = node(attribute.value);
          checkExpression(
            value.type === "JSXExpressionContainer" ? value.expression : value,
          );
        }
      }
      return;
    }
  }
  throw new Error(
    "Preview supports static values only. JavaScript cannot run in a draft.",
  );
}

/** A separate policy for untrusted browser drafts; repository MDX is reviewed code. */
export default function remarkPreviewSecurity() {
  return (tree: Root) => {
    visit(tree, (current) => {
      if (current.type === "mdxjsEsm")
        throw new Error("Preview does not allow imports or exports.");
      if (
        current.type === "mdxFlowExpression" ||
        current.type === "mdxTextExpression"
      ) {
        checkExpression(current.data?.estree);
      }
      if (
        current.type === "link" ||
        current.type === "image" ||
        current.type === "definition"
      )
        checkUrl(current.url);
      if (
        current.type !== "mdxJsxFlowElement" &&
        current.type !== "mdxJsxTextElement"
      )
        return;
      if (
        current.name !== null &&
        (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(current.name) ||
          BLOCKED_TAGS.has(current.name.toLowerCase()))
      ) {
        throw new Error("This element is not allowed in previews.");
      }
      for (const attribute of current.attributes) {
        if (attribute.type !== "mdxJsxAttribute")
          throw new Error("Preview does not allow spread attributes.");
        checkAttribute(attribute.name);
        const value = attribute.value;
        if (value && typeof value !== "string") {
          checkExpression(value.data?.estree);
          if (URL_KEYS.has(attribute.name)) {
            const statement = node(children(node(value.data?.estree).body)[0]);
            checkUrl(node(statement.expression).value);
          }
        } else if (typeof value === "string" && URL_KEYS.has(attribute.name))
          checkUrl(value);
      }
    });
  };
}
