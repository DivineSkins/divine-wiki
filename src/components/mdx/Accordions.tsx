"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Accordion as AccordionRoot,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
} from "@divineskins/ui";
import { Check, Link as LinkIcon } from "lucide-react";

interface AccordionsProps {
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  className?: string;
  children?: ReactNode;
}

/**
 * The package's FAQ Accordion, with the API the guides already use. A row
 * with an `id` is a deep link: opening `#that-id` opens the row, and the row
 * gets a copy-link button.
 */
export function Accordions({
  type = "single",
  defaultValue,
  className,
  children,
}: AccordionsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<string[]>(() =>
    defaultValue === undefined ? [] : [defaultValue].flat(),
  );

  useEffect(() => {
    const id = window.location.hash.substring(1);
    if (!id) return;
    const row = document.getElementById(id);
    if (!row || !rootRef.current?.contains(row)) return;
    const value = row.getAttribute("data-accordion-value");
    if (!value) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the hash only exists on the client
    setOpen((prev) => (type === "single" ? [value] : [value, ...prev]));
  }, [type]);

  const shared = {
    ref: rootRef,
    className: `my-6 ${className ?? ""}`,
    children,
  };
  return type === "single" ? (
    <AccordionRoot
      {...shared}
      type="single"
      collapsible
      value={open[0] ?? ""}
      onValueChange={(value) => setOpen(value ? [value] : [])}
    />
  ) : (
    <AccordionRoot
      {...shared}
      type="multiple"
      value={open}
      onValueChange={setOpen}
    />
  );
}

export function Accordion({
  title,
  id,
  value = String(title),
  children,
}: {
  title: ReactNode;
  id?: string;
  value?: string;
  children?: ReactNode;
}) {
  return (
    <AccordionItem
      value={value}
      id={id}
      data-accordion-value={value}
      className="relative scroll-mt-24"
    >
      {/* The trigger renders an h3, which prose would restyle. */}
      <div className="not-prose">
        <AccordionTrigger className={id ? "pr-14" : undefined}>
          {title}
        </AccordionTrigger>
      </div>
      {id ? <CopyLink id={id} /> : null}
      <AccordionContent className="prose-no-margin">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}

function CopyLink({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Copy link"
      className="absolute top-3 right-3"
      onClick={() => {
        const url = new URL(window.location.href);
        url.hash = id;
        navigator.clipboard.writeText(url.toString()).then(
          () => {
            setCopied(true);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setCopied(false), 1500);
          },
          () => {
            // Clipboard can reject (denied permission); the row's link still
            // works from the address bar.
          },
        );
      }}
    >
      {copied ? <Check /> : <LinkIcon />}
    </Button>
  );
}
