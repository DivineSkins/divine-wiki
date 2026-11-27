"use client";

import { useEffect, useRef, type ComponentProps } from "react";

/** How quickly the row's speed closes on its target, in ms. */
const EASE_MS = 140;
/** Below this share of full speed the row counts as stopped. */
const STOP_RATE = 0.01;
/** How long the row waits after a swipe or wheel before moving again, in ms. */
const RESUME_MS = 2500;

/**
 * A row that scrolls itself, slowly, when it is wider than its box, and holds
 * still when everything fits. Expects two copies of the list as its direct
 * `ul` children: the second stays hidden until the row sets `data-scrolling`
 * on the box, and then takes the first's place when the loop comes round.
 *
 * It moves the box's own scroll position (unlike MarqueeViewport, which
 * slides its lists), so the reader can still swipe, drag the trackpad or tab
 * through it. Hover eases it to a stop; focus, a swipe or a sideways wheel
 * stop it at once, and it picks up from wherever the reader left it. Under
 * reduced motion it never starts, and the row scrolls by hand.
 */
export function AutoScrollRow({
  speed,
  ...props
}: ComponentProps<"div"> & {
  /** Full speed, in px per second. */
  speed: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = ref.current;
    const first = box?.querySelector<HTMLElement>(":scope > ul");
    if (!box || !first) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // One loop: the first list and the gap before its copy. 0 when it fits.
    let distance = 0;
    let position = 0;
    let rate = 0;
    let frame = 0;
    let last = 0;
    let hovered = false;
    let focused = false;
    let touching = false;
    let resumeTimer = 0;
    let handsOffUntil = 0;

    // The reader is in charge of the scroll position: don't touch it.
    const held = () => focused || touching || performance.now() < handsOffUntil;

    const step = (now: number) => {
      // A hidden tab stops the frames: don't jump by the time it was away.
      const dt = Math.min(now - last, 100);
      last = now;
      const target = hovered ? 0 : 1;
      rate += (target - rate) * (1 - Math.exp(-dt / EASE_MS));
      if (Math.abs(target - rate) < STOP_RATE) rate = target;
      if (distance === 0 || held() || (target === 0 && rate === 0)) {
        frame = 0;
        return;
      }
      position = (position + (speed * rate * dt) / 1000) % distance;
      box.scrollLeft = position;
      frame = requestAnimationFrame(step);
    };

    const wake = () => {
      if (frame || distance === 0 || held()) return;
      // Start from where the reader left the row, one loop back if they went
      // into the copy (it shows the same cards there).
      position = box.scrollLeft % distance;
      if (position !== box.scrollLeft) box.scrollLeft = position;
      last = performance.now();
      frame = requestAnimationFrame(step);
    };

    const measure = () => {
      const style = getComputedStyle(box);
      const room =
        box.clientWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight);
      const scrolls = !reducedMotion.matches && first.offsetWidth > room + 1;
      if (scrolls === distance > 0 && !scrolls) return;
      box.toggleAttribute("data-scrolling", scrolls);
      distance = scrolls
        ? first.offsetWidth + (parseFloat(style.columnGap) || 0)
        : 0;
      if (scrolls) wake();
      else box.scrollLeft = 0;
    };

    // The reader takes over: stop now, and start again once they are done.
    const handsOff = () => {
      handsOffUntil = performance.now() + RESUME_MS;
      rate = 0;
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(wake, RESUME_MS + 20);
    };
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) handsOff();
    };
    const onTouchStart = () => {
      touching = true;
      handsOff();
    };
    const onTouchEnd = () => {
      touching = false;
      handsOff();
    };
    const onEnter = () => {
      hovered = true;
    };
    const onLeave = () => {
      hovered = false;
      wake();
    };
    // Keyboard focus stops the row and brings the whole card into view (the
    // browser leaves a half-hidden one where it is). Not on a click: moving
    // the card under the pointer would make the click miss.
    const onFocusIn = (event: FocusEvent) => {
      focused = true;
      rate = 0;
      const target = event.target as HTMLElement;
      if (target.matches(":focus-visible")) {
        target.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    };
    const onFocusOut = (event: FocusEvent) => {
      if (box.contains(event.relatedTarget as Node | null)) return;
      focused = false;
      wake();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    observer.observe(first);
    reducedMotion.addEventListener("change", measure);
    box.addEventListener("wheel", onWheel, { passive: true });
    box.addEventListener("touchstart", onTouchStart, { passive: true });
    box.addEventListener("touchend", onTouchEnd);
    box.addEventListener("touchcancel", onTouchEnd);
    box.addEventListener("mouseenter", onEnter);
    box.addEventListener("mouseleave", onLeave);
    box.addEventListener("focusin", onFocusIn);
    box.addEventListener("focusout", onFocusOut);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(resumeTimer);
      observer.disconnect();
      reducedMotion.removeEventListener("change", measure);
      box.removeEventListener("wheel", onWheel);
      box.removeEventListener("touchstart", onTouchStart);
      box.removeEventListener("touchend", onTouchEnd);
      box.removeEventListener("touchcancel", onTouchEnd);
      box.removeEventListener("mouseenter", onEnter);
      box.removeEventListener("mouseleave", onLeave);
      box.removeEventListener("focusin", onFocusIn);
      box.removeEventListener("focusout", onFocusOut);
    };
  }, [speed]);

  return <div {...props} ref={ref} />;
}
