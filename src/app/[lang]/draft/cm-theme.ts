import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import type { Extension } from "@codemirror/state";

// Theme-aware colors: the editor follows the site theme, so every color is
// a design-system variable. `--editor-accent` is set on the editor wrapper
// (code-editor.tsx): lilac in dark, the amber text tone in light, grey under
// Minimal (its tokens are already neutral).
const TEXT = "var(--color-divine-text)";
const MUTED = "var(--color-divine-text-muted)";
const ACCENT = "var(--editor-accent)";
const FAINT =
  "color-mix(in srgb, var(--color-divine-text-muted) 65%, transparent)";
const PRIMARY_TINT = (percent: number) =>
  `color-mix(in srgb, var(--color-divine-primary) ${percent}%, transparent)`;

/**
 * Divine Skins CodeMirror theme. The pane supplies the surface, so the
 * editor stays transparent and only paints text, caret, selection, and
 * gutters. Syntax colors follow the Muted Stage: structure (headings, JSX
 * tags, links) in the accent, everything else in the two text tiers, and no
 * gold (the site's code blocks are plain text too).
 */
export const divineEditorTheme: Extension = [
  EditorView.theme({
    "&": {
      backgroundColor: "transparent",
      color: TEXT,
      fontSize: "13.5px",
      height: "100%",
    },
    ".cm-scroller": {
      fontFamily: "var(--font-mono)",
      lineHeight: "1.75",
    },
    ".cm-content": {
      padding: "16px 0 48px",
      caretColor: ACCENT,
    },
    ".cm-line": { padding: "0 16px" },
    "&.cm-focused": { outline: "none" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: ACCENT },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground":
      { backgroundColor: PRIMARY_TINT(30) },
    ".cm-content ::selection": { backgroundColor: PRIMARY_TINT(30) },
    ".cm-activeLine": {
      backgroundColor:
        "color-mix(in srgb, var(--color-divine-text) 3%, transparent)",
    },
    ".cm-gutters": {
      backgroundColor: "transparent",
      color: FAINT,
      border: "none",
      paddingLeft: "8px",
    },
    ".cm-activeLineGutter": { backgroundColor: "transparent", color: MUTED },
    ".cm-placeholder": { color: MUTED },
    // @-mention autocomplete dropdown (mention-extension.ts): the panel
    // recipe, rows like the site's menu rows.
    ".cm-tooltip": {
      backgroundColor: "var(--color-fd-card)",
      border: "1px solid var(--color-fd-border)",
      borderRadius: "12px",
      color: TEXT,
      boxShadow: "0 12px 40px -8px rgba(0, 0, 0, 0.6)",
      overflow: "hidden",
    },
    ".cm-tooltip.cm-tooltip-autocomplete > ul": {
      fontFamily: "var(--font-body)",
      fontSize: "13px",
      padding: "4px",
    },
    ".cm-tooltip.cm-tooltip-autocomplete > ul > li": {
      padding: "6px 10px",
      borderRadius: "8px",
    },
    ".cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]": {
      backgroundColor: PRIMARY_TINT(22),
      color: TEXT,
    },
    ".cm-completionMatchedText": {
      color: ACCENT,
      textDecoration: "none",
      fontWeight: "700",
    },
    ".cm-completionDetail": { color: MUTED, fontStyle: "normal" },
  }),
  syntaxHighlighting(
    HighlightStyle.define([
      { tag: t.heading, color: ACCENT, fontWeight: "700" },
      { tag: t.strong, color: TEXT, fontWeight: "700" },
      { tag: t.emphasis, fontStyle: "italic" },
      { tag: t.strikethrough, textDecoration: "line-through" },
      { tag: t.link, color: ACCENT },
      { tag: t.url, color: MUTED },
      { tag: t.monospace, color: TEXT },
      { tag: t.quote, color: MUTED, fontStyle: "italic" },
      { tag: t.contentSeparator, color: FAINT },
      // Markdown punctuation marks (#, *, >, ```) recede so prose reads clean.
      { tag: t.processingInstruction, color: FAINT },
      { tag: t.meta, color: FAINT },
      // JSX component snippets.
      { tag: [t.angleBracket, t.bracket], color: FAINT },
      { tag: t.tagName, color: ACCENT },
      { tag: t.attributeName, color: MUTED },
      { tag: [t.string, t.attributeValue], color: TEXT },
      { tag: t.comment, color: FAINT, fontStyle: "italic" },
    ]),
  ),
];
