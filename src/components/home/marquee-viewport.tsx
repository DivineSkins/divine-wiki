"use client";

import { useEffect, useRef, type ComponentProps } from "react";

/** How quickly the row's speed closes on its target, in ms. */
const EASE_MS = 140;
/** Below this the row is treated as stopped. */
const STOP_RATE = 0.01;

/**
 * The box around the contributor row's CSS animation. Hovering or focusing a
 * card eases the row to a stop instead of freezing it, and leaving eases it
 * back up. The animation stays in CSS, so between those it runs on the
 * compositor, and without JS the row simply keeps scrolling.
 */
export function MarqueeViewport(props: ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  const hovered = useRef(false);
  const focused = useRef(false);
  const update = useRef<() => void>(() => {});

  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    let rate = 1;
    let frame = 0;
    let last = 0;

    const animations = () =>
      box
        .getAnimations({ subtree: true })
        .filter(
          (animation): animation is CSSAnimation =>
            animation instanceof CSSAnimation &&
            animation.animationName === "divine-marquee",
        );

    const step = (now: number) => {
      const target = hovered.current || focused.current ? 0 : 1;
      rate += (target - rate) * (1 - Math.exp(-(now - last) / EASE_MS));
      last = now;
      const done = Math.abs(target - rate) < STOP_RATE;
      if (done) rate = target;
      // Rate 0 rather than pause(): resuming from a pause is delayed, which
      // would swallow the ease back up.
      for (const animation of animations()) animation.playbackRate = rate;
      frame = done ? 0 : requestAnimationFrame(step);
    };

    update.current = () => {
      if (frame) return;
      last = performance.now();
      frame = requestAnimationFrame(step);
    };
    return () => {
      cancelAnimationFrame(frame);
      update.current = () => {};
    };
  }, []);

  return (
    <div
      {...props}
      ref={ref}
      onMouseEnter={() => {
        hovered.current = true;
        update.current();
      }}
      onMouseLeave={() => {
        hovered.current = false;
        update.current();
      }}
      onFocus={() => {
        focused.current = true;
        update.current();
      }}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget)) return;
        focused.current = false;
        update.current();
      }}
    />
  );
}
