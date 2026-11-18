"use client";

import { useEffect, useRef, type ComponentProps } from "react";

/** How quickly the row's speed closes on its target, in ms. */
const EASE_MS = 140;
/** Below this share of full speed the row counts as stopped. */
const STOP_RATE = 0.01;

/**
 * Scrolls the contributor row: its two copies of the list, its direct `ul`
 * children, read their position from `--marquee-x`, and sliding one row width
 * puts the second copy where the first started, so the loop has no seam.
 * Hovering or focusing a card eases the row to a stop, and leaving eases it
 * back up. Nothing runs while it's stopped. Driven from here rather than a CSS
 * animation (like the site's MarqueeRow): changing a running animation's
 * playbackRate every frame tore the row on screen.
 */
export function MarqueeViewport({
  speed,
  ...props
}: ComponentProps<"div"> & {
  /** Full speed, in px per second. */
  speed: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const hovered = useRef(false);
  const focused = useRef(false);
  const wake = useRef<() => void>(() => {});

  useEffect(() => {
    const box = ref.current;
    const first = box?.querySelector<HTMLElement>(":scope > ul");
    if (
      !box ||
      !first ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let distance = 0;
    const measure = () => {
      distance =
        first.offsetWidth + parseFloat(getComputedStyle(box).columnGap);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(first);

    let offset = 0;
    let rate = 1;
    let frame = 0;
    let last = 0;

    const step = (now: number) => {
      // A hidden tab stops the frames: don't jump by the time it was away.
      const dt = Math.min(now - last, 100);
      last = now;
      const target = hovered.current || focused.current ? 0 : 1;
      rate += (target - rate) * (1 - Math.exp(-dt / EASE_MS));
      if (Math.abs(target - rate) < STOP_RATE) rate = target;
      if (distance > 0) {
        offset = (offset + (speed * rate * dt) / 1000) % distance;
        box.style.setProperty("--marquee-x", `${-offset}px`);
      }
      frame = rate === 0 ? 0 : requestAnimationFrame(step);
    };

    wake.current = () => {
      if (frame) return;
      last = performance.now();
      frame = requestAnimationFrame(step);
    };
    wake.current();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      wake.current = () => {};
    };
  }, [speed]);

  return (
    <div
      {...props}
      ref={ref}
      onMouseEnter={() => {
        hovered.current = true;
        wake.current();
      }}
      onMouseLeave={() => {
        hovered.current = false;
        wake.current();
      }}
      onFocus={() => {
        focused.current = true;
        wake.current();
      }}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget)) return;
        focused.current = false;
        wake.current();
      }}
    />
  );
}
