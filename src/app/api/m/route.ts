import { recordEvent } from "@/lib/analytics/server";

// Analytics intake for src/lib/analytics/client.ts. The short, generic path
// keeps filter lists written for third-party trackers (/analytics, /track,
// /collect) from catching this cookieless first-party endpoint.
export async function POST(request: Request) {
  await recordEvent(request);
  return new Response(null, { status: 204 });
}
