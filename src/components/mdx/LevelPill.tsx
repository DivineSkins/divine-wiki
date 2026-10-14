interface LevelPillProps {
  level: "beginner" | "intermediate" | "advanced";
  label?: string;
  /** `sm` is the compact tag used inside cards (PremiumCard `level`). */
  size?: "md" | "sm";
}

/**
 * Difficulty marker in the divineskins.gg category chip recipe: a full
 * pill with bold 11px uppercase tracked text on a soft tint of its tone
 * (no outline stroke). A three-bar meter before the label lights 1, 2 or
 * 3 bars, so the level reads without relying on color.
 */
const tones: Record<LevelPillProps["level"], { pill: string; bars: number }> = {
  beginner: {
    pill: "bg-[rgba(34,197,94,0.12)] text-[#22C55E]",
    bars: 1,
  },
  intermediate: {
    pill: "bg-[rgba(236,185,106,0.12)] text-[#ECB96A]",
    bars: 2,
  },
  advanced: {
    pill: "bg-[rgba(120,60,181,0.2)] text-[#C084FC]",
    bars: 3,
  },
};

// MDX props aren't type-checked, so a typo or translated value
// (`level="Intermediario"`) reaches here at runtime. Render a neutral pill
// with the raw text instead of crashing the prerender and failing the deploy.
const unknownTone = { pill: "bg-white/[0.06] text-[#D9D7DF]", bars: 0 };

const defaults: Record<LevelPillProps["level"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export function LevelPill({ level, label, size = "md" }: LevelPillProps) {
  const tone = tones[level] ?? unknownTone;
  const sizing =
    size === "sm"
      ? "h-5 gap-1.5 px-2 text-[10px]"
      : "me-1.5 h-7 gap-2 px-3 text-[11px]";
  return (
    <span
      className={`not-prose inline-flex items-center rounded-full align-middle leading-none font-bold tracking-wider uppercase ${sizing} ${tone.pill}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 12 12"
        className={`${size === "sm" ? "size-2.5" : "size-3"} shrink-0`}
        fill="currentColor"
      >
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={i * 4.5}
            y={8 - i * 3}
            width="3"
            height={4 + i * 3}
            rx="1"
            opacity={i < tone.bars ? 1 : 0.3}
          />
        ))}
      </svg>
      {label ?? defaults[level] ?? level}
    </span>
  );
}
