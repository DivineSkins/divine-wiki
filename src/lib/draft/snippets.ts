export interface ComponentSnippet {
  id: string;
  label: string;
  /** One-line "when to use this". */
  blurb: string;
  /** Inserted at the cursor on click. */
  snippet: string;
  /** Rendered live in the hover tooltip. */
  preview: string;
  /** Anchor on /docs/contributing/components. */
  docsAnchor: string;
  /** true = lives in the "More" overflow menu, not the main row. */
  overflow?: boolean;
}

export const componentSnippets: ComponentSnippet[] = [
  {
    id: "callout",
    label: "Callout",
    blurb:
      "A colored box for warnings, tips, and the KR/CN safety note. Use danger for real risk.",
    snippet:
      '<Callout type="info" title="Title here">\n  Body text here.\n</Callout>\n',
    preview:
      '<Callout type="danger" title="Don\'t use custom skins in Korea or China">\n  The anti-cheat there blocks all mods. Accounts get banned.\n</Callout>',
    docsAnchor: "callout",
  },
  {
    id: "tabs",
    label: "Tabs",
    blurb: "Alternative paths — OS-specific steps, tool-specific workflows.",
    snippet:
      '<Tabs items={["Windows", "macOS"]}>\n  <Tab value="Windows">\n    Windows steps here.\n  </Tab>\n  <Tab value="macOS">\n    macOS steps here.\n  </Tab>\n</Tabs>\n',
    preview:
      '<Tabs items={["Windows", "macOS"]}>\n  <Tab value="Windows">\n    Open Celestial from the Start menu.\n  </Tab>\n  <Tab value="macOS">\n    Celestial does not run on macOS today.\n  </Tab>\n</Tabs>',
    docsAnchor: "tabs",
  },
  {
    id: "accordion",
    label: "Accordion",
    blurb: "Collapsible sections. Good for FAQs and optional detail.",
    snippet:
      '<Accordions>\n  <Accordion title="Question here">\n    Answer here.\n  </Accordion>\n</Accordions>\n',
    preview:
      '<Accordions>\n  <Accordion title="Is this safe?">\n    Yes, outside Korea and China.\n  </Accordion>\n</Accordions>',
    docsAnchor: "accordion",
  },
  {
    id: "image",
    label: "Image",
    blurb: "A screenshot. alt text is required — CI and reviewers enforce it.",
    snippet:
      '<img src="/wiki-images/your-screenshot.png" alt="Short description of the image" />\n',
    preview:
      '<img src="/brand/logo.webp" alt="Divine Skins logo" width="80" />',
    docsAnchor: "image",
  },
  {
    id: "code",
    label: "Code block",
    blurb: "A fenced code block. Add a language after the opening fence.",
    snippet: "```bash\nnpm run dev\n```\n",
    preview: "```bash\nnpm run dev\n```",
    docsAnchor: "code-block",
  },
  {
    id: "table",
    label: "Table",
    blurb: "A Markdown table. Keep it to a few columns.",
    snippet:
      "| Column A | Column B |\n|---|---|\n| Value | Value |\n| Value | Value |\n",
    preview:
      "| Tool | Use |\n|---|---|\n| Flint | All-in-one |\n| Jade | BIN editing |",
    docsAnchor: "table",
  },
  {
    id: "toolcard",
    label: "ToolCard",
    blurb: "A single tool row — name, link, one-line description.",
    snippet:
      '<ToolCard name="Tool name" href="/docs/tools/slug">\n  One-line description of the tool.\n</ToolCard>\n',
    preview:
      '<ToolCard name="Flint" href="/docs/tools/flint" badge="Recommended">\n  All-in-one skin creation tool.\n</ToolCard>',
    docsAnchor: "toolcard",
  },
  {
    id: "levelpill",
    label: "LevelPill",
    blurb: "A difficulty marker. Put it at the top of a guide.",
    snippet: '<LevelPill level="beginner" />\n',
    preview: '<LevelPill level="intermediate" />',
    docsAnchor: "levelpill",
  },
  {
    id: "parameterlist",
    label: "ParameterList",
    blurb: "A two-column name/description table for reference pages.",
    snippet:
      '<ParameterList\n  parameters={[\n    { name: "name", description: "What this parameter does." },\n  ]}\n/>\n',
    preview:
      '<ParameterList\n  parameters={[\n    { name: "champion", description: "The champion the skin belongs to." },\n    { name: "skinline", description: "Marketing theme, if any." },\n  ]}\n/>',
    docsAnchor: "parameterlist",
    overflow: true,
  },
  {
    id: "premiumcard",
    label: "PremiumCard",
    blurb: "A prominent gradient card for a featured link.",
    snippet:
      '<PremiumCard title="Card title" href="/docs/category/slug">\n  Supporting description.\n</PremiumCard>\n',
    preview:
      '<PremiumCard title="Guided walkthrough" href="/docs/guided-walkthrough">\n  Start here if you are new.\n</PremiumCard>',
    docsAnchor: "premiumcard",
    overflow: true,
  },
  {
    id: "glowcta",
    label: "GlowCTA",
    blurb: "A glowing call-to-action button. Use sparingly — one per page.",
    snippet: '<GlowCTA href="/docs/category/slug">Button label</GlowCTA>\n',
    preview: '<GlowCTA href="/docs">Browse the guides</GlowCTA>',
    docsAnchor: "glowcta",
    overflow: true,
  },
  {
    id: "youtube",
    label: "YouTube",
    blurb: "An embedded YouTube video. Pass the video id, not the full URL.",
    snippet: '<YouTube id="VIDEO_ID" title="What the video shows" />\n',
    preview: '<YouTube id="dQw4w9WgXcQ" title="Example video" />',
    docsAnchor: "youtube",
    overflow: true,
  },
];

export const mainSnippets = componentSnippets.filter((s) => !s.overflow);
export const overflowSnippets = componentSnippets.filter((s) => s.overflow);
