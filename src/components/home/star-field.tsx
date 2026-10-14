import { cn } from "@/lib/utils";

// Seeded PRNG (mulberry32): the server and the browser draw the same sky, so
// hydration never sees a mismatch and the stars don't jump between visits.
function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261014);

// Mostly 1-2px dots, a few 3px ones, every seventh one twinkling.
const STARS = Array.from({ length: 72 }, (_, i) => {
  const roll = rand();
  return {
    left: rand() * 100,
    top: rand() * 100,
    size: roll > 0.9 ? 3 : roll > 0.55 ? 2 : 1,
    opacity: 0.12 + rand() * 0.4,
    twinkle: i % 7 === 0,
    delay: rand() * 5,
  };
});

/**
 * The hero's night sky: the scattered small stars of the divineskins.gg
 * homepage, fading out toward the bottom of the hero. The twinkle holds still
 * under prefers-reduced-motion. Dark Divine style only: on a light page or
 * under the neutral Minimal style the dots read as dust.
 */
export function StarField({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black_45%,transparent)]",
        "light:hidden [.minimal_&]:hidden",
        className,
      )}
    >
      {STARS.map((star, i) => (
        <span
          key={i}
          className={cn(
            "absolute rounded-full bg-[#E4E4E7]",
            star.twinkle && "motion-safe:animate-divine-twinkle",
          )}
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
