import { baseUrl } from "@/lib/config";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import { getLLMFullText } from "@/lib/source";

export const revalidate = false;

export async function GET() {
  const entries = await getLLMFullText(baseUrl);

  const header = [`# ${SITE_NAME}`, "", `> ${SITE_DESCRIPTION}`, "", ""].join(
    "\n",
  );

  return new Response(header + entries.join("\n\n"));
}
