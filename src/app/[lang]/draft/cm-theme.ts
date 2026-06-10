import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import type { Extension } from "@codemirror/state";

/**
 * Divine Skins CodeMirror theme. The editor card supplies the background
 * surface, so the editor itself stays transparent and only paints text,
 * caret, selection, and gutters with design-system tokens. Syntax colors:
 * structure in purple (headings, JSX tags), literals in gold (strings,
 * inline code), prose in primary text — same hierarchy as rendered docs.
 */
export const divineEditorTheme: Extension = [
  EditorView.theme(
    {
      "&": {
        backgroundColor: "transparent",
        color: "#e4e4e7",
        fontSize: "13.5px",
        height: "100%",
      },
      ".cm-scroller": {
        fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
        lineHeight: "1.75",
      },
      ".cm-content": {
        padding: "16px 0 48px",
        caretColor: "#c084fc",
      },
      ".cm-line": { padding: "0 16px" },
      "&.cm-focused": { outline: "none" },
      ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#c084fc" },
      "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground":
        {
          backgroundColor: "rgba(120, 60, 181, 0.32)",
        },
      ".cm-content ::selection": {
        backgroundColor: "rgba(120, 60, 181, 0.32)",
      },
      ".cm-activeLine": { backgroundColor: "rgba(255, 255, 255, 0.025)" },
      ".cm-gutters": {
        backgroundColor: "transparent",
        color: "#4d4b5a",
        border: "none",
        paddingLeft: "8px",
      },
      ".cm-activeLineGutter": {
        backgroundColor: "transparent",
        color: "#8b8d98",
      },
      ".cm-placeholder": { color: "#8b8d98" },
      // @-mention autocomplete dropdown (mention-extension.ts).
      ".cm-tooltip": {
        backgroundColor: "#111016",
        border: "1px solid rgba(120, 60, 181, 0.35)",
        borderRadius: "8px",
        color: "#e4e4e7",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.55)",
        overflow: "hidden",
      },
      ".cm-tooltip.cm-tooltip-autocomplete > ul": {
        fontFamily: "var(--font-inter), system-ui, sans-serif",
        fontSize: "12.5px",
      },
      ".cm-tooltip.cm-tooltip-autocomplete > ul > li": {
        padding: "5px 10px",
      },
      ".cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]": {
        backgroundColor: "rgba(120, 60, 181, 0.28)",
        color: "#e4e4e7",
      },
      ".cm-completionMatchedText": {
        color: "#c084fc",
        textDecoration: "none",
        fontWeight: "600",
      },
    },
    { dark: true },
  ),
  syntaxHighlighting(
    HighlightStyle.define([
      { tag: t.heading, color: "#c084fc", fontWeight: "700" },
      { tag: t.strong, color: "#ffffff", fontWeight: "700" },
      { tag: t.emphasis, fontStyle: "italic" },
      { tag: t.strikethrough, textDecoration: "line-through" },
      { tag: t.link, color: "#b472ff" },
      { tag: t.url, color: "#8b8d98" },
      { tag: t.monospace, color: "#ecb96a" },
      { tag: t.quote, color: "#8b8d98", fontStyle: "italic" },
      { tag: t.contentSeparator, color: "#544f66" },
      // Markdown punctuation marks (#, *, >, ```) recede so prose reads clean.
      { tag: t.processingInstruction, color: "#6f6c80" },
      { tag: t.meta, color: "#6f6c80" },
      // JSX component snippets.
      { tag: [t.angleBracket, t.bracket], color: "#6f6c80" },
      { tag: t.tagName, color: "#c084fc" },
      { tag: t.attributeName, color: "#a78bfa" },
      { tag: [t.string, t.attributeValue], color: "#ecb96a" },
      { tag: t.comment, color: "#544f66", fontStyle: "italic" },
    ]),
  ),
];
