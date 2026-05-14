"use client";

import { forwardRef, useImperativeHandle } from "react";

export interface CodeEditorHandle {
  insertAtCursor: (text: string) => void;
  getValue: () => string;
}

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(
  function CodeEditor({ value, onChange, placeholder }, ref) {
    useImperativeHandle(
      ref,
      () => ({ insertAtCursor: () => {}, getValue: () => value }),
      [value],
    );
    return (
      <textarea
        className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm outline-none"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  },
);
