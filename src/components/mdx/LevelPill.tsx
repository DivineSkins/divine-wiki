import { Badge, type BadgeTone } from "@divineskins/ui";

interface LevelPillProps {
  level: "beginner" | "intermediate" | "advanced";
  label?: string;
  /** `sm` is the compact tag used inside cards (PremiumCard `level`). */
  size?: "md" | "sm";
}

/**
 * Difficulty marker: a caps Badge. A three-bar meter before the label lights
 * 1, 2 or 3 bars, so the level reads without relying on color.
 */
const tones: Record<
  LevelPillProps["level"],
  { tone: BadgeTone; bars: number }
> = {
  beginner: { tone: "success", bars: 1 },
  intermediate: { tone: "gold", bars: 2 },
  advanced: { tone: "accent", bars: 3 },
};

// MDX props aren't type-checked, so a typo or translated value
// (`level="Intermediario"`) reaches here at runtime. Render a neutral pill
// with the raw text instead of crashing the prerender and failing the deploy.
const unknownTone = { tone: "neutral" as const, bars: 0 };

const defaults: Record<LevelPillProps["level"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export function LevelPill({ level, label, size = "md" }: LevelPillProps) {
  const { tone, bars } = tones[level] ?? unknownTone;
  return (
    <Badge
      tone={tone}
      size={size}
      caps
      className={`not-prose align-middle leading-none ${size === "sm" ? "gap-1.5" : "me-1.5 gap-2"}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 12 12"
        className={size === "sm" ? "size-2.5" : "size-3"}
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
            opacity={i < bars ? 1 : 0.3}
          />
        ))}
      </svg>
      {label ?? defaults[level] ?? level}
    </Badge>
  );
}
