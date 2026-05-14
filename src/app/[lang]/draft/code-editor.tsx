"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { EditorView } from "@codemirror/view";
import type { Extension } from "@codemirror/state";

export interface CodeEditorHandle {
  /** Insert text at the current cursor and move the cursor after it. */
  insertAtCursor: (text: string) => void;
  /** The full current document text. */
  getValue: () => string;
}

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Extra CodeMirror extensions (smart-linking autocomplete is added later). */
  extraExtensions?: Extension[];
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(
  function CodeEditor(
    { value, onChange, placeholder, extraExtensions = [] },
    ref,
  ) {
    const cmRef = useRef<ReactCodeMirrorRef>(null);

    useImperativeHandle(
      ref,
      () => ({
        insertAtCursor(text: string) {
          const view = cmRef.current?.view;
          if (!view) return;
          const { from, to } = view.state.selection.main;
          view.dispatch({
            changes: { from, to, insert: text },
            selection: { anchor: from + text.length },
          });
          view.focus();
        },
        getValue() {
          return cmRef.current?.view?.state.doc.toString() ?? value;
        },
      }),
      [value],
    );

    return (
      <CodeMirror
        ref={cmRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        theme="dark"
        height="100%"
        className="h-full text-sm"
        basicSetup={{ lineNumbers: true, foldGutter: false }}
        extensions={[markdown(), EditorView.lineWrapping, ...extraExtensions]}
      />
    );
  },
);
