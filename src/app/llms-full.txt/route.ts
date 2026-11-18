import { baseUrl } from "@/lib/config";
import { LLM_SUMMARY, SITE_NAME } from "@/lib/seo";
import { getLLMFullText } from "@/lib/source";

export const revalidate = false;

export async function GET() {
  const entries = await getLLMFullText(baseUrl);

  const header = [`# ${SITE_NAME}`, "", `> ${LLM_SUMMARY}`, "", ""].join("\n");

  return new Response(header + entries.join("\n\n"));
}
