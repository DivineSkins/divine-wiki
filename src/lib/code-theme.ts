/**
 * Code block theme matching divineskins.gg: code renders as plain #D9D7DF
 * text on a deep panel, with no syntax highlighting (the site's markdown
 * `pre code`). A theme with no token colors gives exactly that.
 */
export const divineDarkTheme = {
  name: "divine-dark",
  type: "dark" as const,
  colors: {
    "editor.background": "#0b0a0f",
    "editor.foreground": "#d9d7df",
  },
  tokenColors: [],
};
