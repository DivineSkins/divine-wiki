import { baseUrl } from "@/lib/config";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import { getLLMIndex } from "@/lib/source";

export const revalidate = false;

export async function GET() {
  const entries = getLLMIndex(baseUrl);

  // Each game gets its own `## <game>` section from getLLMIndex.
  const header = [`# ${SITE_NAME}`, "", `> ${SITE_DESCRIPTION}`].join("\n");

  const footer = [
    "",
    "## Links",
    "",
    `- [Full text (LLM-optimized)](${baseUrl}/llms-full.txt)`,
    "- [Divine Skins platform](https://divineskins.gg)",
    "- [Discord community](https://discord.gg/divineskins)",
    "",
  ].join("\n");

  return new Response([header, ...entries, footer].join("\n"));
}
