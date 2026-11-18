/**
 * Shared SVG gradients for icon glyphs. divineskins.gg fills its category
 * icons with a top-to-bottom gradient (lilac #C084FC → purple #783CB5);
 * icons inside `.divine-icon-*` tiles reference these by id (see the
 * "Icon glyph gradients" block in global.css). userSpaceOnUse over the
 * 24px icon box keeps straight strokes (zero-height bounding boxes) from
 * dropping out.
 */
const GRADIENTS: [id: string, from: string, to: string][] = [
  ["brand", "#c084fc", "#783cb5"],
  ["success", "#4ade80", "#16a34a"],
  ["warning", "#fde047", "#ca8a04"],
  ["danger", "#f87171", "#dc2626"],
  ["gold", "#f5d49b", "#c99645"],
];

export function IconGradients() {
  return (
    <svg
      aria-hidden
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {GRADIENTS.map(([id, from, to]) => (
          <linearGradient
            key={id}
            id={`divine-icon-${id}`}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="0"
            y2="24"
          >
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        ))}
      </defs>
    </svg>
  );
}
