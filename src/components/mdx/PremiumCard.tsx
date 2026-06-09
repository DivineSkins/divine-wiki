import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

interface PremiumCardProps {
  title: string;
  href: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export function PremiumCard({ title, href, icon, children }: PremiumCardProps) {
  const isExternal = /^https?:\/\//i.test(href);
  const Tag = isExternal ? "a" : Link;
  const externalProps = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Tag
      href={href}
      {...externalProps}
      className="divine-card-gradient-border group bg-divine-surface hover:divine-card-hover relative my-2 block rounded-[8px] p-5 no-underline transition-shadow duration-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            {icon ? (
              <div className="bg-divine-primary/15 text-divine-primary-light inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px]">
                {icon}
              </div>
            ) : null}
            <div className="text-divine-text text-lg leading-tight font-[var(--font-section)] font-semibold">
              {title}
            </div>
          </div>
          {children ? (
            <div className="text-divine-text-muted mt-2 text-sm leading-relaxed">
              {children}
            </div>
          ) : null}
        </div>
        <ArrowUpRight
          className="text-divine-text-muted group-hover:text-divine-primary-light mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden
        />
      </div>
    </Tag>
  );
}
