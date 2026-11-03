"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";

// The divineskins.gg TiltCard: the art scales to 1.04 and turns away from the
// cursor by ~0.081deg per px from its center, in 1000px perspective, with a
// soft glare on the edge that tips toward the viewer.
const TILT_DEG_PER_PX = 0.0813;
const TILT_SCALE = "scale3d(1.04, 1.04, 1.04)";
const TILT_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const TILT_FOLLOW = `transform 0.4s ${TILT_EASE}`;
const TILT_RETURN = `transform 0.6s ${TILT_EASE}`;

/**
 * A card face that tilts toward the cursor. `className` sizes the frame;
 * `artClassName` styles the tilting face, which should clip its content. The
 * scroll container around it needs ~8px of room so the tilt isn't clipped.
 */
export function TiltCard({
  children,
  className,
  artClassName,
}: {
  children: ReactNode;
  className?: string;
  artClassName?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);

  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const frame = frameRef.current;
    const art = artRef.current;
    if (
      !frame ||
      !art ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const rect = frame.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(dx, dy);
    art.style.transition = TILT_FOLLOW;
    art.style.transform =
      distance < 0.5
        ? TILT_SCALE
        : `${TILT_SCALE} rotate3d(${-dy}, ${dx}, 0, ${distance * TILT_DEG_PER_PX}deg)`;
    frame.style.setProperty(
      "--glare-x",
      `${(-(event.clientX - rect.left) / rect.width) * 100}%`,
    );
    frame.style.setProperty(
      "--glare-y",
      `${(-(event.clientY - rect.top) / rect.height) * 100}%`,
    );
  };

  const onMouseLeave = () => {
    const art = artRef.current;
    if (!art) return;
    art.style.transition = TILT_RETURN;
    art.style.transform = "";
  };

  return (
    <div
      ref={frameRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn("group/tilt [perspective:1000px]", className)}
    >
      <div
        ref={artRef}
        className={artClassName}
        style={{ transition: TILT_RETURN }}
      >
        {children}
        <div
          aria-hidden
          className="pointer-events-none absolute top-[var(--glare-y,-50%)] left-[var(--glare-x,-50%)] h-[200%] w-[200%] bg-[radial-gradient(circle,rgba(235,235,235,0.15)_3%,rgba(0,0,0,0)_60%)] opacity-0 transition-[top,left,opacity] duration-[480ms] ease-out group-hover/tilt:opacity-100"
        />
      </div>
    </div>
  );
}
